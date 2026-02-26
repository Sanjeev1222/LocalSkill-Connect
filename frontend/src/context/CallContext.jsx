import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Call state
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle | ringing | connecting | active | ended

  const socketRef = useRef(null);

  // Connect socket when user logs in
  useEffect(() => {
    if (!user?.token) {
      // Disconnect if no user
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const SOCKET_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : window.location.origin;

    const newSocket = io(SOCKET_URL, {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // ─── Incoming call ───
    newSocket.on('call:incoming', (data) => {
      console.log('[Socket] Incoming call:', data);
      setIncomingCall(data);
      setCallStatus('ringing');
    });

    // ─── Call initiated (caller gets room/call ID back) ───
    newSocket.on('call:initiated', (data) => {
      console.log('[Socket] Call initiated:', data);
      setActiveCall(prev => ({ ...prev, ...data }));
    });

    // ─── Call accepted ───
    newSocket.on('call:accepted', (data) => {
      console.log('[Socket] Call accepted:', data);
      setCallStatus('connecting');
      setActiveCall(prev => ({ ...prev, ...data }));
      setIncomingCall(null);
    });

    // ─── Call rejected ───
    newSocket.on('call:rejected', (data) => {
      console.log('[Socket] Call rejected:', data);
      setCallStatus('ended');
      setActiveCall(null);
      setIncomingCall(null);
    });

    // ─── Call ended ───
    newSocket.on('call:ended', (data) => {
      console.log('[Socket] Call ended:', data);
      setCallStatus('ended');
      setActiveCall(null);
      setIncomingCall(null);
    });

    // ─── Call missed ───
    newSocket.on('call:missed', (data) => {
      console.log('[Socket] Call missed:', data);
      setCallStatus('idle');
      setActiveCall(null);
      setIncomingCall(null);
    });

    // ─── Call error ───
    newSocket.on('call:error', (data) => {
      console.error('[Socket] Call error:', data.message);
      setCallStatus('idle');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user?.token]);

  // ─── Actions ───
  const initiateCall = useCallback((receiverUserId, technicianId, callerName) => {
    if (!socketRef.current) return;
    setCallStatus('ringing');
    setActiveCall({
      receiverId: receiverUserId,
      technicianId,
      callerName,
      isCaller: true
    });
    socketRef.current.emit('call:initiate', {
      receiverId: receiverUserId,
      technicianId,
      callerName: callerName || user?.name
    });
  }, [user]);

  const acceptCall = useCallback(() => {
    if (!socketRef.current || !incomingCall) return;
    socketRef.current.emit('call:accept', {
      callId: incomingCall.callId,
      roomId: incomingCall.roomId
    });
    setActiveCall({
      ...incomingCall,
      isCaller: false
    });
    setCallStatus('connecting');
  }, [incomingCall]);

  const rejectCall = useCallback(() => {
    if (!socketRef.current || !incomingCall) return;
    socketRef.current.emit('call:reject', {
      callId: incomingCall.callId,
      roomId: incomingCall.roomId
    });
    setIncomingCall(null);
    setCallStatus('idle');
  }, [incomingCall]);

  const endCall = useCallback(() => {
    if (!socketRef.current || !activeCall) return;
    socketRef.current.emit('call:end', {
      callId: activeCall.callId,
      roomId: activeCall.roomId
    });
    setActiveCall(null);
    setCallStatus('ended');
    setTimeout(() => setCallStatus('idle'), 2000);
  }, [activeCall]);

  const resetCallState = useCallback(() => {
    setCallStatus('idle');
    setActiveCall(null);
    setIncomingCall(null);
  }, []);

  const checkUserOnline = useCallback((targetUserId) => {
    return new Promise((resolve) => {
      if (!socketRef.current) return resolve(false);
      socketRef.current.emit('user:check-online', targetUserId);
      socketRef.current.once('user:online-status', (data) => {
        if (data.userId === targetUserId) {
          resolve(data.isOnline);
        }
      });
      // Timeout after 3s
      setTimeout(() => resolve(false), 3000);
    });
  }, []);

  return (
    <CallContext.Provider value={{
      socket,
      connected,
      incomingCall,
      activeCall,
      callStatus,
      initiateCall,
      acceptCall,
      rejectCall,
      endCall,
      resetCallState,
      checkUserOnline
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
};
