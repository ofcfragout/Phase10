'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import GameBoard from '@/components/GameBoard';

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId');

  if (!playerId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Game Link</h1>
          <p>Player ID is missing from the URL.</p>
        </div>
      </div>
    );
  }

  return <GameBoard gameId={gameId} playerId={playerId} />;
}
