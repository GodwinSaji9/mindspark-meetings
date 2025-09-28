import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Video, 
  Calendar, 
  Users, 
  Clock, 
  Brain,
  FileText,
  Download,
  BarChart3,
  Zap,
  Star
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  status: 'upcoming' | 'completed' | 'in-progress';
  aiSummary: boolean;
  transcription: boolean;
  actionItems: number;
}

interface DashboardStats {
  totalMeetings: number;
  totalDuration: string;
  actionItemsCompleted: number;
  totalActionItems: number;
  transcriptionAccuracy: number;
}

export const MeetingDashboard: React.FC = () => {
  const [stats] = useState<DashboardStats>({
    totalMeetings: 24,
    totalDuration: '18h 42m',
    actionItemsCompleted: 32,
    totalActionItems: 45,
    transcriptionAccuracy: 94
  });

  const [recentMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Q4 Planning Meeting',
      date: '2024-01-22',
      duration: '1h 23m',
      participants: 5,
      status: 'in-progress',
      aiSummary: true,
      transcription: true,
      actionItems: 8
    },
    {
      id: '2', 
      title: 'Design Review Session',
      date: '2024-01-21',
      duration: '45m',
      participants: 3,
      status: 'completed',
      aiSummary: true,
      transcription: true,
      actionItems: 4
    },
    {
      id: '3',
      title: 'Client Presentation',
      date: '2024-01-20',
      duration: '2h 15m',
      participants: 8,
      status: 'completed',
      aiSummary: true,
      transcription: true,
      actionItems: 12
    },
    {
      id: '4',
      title: 'Weekly Standup',
      date: '2024-01-19',
      duration: '30m',
      participants: 6,
      status: 'completed',
      aiSummary: false,
      transcription: true,
      actionItems: 2
    }
  ]);

  const [aiInsights] = useState([
    {
      title: 'Meeting Efficiency Improved',
      description: 'Your average meeting duration decreased by 15% this week',
      type: 'positive',
      icon: BarChart3
    },
    {
      title: 'Action Item Completion Rate',
      description: '89% of action items are completed on time',
      type: 'positive', 
      icon: Star
    },
    {
      title: 'Transcription Quality',
      description: 'AI transcription accuracy is at 94% - excellent!',
      type: 'info',
      icon: Brain
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'default';
      case 'completed': return 'secondary';
      case 'in-progress': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'in-progress': return 'Live';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">REVIA Dashboard</h1>
            <p className="text-muted-foreground">Your AI-powered meeting companion</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Start Meeting
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalMeetings}</p>
                <p className="text-sm text-muted-foreground">Total Meetings</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-accent/20">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalDuration}</p>
                <p className="text-sm text-muted-foreground">Meeting Time</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-success/20">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.actionItemsCompleted}/{stats.totalActionItems}
                </p>
                <p className="text-sm text-muted-foreground">Action Items</p>
                <Progress 
                  value={(stats.actionItemsCompleted / stats.totalActionItems) * 100} 
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-ai-primary/20">
                <Brain className="w-6 h-6 text-ai-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.transcriptionAccuracy}%</p>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Meetings */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Recent Meetings</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <Card key={meeting.id} className="p-4 hover:bg-card-hover transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-foreground">{meeting.title}</h3>
                          <Badge variant={getStatusColor(meeting.status)}>
                            {getStatusText(meeting.status)}
                          </Badge>
                          {meeting.status === 'in-progress' && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                              <span className="text-xs text-destructive">LIVE</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(meeting.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {meeting.duration}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {meeting.participants}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          {meeting.transcription && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              Transcript
                            </Badge>
                          )}
                          {meeting.aiSummary && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Summary
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {meeting.actionItems} Actions
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {meeting.status === 'in-progress' ? (
                          <Button size="sm">
                            <Video className="w-4 h-4 mr-2" />
                            Join
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* AI Insights */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-ai-primary" />
                AI Insights
              </h2>

              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-primary">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <insight.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Insights
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Start Instant Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Transcripts
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
