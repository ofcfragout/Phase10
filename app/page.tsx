'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create game');
      }

      router.push(`/game/${data.gameId}?playerId=${data.playerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !shareCode.trim()) {
      setError('Please enter your name and share code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerName: playerName.trim(),
          shareCode: shareCode.trim().toUpperCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join game');
      }

      router.push(`/game/${data.gameId}?playerId=${data.playerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-5xl font-bold text-white mb-2 text-center">Phase 10</h1>
        <p className="text-gray-200 text-center mb-8">Multiplayer Card Game</p>

        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-semibold">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleCreateGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Creating...' : 'Create New Game'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white font-semibold">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-white mb-2 font-semibold">Share Code</label>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 font-mono"
              placeholder="Enter 6-digit code"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleJoinGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20">
          <h2 className="text-white font-bold mb-2">How to Play:</h2>
          <ul className="text-gray-200 text-sm space-y-1">
            <li>• Complete phases 1-10 in order</li>
            <li>• Draw and discard each turn</li>
            <li>• Lay down your phase to win the round</li>
            <li>• First to complete all phases wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
