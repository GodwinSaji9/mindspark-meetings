import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptEntry {
  id: string;
  speaker_name: string;
  content: string;
  timestamp: string;
}

export const useTranscript = (meetingId?: string) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isListening, setIsListening] = useState(false);

  const addTranscriptEntry = async (speakerName: string, content: string) => {
    if (!meetingId || !content.trim()) return;

    try {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError || !meeting) return;

      const { data, error } = await supabase
        .from('transcripts')
        .insert({
          meeting_id: meeting.id,
          speaker_name: speakerName,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
    } catch (error) {
      console.error('Error adding transcript entry:', error);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        addTranscriptEntry('You', finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    
    return () => {
      recognition.stop();
    };
  };

  const stopListening = () => {
    setIsListening(false);
  };

  useEffect(() => {
    if (!meetingId) return;

    const loadTranscript = async () => {
      try {
        const { data: meeting, error: meetingError } = await supabase
          .from('meetings')
          .select('id')
          .eq('meeting_id', meetingId)
          .single();

        if (meetingError || !meeting) return;

        const { data, error } = await supabase
          .from('transcripts')
          .select('*')
          .eq('meeting_id', meeting.id)
          .order('timestamp', { ascending: true });

        if (error) throw error;
        setTranscript(data || []);
      } catch (error) {
        console.error('Error loading transcript:', error);
      }
    };

    loadTranscript();

    // Subscribe to real-time transcript updates
    const channel = supabase
      .channel('transcript-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transcripts'
      }, (payload) => {
        setTranscript(prev => [...prev, payload.new as TranscriptEntry]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    addTranscriptEntry
  };
};