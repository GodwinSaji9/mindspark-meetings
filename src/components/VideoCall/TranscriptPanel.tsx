import React from 'react';
import { MessageSquare } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  speaker_name: string;
  content: string;
  timestamp: string;
}

interface TranscriptPanelProps {
  transcript: TranscriptEntry[];
  meetingId: string | null;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, meetingId }) => {
  if (!meetingId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active meeting</p>
        <p className="text-sm mt-1">Join a meeting to see the transcript</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Live Transcript
        </h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {transcript.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No transcript yet</p>
            <p className="text-sm mt-1">Enable transcription to start recording</p>
          </div>
        ) : (
          transcript.map((entry) => (
            <div key={entry.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {entry.speaker_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{entry.speaker_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{entry.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};