# Spur AI Support Agent

A robust, AI-powered customer support chat widget built with **SvelteKit** (Frontend) and **Node.js/TypeScript** (Backend).

## Features

-   **Interactive Chat UI**: Modern, glassmorphism-inspired interface with typing indicators and auto-scroll.
-   **Context-Aware AI**: Powered by OpenAI (GPT-4o mini), seeded with specific store policies (Shipping, Returns).
-   **Conversation History**: Persists chats across reloads using PostgreSQL/SQLite and LocalStorage.
-   **Robust Architecture**: Clean separation of concerns (Controllers, Services) with Zod validation.
-   **Error Handling**: Graceful degradation on API failures.

## Tech Stack

-   **Frontend**: SvelteKit, Vite, CSS (Custom Design)
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: SQLite (via Prisma ORM) - *Easily switchable to PostgreSQL*
-   **Validation**: Zod
-   **AI**: OpenAI API

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   npm

### Installation

1.  **Clone the repository** (if you haven't already).

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    cp .env.example .env
    ```
    *Open `.env` and add your `OPENAI_API_KEY`.*

    ```bash
    # Push database schema (Migrations)
    npx prisma db push
    
    # Note: No seeding is required. The app creates conversations dynamically.

    # Start the server
    npm run dev
    ```
    Backend runs on `http://localhost:3000`.

3.  **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    
    # Start the development server
    npm run dev
    ```
    Frontend runs on `http://localhost:5173`.

## Architecture Overview

The backend follows a layered architecture to ensure maintainability and scalability:

-   **Routes** (`src/routes`): Define API endpoints.
-   **Controllers** (`src/controllers`): Handle request parsing, validation (Zod), and response formatting.
-   **Services** (`src/services`): contain business logic:
    -   `chatService.ts`: Manages database interactions (Prisma) and conversation state.
    -   `llmService.ts`: Encapsulates OpenAI interaction, system prompts, and error handling.
-   **Utils** (`src/utils`): Shared utilities like validation schemas.

## LLM Integration

I used **OpenAI (GPT-4o mini)** for its balance of speed and intelligence.

-   **System Prompt**: The agent is seeded with specific facts about "Spur Mart" (shipping times, return window).
-   **Context**: The last 10 messages of the conversation are injected into the prompt to provide context.
-   **Error Handling**: If the API fails (quota, network), a user-friendly error message is returned.

## Troubleshooting

### LLM Connection Errors
-   **401 Unauthorized**: Ensure your `OPENAI_API_KEY` in `backend/.env` is correct and not the default "your-key".
-   **Quota Limits**: If you see "I am currently out of service due to quota limits", your API key is valid but your OpenAI account has insufficient credits.
-   **Restarting**: If you edit `.env`, you must restart the backend (`npm run dev`) or wait for `tsx watch` to reload it.

## Trade-offs & Future Improvements

-   **Validation**: Used `zod` for strict input validation.
-   **Database**: Used SQLite for ease of setup. For production, I would switch the Prisma provider to `postgresql`.
-   **Testing**: Added an integration test script (`scripts/test-api.ts`) to verify end-to-end API flows.
-   **If I had more time**:
    -   Implement WebSocket (Socket.io) for real-time typing indicators instead of polling/request-based.
    -   Add rate limiting (Redis).
    -   Add unit tests for services using Jest/Vitest.
