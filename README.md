# SDIT Bustanul Huda - Frontend

Frontend application for SDIT Bustanul Huda school management system.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router v7
- Recharts
- Tiptap (rich text editor)
- Shadcn/ui components

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── interfaces/     # TypeScript interfaces
├── lib/            # Utility functions
├── pages/          # Page components
├── services/       # API services
└── App.tsx         # Main app component
```

## Configuration

Set `VITE_API_URL` in `.env` to point to the backend API URL.