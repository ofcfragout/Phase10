'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card as CardType } from '@/lib/types';
import { PHASES, drawCard, validatePhaseCompletion } from '@/lib/gameLogic';
import Card from './Card';

interface GameBoardProps {
  gameId: string;
  playerId: string;
}

export default function GameBoard({ gameId, playerId }: GameBoardProps) {
  const [game, setGame] = useState<Record<string, unknown> | null>(null);
  const [players, setPlayers] = useState<Record<string, unknown>[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Record<string, unknown> | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [phaseGroups, setPhaseGroups] = useState<CardType[][]>([]);
  const [message, setMessage] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);

  const loadGameState = async () => {
    const { data: gameData } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('player_order', { ascending: true });

    if (gameData) setGame(gameData);
    if (playersData) {
      setPlayers(playersData);
      const current = playersData.find(p => p.id === playerId);
      setCurrentPlayer(current);
    }
  };

  useEffect(() => {
    loadGameState();
    
    // Subscribe to game changes
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, () => {
        loadGameState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` }, () => {
        loadGameState();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const handleDrawFromDeck = async () => {
    if (hasDrawn || !isMyTurn() || !game || !currentPlayer) {
      setMessage('Not your turn or already drew!');
      return;
    }

    const result = drawCard(game.deck as CardType[], game.discard_pile as CardType[]);
    if (!result.card) {
      setMessage('No more cards!');
      return;
    }

    const newHand = [...(currentPlayer.hand as CardType[]), result.card];

    await supabase
      .from('games')
      .update({ deck: result.newDeck, discard_pile: result.newDiscardPile })
      .eq('id', gameId);

    await supabase
      .from('players')
      .update({ hand: newHand })
      .eq('id', playerId);

    setHasDrawn(true);
    setMessage('Drew a card from deck');
  };

  const handleDrawFromDiscard = async () => {
    if (hasDrawn || !isMyTurn() || !game || !currentPlayer) {
      setMessage('Not your turn or already drew!');
      return;
    }

    const discardPile = game.discard_pile as CardType[];
    if (discardPile.length === 0) return;

    const card = discardPile[discardPile.length - 1];
    const newHand = [...(currentPlayer.hand as CardType[]), card];
    const newDiscardPile = discardPile.slice(0, -1);

    await supabase
      .from('games')
      .update({ discard_pile: newDiscardPile })
      .eq('id', gameId);

    await supabase
      .from('players')
      .update({ hand: newHand })
      .eq('id', playerId);

    setHasDrawn(true);
    setMessage('Drew from discard pile');
  };

  const handleDiscard = async (cardId: string) => {
    if (!hasDrawn || !isMyTurn() || !game || !currentPlayer) {
      setMessage('Must draw first!');
      return;
    }

    const hand = currentPlayer.hand as CardType[];
    const cardIndex = hand.findIndex((c: CardType) => c.id === cardId);
    if (cardIndex === -1) return;

    const card = hand[cardIndex];
    const newHand = hand.filter((_: CardType, i: number) => i !== cardIndex);
    const newDiscardPile = [...(game.discard_pile as CardType[]), card];

    await supabase
      .from('games')
      .update({ 
        discard_pile: newDiscardPile,
        current_player_index: ((game.current_player_index as number) + 1) % players.length
      })
      .eq('id', gameId);

    await supabase
      .from('players')
      .update({ hand: newHand })
      .eq('id', playerId);

    setHasDrawn(false);
    setMessage('Discarded card');
    
    // Check if player won
    if (newHand.length === 0 && (currentPlayer.has_laid_down as boolean)) {
      handleWin();
    }
  };

  const handleLayDownPhase = async () => {
    if (!isMyTurn() || !currentPlayer || (currentPlayer.has_laid_down as boolean)) {
      setMessage('Cannot lay down phase now!');
      return;
    }

    const phase = PHASES[(currentPlayer.current_phase as number) - 1];
    if (!validatePhaseCompletion(phase, phaseGroups)) {
      setMessage('Invalid phase combination!');
      return;
    }

    // Remove cards from hand
    const usedCardIds = new Set(phaseGroups.flat().map(c => c.id));
    const hand = currentPlayer.hand as CardType[];
    const newHand = hand.filter((c: CardType) => !usedCardIds.has(c.id));

    await supabase
      .from('players')
      .update({ 
        hand: newHand,
        has_laid_down: true,
        has_completed_phase: true
      })
      .eq('id', playerId);

    await supabase
      .from('laid_down_cards')
      .insert({
        game_id: gameId,
        player_id: playerId,
        groups: phaseGroups
      });

    setPhaseGroups([]);
    setSelectedCards([]);
    setMessage('Phase laid down successfully!');
  };

  const handleWin = async () => {
    await supabase
      .from('games')
      .update({ status: 'completed', winner_id: playerId })
      .eq('id', gameId);

    setMessage('You won!');
  };

  const isMyTurn = () => {
    if (!game || !players.length) return false;
    const currentPlayerData = players[game.current_player_index as number];
    return currentPlayerData?.id === playerId;
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const addSelectedToGroup = (groupIndex: number) => {
    if (!currentPlayer) return;
    const hand = currentPlayer.hand as CardType[];
    const selected = hand.filter((c: CardType) => selectedCards.includes(c.id));
    const newGroups = [...phaseGroups];
    if (!newGroups[groupIndex]) {
      newGroups[groupIndex] = [];
    }
    newGroups[groupIndex] = [...newGroups[groupIndex], ...selected];
    setPhaseGroups(newGroups);
    setSelectedCards([]);
  };

  const createNewGroup = () => {
    if (!currentPlayer) return;
    const hand = currentPlayer.hand as CardType[];
    const selected = hand.filter((c: CardType) => selectedCards.includes(c.id));
    setPhaseGroups([...phaseGroups, selected]);
    setSelectedCards([]);
  };

  if (!game || !currentPlayer) {
    return <div className="text-white p-8">Loading...</div>;
  }

  const currentPhase = PHASES[(currentPlayer.current_phase as number) - 1];
  const discardPile = game.discard_pile as CardType[];
  const topDiscard = discardPile[discardPile.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Phase 10</h1>
              <p className="text-gray-300">Share Code: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{game.share_code as string}</span></p>
            </div>
            <div className="text-right">
              <p className="text-gray-300">Current Phase: {currentPhase.name}</p>
              <p className="text-gray-400 text-sm">{currentPhase.description}</p>
              <p className="text-yellow-400 mt-1">
                {isMyTurn() ? "Your Turn!" : `${players[game.current_player_index as number]?.name as string}'s Turn`}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 text-center">
            {message}
          </div>
        )}

        {/* Players List */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-xl font-bold text-white mb-3">Players</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {players.map((player, idx) => (
              <div 
                key={player.id as string}
                className={`p-3 rounded-lg ${
                  player.id === playerId ? 'bg-blue-700' : 'bg-gray-700'
                } ${(game.current_player_index as number) === idx ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <p className="text-white font-semibold truncate">{player.name as string}</p>
                <p className="text-gray-300 text-sm">Phase {player.current_phase as number}</p>
                <p className="text-gray-400 text-xs">Score: {player.score as number}</p>
                <p className="text-gray-400 text-xs">Cards: {(player.hand as CardType[]).length}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Deck and Discard */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">Draw Pile</h3>
            <div className="flex gap-4 justify-center">
              <div 
                onClick={handleDrawFromDeck}
                className="w-20 h-28 bg-blue-900 rounded-lg shadow-lg cursor-pointer hover:bg-blue-800 flex items-center justify-center text-white font-bold border-2 border-blue-700"
              >
                <span>DECK<br/>{(game.deck as CardType[]).length}</span>
              </div>
              {topDiscard && (
                <div onClick={handleDrawFromDiscard}>
                  <Card card={topDiscard} />
                </div>
              )}
            </div>
          </div>

          {/* Phase Groups */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">Phase Groups</h3>
            {currentPhase.requirements.map((req, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-300 text-sm">
                    Group {idx + 1}: {req.type} of {req.count}
                  </p>
                  <button
                    onClick={() => addSelectedToGroup(idx)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    disabled={selectedCards.length === 0}
                  >
                    Add Selected
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap min-h-[6rem] bg-gray-700 rounded p-2">
                  {phaseGroups[idx]?.map(card => (
                    <Card key={card.id} card={card} />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleLayDownPhase}
                disabled={!(currentPlayer.has_laid_down as boolean) && phaseGroups.length !== currentPhase.requirements.length}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Lay Down Phase
              </button>
              <button
                onClick={createNewGroup}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                disabled={selectedCards.length === 0}
              >
                New Group
              </button>
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">Your Hand ({(currentPlayer.hand as CardType[]).length} cards)</h3>
          <div className="flex gap-2 flex-wrap justify-center">
            {(currentPlayer.hand as CardType[]).map((card: CardType) => (
              <div key={card.id} onClick={() => toggleCardSelection(card.id)}>
                <Card 
                  card={card}
                  selected={selectedCards.includes(card.id)}
                />
              </div>
            ))}
          </div>
          {hasDrawn && (
            <div className="mt-4 text-center">
              <p className="text-yellow-400 mb-2">Select a card to discard</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {(currentPlayer.hand as CardType[]).map((card: CardType) => (
                  <button
                    key={card.id}
                    onClick={() => handleDiscard(card.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Discard
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
