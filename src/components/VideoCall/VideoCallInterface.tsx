import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Settings,
  Users,
  MessageSquare,
  Brain,
  FileText,
  Download,
  Camera,
  Volume2,
  VolumeX
} from 'lucide-react';
import { TranscriptPanel } from './TranscriptPanel';
import { MindMapPanel } from './MindMapPanel';
import { ActionItemsPanel } from './ActionItemsPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { BackgroundControls } from './BackgroundControls';
import { useMeeting, Participant } from '@/hooks/useMeeting';
import { useRecording } from '@/hooks/useRecording';
import { useTranscript } from '@/hooks/useTranscript';
import { useSearchParams } from 'react-router-dom';

export const VideoCallInterface: React.FC = () => {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('id');
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activePanel, setActivePanel] = useState<'transcript' | 'mindmap' | 'actions' | 'participants' | null>('transcript');
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [isMindMapEnabled, setIsMindMapEnabled] = useState(true);

  const { meeting, participants, isHost, loading, leaveMeeting, updateParticipantStatus } = useMeeting(meetingId || undefined);
  const { isRecording, startRecording, stopRecording } = useRecording(meetingId || undefined);
  const { transcript, isListening, startListening, stopListening } = useTranscript(meetingId || undefined);

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Initialize camera
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setUserStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    
    initCamera();
    
    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await updateParticipantStatus({ is_muted: newMuted });
  };

  const toggleVideo = async () => {
    const newVideoOn = !isVideoOn;
    setIsVideoOn(newVideoOn);
    
    if (userStream && videoRef.current) {
      const videoTrack = userStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoOn;
      }
    }
    
    await updateParticipantStatus({ is_video_on: newVideoOn });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      // Switch back to camera
      if (userStream && videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
      setIsScreenSharing(false);
    } else {
      try {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        setScreenStream(displayStream);
        if (videoRef.current) {
          videoRef.current.srcObject = displayStream;
        }
        setIsScreenSharing(true);
        
        // Stop screen sharing when user clicks stop in browser
        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          if (userStream && videoRef.current) {
            videoRef.current.srcObject = userStream;
          }
        };
      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleTranscription = () => {
    const newEnabled = !isTranscriptionEnabled;
    setIsTranscriptionEnabled(newEnabled);
    
    if (newEnabled && !isListening) {
      startListening();
    } else if (!newEnabled && isListening) {
      stopListening();
    }
  };
  const endCall = async () => {
    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    // Stop transcription if active
    if (isListening) {
      stopListening();
    }
    
    // Leave meeting
    await leaveMeeting();
    
    // Navigate back to home
    window.location.replace('/');
  };

  return (
    <div className="h-screen bg-video-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground">
            {meeting?.title || 'EchoMind Meeting'}
          </h1>
          {meetingId && (
            <Badge variant="outline" className="font-mono">
              ID: {meetingId}
            </Badge>
          )}
          <Badge variant={isRecording ? "destructive" : "secondary"} className="animate-pulse-glow">
            {isRecording ? 'REC' : 'READY'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isTranscriptionEnabled ? "default" : "secondary"}
            size="sm"
            onClick={toggleTranscription}
            className="glow-primary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {isListening ? 'Stop Transcript' : 'Start Transcript'}
          </Button>
          
          <Button
            variant={isMindMapEnabled ? "default" : "secondary"}
            size="sm"
            onClick={() => setIsMindMapEnabled(!isMindMapEnabled)}
            className="glow-ai"
          >
            <Brain className="w-4 h-4 mr-2" />
            Mind Map
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Export transcript and action items
              const exportData = {
                meeting: meeting?.title || 'EchoMind Meeting',
                meetingId: meetingId,
                date: new Date().toLocaleDateString(),
                transcript: transcript,
                participants: participants.map(p => p.name)
              };
              
              const dataStr = JSON.stringify(exportData, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `meeting-export-${meetingId}-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Main Video */}
            <Card className="col-span-2 relative overflow-hidden bg-gradient-card">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
                style={{ 
                  transform: 'scaleX(-1)',
                  filter: backgroundBlur && !isScreenSharing ? 'blur(8px)' : 'none'
                }}
              />
              
              {/* User overlay when video is off */}
              {!isVideoOn && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-semibold text-primary-foreground">
                        You
                      </span>
                    </div>
                    <p className="text-white">Camera Off</p>
                  </div>
                </div>
              )}
              
              {/* Video Overlay */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  You
                </Badge>
                {!isVideoOn && (
                  <Badge variant="destructive">Video Off</Badge>
                )}
              </div>
              
              {/* Background Controls */}
              <div className="absolute top-4 right-4">
                <BackgroundControls 
                  onBlurToggle={setBackgroundBlur}
                  isBlurred={backgroundBlur}
                />
              </div>
            </Card>

            {/* Participant Videos */}
            {participants.filter(p => p.name !== 'You').map((participant) => (
              <Card key={participant.id} className="relative overflow-hidden bg-gradient-card">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {participant.is_video_on ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl font-semibold text-primary-foreground">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{participant.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                  <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                    {participant.name}
                  </Badge>
                  {participant.is_muted && <MicOff className="w-3 h-3 text-destructive" />}
                  {participant.is_speaking && (
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Panels */}
        {activePanel && (
          <div className="w-96 border-l border-border bg-card overflow-hidden flex flex-col">
            <div className="flex border-b border-border">
              <Button
                variant={activePanel === 'transcript' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePanel('transcript')}
                className="flex-1 rounded-none"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Transcript
              </Button>
              <Button
                variant={activePanel === 'mindmap' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePanel('mindmap')}
                className="flex-1 rounded-none"
              >
                <Brain className="w-4 h-4 mr-2" />
                Mind Map
              </Button>
              <Button
                variant={activePanel === 'actions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePanel('actions')}
                className="flex-1 rounded-none"
              >
                <FileText className="w-4 h-4 mr-2" />
                Actions
              </Button>
              <Button
                variant={activePanel === 'participants' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActivePanel('participants')}
                className="flex-1 rounded-none"
              >
                <Users className="w-4 h-4 mr-2" />
                People
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {activePanel === 'transcript' && <TranscriptPanel transcript={transcript} meetingId={meetingId} />}
              {activePanel === 'mindmap' && <MindMapPanel meetingId={meetingId} />}
              {activePanel === 'actions' && <ActionItemsPanel meetingId={meetingId} />}
              {activePanel === 'participants' && <ParticipantsPanel participants={participants} />}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="control-bar p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleMute}
            className="rounded-full w-12 h-12"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={!isVideoOn ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-12 h-12"
          >
            <Monitor className="w-5 h-5" />
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            onClick={toggleRecording}
            className="rounded-full w-12 h-12 glow-primary"
          >
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-destructive'}`} />
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setActivePanel(activePanel ? null : 'transcript')}
            className="rounded-full w-12 h-12"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};