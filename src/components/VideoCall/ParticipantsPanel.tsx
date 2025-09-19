import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MoreVertical,
  Crown,
  UserPlus,
  Volume2,
  MessageSquare,
  Phone
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  status: 'online' | 'away' | 'busy';
  role?: 'host' | 'co-host' | 'participant';
  speakingTime?: number; // in seconds
  lastSpoke?: string;
}

interface ParticipantsPanelProps {
  participants: Participant[];
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ participants }) => {
  const [sortBy, setSortBy] = useState<'name' | 'speaking-time' | 'status'>('name');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-online';
      case 'away': return 'bg-away';
      case 'busy': return 'bg-busy';
      default: return 'bg-offline';
    }
  };

  const formatSpeakingTime = (seconds?: number) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'speaking-time':
        return (b.speakingTime || 0) - (a.speakingTime || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Participants ({participants.length})
          </h3>
          <Button size="sm" variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
          <Button
            variant={sortBy === 'speaking-time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('speaking-time')}
          >
            Speaking
          </Button>
          <Button
            variant={sortBy === 'status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('status')}
          >
            Status
          </Button>
        </div>
      </div>

      {/* Participants List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedParticipants.map((participant) => (
            <Card key={participant.id} className="p-3 hover:bg-card-hover transition-smooth">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(participant.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(participant.status)}`} />
                  
                  {/* Speaking indicator */}
                  {participant.isSpeaking && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
                  )}
                </div>

                {/* Participant Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {participant.name}
                    </span>
                    {participant.role === 'host' && (
                      <Crown className="w-3 h-3 text-warning" />
                    )}
                    {participant.role === 'co-host' && (
                      <Badge variant="outline" className="text-xs">
                        Co-host
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      {participant.isMuted ? (
                        <MicOff className="w-3 h-3 text-destructive" />
                      ) : (
                        <Mic className="w-3 h-3 text-success" />
                      )}
                      {participant.isVideoOn ? (
                        <Video className="w-3 h-3 text-success" />
                      ) : (
                        <VideoOff className="w-3 h-3 text-destructive" />
                      )}
                    </div>
                    
                    {participant.speakingTime && (
                      <span className="text-xs text-muted-foreground">
                        {formatSpeakingTime(participant.speakingTime)}
                      </span>
                    )}
                  </div>
                  
                  {participant.lastSpoke && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Last spoke: {participant.lastSpoke}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Adjust Volume
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Privately
                    </DropdownMenuItem>
                    {participant.id !== '1' && (
                      <>
                        <DropdownMenuItem className="text-destructive">
                          <MicOff className="w-4 h-4 mr-2" />
                          Mute Participant
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove from Meeting
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Meeting Stats */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">
              {participants.filter(p => p.isSpeaking).length}
            </div>
            <div className="text-xs text-muted-foreground">
              Currently Speaking
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">
              {participants.filter(p => !p.isMuted).length}
            </div>
            <div className="text-xs text-muted-foreground">
              Unmuted
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <Badge variant="outline" className="text-xs">
            Meeting Duration: 12m 34s
          </Badge>
        </div>
      </div>
    </div>
  );
};