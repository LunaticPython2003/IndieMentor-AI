import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Video, FileText } from 'lucide-react';
import { enhancedMentorAI } from '../lib/enhancedMentorAI';
import { GroqMessage } from '../lib/groqAI';
import { tavusService } from '../lib/tavusService';
import { notesService } from '../lib/notesService';
import TavusVideoChat from './TavusVideoChat';
import toast from 'react-hot-toast';

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

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MentorChatProps {
  mentor: Mentor;
  onClose?: () => void;
}

export const MentorChat: React.FC<MentorChatProps> = ({ mentor, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: enhancedMentorAI.getWelcomeMessage(mentor.name),
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<GroqMessage[]>([]);
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if video chat is available for this mentor
  useEffect(() => {
    const checkVideoAvailability = async () => {
      try {
        // Check if the mentor has videoAvailable property set to true
        if (mentor.videoAvailable === false) {
          setIsVideoAvailable(false);
          return;
        }
        
        // Check if the mentor has a replica ID mapped in Tavus service
        const isAvailable = await tavusService.isMentorVideoReady(mentor.id);
        setIsVideoAvailable(isAvailable);
        
        if (!isAvailable) {
          console.log(`Video chat not available for ${mentor.name} (ID: ${mentor.id})`);
        }
      } catch (error) {
        console.error('Error checking video availability:', error);
        setIsVideoAvailable(false);
      }
    };

    checkVideoAvailability();
  }, [mentor.id, mentor.videoAvailable]);

  const generateNotes = async () => {
    if (messages.length <= 1) {
      toast.error('Start a conversation before generating notes');
      return;
    }

    setIsGeneratingNotes(true);
    
    try {
      // Check if notes service is available
      const isServiceAvailable = await notesService.checkServiceAvailability();
      if (!isServiceAvailable) {
        throw new Error('Notes service is not available. Please make sure the handbook server is running.');
      }

      // Generate notes from conversation
      const notesBlob = await notesService.generateConversationNotes(
        mentor.name,
        mentor.expertise || [],
        messages
      );

      // Download the generated notes
      const filename = `${mentor.name.replace(/\s+/g, '_')}_conversation_notes.pdf`;
      notesService.downloadPDF(notesBlob, filename);
      
      toast.success('Notes generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate notes');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Update conversation history for context
      const newHistory: GroqMessage[] = [
        ...conversationHistory,
        { role: 'user', content: currentMessage }
      ];

      const response = await enhancedMentorAI.getChatResponse(
        mentor.name,
        mentor,
        currentMessage,
        conversationHistory
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation history
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: response }
      ]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show video chat if enabled
  if (showVideoChat) {
    return (
      <TavusVideoChat
        mentor={mentor}
        onClose={() => setShowVideoChat(false)}
        onFallbackToText={() => setShowVideoChat(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
              alt={mentor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
            <p className="text-sm text-gray-600">{mentor.title}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Notes Generation Button */}
          <button
            onClick={generateNotes}
            disabled={isGeneratingNotes || messages.length <= 1}
            className="p-2 hover:bg-primary-200 rounded-full transition-colors text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title={messages.length <= 1 ? "Start a conversation to generate notes" : "Generate conversation notes"}
          >
            {isGeneratingNotes ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </button>

          {/* Video Chat Button - Visible but disabled if not available */}
          <button
            onClick={() => isVideoAvailable ? setShowVideoChat(true) : toast.error('Video chat is not available with this mentor')}
            className={`p-2 rounded-full transition-colors ${isVideoAvailable 
              ? 'hover:bg-primary-200 text-primary-600' 
              : 'text-gray-400 cursor-not-allowed'}`}
            title={isVideoAvailable ? "Start video chat" : "Video chat not available with this mentor"}
          >
            <Video className="w-5 h-5" />
          </button>
          
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md`}>
              {!message.isUser && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-primary-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.isUser && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${mentor.name} anything...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default MentorChat;
