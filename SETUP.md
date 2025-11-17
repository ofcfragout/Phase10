# Phase 10 Setup Guide

This guide will help you set up and run the Phase 10 multiplayer card game.

## Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works fine)
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned (this takes a few minutes)

### 3. Create Database Schema

1. In your Supabase project dashboard, click on the "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this repository
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- `games` table - stores game state
- `players` table - stores player information
- `game_moves` table - tracks all game moves
- `laid_down_cards` table - stores phase completions
- Necessary indexes and RLS policies

### 4. Configure Environment Variables

1. In your Supabase project, go to Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 6. Test the Game

1. Open the app in your browser
2. Enter your name and click "Create New Game"
3. You'll get a 6-digit share code
4. Open another browser tab (or share with friends)
5. Enter the share code to join the game
6. Start playing!

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

Vercel will automatically build and deploy your app.

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Platform
- Your own server with Node.js

Build the production version:
```bash
npm run build
npm start
```

## Troubleshooting

### "Failed to fetch" errors
- Make sure your Supabase project is active
- Verify your environment variables are correct
- Check that the database schema has been created

### Real-time updates not working
- Ensure Supabase Realtime is enabled in your project settings
- Check browser console for any WebSocket connection errors
- Verify RLS policies are set correctly

### Cards not appearing correctly
- Clear your browser cache
- Check that all game logic files are properly deployed
- Verify no TypeScript compilation errors

## Game Rules Reference

### The 10 Phases

1. **Phase 1**: 2 sets of 3
2. **Phase 2**: 1 set of 3 + 1 run of 4
3. **Phase 3**: 1 set of 4 + 1 run of 4
4. **Phase 4**: 1 run of 7
5. **Phase 5**: 1 run of 8
6. **Phase 6**: 1 run of 9
7. **Phase 7**: 2 sets of 4
8. **Phase 8**: 7 cards of one color
9. **Phase 9**: 1 set of 5 + 1 set of 2
10. **Phase 10**: 1 set of 5 + 1 set of 3

### Card Types

- **Numbered Cards (1-12)**: Four colors (red, blue, green, yellow), 2 of each per color
- **Wild Cards**: Can substitute for any card (8 total)
- **Skip Cards**: Makes next player skip their turn (4 total)

### Gameplay

1. Each player is dealt 10 cards
2. On your turn:
   - Draw one card from the deck or discard pile
   - Lay down your phase if you have the required cards
   - Discard one card to end your turn
3. First player to complete all 10 phases wins!

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the Supabase logs in your project dashboard
3. Check browser console for errors
4. Open an issue on GitHub

## License

MIT License - feel free to use this project for learning or building your own games!
