import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMeeting } from '@/hooks/useMeeting';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MeetingLobby: React.FC = () => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [userName, setUserName] = useState('');
  const { createMeeting, joinMeeting } = useMeeting();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) return;
    const newMeetingId = await createMeeting(meetingTitle);
    if (newMeetingId) {
      navigate(`/video-call?id=${newMeetingId}`);
    }
  };

  const handleJoinMeeting = async () => {
    if (!joinMeetingId.trim() || !userName.trim()) return;
    const success = await joinMeeting(joinMeetingId, userName);
    if (success) {
      navigate(`/video-call?id=${joinMeetingId}`);
    }
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold">EchoMind Meetings</h1>
          <p className="text-muted-foreground">Start or join a meeting</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-3">
            <h2 className="font-semibold flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Start New Meeting
            </h2>
            <Input
              placeholder="Meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
            <Button 
              onClick={handleCreateMeeting} 
              className="w-full"
              disabled={!meetingTitle.trim()}
            >
              Create Meeting
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-3">
            <h2 className="font-semibold flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Join Meeting
            </h2>
            <Input
              placeholder="Meeting ID"
              value={joinMeetingId}
              onChange={(e) => setJoinMeetingId(e.target.value)}
            />
            <Input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <Button 
              onClick={handleJoinMeeting} 
              variant="outline" 
              className="w-full"
              disabled={!joinMeetingId.trim() || !userName.trim()}
            >
              Join Meeting
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};