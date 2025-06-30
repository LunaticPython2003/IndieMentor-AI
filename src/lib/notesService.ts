// Notes and Handbook Generation Service
// Integrates with the backend handbook API

const HANDBOOK_API_BASE = typeof window !== 'undefined' && window.location.origin.includes('localhost') 
  ? '/IndieMentor/api/v1/handbook'  // Use proxy path in development
  : 'http://localhost:8001/IndieMentor/api/v1/handbook';  // Direct connection for production

export interface HandbookRequest {
  prompt: string;
}

export interface ConversationNotesRequest {
  mentor_name: string;
  mentor_expertise: string[];
  messages: Array<{ content: string; isUser: boolean; timestamp?: Date }>;
}

class NotesService {
  
  // No need for auth token as the handbook API is public

  // Generate a handbook/notes based on conversation

  async generateHandbook(prompt: string): Promise<Blob> {
    try {
      const response = await fetch(`${HANDBOOK_API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate handbook: ${response.status} ${response.statusText}`);
      }

      // Return the PDF blob
      return await response.blob();
    } catch (error) {
      console.error('Error generating handbook:', error);
      throw new Error('Failed to generate handbook. Please try again.');
    }
  }

  // Generate notes from conversation with a mentor

  async generateConversationNotes(
    mentorName: string,
    mentorExpertise: string[],
    messages: Array<{ content: string; isUser: boolean; timestamp?: Date }>
  ): Promise<Blob> {
    try {
      const requestData: ConversationNotesRequest = {
        mentor_name: mentorName,
        mentor_expertise: mentorExpertise,
        messages: messages.map(msg => ({
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp
        }))
      };

      const response = await fetch(`${HANDBOOK_API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate conversation notes: ${response.status} ${response.statusText}`);
      }

      // Return the PDF blob
      return await response.blob();
    } catch (error) {
      console.error('Error generating conversation notes:', error);
      throw new Error('Failed to generate conversation notes. Please try again.');
    }
  }

  // All processing is now done on the backend

  // Download PDF blob as file
  downloadPDF(blob: Blob, filename: string = 'conversation-notes.pdf'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Check if handbook service is available
  async checkServiceAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${HANDBOOK_API_BASE}/generate`, {
        method: 'HEAD',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.status !== 404;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const notesService = new NotesService();
export default NotesService;
