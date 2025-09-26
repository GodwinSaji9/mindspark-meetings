import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Meeting {
  id: string;
  meeting_id: string;
  title: string;
  host_id: string;
  status: 'waiting' | 'active' | 'ended';
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  name: string;
  user_id: string;
  is_muted: boolean;
  is_video_on: boolean;
  is_speaking: boolean;
  status: 'online' | 'away' | 'busy';
  meeting_id: string;
  joined_at: string;
  left_at?: string;
}

export const useMeeting = (meetingId?: string) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateMeetingId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createMeeting = async (title: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newMeetingId = generateMeetingId();
      
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          meeting_id: newMeetingId,
          title,
          host_id: user.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      // Add the host as a participant
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          meeting_id: data.id,
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Host',
          status: 'online'
        });

      if (participantError) throw participantError;

      toast({
        title: "Meeting Created!",
        description: `Meeting ID: ${newMeetingId} - Share this with others to join`,
      });
      
      return data.meeting_id;
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinMeeting = async (meetingId: string, userName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find meeting by meeting_id
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError || !meetingData) {
        toast({
          title: "Error",
          description: "Meeting not found",
          variant: "destructive"
        });
        return false;
      }

      // Check if already a participant
      const { data: existingParticipant } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', meetingData.id)
        .eq('user_id', user.id)
        .single();

      if (!existingParticipant) {
        // Join as participant
        const { error: participantError } = await supabase
          .from('participants')
          .insert({
            meeting_id: meetingData.id,
            user_id: user.id,
            name: userName
          });

        if (participantError) throw participantError;
      }

      // Start meeting if host joins
      if (meetingData.host_id === user.id && meetingData.status === 'waiting') {
        await supabase
          .from('meetings')
          .update({ status: 'active', started_at: new Date().toISOString() })
          .eq('id', meetingData.id);
      }

      setMeeting(meetingData as Meeting);
      setIsHost(meetingData.host_id === user.id);
      return true;
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast({
        title: "Error",
        description: "Failed to join meeting",
        variant: "destructive"
      });
      return false;
    }
  };

  const leaveMeeting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !meeting) return;

      // Update participant leave time
      await supabase
        .from('participants')
        .update({ left_at: new Date().toISOString() })
        .eq('meeting_id', meeting.id)
        .eq('user_id', user.id);

      // If host leaves, end the meeting
      if (isHost) {
        await supabase
          .from('meetings')
          .update({ status: 'ended', ended_at: new Date().toISOString() })
          .eq('id', meeting.id);
      }

      setMeeting(null);
      setParticipants([]);
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  };

  const updateParticipantStatus = async (updates: { is_muted?: boolean; is_video_on?: boolean; is_speaking?: boolean }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !meeting) return;

      await supabase
        .from('participants')
        .update(updates)
        .eq('meeting_id', meeting.id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating participant status:', error);
    }
  };

  useEffect(() => {
    if (!meetingId) {
      setLoading(false);
      return;
    }

    const loadMeeting = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Load meeting and participants
        const { data: meetingData, error: meetingError } = await supabase
          .from('meetings')
          .select('*')
          .eq('meeting_id', meetingId)
          .single();

        if (meetingError || !meetingData) {
          toast({
            title: "Error",
            description: "Meeting not found",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { data: participantsData, error: participantsError } = await supabase
          .from('participants')
          .select('*')
          .eq('meeting_id', meetingData.id)
          .is('left_at', null);

        if (participantsError) throw participantsError;

        setMeeting(meetingData as Meeting);
        setParticipants((participantsData || []) as Participant[]);
        setIsHost(meetingData.host_id === user.id);
      } catch (error) {
        console.error('Error loading meeting:', error);
        toast({
          title: "Error",
          description: "Failed to load meeting",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('meeting-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `meeting_id=eq.${meetingId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setParticipants(prev => [...prev, payload.new as Participant]);
        } else if (payload.eventType === 'UPDATE') {
          setParticipants(prev => prev.map(p => 
            p.id === payload.new.id ? payload.new as Participant : p
          ));
        } else if (payload.eventType === 'DELETE') {
          setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  return {
    meeting,
    participants,
    isHost,
    loading,
    createMeeting,
    joinMeeting,
    leaveMeeting,
    updateParticipantStatus
  };
};