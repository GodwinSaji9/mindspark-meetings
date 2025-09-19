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

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  status: 'online' | 'away' | 'busy';
}

export const VideoCallInterface: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activePanel, setActivePanel] = useState<'transcript' | 'mindmap' | 'actions' | 'participants' | null>('transcript');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [isMindMapEnabled, setIsMindMapEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'You',
      isMuted: false,
      isVideoOn: true,
      isSpeaking: false,
      status: 'online'
    },
    {
      id: '2', 
      name: 'Alice Johnson',
      isMuted: false,
      isVideoOn: true,
      isSpeaking: true,
      status: 'online'
    },
    {
      id: '3',
      name: 'Bob Smith', 
      isMuted: true,
      isVideoOn: false,
      isSpeaking: false,
      status: 'online'
    }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [backgroundBlur, setBackgroundBlur] = useState(false);

  useEffect(() => {
    // Initialize camera
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    
    initCamera();
  }, []);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleRecording = () => setIsRecording(!isRecording);
  const endCall = () => {
    console.log('Ending call...');
  };

  return (
    <div className="h-screen bg-video-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground">EchoMind Meeting</h1>
          <Badge variant={isRecording ? "destructive" : "secondary"} className="animate-pulse-glow">
            {isRecording ? 'REC' : 'READY'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isTranscriptionEnabled ? "default" : "secondary"}
            size="sm"
            onClick={() => setIsTranscriptionEnabled(!isTranscriptionEnabled)}
            className="glow-primary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Transcript
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
          
          <Button variant="outline" size="sm">
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
                className={`w-full h-full object-cover ${backgroundBlur ? 'blur-sm' : ''}`}
                style={{ transform: 'scaleX(-1)' }}
              />
              
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
            {participants.slice(1).map((participant) => (
              <Card key={participant.id} className="relative overflow-hidden bg-gradient-card">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {participant.isVideoOn ? (
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
                  {participant.isMuted && <MicOff className="w-3 h-3 text-destructive" />}
                  {participant.isSpeaking && (
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
              {activePanel === 'transcript' && <TranscriptPanel isEnabled={isTranscriptionEnabled} />}
              {activePanel === 'mindmap' && <MindMapPanel isEnabled={isMindMapEnabled} />}
              {activePanel === 'actions' && <ActionItemsPanel />}
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