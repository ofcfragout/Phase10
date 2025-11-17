# Phase 10 - Multiplayer Card Game

A real-time multiplayer Phase 10 card game built with Next.js and Supabase.

## Features

- 🎮 Real-time multiplayer gameplay using Supabase realtime
- 🎴 Complete Phase 10 game logic with all 10 phases
- 👥 Create groups and share game links with friends
- 🎯 Authentic Phase 10 rules and scoring
- 📱 Responsive design for desktop and mobile
- ⚡ Fast and smooth gameplay experience

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Realtime**: Supabase
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Phase10
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   a. Create a new Supabase project at [https://supabase.com](https://supabase.com)
   
   b. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   
   c. Get your Supabase URL and anon key from Project Settings > API

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Play

1. **Create a Game**: Enter your name and click "Create New Game"
2. **Share the Code**: Share the 6-digit code with friends
3. **Join Game**: Friends can join using the share code
4. **Play**: 
   - Draw a card from deck or discard pile
   - Lay down your phase when you have the right cards
   - Discard a card to end your turn
   - Complete all 10 phases to win!

## Phase 10 Phases

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

## Game Rules

- **Set**: Cards of the same number (e.g., 3, 3, 3)
- **Run**: Sequential numbers (e.g., 1, 2, 3, 4)
- **Color**: All cards of the same color
- **Wild Cards**: Can substitute for any card
- **Skip Cards**: Makes the next player skip their turn (25 points)

## Project Structure

```
Phase10/
├── app/
│   ├── api/
│   │   ├── game/          # Create game API
│   │   └── join/          # Join game API
│   ├── game/[gameId]/     # Game page
│   └── page.tsx           # Home page
├── components/
│   ├── Card.tsx           # Card component
│   └── GameBoard.tsx      # Main game board
├── lib/
│   ├── gameLogic.ts       # Phase 10 game logic
│   ├── supabase.ts        # Supabase client
│   └── types.ts           # TypeScript types
└── supabase-schema.sql    # Database schema
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
