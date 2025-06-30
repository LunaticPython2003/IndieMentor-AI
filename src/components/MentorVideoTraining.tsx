import React, { useState, useRef } from 'react';
import { Upload, Video, CheckCircle, AlertCircle, Loader2, User, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { tavusService, TavusReplica } from '../lib/tavusService';

interface MentorVideoTrainingProps {
  mentorId: string;
  mentorName: string;
  onReplicaCreated?: (replica: TavusReplica) => void;
}

export const MentorVideoTraining: React.FC<MentorVideoTrainingProps> = ({
  mentorId,
  mentorName,
  onReplicaCreated
}) => {
  const [step, setStep] = useState<'upload' | 'consent' | 'training' | 'complete'>('upload');
  const [trainingVideo, setTrainingVideo] = useState<File | null>(null);
  const [consentVideo, setConsentVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replica, setReplica] = useState<TavusReplica | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const trainingFileRef = useRef<HTMLInputElement>(null);
  const consentFileRef = useRef<HTMLInputElement>(null);

  const handleTrainingVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTrainingVideo(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep('consent');
    }
  };

  const handleConsentVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setConsentVideo(file);
    }
  };

  const uploadVideoToStorage = async (file: File): Promise<string> => {
    // This is a placeholder implementation
    // In a real app, you'd upload to AWS S3, Google Cloud Storage, etc.
    // and return the public URL
    
    // For demo purposes, we'll use a placeholder URL
    // You should implement actual file upload to your cloud storage
    return `https://your-storage.com/videos/${file.name}-${Date.now()}`;
  };

  const createReplica = async () => {
    if (!trainingVideo) {
      toast.error('Please upload a training video first');
      return;
    }

    setIsUploading(true);
    setStep('training');

    try {
      // Upload training video to storage
      const trainingVideoUrl = await uploadVideoToStorage(trainingVideo);
      
      // Upload consent video if provided
      let consentVideoUrl: string | undefined;
      if (consentVideo) {
        consentVideoUrl = await uploadVideoToStorage(consentVideo);
      }

      // Create replica using Tavus API
      const newReplica = await tavusService.createReplica({
        train_video_url: trainingVideoUrl,
        consent_video_url: consentVideoUrl,
        replica_name: `${mentorName} AI Replica`,
        model_name: 'phoenix-3',
        properties: {
          voice_speed: 1.0,
          voice_stability: 0.8,
          enable_voice_training: true,
        },
      });

      setReplica(newReplica);
      setStep('complete');
      
      toast.success(`Replica creation started for ${mentorName}!`);
      onReplicaCreated?.(newReplica);

    } catch (error) {
      console.error('Error creating replica:', error);
      toast.error('Failed to create replica. Please try again.');
      setStep('consent');
    } finally {
      setIsUploading(false);
    }
  };

  const consentStatement = tavusService.generateConsentStatement(mentorName);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Video Training</h2>
        <p className="text-gray-600">
          Create an AI replica of {mentorName} for video conversations with users.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { key: 'upload', label: 'Upload Video', icon: Upload },
          { key: 'consent', label: 'Consent', icon: User },
          { key: 'training', label: 'Training', icon: Loader2 },
          { key: 'complete', label: 'Complete', icon: CheckCircle }
        ].map(({ key, label, icon: Icon }, index) => (
          <div key={key} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === key 
                ? 'border-primary-500 bg-primary-500 text-white' 
                : ['upload', 'consent'].includes(step) && index < ['upload', 'consent'].indexOf(step)
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-gray-100 text-gray-400'
            }`}>
              <Icon className={`w-5 h-5 ${step === 'training' && key === 'training' ? 'animate-spin' : ''}`} />
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step === key ? 'text-primary-600' : 'text-gray-500'
            }`}>
              {label}
            </span>
            {index < 3 && (
              <div className={`w-16 h-0.5 mx-4 ${
                ['upload', 'consent'].includes(step) && index < ['upload', 'consent'].indexOf(step)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Training Video</h3>
            <p className="text-gray-600 mb-4">
              Upload a high-quality video of {mentorName} speaking. The video should be at least 2 minutes long
              and show the person clearly speaking to the camera.
            </p>
            
            <input
              ref={trainingFileRef}
              type="file"
              accept="video/*"
              onChange={handleTrainingVideoUpload}
              className="hidden"
            />
            
            <button
              onClick={() => trainingFileRef.current?.click()}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Choose Video File
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: MP4, MOV, AVI • Max size: 500MB
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Video Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• High-quality video (1080p recommended)</li>
              <li>• Clear audio with minimal background noise</li>
              <li>• Good lighting and clear view of face</li>
              <li>• Natural speaking pace and expressions</li>
              <li>• Minimum 2 minutes, maximum 30 minutes</li>
            </ul>
          </div>
        </div>
      )}

      {step === 'consent' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Consent Statement Required</h3>
                <p className="text-yellow-800 mb-4">
                  The training video must include the following consent statement at the beginning,
                  or you can upload a separate consent video.
                </p>
                
                <div className="bg-white border border-yellow-300 rounded p-4 text-sm text-gray-900">
                  <strong>Required Statement:</strong><br />
                  "{consentStatement}"
                </div>
              </div>
            </div>
          </div>

          {trainingVideo && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Training Video Preview</h4>
              <div className="flex items-center space-x-4">
                {previewUrl && (
                  <video
                    src={previewUrl}
                    controls
                    className="w-48 h-32 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{trainingVideo.name}</p>
                  <p className="text-sm text-gray-500">
                    {(trainingVideo.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Consent Video (Optional)</h4>
            <p className="text-gray-600 text-sm">
              If your training video doesn't include the consent statement at the beginning,
              upload a separate consent video here.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={consentFileRef}
                type="file"
                accept="video/*"
                onChange={handleConsentVideoUpload}
                className="hidden"
              />
              
              {consentVideo ? (
                <div className="space-y-2">
                  <Eye className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="font-medium text-green-700">{consentVideo.name}</p>
                  <p className="text-sm text-gray-500">
                    {(consentVideo.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  <button
                    onClick={() => consentFileRef.current?.click()}
                    className="text-primary-500 hover:text-primary-600 text-sm underline"
                  >
                    Replace file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <button
                    onClick={() => consentFileRef.current?.click()}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Upload Consent Video
                  </button>
                  <p className="text-sm text-gray-500">Optional if included in training video</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep('upload')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={createReplica}
              disabled={isUploading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Training
            </button>
          </div>
        </div>
      )}

      {step === 'training' && (
        <div className="text-center py-12">
          <Loader2 className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Training Your AI Replica</h3>
          <p className="text-gray-600 mb-4">
            This process typically takes 20-30 minutes. You'll receive an email when it's complete.
          </p>
          
          {replica && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6 max-w-md mx-auto">
              <h4 className="font-semibold text-gray-900 mb-2">Training Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Replica ID: {replica.replica_id}</p>
                <p>Status: {replica.status}</p>
                <p>Model: {replica.model_name || 'phoenix-3'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'complete' && replica && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Training Started Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Your AI replica is being trained. You'll receive an email when it's ready for use.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
            <h4 className="font-semibold text-green-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-green-800 space-y-2 text-left">
              <li>• Training typically takes 20-30 minutes</li>
              <li>• You'll receive an email notification when complete</li>
              <li>• Once ready, users can start video conversations</li>
              <li>• Monitor usage through your dashboard</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorVideoTraining;
