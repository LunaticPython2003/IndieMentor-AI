import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Loader2, AlertCircle, FileText } from 'lucide-react';
import { tavusService } from '../lib/tavusService';
import { notesService } from '../lib/notesService';
import type { TavusConversation } from '../lib/tavusService';
import { toast } from 'react-hot-toast';

interface Mentor {
  id: string;
  name: string;
  title: string;
  description: string;
  expertise: string[];
  avatar_url?: string;
  price?: number;
  videoAvailable?: boolean;
}

interface TavusVideoChatProps {
  mentor: Mentor;
  onClose?: () => void;
  onFallbackToText?: () => void;
}

export const TavusVideoChat: React.FC<TavusVideoChatProps> = ({ 
  mentor, 
  onClose, 
  onFallbackToText 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [replicaReady, setReplicaReady] = useState<boolean | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [videoSessionNotes, setVideoSessionNotes] = useState<Array<{ content: string; isUser: boolean; timestamp: Date }>>([]);
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Check if replicas are available for video chat
  useEffect(() => {
    const checkReplicaStatus = async () => {
      try {
        // Check if the mentor has videoAvailable property set to true
        if (mentor.videoAvailable === false) {
          setReplicaReady(false);
          setError('Video chat is not available with this mentor. Please use text chat instead.');
          return;
        }
        
        // Check if this mentor has a replica ID assigned in Tavus service
        const hasReplicaId = await tavusService.isMentorVideoReady(mentor.id);
        
        if (!hasReplicaId) {
          setReplicaReady(false);
          setError('Video chat is currently unavailable for this mentor. Please try again later or use text chat.');
          return;
        }
        
        setReplicaReady(true);
      } catch (err) {
        console.error('Error checking replica status:', err);
        setReplicaReady(false);
        setError('Unable to check video chat availability. Please try text chat instead.');
      }
    };

    checkReplicaStatus();
  }, [mentor.id, mentor.videoAvailable]);

  const startVideoChat = async () => {
    if (!replicaReady) {
      toast.error('Video chat is not available for this mentor');
      return;
    }

    // Debug: Check if the method exists
    console.log('TavusService methods:', Object.getOwnPropertyNames(tavusService));
    console.log('createMentorVideoChat exists:', typeof tavusService.createMentorVideoChat === 'function');

    setIsConnecting(true);
    setError(null);

    try {
      // Create a new conversation with the mentor's assigned replica
      const newConversation = await tavusService.createMentorVideoChat(mentor.id, mentor.name);

      setConversation(newConversation);

      // Initialize local video if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (mediaError) {
          console.warn('Could not access camera/microphone:', mediaError);
          toast.error('Could not access camera or microphone. You can still participate in the conversation.');
        }
      }

      setIsConnected(true);
      toast.success(`Connected to video chat with ${mentor.name}!`);

    } catch (err) {
      console.error('Error starting video chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to start video chat');
      toast.error('Failed to start video chat. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const endVideoChat = async () => {
    if (conversation) {
      try {
        await tavusService.deleteConversation(conversation.conversation_id);
      } catch (err) {
        console.error('Error ending conversation:', err);
      }
    }

    // Stop local video stream
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    setIsConnected(false);
    setConversation(null);
    onClose?.();
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const generateVideoNotes = async () => {
    if (!conversation) {
      toast.error('No active video conversation to generate notes from');
      return;
    }

    setIsGeneratingNotes(true);
    
    try {
      // Check if notes service is available
      const isServiceAvailable = await notesService.checkServiceAvailability();
      if (!isServiceAvailable) {
        throw new Error('Notes service is not available. Please make sure the handbook server is running.');
      }

      // Create notes from video session
      const videoSessionSummary = videoSessionNotes.length > 0 
        ? videoSessionNotes 
        : [
            { content: `Started video chat session with ${mentor.name}`, isUser: false, timestamp: new Date() },
            { content: `Discussed topics related to: ${mentor.expertise?.join(', ') || 'mentoring'}`, isUser: false, timestamp: new Date() }
          ];

      // Generate notes from video session
      const notesBlob = await notesService.generateConversationNotes(
        mentor.name,
        mentor.expertise || [],
        videoSessionSummary
      );

      // Download the generated notes
      const filename = `${mentor.name.replace(/\s+/g, '_')}_video_session_notes.pdf`;
      notesService.downloadPDF(notesBlob, filename);
      
      toast.success('Video session notes generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating video notes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate video session notes');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  if (replicaReady === null) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Checking video chat availability...</p>
          </div>
        </div>
      </div>
    );
  }

  if (replicaReady === false || error) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <img
              src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
              alt={mentor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
              <p className="text-sm text-red-600">Video Chat Unavailable</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Error Message */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Chat Not Available</h3>
            <p className="text-gray-600 mb-6">
              {error || 'Video chat is temporarily unavailable. Please try again later or use text chat instead.'}
            </p>
            
            <div className="space-y-3">
              {onFallbackToText && (
                <button
                  onClick={onFallbackToText}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Start Text Chat Instead
                </button>
              )}
              
              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
              alt={mentor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Video Chat Active' : 'Ready for Video Chat'}
            </p>
          </div>
        </div>
        
        <button
          onClick={endVideoChat}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {!isConnected ? (
          // Pre-connection state
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Video Chat with {mentor.name}</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Connect face-to-face with a professional AI representative for your mentoring session.
              </p>
              
              <button
                onClick={startVideoChat}
                disabled={isConnecting}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    <span>Start Video Chat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Connected state
          <div className="relative h-full">
            {/* Main video area - Tavus conversation iframe */}
            {conversation?.conversation_url && (
              <iframe
                ref={videoRef}
                src={conversation.conversation_url}
                className="w-full h-full"
                allow="camera; microphone; autoplay; encrypted-media; fullscreen"
                title={`Video chat with ${mentor.name}`}
              />
            )}

            {/* Local video preview */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
              />
              {!isVideoEnabled && (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <VideoOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {isConnected && (
        <div className="p-4 bg-gray-100 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                isVideoEnabled 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                isAudioEnabled 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Notes Generation Button */}
            <button
              onClick={generateVideoNotes}
              disabled={isGeneratingNotes}
              className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate session notes"
            >
              {isGeneratingNotes ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={endVideoChat}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-2">
            {onFallbackToText && (
              <button
                onClick={onFallbackToText}
                className="text-primary-500 hover:text-primary-600 underline"
              >
                Switch to text chat
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default TavusVideoChat;
