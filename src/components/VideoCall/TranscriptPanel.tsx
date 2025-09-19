import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Edit3, Clock, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  isEdited?: boolean;
  actionItems?: string[];
}

interface TranscriptPanelProps {
  isEnabled: boolean;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ isEnabled }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([
    {
      id: '1',
      speaker: 'Alice Johnson',
      text: 'Good morning everyone! Thanks for joining our quarterly planning meeting. Today we need to discuss our Q4 objectives and review the current project status.',
      timestamp: '09:00:15',
      confidence: 0.95,
      actionItems: ['Review Q4 objectives']
    },
    {
      id: '2', 
      speaker: 'You',
      text: 'Morning Alice! I have the latest metrics ready to share. Our user engagement is up 23% this quarter.',
      timestamp: '09:00:42',
      confidence: 0.92
    },
    {
      id: '3',
      speaker: 'Bob Smith',
      text: 'That\'s excellent news! We should definitely capitalize on this momentum. I think we need to plan the marketing campaign for next quarter.',
      timestamp: '09:01:08', 
      confidence: 0.89,
      actionItems: ['Plan marketing campaign']
    },
    {
      id: '4',
      speaker: 'Alice Johnson',
      text: 'Agreed. Let me assign action items - Bob, can you take the lead on the marketing strategy? We need a proposal by Friday.',
      timestamp: '09:01:35',
      confidence: 0.94,
      actionItems: ['Bob: Marketing strategy proposal due Friday']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptItems]);

  // Simulate live transcription
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      const speakers = ['Alice Johnson', 'You', 'Bob Smith'];
      const sampleTexts = [
        'I think we should prioritize the user experience improvements.',
        'The analytics data shows promising trends in user retention.',
        'We need to coordinate with the design team on the new features.',
        'Let\'s schedule a follow-up meeting to review progress.',
        'The development timeline looks achievable with current resources.'
      ];

      const newItem: TranscriptItem = {
        id: Date.now().toString(),
        speaker: speakers[Math.floor(Math.random() * speakers.length)],
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
        timestamp: new Date().toLocaleTimeString(),
        confidence: 0.85 + Math.random() * 0.15
      };

      setTranscriptItems(prev => [...prev, newItem]);
    }, 15000); // Add new transcript every 15 seconds

    return () => clearInterval(interval);
  }, [isEnabled]);

  const filteredItems = transcriptItems.filter(item =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editingId) {
      setTranscriptItems(prev =>
        prev.map(item =>
          item.id === editingId
            ? { ...item, text: editText, isEdited: true }
            : item
        )
      );
      setEditingId(null);
      setEditText('');
    }
  };

  const exportTranscript = () => {
    const transcript = transcriptItems
      .map(item => `[${item.timestamp}] ${item.speaker}: ${item.text}`)
      .join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (!isEnabled) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Transcription Paused</h3>
          <p className="text-sm text-muted-foreground">
            Enable transcription to start capturing meeting conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Live Transcript</h3>
          <Button onClick={exportTranscript} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transcript Items */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="transcript-item hover:bg-card-hover transition-smooth">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {item.speaker}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.timestamp}
                  </Badge>
                  {item.isEdited && (
                    <Badge variant="outline" className="text-xs">
                      Edited
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(item.id, item.text)}
                  className="h-auto p-1"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
              
              {editingId === item.id ? (
                <div className="space-y-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={saveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed">
                  {item.text}
                </p>
              )}
              
              {item.actionItems && item.actionItems.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.actionItems.map((action, index) => (
                    <Badge key={index} variant="default" className="text-xs bg-ai-primary">
                      {action}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-muted-foreground">
                    Confidence: {Math.round(item.confidence * 100)}%
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    item.confidence > 0.9 ? 'bg-success' :
                    item.confidence > 0.8 ? 'bg-warning' : 'bg-destructive'
                  }`} />
                </div>
                
                {isEnabled && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};