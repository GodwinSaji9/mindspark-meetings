import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionItemsPanelProps {
  meetingId: string | null;
}

export const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ meetingId }) => {
  const [newActionItem, setNewActionItem] = useState('');

  if (!meetingId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active meeting</p>
        <p className="text-sm mt-1">Join a meeting to create action items</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Action Items
          </h3>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newActionItem}
              onChange={(e) => setNewActionItem(e.target.value)}
              placeholder="Enter new action item..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <Button size="sm" variant="default">Add</Button>
          </div>
        </div>
        
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No action items yet</p>
          <p className="text-sm mt-1">Add action items as the meeting progresses</p>
        </div>
      </div>
    </div>
  );
};