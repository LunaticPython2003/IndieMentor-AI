// Tavus AI Video Chat Service
// Documentation: https://docs.tavus.io/

const TAVUS_API_BASE = 'https://tavusapi.com/v2';
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY || '10368f13d8194fdf9280547f51fedaf0';

// Available replica IDs are mapped to mentor IDs below

// Map mentors to replica IDs (mapped to your actual mentors)
const MENTOR_REPLICA_MAPPING: { [mentorId: string]: string } = {
  'mentor_001': 'r92debe21318',  // Dr. Sarah Chen - Senior Software Engineer & Tech Lead
  'mentor_002': 'r6ae5b6efc9d',  // Marcus Johnson - Startup Founder & Business Strategist  
  'mentor_003': 'r4317e64d25a',  // Elena Rodriguez - UX Design Director & Product Innovation Expert
  'mentor_004': 'r93183fb36c0'   // Dr. Michael Thompson - AI/ML Research Scientist & Data Science Expert
};

export interface TavusReplica {
  replica_id: string;
  status: 'training' | 'completed' | 'error';
  replica_name?: string;
  model_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TavusConversation {
  conversation_id: string;
  status: 'active' | 'completed' | 'error';
  conversation_url?: string;
  created_at?: string;
  properties?: {
    max_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    language?: string;
  };
}

export interface CreateReplicaData {
  train_video_url: string;
  consent_video_url?: string;
  replica_name?: string;
  callback_url?: string;
  model_name?: 'phoenix-3' | 'phoenix-2';
  properties?: {
    voice_speed?: number;
    voice_stability?: number;
    max_training_duration?: number;
    enable_voice_training?: boolean;
  };
}

export interface CreateConversationData {
  replica_id: string;
  persona_id?: string;
  conversation_name?: string;
  conversational_context?: string;
  custom_greeting?: string;
  audio_only?: boolean;
  callback_url?: string;
  properties?: {
    max_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    language?: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh' | 'hi' | 'ar';
    participant_name?: string;
  };
}

class TavusService {
  private apiKey: string;

  constructor(apiKey: string = TAVUS_API_KEY) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${TAVUS_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Tavus API Error: ${response.status} - ${error.message || response.statusText}`);
    }

    return response.json();
  }

  // Replica Management
  async createReplica(data: CreateReplicaData): Promise<TavusReplica> {
    return this.makeRequest('/replicas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReplica(replicaId: string): Promise<TavusReplica> {
    return this.makeRequest(`/replicas/${replicaId}`);
  }

  async getAllReplicas(): Promise<TavusReplica[]> {
    const response = await this.makeRequest('/replicas');
    return response.data || [];
  }

  async deleteReplica(replicaId: string): Promise<{ message: string }> {
    return this.makeRequest(`/replicas/${replicaId}`, {
      method: 'DELETE',
    });
  }

  // Conversation Management
  async createConversation(data: CreateConversationData): Promise<TavusConversation> {
    return this.makeRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(conversationId: string): Promise<TavusConversation> {
    return this.makeRequest(`/conversations/${conversationId}`);
  }

  async getAllConversations(): Promise<TavusConversation[]> {
    const response = await this.makeRequest('/conversations');
    return response.data || [];
  }

  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    return this.makeRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // Video Chat Integration - for prepaid mentors with replica IDs
  async createMentorVideoChat(mentorId: string, _mentorName: string): Promise<TavusConversation> {
    // Check if this mentor has a replica ID assigned
    const replicaId = MENTOR_REPLICA_MAPPING[mentorId];
    
    if (!replicaId) {
      throw new Error('Video chat is only available for prepaid mentors. Custom mentors can only use text chat.');
    }

    // Use minimal format - only replica_id is required according to docs
    const requestBody = {
      replica_id: replicaId
    };

    return this.createConversation(requestBody);
  }

  // Check if video chat is available (only for prepaid mentors with replica IDs)
  async isMentorVideoReady(mentorId: string): Promise<boolean> {
    // Check if this mentor has a replica ID assigned
    const hasReplicaId = Object.hasOwnProperty.call(MENTOR_REPLICA_MAPPING, mentorId);
    
    // Check if API Key is configured
    const hasApiKey = TAVUS_API_KEY && TAVUS_API_KEY.length > 0;
    
    if (!hasApiKey) {
      console.warn('Tavus API key not configured properly. Video chat unavailable.');
    }
    
    return hasReplicaId && hasApiKey;
  }

  // Check if a mentor has video capabilities
  isMentorVideoEnabled(mentorId: string): boolean {
    return Object.hasOwnProperty.call(MENTOR_REPLICA_MAPPING, mentorId);
  }

  // Get available stock/celebrity replicas
  async getStockReplicas(): Promise<TavusReplica[]> {
    try {
      // Use the correct Tavus API endpoint to get system (stock) replicas
      const response = await this.makeRequest('/replicas?replica_type=system&limit=50');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching stock replicas:', error);
      // Return known stock replica IDs if the API call fails
      return [
        { replica_id: 'r92debe21318', status: 'completed', replica_name: 'Professional Representative 1' },
        { replica_id: 'r6ae5b6efc9d', status: 'completed', replica_name: 'Professional Representative 2' },
        { replica_id: 'r4317e64d25a', status: 'completed', replica_name: 'Professional Representative 3' },
        { replica_id: 'r93183fb36c0', status: 'completed', replica_name: 'Professional Representative 4' },
      ] as TavusReplica[];
    }
  }

  // Generate consent statement for replica training
  generateConsentStatement(fullName: string): string {
    return `I, ${fullName}, am currently speaking and consent Tavus to create an AI clone of me by using the audio and video samples I provide. I understand that this AI clone can be used to create videos that look and sound like me.`;
  }

  // Helper to create training video upload URL (you'd implement your own storage solution)
  async getTrainingVideoUploadUrl(_mentorId: string): Promise<string> {
    // This would typically integrate with your file storage service (S3, etc.)
    // For now, return a placeholder
    throw new Error('Training video upload not implemented. Please implement your own storage solution.');
  }
}

// Export singleton instance
export const tavusService = new TavusService();

// Export types and service
export default TavusService;
