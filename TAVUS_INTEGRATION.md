# Tavus AI Video Chat Integration - Celebrity Replicas

This document explains how to use the Tavus AI video chat integration with pre-built celebrity replicas in your IndieMentor AI platform.

## Overview

Tavus provides high-quality pre-built celebrity and professional AI replicas that can represent mentors in video conversations. This approach eliminates the need for mentors to create their own video replicas while still providing engaging face-to-face conversations.

## Features

### For Mentors
- **Instant Video Availability**: No training videos required
- **Professional Representation**: High-quality celebrity replicas represent their expertise
- **Easy Setup**: Video chat enabled immediately upon mentor creation
- **No Personal Video Upload**: Privacy-friendly approach

### For Users
- **Immediate Access**: Video conversations available instantly
- **Professional Quality**: High-quality celebrity representatives
- **Seamless Experience**: Consistent video quality across all mentors
- **Mobile Compatible**: Works on desktop and mobile browsers

## Setup Instructions

### 1. Tavus Account Setup

1. Sign up for a Tavus account at [platform.tavus.io](https://platform.tavus.io/)
2. Get your API key from the Developer Portal
3. Add your API key to the `.env` file:
   ```
   VITE_TAVUS_API_KEY=your_tavus_api_key_here
   ```

### Backend Setup

The backend includes celebrity replica integration endpoints:

- `GET /tavus/stock-replicas` - List available celebrity replicas
- `POST /tavus/conversations` - Start a video conversation with celebrity replica
- `GET /tavus/conversations/{conversation_id}` - Get conversation details
- `DELETE /tavus/conversations/{conversation_id}` - End conversation
- `GET /tavus/mentors/{mentor_id}/video-status` - Check video availability (always available)

### 3. Frontend Components

#### TavusVideoChat Component
- Full video chat interface with camera controls
- Automatic fallback to text chat if video unavailable
- Real-time connection status and error handling

#### MentorVideoTraining Component
- Step-by-step replica creation process
- Video upload with requirements validation
- Consent statement handling
- Training progress tracking

#### Enhanced MentorChat Component
- Video chat button integration
- Seamless mode switching
- Video availability detection

## Usage Guide

### Automatic Video Chat Setup

1. **Mentor Creation**
   - Complete the standard mentor setup process
   - Video chat is automatically available upon mentor creation
   - No additional video training required

2. **Celebrity Replica Selection**
   - System automatically selects appropriate celebrity replica
   - Based on mentor expertise and professional category
   - High-quality professional representatives

3. **Instant Availability**
   - Video chat available immediately
   - No waiting for training or processing
   - Consistent quality across all mentors

### Starting Video Conversations

1. **User Experience**
   - Users see video chat option when available
   - Click "Start Video Chat" to begin
   - Automatic camera/microphone permissions request

2. **Conversation Controls**
   - Toggle video/audio on/off
   - End conversation
   - Switch to text chat if needed

3. **Fallback Handling**
   - Automatic fallback to text if video unavailable
   - Clear messaging about video status
   - Graceful error handling

## Technical Implementation

### File Structure
```
src/
├── lib/
│   └── tavusService.ts          # Main Tavus API integration
├── components/
│   ├── TavusVideoChat.tsx       # Video chat interface
│   ├── MentorVideoTraining.tsx  # Replica creation flow
│   └── MentorChat.tsx           # Enhanced with video options
└── pages/
    ├── CreateMentorPage.tsx     # Updated with video training
    └── MentorDetailPage.tsx     # Enhanced with video options

mentor_agent/
├── models/
│   └── tavus.py                 # Pydantic models for Tavus
├── routes/
│   └── tavus.py                 # API endpoints for Tavus
└── main.py                      # Updated with Tavus routes
```

### Key Components

#### TavusService Class
- Handles all Tavus API interactions
- Replica management (create, read, delete)
- Conversation management
- Error handling and retry logic

#### Video Chat Component
- WebRTC integration for local video
- Tavus iframe embedding for AI replica
- Camera/microphone controls
- Connection status management

#### Training Component
- Multi-step wizard interface
- File upload handling
- Progress tracking
- Success/error states

## Best Practices

### Video Training
- **Quality Requirements**: Use high-quality videos with good lighting
- **Content Guidelines**: Include diverse expressions and speaking styles
- **Consent Compliance**: Always include required consent statement
- **Testing**: Test replicas before making them live

### User Experience
- **Performance**: Optimize for mobile and low-bandwidth connections
- **Accessibility**: Include keyboard navigation and screen reader support
- **Error Handling**: Provide clear messaging for connection issues
- **Privacy**: Respect user privacy and data protection

### Security
- **API Keys**: Never expose API keys in client-side code
- **Authentication**: Require user authentication for video features
- **Rate Limiting**: Implement appropriate rate limits for API calls
- **Data Protection**: Handle user data according to privacy regulations

## Troubleshooting

### Common Issues

1. **Replica Training Fails**
   - Check video quality requirements
   - Ensure consent statement is present
   - Verify video file size and format

2. **Video Chat Not Working**
   - Check camera/microphone permissions
   - Verify network connectivity
   - Ensure replica status is "completed"

3. **API Errors**
   - Verify API key is correct
   - Check rate limits
   - Review error logs

### Debug Tools
- Browser developer console for client-side errors
- Network tab to inspect API calls
- Tavus Developer Portal for replica status
- Backend logs for server-side issues

## Pricing Considerations

### Tavus Costs
- Replica training: One-time cost per mentor
- Conversation minutes: Usage-based pricing
- Storage: Ongoing costs for video storage

### Business Model
- Premium pricing for video-enabled mentors
- Tiered subscription plans
- Usage-based billing options

## Future Enhancements

- **Group Video Sessions**: Multiple users with one mentor
- **Screen Sharing**: Share documents during video calls
- **Recording**: Save important conversations
- **Analytics**: Track engagement and usage metrics
- **Mobile App**: Native mobile video chat experience

## Support

For technical support:
- Tavus Documentation: [docs.tavus.io](https://docs.tavus.io/)
- Tavus Discord: [discord.gg/tavus](https://discord.gg/2MEZZaWAwf)
- Email: developer-support@tavus.io

## API Reference

### Create Replica
```typescript
await tavusService.createReplica({
  train_video_url: "https://your-storage.com/video.mp4",
  consent_video_url: "https://your-storage.com/consent.mp4", // optional
  replica_name: "Mentor Name AI Replica",
  model_name: "phoenix-3"
});
```

### Start Conversation
```typescript
await tavusService.createMentorVideoChat(
  mentorId,
  mentorName,
  replicaId
);
```

### Check Status
```typescript
const isReady = await tavusService.isMentorVideoReady(mentorName);
```
