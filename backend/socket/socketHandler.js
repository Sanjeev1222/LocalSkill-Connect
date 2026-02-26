const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VideoCall = require('../models/VideoCall');

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Auth middleware — verify JWT on connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${socket.user.name} (${userId})`);

    // Register user online
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join own room for direct messaging
    socket.join(userId);

    // ─── Initiate a call ───
    socket.on('call:initiate', async (data) => {
      const { receiverId, technicianId, callerName, callerAvatar } = data;
      const roomId = `call_${userId}_${receiverId}_${Date.now()}`;

      try {
        // Save call record
        const call = await VideoCall.create({
          caller: userId,
          receiver: receiverId,
          technician: technicianId,
          roomId,
          status: 'ringing'
        });

        // Join caller to the room
        socket.join(roomId);

        // Notify receiver
        io.to(receiverId).emit('call:incoming', {
          callId: call._id.toString(),
          roomId,
          callerId: userId,
          callerName: callerName || socket.user.name,
          callerAvatar: callerAvatar || '',
          technicianId
        });

        // Confirm to caller
        socket.emit('call:initiated', {
          callId: call._id.toString(),
          roomId
        });

        // Auto-miss after 60s if not answered
        setTimeout(async () => {
          const updated = await VideoCall.findById(call._id);
          if (updated && updated.status === 'ringing') {
            updated.status = 'missed';
            await updated.save();
            io.to(roomId).emit('call:missed', { callId: call._id.toString(), roomId });
            io.to(receiverId).emit('call:missed', { callId: call._id.toString(), roomId });
          }
        }, 60000);
      } catch (err) {
        socket.emit('call:error', { message: 'Failed to initiate call' });
      }
    });

    // ─── Accept a call ───
    socket.on('call:accept', async (data) => {
      const { callId, roomId } = data;
      try {
        const call = await VideoCall.findById(callId);
        if (!call || call.status !== 'ringing') return;

        call.status = 'active';
        call.startedAt = new Date();
        await call.save();

        socket.join(roomId);

        // Notify both parties
        io.to(roomId).emit('call:accepted', {
          callId,
          roomId
        });
      } catch (err) {
        socket.emit('call:error', { message: 'Failed to accept call' });
      }
    });

    // ─── Reject a call ───
    socket.on('call:reject', async (data) => {
      const { callId, roomId } = data;
      try {
        const call = await VideoCall.findById(callId);
        if (!call || call.status !== 'ringing') return;

        call.status = 'rejected';
        await call.save();

        io.to(roomId).emit('call:rejected', { callId, roomId });
      } catch (err) {
        socket.emit('call:error', { message: 'Failed to reject call' });
      }
    });

    // ─── End a call ───
    socket.on('call:end', async (data) => {
      const { callId, roomId } = data;
      try {
        const call = await VideoCall.findById(callId);
        if (!call) return;

        call.status = 'ended';
        call.endedAt = new Date();
        if (call.startedAt) {
          call.duration = Math.round((call.endedAt - call.startedAt) / 1000);
        }
        await call.save();

        io.to(roomId).emit('call:ended', {
          callId,
          roomId,
          duration: call.duration
        });
      } catch (err) {
        socket.emit('call:error', { message: 'Failed to end call' });
      }
    });

    // ─── WebRTC Signaling ───
    socket.on('webrtc:offer', (data) => {
      const { roomId, offer } = data;
      socket.to(roomId).emit('webrtc:offer', {
        offer,
        roomId,
        from: userId
      });
    });

    socket.on('webrtc:answer', (data) => {
      const { roomId, answer } = data;
      socket.to(roomId).emit('webrtc:answer', {
        answer,
        roomId,
        from: userId
      });
    });

    socket.on('webrtc:ice-candidate', (data) => {
      const { roomId, candidate } = data;
      socket.to(roomId).emit('webrtc:ice-candidate', {
        candidate,
        roomId,
        from: userId
      });
    });

    // ─── Toggle audio/video ───
    socket.on('call:toggle-audio', (data) => {
      const { roomId, enabled } = data;
      socket.to(roomId).emit('call:peer-toggle-audio', { userId, enabled });
    });

    socket.on('call:toggle-video', (data) => {
      const { roomId, enabled } = data;
      socket.to(roomId).emit('call:peer-toggle-video', { userId, enabled });
    });

    // ─── Check if a user is online ───
    socket.on('user:check-online', (targetUserId) => {
      const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId).size > 0;
      socket.emit('user:online-status', { userId: targetUserId, isOnline });
    });

    // ─── Disconnect ───
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.name} (${userId})`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
