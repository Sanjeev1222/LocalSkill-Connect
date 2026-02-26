import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Maximize2, Minimize2, Clock, Wifi, WifiOff
} from 'lucide-react';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import { useCall } from '../context/CallContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, activeCall, callStatus, endCall, resetCallState } = useCall();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [peerAudioEnabled, setPeerAudioEnabled] = useState(true);
  const [peerVideoEnabled, setPeerVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Format duration mm:ss
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Get media stream
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Failed to get media:', err);
      toast.error('Camera/microphone access denied. Please allow permissions.');
      return null;
    }
  }, []);

  // Create peer connection
  const createPeer = useCallback((stream, initiator) => {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peer.on('signal', (data) => {
      if (data.type === 'offer') {
        socket.emit('webrtc:offer', { roomId, offer: data });
      } else if (data.type === 'answer') {
        socket.emit('webrtc:answer', { roomId, answer: data });
      } else if (data.candidate) {
        socket.emit('webrtc:ice-candidate', { roomId, candidate: data });
      }
    });

    peer.on('stream', (remoteStr) => {
      console.log('[Peer] Got remote stream');
      setRemoteStream(remoteStr);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStr;
      }
    });

    peer.on('connect', () => {
      console.log('[Peer] Connected!');
      setPeerConnected(true);
      // Start call timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    });

    peer.on('close', () => {
      console.log('[Peer] Connection closed');
      setPeerConnected(false);
    });

    peer.on('error', (err) => {
      console.error('[Peer] Error:', err);
      toast.error('Connection issue. Try again.');
    });

    return peer;
  }, [socket, roomId]);

  // Initialize call
  useEffect(() => {
    if (!socket || !roomId) return;

    let stream = null;

    const init = async () => {
      stream = await getLocalStream();
      if (!stream) return;

      // If we're the caller, we initiate the peer
      const isCaller = activeCall?.isCaller;
      if (isCaller) {
        const peer = createPeer(stream, true);
        peerRef.current = peer;
      }

      // Listen for WebRTC signals
      socket.on('webrtc:offer', (data) => {
        if (data.roomId === roomId) {
          if (!peerRef.current) {
            // We're the receiver — create answering peer
            const peer = createPeer(stream, false);
            peerRef.current = peer;
          }
          peerRef.current.signal(data.offer);
        }
      });

      socket.on('webrtc:answer', (data) => {
        if (data.roomId === roomId && peerRef.current) {
          peerRef.current.signal(data.answer);
        }
      });

      socket.on('webrtc:ice-candidate', (data) => {
        if (data.roomId === roomId && peerRef.current) {
          peerRef.current.signal(data.candidate);
        }
      });

      socket.on('call:peer-toggle-audio', ({ enabled }) => {
        setPeerAudioEnabled(enabled);
      });

      socket.on('call:peer-toggle-video', ({ enabled }) => {
        setPeerVideoEnabled(enabled);
      });

      socket.on('call:ended', () => {
        cleanupCall();
        toast('Call ended', { icon: '📞' });
        setTimeout(() => navigate(-1), 1500);
      });
    };

    init();

    return () => {
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:ice-candidate');
      socket.off('call:peer-toggle-audio');
      socket.off('call:peer-toggle-video');
      socket.off('call:ended');
    };
  }, [socket, roomId, activeCall?.isCaller]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);

  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        socket?.emit('call:toggle-audio', { roomId, enabled: audioTrack.enabled });
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        socket?.emit('call:toggle-video', { roomId, enabled: videoTrack.enabled });
      }
    }
  };

  // End call
  const handleEndCall = () => {
    endCall();
    cleanupCall();
    navigate(-1);
  };

  // Toggle fullscreen 
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${peerConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-white text-sm font-medium">
              {peerConnected ? 'Connected' : callStatus === 'ringing' ? 'Ringing...' : 'Connecting...'}
            </span>
          </div>

          {peerConnected && (
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Remote video (full screen) */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                {callStatus === 'ringing' ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-white text-3xl"
                  >
                    📞
                  </motion.div>
                ) : (
                  <Video className="w-10 h-10 text-white" />
                )}
              </div>
              <p className="text-white text-lg font-medium">
                {callStatus === 'ringing' ? 'Calling...' : 'Waiting for connection...'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {callStatus === 'ringing'
                  ? 'Waiting for the other person to answer'
                  : 'Setting up video connection'}
              </p>
            </div>
          </div>
        )}

        {/* Peer muted/video off overlays */}
        {remoteStream && !peerVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90">
            <div className="text-center">
              <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">Camera turned off</p>
            </div>
          </div>
        )}

        {remoteStream && !peerAudioEnabled && (
          <div className="absolute top-16 right-4 bg-red-500/80 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5">
            <MicOff className="w-3.5 h-3.5" /> Muted
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        <motion.div
          drag
          dragConstraints={containerRef}
          className="absolute bottom-24 right-4 w-40 h-28 sm:w-52 sm:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-move"
        >
          {videoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* Audio indicator */}
          {!audioEnabled && (
            <div className="absolute bottom-1 left-1 bg-red-500 rounded-full p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Toggle Audio */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              audioEnabled
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </motion.button>

          {/* Toggle Video */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              videoEnabled
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </motion.button>

          {/* End Call */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30"
          >
            <PhoneOff className="w-7 h-7" />
          </motion.button>
        </div>
      </div>

      {/* Mirror CSS for local video */}
      <style>{`
        .mirror { transform: scaleX(-1); }
      `}</style>
    </div>
  );
};

export default VideoCall;
