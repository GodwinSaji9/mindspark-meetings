import React, { useState } from 'react';
import { VideoCallInterface } from '@/components/VideoCall/VideoCallInterface';
import { MeetingDashboard } from '@/components/Dashboard/MeetingDashboard';
import { MeetingLobby } from './MeetingLobby';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Brain, 
  Mic, 
  Users, 
  FileText, 
  Sparkles,
  Play,
  Calendar,
  Settings,
  LogOut,
  ArrowLeft
} from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'meeting'>('dashboard');
  const [showWelcome, setShowWelcome] = useState(true);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground mb-4">Please sign in to continue</p>
          <Button onClick={() => navigate('/auth')}>
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="w-full p-8 bg-gradient-card border border-border/50 shadow-ai">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6 shadow-glow-primary">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Welcome to REVIA
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Your AI-Powered Meeting Assistant
            </p>
            <p className="text-muted-foreground">
              Transform your meetings with real-time transcription, mind mapping, and intelligent action item extraction
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center border border-primary/20 hover:border-primary/40 transition-smooth">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Transcription</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered speech-to-text with 94% accuracy and speaker identification
              </p>
            </Card>

            <Card className="p-6 text-center border border-accent/20 hover:border-accent/40 transition-smooth">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Smart Mind Maps</h3>
              <p className="text-sm text-muted-foreground">
                Automatically generate visual knowledge maps from your conversations
              </p>
            </Card>

            <Card className="p-6 text-center border border-success/20 hover:border-success/40 transition-smooth">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/20 mb-4">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Action Items</h3>
              <p className="text-sm text-muted-foreground">
                Extract tasks, decisions, and follow-ups with context and ownership
              </p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/meeting-lobby')}
              className="glow-primary animate-pulse-glow"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Meeting
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentView('dashboard');
                setShowWelcome(false);
              }}
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              View Dashboard
            </Button>

            <Button 
              variant="outline" 
              onClick={handleLogout}
              size="lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                WebRTC Video Calling
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered Analytics
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Multi-User Support
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Video className="w-3 h-3 mr-1" />
                HD Video Quality
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Background Effects
              </Badge>
            </div>
          </div>
        </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'meeting') {
    return <MeetingLobby />;
  }

  return <MeetingDashboard />;
};

export default Index;
