import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const ChatWindow = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [messageStatus, setMessageStatus] = useState({}); // Track message delivery status
  const [connectionError, setConnectionError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 384, height: 600 }); // 384px = w-96
  const [originalSize, setOriginalSize] = useState({ width: 384, height: 600 });
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatWindowRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      console.log('Initializing socket connection with user:', user.name);
      console.log('Token length:', token.length);
      console.log('Token preview:', token.substring(0, 20) + '...');
      
      // Clean up any existing socket
      if (socket) {
        socket.disconnect();
      }
      
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsOnline(true);
        setConnectionError(null);
        newSocket.emit('user_online');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from chat server:', reason);
        setIsOnline(false);
        if (reason === 'io server disconnect') {
          setConnectionError('Server disconnected');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnectionError(`Connection failed: ${error.message}`);
        setIsOnline(false);
        
        // Retry connection after 3 seconds
        if (retryCount < 3) {
          setTimeout(() => {
            console.log(`Retrying connection (attempt ${retryCount + 1})`);
            setRetryCount(prev => prev + 1);
            newSocket.connect();
          }, 3000);
        }
      });

      newSocket.on('receive_message', (message) => {
        console.log('Received message:', message);
        setMessages(prev => {
          // Only add message if it's for the current conversation
          if (selectedUser && 
              (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
            // Remove any temporary messages with the same content
            const filtered = prev.filter(msg => 
              !(msg.isTemporary && msg.message === message.message && msg.sender._id === message.sender._id)
            );
            return [...filtered, message];
          }
          return prev; // Don't add message if it's not for current conversation
        });
        // Mark as read if it's the current conversation
        if (selectedUser && message.sender._id === selectedUser._id) {
          markMessagesAsRead(selectedUser._id);
        }
      });

      newSocket.on('message_sent', (message) => {
        console.log('Message sent confirmation:', message);
        setMessages(prev => {
          // Only update if it's for the current conversation
          if (selectedUser && 
              (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
            // Replace temporary message with real one
            const filtered = prev.filter(msg => 
              !(msg.isTemporary && msg.message === message.message && msg.sender._id === message.sender._id)
            );
            return [...filtered, message];
          }
          return prev; // Don't update if it's not for current conversation
        });
      });

      newSocket.on('message_delivered', (data) => {
        console.log('Message delivered:', data);
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, delivered: data.delivered }
              : msg
          )
        );
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectionError(error.message);
      });

      newSocket.on('user_typing', (data) => {
        if (selectedUser && data.senderId === selectedUser._id) {
          setTypingUser(data.senderName);
          setIsTyping(data.isTyping);
        }
      });

      newSocket.on('user_status', (data) => {
        // Update user status in conversations
        setConversations(prev => 
          prev.map(conv => 
            conv.user._id === data.userId 
              ? { ...conv, isOnline: data.status === 'online' }
              : conv
          )
        );
      });

      setSocket(newSocket);

      return () => {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.off('receive_message');
        newSocket.off('message_sent');
        newSocket.off('message_delivered');
        newSocket.off('error');
        newSocket.off('user_typing');
        newSocket.off('user_status');
        newSocket.close();
      };
    }
  }, [user]);

  // Fetch conversations and users
  useEffect(() => {
    if (user && token) {
      testConnection();
      fetchConversations();
      fetchUsers();
    }
  }, [user, token]);

  const testConnection = async () => {
    try {
      console.log('Testing chat connection...');
      console.log('User:', user);
      console.log('Token:', token ? 'present' : 'missing');
      
      if (!user || !token) {
        setConnectionError('Please log in to use chat');
        return;
      }
      
      // Check if token is valid by testing it
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            setConnectionError('Session expired. Please log out and log back in.');
            return;
          }
        }
      } catch (e) {
        setConnectionError('Invalid token. Please log out and log back in.');
        return;
      }
      
      // Decode token to see its structure
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', payload);
        }
      } catch (e) {
        console.log('Could not decode token:', e.message);
      }
      
      const response = await fetch('/api/debug/chat-test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Chat connection test successful:', data);
        setConnectionError(null);
      } else {
        const errorData = await response.json();
        console.error('Chat connection test failed:', response.status, errorData);
        setConnectionError(`Authentication failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Chat connection test error:', error);
      setConnectionError(`Connection test failed: ${error.message}`);
    }
  };

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser && user && token) {
      console.log('Fetching messages for user:', selectedUser.name, selectedUser._id);
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser, user, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
      
      // Update message status for offline messages
      data.forEach(conv => {
        if (conv.lastMessage && conv.lastMessage.sender === user._id) {
          setMessages(prev => 
            prev.map(msg => 
              msg.message === conv.lastMessage.message && msg.sender._id === user._id
                ? { ...msg, delivered: true, read: conv.unreadCount === 0 }
                : msg
            )
          );
        }
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConnectionError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with token:', token ? 'present' : 'missing');
      const response = await fetch('/api/chat/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setConnectionError('Failed to load users');
    }
  };

  const fetchMessages = async (userId) => {
    try {
      console.log('Fetching messages for userId:', userId);
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched messages:', data.length, 'messages');
      console.log('Messages data:', data);
      
      // Clear previous messages and set new ones
      setMessages(data);
      markMessagesAsRead(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setConnectionError('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (userId) => {
    try {
      await fetch(`/api/chat/messages/${userId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local message status
      setMessages(prev => 
        prev.map(msg => 
          msg.sender._id === userId && !msg.read 
            ? { ...msg, read: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getMessageStatus = (message) => {
    if (message.isTemporary) return 'sending';
    if (message.read) return 'read';
    if (message.delivered) return 'delivered';
    return 'sent';
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedUser && socket) {
      const messageText = newMessage.trim();
      console.log('Sending message:', messageText, 'to:', selectedUser.name);
      setNewMessage('');
      
      // Create a temporary message for immediate UI update
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        sender: { _id: user._id, name: user.name, email: user.email },
        receiver: { _id: selectedUser._id, name: selectedUser.name, email: selectedUser.email },
        message: messageText,
        messageType: 'text',
        timestamp: new Date(),
        read: false,
        isTemporary: true
      };
      
      // Add to messages immediately for better UX
      setMessages(prev => [...prev, tempMessage]);
      
      // Send via socket
      socket.emit('send_message', {
        receiverId: selectedUser._id,
        message: messageText,
        messageType: 'text'
      });
    } else {
      console.log('Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasSelectedUser: !!selectedUser,
        hasSocket: !!socket,
        socketConnected: socket?.connected
      });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedUser && socket) {
      socket.emit('typing', {
        receiverId: selectedUser._id,
        isTyping: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          receiverId: selectedUser._id,
          isTyping: false
        });
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const startNewChat = (user) => {
    console.log('Starting new chat with user:', user.name, user._id);
    setSelectedUser(user);
    setMessages([]);
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return;
    if (e.detail === 2) {
      // Double click to maximize/restore
      toggleMaximize();
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore to original size and position
      setSize(originalSize);
      setPosition(originalPosition);
      setIsMaximized(false);
    } else {
      // Save current state and maximize
      setOriginalSize(size);
      setOriginalPosition(position);
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight - 64 // Account for navbar
      });
      setIsMaximized(true);
    }
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      // Expand - restore to previous size or default
      setIsCollapsed(false);
      if (isMaximized) {
        // If it was maximized before collapse, restore to maximized
        setSize({ 
          width: window.innerWidth, 
          height: window.innerHeight - 64
        });
        setPosition({ x: 0, y: 0 });
      } else {
        // Restore to original size and position
        setSize(originalSize);
        setPosition(originalPosition);
      }
    } else {
      // Collapse - save current state first
      if (!isMaximized) {
        setOriginalSize(size);
        setOriginalPosition(position);
      }
      setIsCollapsed(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    } else if (isResizing) {
      const newWidth = Math.max(300, Math.min(800, resizeStartRef.current.width + (e.clientX - resizeStartRef.current.x)));
      const newHeight = Math.max(400, Math.min(window.innerHeight - 100, resizeStartRef.current.height + (e.clientY - resizeStartRef.current.y)));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  };

  // Add event listeners for drag and resize
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  // Initialize position on first render - center the window
  useEffect(() => {
    const centerWindow = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const chatWidth = size.width;
      const chatHeight = size.height;
      
      const centerX = Math.max(0, (windowWidth - chatWidth) / 2);
      const centerY = Math.max(0, (windowHeight - chatHeight) / 2);
      
      setPosition({
        x: centerX,
        y: centerY
      });
    };

    // Center immediately
    centerWindow();

    // Also center when window is resized
    const handleResize = () => {
      if (!isMaximized && !isCollapsed) {
        centerWindow();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized, isCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
          chatWindow.classList.toggle('hidden');
        }
      }
      // Toggle collapse with Ctrl/Cmd + Shift + M
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        toggleCollapse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  // Don't render if user is not authenticated
  if (!user || !token) {
    return null;
  }

  return (
    <div 
      id="chat-window" 
      ref={chatWindowRef}
      className="fixed bg-white shadow-2xl rounded-lg border border-gray-200 hidden z-40 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isCollapsed ? '300px' : (isMaximized ? '100vw' : `${size.width}px`),
        height: isCollapsed ? '60px' : (isMaximized ? '100vh' : `${size.height}px`),
        minWidth: isCollapsed ? '300px' : (isMaximized ? '100vw' : '300px'),
        minHeight: isCollapsed ? '60px' : (isMaximized ? '100vh' : '400px'),
        maxWidth: isMaximized ? '100vw' : '800px',
        maxHeight: isMaximized ? '100vh' : '90vh',
        borderRadius: isMaximized ? '0' : '0.5rem',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header - Draggable */}
        <div 
          className={`bg-indigo-600 text-white ${isCollapsed ? 'p-2' : 'p-4'} ${isMaximized ? 'rounded-none' : 'rounded-t-lg'} flex items-center justify-between ${isCollapsed ? 'cursor-pointer' : 'cursor-move'}`}
          onMouseDown={isCollapsed ? undefined : handleMouseDown}
          onDoubleClick={isCollapsed ? toggleCollapse : toggleMaximize}
          onClick={isCollapsed ? toggleCollapse : undefined}
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <h3 className="font-semibold">Chat</h3>
            {isCollapsed && (
              <span className="text-xs text-indigo-200 ml-2">(Collapsed - Click to expand)</span>
            )}
            {connectionError && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-200">Connection Error</span>
                <button 
                  onClick={() => {
                    setRetryCount(0);
                    setConnectionError(null);
                    if (socket) {
                      socket.disconnect();
                      socket.connect();
                    }
                  }}
                  className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                >
                  Retry
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded"
                >
                  Clear Session
                </button>
                <button 
                  onClick={testConnection}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded ml-2"
                >
                  Test Connection
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleCollapse}
              className="text-white hover:text-gray-200 hover:bg-indigo-700 rounded p-1 transition-colors z-10"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                )}
              </svg>
            </button>
            <button 
              onClick={toggleMaximize}
              className="text-white hover:text-gray-200 hover:bg-indigo-700 rounded p-1 transition-colors z-10"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMaximized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9v4.5M15 9h4.5M15 9l5.5-5.5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
            <button 
              onClick={() => document.getElementById('chat-window').classList.add('hidden')}
              className="text-white hover:text-gray-200 hover:bg-red-600 rounded p-1 transition-colors z-10"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Conversations */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <h4 className="font-medium text-sm text-gray-600">Conversations</h4>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-xs mt-2">Loading conversations...</p>
                </div>
              ) : (
                conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => {
                    console.log('Selecting conversation with user:', conv.user.name, conv.user._id);
                    setSelectedUser(conv.user);
                  }}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUser?._id === conv.user._id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {conv.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate">{conv.user.name}</p>
                        {conv.isOnline && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                ))
              )}
            </div>

            {/* New Chat Button */}
            <div className="p-3 border-t border-gray-200">
              <h4 className="font-medium text-sm text-gray-600 mb-2">Start New Chat</h4>
              <div className="max-h-32 overflow-y-auto">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        console.log('Starting new chat with user from list:', user.name, user._id);
                        startNewChat(user);
                      }}
                      className="p-2 hover:bg-gray-50 cursor-pointer rounded text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-gray-800">{user.name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-gray-500 text-xs">
                    {loading ? 'Loading users...' : 'No users available'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedUser.name}</p>
                      <p className="text-xs text-gray-500">
                        {selectedUser.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender._id === user._id;
                      console.log('Rendering message:', {
                        id: message._id,
                        text: message.message,
                        sender: message.sender.name,
                        isOwn: isOwnMessage,
                        currentUser: user.name
                      });
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              isOwnMessage
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p>{message.message}</p>
                            <div className={`flex items-center justify-between mt-1 ${
                              isOwnMessage ? 'text-indigo-100' : 'text-gray-500'
                            }`}>
                              <p className="text-xs">
                                {formatTime(message.timestamp)}
                              </p>
                              {isOwnMessage && (
                                <div className="flex items-center ml-2">
                                  {getMessageStatus(message) === 'sending' && (
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                  )}
                                  {getMessageStatus(message) === 'sent' && (
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  )}
                                  {getMessageStatus(message) === 'delivered' && (
                                    <div className="flex">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full -ml-1"></div>
                                    </div>
                                  )}
                                  {getMessageStatus(message) === 'read' && (
                                    <div className="flex">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                      <div className="w-2 h-2 bg-blue-400 rounded-full -ml-1"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 px-3 py-2 rounded-lg text-sm">
                        <p className="text-gray-500 italic">{typingUser} is typing...</p>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
        
        {/* Resize Handle */}
        {!isMaximized && !isCollapsed && (
          <div 
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-30 hover:opacity-100 transition-opacity"
            onMouseDown={handleResizeStart}
            style={{
              background: 'linear-gradient(-45deg, transparent 30%, #6B7280 30%, #6B7280 40%, transparent 40%, transparent 60%, #6B7280 60%, #6B7280 70%, transparent 70%)'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
