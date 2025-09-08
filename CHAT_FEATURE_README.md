# Real-Time Chat Feature

This document describes the real-time chat functionality added to the task manager application.

## Features

- **Real-time messaging** using WebSockets (Socket.IO)
- **WhatsApp-like interface** with modern UI design
- **Movable and resizable window** - drag to move, resize from corner
- **Maximize/restore functionality** - double-click header or use maximize button
- **Keyboard shortcuts** - Ctrl/Cmd + Shift + C to toggle chat window
- **User presence indicators** (online/offline status)
- **Typing indicators** when users are typing
- **Message read receipts** and unread count
- **Conversation history** with all previous messages
- **Start new chats** with any registered user

## Components

### Backend (ServerConnect)

1. **ChatMessage Model** (`models/ChatMessage.js`)
   - Stores chat messages with sender, receiver, message content, timestamp, and read status
   - Indexed for efficient querying

2. **WebSocket Server** (`server.js`)
   - Socket.IO integration for real-time communication
   - Authentication middleware for socket connections
   - Handles message sending, typing indicators, and user status

3. **Chat API Routes** (`routes/chat.js`)
   - GET `/api/chat/conversations` - Get all conversations for current user
   - GET `/api/chat/messages/:userId` - Get chat history with specific user
   - PUT `/api/chat/messages/:userId/read` - Mark messages as read
   - GET `/api/chat/users` - Get all users available for chat

### Frontend (ClientConnect)

1. **ChatWindow Component** (`components/ChatWindow.jsx`)
   - Main chat interface with sidebar and message area
   - Real-time message handling
   - User presence and typing indicators
   - Modern WhatsApp-like UI design

2. **Navbar Integration** (`components/Navbar.jsx`)
   - Chat button with message icon
   - Toggle chat window visibility

## Usage

1. **Accessing Chat**: 
   - Click the "Chat" button in the top navigation bar
   - Or use keyboard shortcut: `Ctrl/Cmd + Shift + C`
2. **Moving the Window**: 
   - Drag the header (purple bar) to move the chat window anywhere on screen
   - Double-click the header to maximize/restore the window
3. **Resizing the Window**: 
   - Drag the resize handle (bottom-right corner) to resize
   - Minimum size: 300x400px, Maximum size: 800x90vh
4. **Starting a Conversation**: 
   - Select from existing conversations in the left sidebar
   - Or start a new chat by selecting a user from the "Start New Chat" section
5. **Sending Messages**: Type in the message input and press Enter or click Send
6. **Real-time Features**: 
   - See when other users are online/offline
   - See typing indicators when someone is typing
   - Messages appear instantly without page refresh

## Technical Details

### WebSocket Events

- `send_message` - Send a new message
- `receive_message` - Receive a new message
- `typing` - Send typing indicator
- `user_typing` - Receive typing indicator
- `user_online` - User comes online
- `user_status` - User status change (online/offline)

### Database Schema

```javascript
ChatMessage {
  sender: ObjectId (ref: User)
  receiver: ObjectId (ref: User)
  message: String
  timestamp: Date
  read: Boolean
  messageType: String (enum: 'text', 'image', 'file')
}
```

### Authentication

- Socket connections are authenticated using JWT tokens
- All API endpoints require valid authentication
- User context is maintained throughout the chat session

## Dependencies

### Backend
- `socket.io` - WebSocket server
- `mongoose` - Database operations
- `jsonwebtoken` - Token verification

### Frontend
- `socket.io-client` - WebSocket client
- `react` - UI components
- `tailwindcss` - Styling

## Setup

1. Install dependencies:
   ```bash
   # Backend
   cd ServerConnect && npm install socket.io
   
   # Frontend
   cd ClientConnect && npm install socket.io-client
   ```

2. Start the servers:
   ```bash
   # From project root
   npm run dev
   ```

3. Access the application and click the "Chat" button in the navigation bar

## Future Enhancements

- File and image sharing
- Message reactions and replies
- Group chats
- Message search functionality
- Push notifications
- Message encryption
