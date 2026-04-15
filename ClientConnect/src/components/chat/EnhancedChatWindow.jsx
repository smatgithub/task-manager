import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import io from 'socket.io-client';
import MessageSearch from './MessageSearch';
import FileUpload from './FileUpload';
import EmojiPicker from './EmojiPicker';

const EnhancedChatWindow = () => {
  const { user, token } = useAuth();
  
  // Guard clause - don't render if user is not available
  if (!user || !token) {
    console.log('EnhancedChatWindow: User or token not available', { user, token });
    return null;
  }
  
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [messageStatus, setMessageStatus] = useState({});
  const [connectionError, setConnectionError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 500, height: 700 });
  const [originalSize, setOriginalSize] = useState({ width: 500, height: 700 });
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 });
  
  // New feature states
  const [showSearch, setShowSearch] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatTheme, setChatTheme] = useState('default');
  const [showTimestamp, setShowTimestamp] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [notifications, setNotifications] = useState(true);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatWindowRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const fileInputRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  const selectedUserRef = useRef(null);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    currentUserIdRef.current = user?._id ? String(user._id) : null;
  }, [user?._id]);

  const getSocketUrl = () => {
    // In production, client + API are served from the same origin on Render.
    // In dev, default to local API server.
    const fromEnv = import.meta?.env?.VITE_SOCKET_URL || import.meta?.env?.VITE_API_BASE_URL || '';
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
    return 'http://localhost:3000';
  };

  // Themes - using static classes to avoid Tailwind purging issues
  const getThemeClasses = (theme) => {
    switch (theme) {
      case 'dark':
        return {
          header: 'bg-purple-600',
          bg: 'bg-gray-900',
          text: 'text-white',
          messageOwn: 'bg-purple-600 text-white',
          messageOther: 'bg-gray-700 text-white'
        };
      case 'blue':
        return {
          header: 'bg-blue-600',
          bg: 'bg-blue-50',
          text: 'text-blue-900',
          messageOwn: 'bg-blue-500 text-white',
          messageOther: 'bg-blue-100 text-blue-900'
        };
      default:
        return {
          header: 'bg-indigo-600',
          bg: 'bg-white',
          text: 'text-gray-900',
          messageOwn: 'bg-indigo-500 text-white',
          messageOther: 'bg-gray-200 text-gray-800'
        };
    }
  };

  const themeClasses = getThemeClasses(chatTheme);

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const socketUrl = getSocketUrl();
      const newSocket = io(socketUrl, {
        auth: { token: token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 8,
        reconnectionDelayMax: 4000
      });

      newSocket.on('connect', () => {
        setIsOnline(true);
        setConnectionError(null);
        newSocket.emit('user_online');
      });

      newSocket.on('disconnect', (reason) => {
        setIsOnline(false);
        if (reason === 'io server disconnect') {
          setConnectionError('Server disconnected');
        }
      });

      newSocket.on('connect_error', (err) => {
        setIsOnline(false);
        setConnectionError(err?.message || 'Chat connection failed');
      });

      newSocket.on('receive_message', (message) => {
        console.log('=== RECEIVE_MESSAGE EVENT ===');
        console.log('Received message:', message);
        console.log('Message sender:', message.sender);
        console.log('Message receiver:', message.receiver);
        console.log('Current selectedUser:', selectedUser);
        console.log('Current messages count:', messages.length);
        console.log('Current user object:', user);
        console.log('Current user ID:', user?._id);
        console.log('User ID type:', typeof user?._id);
        
        const currentUserId = currentUserIdRef.current;
        if (!currentUserId) {
          console.log('User not available, skipping message');
          return;
        }
        
        setMessages(prev => {
          // Check if this message involves the current user
          const senderId = message.sender?._id || message.sender;
          const receiverId = message.receiver?._id || message.receiver;
          
          console.log('Sender ID:', senderId, 'Type:', typeof senderId);
          console.log('Receiver ID:', receiverId, 'Type:', typeof receiverId);
          console.log('Current User ID:', currentUserId, 'Type:', typeof currentUserId);
          
          const involvesCurrentUser = String(senderId) === String(currentUserId) || String(receiverId) === String(currentUserId);
          
          console.log('Message involves current user:', involvesCurrentUser);
          
          if (involvesCurrentUser) {
            // Remove any temporary messages with the same content
            const filtered = prev.filter(msg => 
              !(msg.isTemporary && msg.message === message.message && msg.sender._id === message.sender._id)
            );
            
            // Check if message already exists to avoid duplicates
            const messageExists = filtered.some(msg => 
              msg._id === message._id || 
              (msg.message === message.message && msg.sender._id === message.sender._id && msg.timestamp === message.timestamp)
            );
            
            if (!messageExists) {
              const newMessages = [...filtered, message];
              console.log('Added received message:', newMessages);
              return newMessages;
            } else {
              console.log('Message already exists, skipping');
            }
          } else {
            console.log('Message does not involve current user, skipping');
          }
          
          return prev;
        });
        
        const selected = selectedUserRef.current;
        if (selected && message.sender?._id && String(message.sender._id) === String(selected._id)) {
          markMessagesAsRead(selected._id);
        }

        // Browser notification
        if (notifications && message.sender?._id && String(message.sender._id) !== String(currentUserId)) {
          new Notification('New Message', {
            body: `${message.sender.name}: ${message.message}`,
            icon: '/favicon.ico'
          });
        }
      });

      newSocket.on('message_sent', (message) => {
        console.log('=== MESSAGE_SENT EVENT ===');
        console.log('Message sent confirmation:', message);
        console.log('Message sender:', message.sender);
        console.log('Message receiver:', message.receiver);
        console.log('Current selectedUser:', selectedUser);
        console.log('Current user object:', user);
        console.log('Current user ID:', user?._id);
        console.log('User ID type:', typeof user?._id);
        
        // Early return if user is not available
        if (!user || !user._id) {
          console.log('User not available, skipping sent message');
          return;
        }
        
        setMessages(prev => {
          // Check if this message involves the current user
          const senderId = message.sender?._id || message.sender;
          const receiverId = message.receiver?._id || message.receiver;
          const currentUserId = user._id;
          
          console.log('Sender ID:', senderId, 'Type:', typeof senderId);
          console.log('Receiver ID:', receiverId, 'Type:', typeof receiverId);
          console.log('Current User ID:', currentUserId, 'Type:', typeof currentUserId);
          
          const involvesCurrentUser = String(senderId) === String(currentUserId) || String(receiverId) === String(currentUserId);
          
          console.log('Sent message involves current user:', involvesCurrentUser);
          
          if (involvesCurrentUser) {
            // Remove any temporary messages with the same content
            const filtered = prev.filter(msg => 
              !(msg.isTemporary && msg.message === message.message && msg.sender._id === message.sender._id)
            );
            
            // Check if message already exists to avoid duplicates
            const messageExists = filtered.some(msg => 
              msg._id === message._id || 
              (msg.message === message.message && msg.sender._id === message.sender._id && msg.timestamp === message.timestamp)
            );
            
            if (!messageExists) {
              const newMessages = [...filtered, message];
              console.log('Added sent message:', newMessages);
              return newMessages;
            } else {
              console.log('Sent message already exists, skipping');
            }
          } else {
            console.log('Sent message does not involve current user, skipping');
          }
          
          return prev;
        });
      });

      newSocket.on('user_typing', (data) => {
        if (selectedUser && data.senderId === selectedUser._id) {
          setTypingUser(data.senderName);
          setIsTyping(data.isTyping);
        }
      });

      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [user, token, notifications]);

  // Fetch data
  useEffect(() => {
    if (user && token) {
      fetchConversations();
      fetchUsers();
      fetchGroups();
      requestNotificationPermission();
    }
  }, [user, token]);

  // Fetch messages when user/group is selected
  useEffect(() => {
    if (selectedUser && user && token) {
      fetchMessages(selectedUser._id);
    } else if (selectedGroup && user && token) {
      fetchGroupMessages(selectedGroup._id);
    }
  }, [selectedUser, selectedGroup, user, token]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/chat/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/chat/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
      markMessagesAsRead(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await fetch(`/api/chat/groups/${groupId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  };

  const markMessagesAsRead = async (userId) => {
    try {
      await fetch(`/api/chat/messages/${userId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    const messageData = {
      message: newMessage,
      messageType: selectedFile ? selectedFile.type.startsWith('image/') ? 'image' : 'file' : 'text',
      attachments: selectedFile ? [{
        filename: selectedFile.name,
        originalName: selectedFile.name,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        url: URL.createObjectURL(selectedFile)
      }] : []
    };

    if (selectedUser) {
      messageData.receiverId = selectedUser._id;
    } else if (selectedGroup) {
      messageData.groupId = selectedGroup._id;
    }

    if (replyToMessage) {
      messageData.replyTo = replyToMessage._id;
    }

    try {
      const formData = new FormData();
      Object.keys(messageData).forEach(key => {
        if (key === 'attachments') {
          // Handle attachments separately - append file and metadata
          if (selectedFile) {
            formData.append('attachments', selectedFile);
          }
          formData.append('attachments', JSON.stringify(messageData[key]));
        } else if (key === 'receiverId' || key === 'groupId' || key === 'replyTo' || key === 'messageType' || key === 'message') {
          // Don't stringify ObjectIds and simple strings
          formData.append(key, messageData[key]);
        } else {
          formData.append(key, JSON.stringify(messageData[key]));
        }
      });

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setNewMessage('');
        setSelectedFile(null);
        setReplyToMessage(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedUser && socket) {
      socket.emit('typing', {
        receiverId: selectedUser._id,
        isTyping: true
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          receiverId: selectedUser._id,
          isTyping: false
        });
      }, 1000);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShowFileUpload(false);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const editMessage = async (messageId, newText) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newText })
      });

      if (response.ok) {
        setEditingMessage(null);
        fetchMessages(selectedUser._id);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchMessages(selectedUser._id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      await fetch(`/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const forwardMessage = async (messageId, targetUserId) => {
    try {
      await fetch(`/api/chat/messages/${messageId}/forward`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId: targetUserId })
      });
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
  };

  const pinMessage = async (messageId) => {
    try {
      await fetch(`/api/chat/messages/${messageId}/pin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const exportChat = async () => {
    try {
      const response = await fetch(`/api/chat/export?userId=${selectedUser._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting chat:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      if (isMaximized) {
        setSize({ 
          width: window.innerWidth, 
          height: window.innerHeight - 64
        });
        setPosition({ x: 0, y: 0 });
      } else {
        setSize(originalSize);
        setPosition(originalPosition);
      }
    } else {
      if (!isMaximized) {
        setOriginalSize(size);
        setOriginalPosition(position);
      }
      setIsCollapsed(true);
    }
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const enhancedChatWindow = document.getElementById('enhanced-chat-window');
        if (enhancedChatWindow) {
          enhancedChatWindow.classList.toggle('hidden');
        }
      }
      // Toggle collapse with Ctrl/Cmd + Shift + M
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        toggleCollapse();
      }
      // Toggle maximize with Ctrl/Cmd + Shift + F
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        toggleMaximize();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, isMaximized]);

  const formatFullTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMessageStatus = (message) => {
    if (message.isTemporary) return 'sending';
    if (message.read) return 'read';
    if (message.delivered) return 'delivered';
    return 'sent';
  };

  const startVoiceRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          setSelectedFile(blob);
        };
        
        mediaRecorder.start();
        voiceRecorderRef.current = mediaRecorder;
      })
      .catch(err => console.error('Error accessing microphone:', err));
  };

  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.stop();
    }
  };

  // Don't render if no user or token
  if (!user || !token) {
    return null;
  }

  return (
    <div 
      id="enhanced-chat-window" 
      ref={chatWindowRef}
      className={`fixed hidden z-40 select-none shadow-2xl border border-black/10 rounded-2xl overflow-hidden backdrop-blur-sm ${themeClasses.bg}`}
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
          className={`${themeClasses.header} text-white ${isCollapsed ? 'px-3 py-2' : 'px-4 py-3'} ${isMaximized ? 'rounded-none' : ''} flex items-center justify-between ${isCollapsed ? 'cursor-pointer' : 'cursor-move'}`}
          onMouseDown={isCollapsed ? undefined : handleMouseDown}
          onDoubleClick={isCollapsed ? toggleCollapse : toggleMaximize}
          onClick={isCollapsed ? toggleCollapse : undefined}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white/20 ${isOnline ? 'bg-emerald-300' : 'bg-rose-300'}`}></div>
            <h3 className="font-semibold tracking-tight">Chat</h3>
            {isCollapsed && (
              <span className="text-xs text-indigo-200 ml-2">(Collapsed)</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowSearch(true)}
              className="text-white/90 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition-colors"
              title="Search Messages"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              onClick={() => setChatTheme(chatTheme === 'default' ? 'dark' : chatTheme === 'dark' ? 'blue' : 'default')}
              className="text-white/90 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition-colors"
              title="Change Theme"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </button>
            <button 
              onClick={exportChat}
              className="text-white/90 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition-colors"
              title="Export Chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button 
              onClick={toggleCollapse}
              className="text-white/90 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition-colors z-10"
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
              className="text-white/90 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition-colors z-10"
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
              onClick={() => document.getElementById('enhanced-chat-window').classList.add('hidden')}
              className="text-white/90 hover:text-white hover:bg-rose-500/60 rounded-lg p-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-black/5 flex flex-col bg-white/50">
              <div className="px-4 py-3 border-b border-black/5">
                <h4 className="font-semibold text-sm text-gray-800 tracking-tight">Conversations</h4>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm mt-2">Loading…</p>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-600">
                    <p className="text-sm">{error}</p>
                    <button 
                      onClick={() => {
                        setError(null);
                        fetchConversations();
                      }}
                      className="mt-3 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs hover:bg-red-100 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    {conversations && conversations.length > 0 ? conversations.map((conv) => (
                      <div
                        key={conv._id}
                        onClick={() => {
                          setSelectedUser(conv.user);
                          setSelectedGroup(null);
                        }}
                        className={`px-4 py-3 border-b border-black/5 cursor-pointer hover:bg-white/70 transition-colors ${
                          selectedUser?._id === conv.user._id ? 'bg-white border-l-4 border-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {conv.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">{conv.user.name}</p>
                              {conv.isOnline && (
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {conv.lastMessage?.message || 'No messages yet'}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="bg-rose-500 text-white text-[11px] rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
                              {conv.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-gray-600">
                        <p className="text-sm font-medium text-gray-800">No conversations yet</p>
                        <p className="text-xs mt-1 text-gray-600">Start a chat from the list below.</p>
                      </div>
                    )}
                    
                    {groups && groups.length > 0 ? groups.map((group) => (
                      <div
                        key={group._id}
                        onClick={() => {
                          setSelectedGroup(group);
                          setSelectedUser(null);
                        }}
                        className={`px-4 py-3 border-b border-black/5 cursor-pointer hover:bg-white/70 transition-colors ${
                          selectedGroup?._id === group._id ? 'bg-white border-l-4 border-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{group.name}</p>
                            <p className="text-xs text-gray-600 truncate">
                              {group.members.length} members
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-gray-600">
                        <p className="text-sm font-medium text-gray-800">No groups yet</p>
                        <p className="text-xs mt-1 text-gray-600">Create or join a group to chat together.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* New Chat Button */}
              <div className="px-4 py-3 border-t border-black/5 bg-white/60">
                <h4 className="font-semibold text-sm text-gray-800 mb-2 tracking-tight">Start new chat</h4>
                <div className="max-h-32 overflow-y-auto">
                  {users && users.length > 0 ? users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedGroup(null);
                      }}
                      className="px-2.5 py-2 hover:bg-white/70 cursor-pointer rounded-lg text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-gray-900 font-medium">{user.name}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-3 text-center text-gray-600">
                      <p className="text-sm">No users available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {(selectedUser || selectedGroup) ? (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-3 border-b border-black/5 bg-white/70">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 ${selectedUser ? 'bg-indigo-600' : 'bg-purple-600'} rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm`}>
                        {(selectedUser?.name || selectedGroup?.name).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 tracking-tight">{selectedUser?.name || selectedGroup?.name}</p>
                        <p className="text-xs text-gray-600">
                          {selectedUser ? (selectedUser.isOnline ? 'Online' : 'Offline') : `${selectedGroup?.members.length} members`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-white">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-700">No messages yet</p>
                          <p className="text-xs mt-1 text-gray-500">Say hello to start the conversation.</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwnMessage = message.sender._id === user._id;
                        
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            onMouseEnter={() => setShowTimestamp(message._id)}
                            onMouseLeave={() => setShowTimestamp(null)}
                          >
                            <div className="max-w-[75%] group">
                              {message.replyTo && (
                                <div className="text-xs text-gray-500 mb-1 pl-2 border-l-2 border-gray-300">
                                  Replying to: {message.replyTo.message}
                                </div>
                              )}
                              
                              <div
                                className={`px-3 py-2 rounded-lg text-sm ${
                                  isOwnMessage
                                    ? themeClasses.messageOwn
                                    : themeClasses.messageOther
                                }`}
                              >
                                {message.messageType === 'image' && message.attachments?.[0] && (
                                  <img 
                                    src={message.attachments[0].url} 
                                    alt="Attachment" 
                                    className="max-w-full h-auto rounded mb-2"
                                  />
                                )}
                                
                                {message.messageType === 'file' && message.attachments?.[0] && (
                                  <div className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded mb-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-xs">{message.attachments[0].originalName}</span>
                                  </div>
                                )}
                                
                                <p>{message.message}</p>
                                
                                {message.edited && (
                                  <span className="text-xs opacity-70">(edited)</span>
                                )}
                                
                                <div className={`flex items-center justify-between mt-1 ${
                                  isOwnMessage ? 'text-indigo-100' : 'text-gray-500'
                                }`}>
                                  <p className="text-xs">
                                    {showTimestamp === message._id ? formatFullTime(message.timestamp) : formatTime(message.timestamp)}
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
                                
                                {message.reactions && message.reactions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {message.reactions.map((reaction, index) => (
                                      <span key={index} className="text-xs">
                                        {reaction.emoji}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Message Actions */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1">
                                <button
                                  onClick={() => addReaction(message._id, '👍')}
                                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                  👍
                                </button>
                                <button
                                  onClick={() => addReaction(message._id, '❤️')}
                                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                  ❤️
                                </button>
                                <button
                                  onClick={() => setReplyToMessage(message)}
                                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                  Reply
                                </button>
                                {isOwnMessage && (
                                  <>
                                    <button
                                      onClick={() => setEditingMessage(message)}
                                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteMessage(message._id)}
                                      className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    
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
                  <div className="px-5 py-3 border-t border-black/5 bg-white/80">
                    {replyToMessage && (
                      <div className="mb-2 p-2 bg-gray-100 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span>Replying to: {replyToMessage.message}</span>
                          <button
                            onClick={() => setReplyToMessage(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={handleTyping}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white shadow-sm"
                        />
                        
                        {selectedFile && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{selectedFile.name}</span>
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowEmojiPicker(true)}
                          className="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                        >
                          😊
                        </button>
                        <button
                          onClick={() => setShowFileUpload(true)}
                          className="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                        >
                          📎
                        </button>
                        <button
                          onMouseDown={startVoiceRecording}
                          onMouseUp={stopVoiceRecording}
                          className="px-2.5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                        >
                          🎤
                        </button>
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() && !selectedFile}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Select a conversation</p>
                    <p className="text-xs mt-1 text-gray-500">Choose a user from the left to start chatting.</p>
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

      {/* Modals */}
      <MessageSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
        onSearch={(message) => {
          setShowSearch(false);
          // Navigate to message
        }}
      />
      
      <FileUpload 
        isOpen={showFileUpload} 
        onClose={() => setShowFileUpload(false)} 
        onFileSelect={handleFileSelect}
      />
      
      <EmojiPicker 
        isOpen={showEmojiPicker} 
        onClose={() => setShowEmojiPicker(false)} 
        onEmojiSelect={handleEmojiSelect}
      />
    </div>
  );
};

export default EnhancedChatWindow;
