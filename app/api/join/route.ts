import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { drawCard } from '@/lib/gameLogic';
import { Card } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { shareCode, playerName } = await request.json();

    if (!shareCode || !playerName) {
      return NextResponse.json({ error: 'Share code and player name are required' }, { status: 400 });
    }

    // Find game by share code
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('share_code', shareCode.toUpperCase())
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'waiting' && game.status !== 'active') {
      return NextResponse.json({ error: 'Game is not available' }, { status: 400 });
    }

    // Get existing players
    const { data: existingPlayers, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', game.id)
      .order('player_order', { ascending: true });

    if (playersError) {
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    // Check if max players reached (e.g., 6 players)
    if (existingPlayers && existingPlayers.length >= 6) {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 });
    }

    // Deal hand to new player
    const hand: Card[] = [];
    let deck = game.deck as Card[];
    let discardPile = game.discard_pile as Card[];

    for (let i = 0; i < 10; i++) {
      const result = drawCard(deck, discardPile);
      if (result.card) {
        hand.push(result.card);
        deck = result.newDeck;
        discardPile = result.newDiscardPile;
      }
    }

    // Update game deck
    await supabase
      .from('games')
      .update({ deck, discard_pile: discardPile })
      .eq('id', game.id);

    // Insert new player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: playerName,
        hand,
        current_phase: 1,
        score: 0,
        has_completed_phase: false,
        has_laid_down: false,
        player_order: existingPlayers.length,
      })
      .select()
      .single();

    if (playerError) {
      return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
    }

    return NextResponse.json({
      gameId: game.id,
      playerId: player.id,
      shareCode: game.share_code,
    });
  } catch (error) {
    console.error('Error in POST /api/join:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
