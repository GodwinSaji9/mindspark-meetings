import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, 
  Download, 
  Clock, 
  User, 
  AlertCircle,
  Calendar,
  Filter,
  Plus
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  context: string; // Transcript context where this was mentioned
  timestamp: string;
  confidence: number;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  decisionMaker: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
  context: string;
}

export const ActionItemsPanel: React.FC = () => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: '1',
      title: 'Create Q4 Marketing Strategy',
      description: 'Develop comprehensive marketing strategy for Q4 focusing on user engagement growth',
      assignee: 'Bob Smith',
      dueDate: '2024-01-26',
      priority: 'high',
      status: 'pending',
      context: 'Bob, can you take the lead on the marketing strategy? We need a proposal by Friday.',
      timestamp: '09:01:35',
      confidence: 0.94
    },
    {
      id: '2',
      title: 'Review Current Metrics Report',
      description: 'Analyze user engagement metrics and prepare detailed report',
      assignee: 'You',
      dueDate: '2024-01-24',
      priority: 'medium',
      status: 'in-progress',
      context: 'Our user engagement is up 23% this quarter.',
      timestamp: '09:00:42',
      confidence: 0.92
    },
    {
      id: '3',
      title: 'Schedule Design Team Coordination',
      description: 'Coordinate with design team on new feature implementation',
      assignee: 'Alice Johnson',
      dueDate: '2024-01-25',
      priority: 'medium',
      status: 'pending',
      context: 'We need to coordinate with the design team on the new features.',
      timestamp: '09:02:15',
      confidence: 0.89
    }
  ]);

  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: '1',
      title: 'Prioritize User Experience Improvements',
      description: 'Team decided to focus on UX improvements as primary Q4 objective',
      decisionMaker: 'Alice Johnson',
      timestamp: '09:01:20',
      impact: 'high',
      context: 'I think we should prioritize the user experience improvements.'
    },
    {
      id: '2',
      title: 'Increase Marketing Budget',
      description: 'Approved budget increase for Q4 marketing campaign',
      decisionMaker: 'Team Consensus',
      timestamp: '09:02:45',
      impact: 'medium',
      context: 'We should definitely capitalize on this momentum.'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Simulate AI extracting new action items
  useEffect(() => {
    const interval = setInterval(() => {
      const newActions = [
        'Follow up with stakeholders',
        'Update project timeline',
        'Prepare presentation slides',
        'Schedule team retrospective',
        'Review budget allocation',
        'Coordinate with external vendors'
      ];

      const assignees = ['You', 'Alice Johnson', 'Bob Smith', 'Sarah Wilson'];
      const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

      const newAction: ActionItem = {
        id: Date.now().toString(),
        title: newActions[Math.floor(Math.random() * newActions.length)],
        description: 'Auto-generated action item based on meeting discussion',
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: 'pending',
        context: 'Extracted from recent conversation',
        timestamp: new Date().toLocaleTimeString(),
        confidence: 0.75 + Math.random() * 0.25
      };

      setActionItems(prev => [...prev, newAction]);
    }, 30000); // Add new action item every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredItems = actionItems.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    return true;
  });

  const toggleItemStatus = (id: string) => {
    setActionItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'completed' ? 'pending' : 
                     item.status === 'pending' ? 'in-progress' : 'completed'
            }
          : item
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'default';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const exportActionItems = () => {
    const csv = [
      'Title,Assignee,Due Date,Priority,Status,Context',
      ...actionItems.map(item =>
        `"${item.title}","${item.assignee}","${item.dueDate}","${item.priority}","${item.status}","${item.context}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Action Items & Decisions</h3>
          <Button onClick={exportActionItems} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Action Items */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
              <CheckSquare className="w-4 h-4 mr-2" />
              Action Items ({filteredItems.length})
            </h4>
            
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-4 mb-3 hover:bg-card-hover transition-smooth">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={item.status === 'completed'}
                    onCheckedChange={() => toggleItemStatus(item.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className={`font-medium text-sm ${
                        item.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {item.title}
                      </h5>
                      
                      <div className="flex space-x-1">
                        <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                          {item.priority}
                        </Badge>
                        <Badge variant={getStatusColor(item.status)} className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {item.assignee}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.timestamp}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          item.confidence > 0.9 ? 'bg-success' :
                          item.confidence > 0.8 ? 'bg-warning' : 'bg-destructive'
                        }`} />
                        <span>{Math.round(item.confidence * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 p-2 bg-muted rounded text-xs italic">
                      "{item.context}"
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Decisions */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Key Decisions ({decisions.length})
            </h4>
            
            {decisions.map((decision) => (
              <Card key={decision.id} className="p-4 mb-3 border-l-4 border-l-accent">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-sm text-foreground">
                    {decision.title}
                  </h5>
                  <Badge variant="outline" className="text-xs">
                    {decision.impact} impact
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {decision.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {decision.decisionMaker}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {decision.timestamp}
                  </span>
                </div>
                
                <div className="mt-2 p-2 bg-muted rounded text-xs italic">
                  "{decision.context}"
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};