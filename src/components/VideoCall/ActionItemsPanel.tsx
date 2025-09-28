import React, { useState } from 'react';
import { FileText, Plus, Check, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActionItems } from '@/hooks/useActionItems';

interface ActionItemsPanelProps {
  meetingId: string | null;
}

export const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ meetingId }) => {
  const [newActionItem, setNewActionItem] = useState('');
  const [description, setDescription] = useState('');
  const { actionItems, loading, addActionItem, updateActionItem } = useActionItems(meetingId || undefined);

  if (!meetingId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active meeting</p>
        <p className="text-sm mt-1">Join a meeting to create action items</p>
      </div>
    );
  }

  const handleAddActionItem = async () => {
    if (newActionItem.trim()) {
      await addActionItem(newActionItem, description);
      setNewActionItem('');
      setDescription('');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    await updateActionItem(id, { status: nextStatus });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Action Items ({actionItems.length})
          </h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {/* Add new action item */}
        <div className="space-y-2 pb-4 border-b border-border">
          <input
            type="text"
            value={newActionItem}
            onChange={(e) => setNewActionItem(e.target.value)}
            placeholder="Enter action item title..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyPress={(e) => e.key === 'Enter' && handleAddActionItem()}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button 
            size="sm" 
            onClick={handleAddActionItem}
            disabled={!newActionItem.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Action Item
          </Button>
        </div>
        
        {/* Action items list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading...</p>
            </div>
          ) : actionItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No action items yet</p>
              <p className="text-sm mt-1">Add action items as the meeting progresses</p>
            </div>
          ) : (
            actionItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-card border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        className="h-6 w-6 p-0"
                      >
                        {item.status === 'completed' ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-muted rounded-sm" />
                        )}
                      </Button>
                      <h4 className={`font-medium text-sm ${
                        item.status === 'completed' ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {item.title}
                      </h4>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 ml-8">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={item.status === 'completed' ? 'default' : 'secondary'}
                    className={`text-xs ${item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}`}
                  >
                    {item.status === 'completed' ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {item.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground ml-8">
                  <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
