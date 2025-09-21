import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRecording = (meetingId?: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    if (!meetingId) {
      toast({
        title: "Error",
        description: "No active meeting to record",
        variant: "destructive"
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const startTime = new Date();
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await saveRecording(blob, startTime, new Date());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingStartTime(startTime);
      
      toast({
        title: "Recording Started",
        description: "Meeting recording has begun"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      setRecordingStartTime(null);
      
      toast({
        title: "Recording Stopped",
        description: "Meeting recording has been saved"
      });
    }
  };

  const saveRecording = async (blob: Blob, startTime: Date, endTime: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get meeting data
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError || !meeting) throw new Error('Meeting not found');

      // Upload file to storage
      const fileName = `${meetingId}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meeting-recordings')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Save recording metadata
      const { error: dbError } = await supabase
        .from('recordings')
        .insert({
          meeting_id: meeting.id,
          file_path: uploadData.path,
          file_size: blob.size,
          duration: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString()
        });

      if (dbError) throw dbError;

      toast({
        title: "Recording Saved",
        description: "Your meeting recording has been saved successfully"
      });
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Error",
        description: "Failed to save recording",
        variant: "destructive"
      });
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};