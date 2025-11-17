import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { initializeGame } from '@/lib/gameLogic';

export async function POST(request: NextRequest) {
  try {
    const { playerName } = await request.json();

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    // Initialize game state
    const gameState = initializeGame([playerName]);

    // Insert game into database
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        share_code: gameState.shareCode,
        status: 'waiting',
        current_player_index: 0,
        phase: 1,
        deck: gameState.deck,
        discard_pile: gameState.discardPile,
      })
      .select()
      .single();

    if (gameError) {
      console.error('Error creating game:', gameError);
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }

    // Insert player into database
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: playerName,
        hand: gameState.players[0].hand,
        current_phase: 1,
        score: 0,
        has_completed_phase: false,
        has_laid_down: false,
        player_order: 0,
      })
      .select()
      .single();

    if (playerError) {
      console.error('Error creating player:', playerError);
      return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }

    return NextResponse.json({
      gameId: game.id,
      shareCode: game.share_code,
      playerId: player.id,
    });
  } catch (error) {
    console.error('Error in POST /api/game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
