# Real-Time Group Chat App

A clean and simple Angular frontend for a real-time group chat application. It connects to a Socket.IO backend and supports joining a chat, sending messages, online user count, typing indicators, connection status, and leave/disconnect behavior.

## Tech Stack

- Angular
- TypeScript
- Socket.IO Client
- Lucide Angular icons
- SCSS

## Features

- Join chat with a username
- Send and receive messages instantly
- Show current online user count
- Show connection status
- Show typing indicators from other users
- Show welcome and system messages
- Leave chat from the UI
- Responsive layout for desktop and mobile

## Folder Structure

```text
src/
├── app/
│   ├── chat/
│   │   ├── chat.component.ts
│   │   ├── chat.models.ts
│   │   └── chat.service.ts
│   └── app.routes.ts
├── main.ts
└── styles.scss
```

## Prerequisites

Install Node.js and npm.

The chat frontend expects the Socket.IO backend to run at:

```text
http://localhost:3000
```

The Angular frontend runs at:

```text
http://localhost:4200
```

## Installation

```bash
npm install
```

## Run The Frontend

```bash
npm run dev:client
```

Open:

```text
http://localhost:4200
```

## Build

```bash
npm run build
```

## Backend Requirement

Start the Node.js Socket.IO backend before using the chat UI. The frontend connects to the backend from:

```ts
const SOCKET_URL = 'http://localhost:3000';
```

This value is defined in:

```text
src/app/chat/chat.service.ts
```

## Expected Backend Events

### Client-To-Server Events

| Event | Payload |
| --- | --- |
| `join_chat` | `{ "username": "Hemanth" }` |
| `send_message` | `{ "message": "Hello everyone" }` |
| `typing` | `{ "isTyping": true }` |
| `stop_typing` | No payload |

### Server-To-Client Events

| Event | Payload |
| --- | --- |
| `welcome_message` | `{ "message": "Welcome to the chat, Hemanth!", "timestamp": "ISO date string" }` |
| `system_message` | `{ "message": "Hemanth joined the chat", "timestamp": "ISO date string" }` |
| `receive_message` | `{ "id": "message-id", "username": "Hemanth", "message": "Hello", "timestamp": "ISO date string", "socketId": "sender socket id" }` |
| `online_users` | `{ "count": 3 }` |
| `user_typing` | `{ "username": "Hemanth", "socketId": "sender socket id" }` |
| `user_stop_typing` | `{ "username": "Hemanth", "socketId": "sender socket id" }` |
| `chat_error` | `{ "message": "Username is required" }` |

## How The Frontend Works

`chat.component.ts` contains the user interface. It displays the join form, message list, typing text, status pills, and message input.

`chat.service.ts` manages the Socket.IO connection. It sends client events, listens for server events, and stores chat state using Angular signals.

`chat.models.ts` contains TypeScript interfaces for chat messages, system messages, typing users, and feed items.

`app.routes.ts` loads the chat screen as the default route.

`styles.scss` contains the responsive chat UI styles.

## Testing The Chat

1. Start the backend on port `3000`.
2. Start the Angular frontend:

   ```bash
   npm run dev:client
   ```

3. Open `http://localhost:4200` in two browser tabs.
4. Join with a different username in each tab.
5. Send messages and verify both tabs update instantly.
6. Type in one tab and verify the other tab shows the typing indicator.
7. Leave or close one tab and verify the online count updates.

## Notes

- This frontend does not include authentication.
- This frontend does not store chat history.
- Messages only appear while the backend and clients are connected.
- The backend should handle validation, message IDs, timestamps, and online user count.
