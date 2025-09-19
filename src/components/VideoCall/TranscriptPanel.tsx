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
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

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

  // Real transcription would use speech recognition API when enabled

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