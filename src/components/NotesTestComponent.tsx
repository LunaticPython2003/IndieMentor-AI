import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { notesService } from '../lib/notesService';
import toast from 'react-hot-toast';

const NotesTestComponent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const testNotesGeneration = async () => {
    setIsGenerating(true);
    
    try {
      // Test with a simple prompt
      const prompt = "I want to learn about business strategy, marketing techniques, and leadership skills for entrepreneurs starting their first company.";
      
      const notesBlob = await notesService.generateHandbook(prompt);
      
      // Download the generated notes
      notesService.downloadPDF(notesBlob, 'test_handbook.pdf');
      
      toast.success('Test handbook generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating test notes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate test handbook');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes System Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test the handbook generation system with a sample prompt.
      </p>
      
      <button
        onClick={testNotesGeneration}
        disabled={isGenerating}
        className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Generate Test Handbook</span>
          </>
        )}
      </button>
    </div>
  );
};

export default NotesTestComponent;
