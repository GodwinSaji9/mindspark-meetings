import React from 'react';
import { Brain } from 'lucide-react';

interface MindMapPanelProps {
  meetingId: string | null;
}

export const MindMapPanel: React.FC<MindMapPanelProps> = ({ meetingId }) => {
  if (!meetingId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active meeting</p>
        <p className="text-sm mt-1">Join a meeting to create mind maps</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium flex items-center">
          <Brain className="w-4 h-4 mr-2" />
          Mind Map
        </h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-medium mb-2">Create Your Mind Map</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start creating your mind map by adding key points and ideas from the meeting.
          </p>
          
          <div className="text-left max-w-md mx-auto">
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <input 
                type="text" 
                placeholder="Enter main topic..." 
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <input 
                    type="text" 
                    placeholder="Add key point..." 
                    className="flex-1 px-2 py-1 border rounded text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <input 
                    type="text" 
                    placeholder="Add sub-point..." 
                    className="flex-1 px-2 py-1 border rounded text-xs"
                  />
                </div>
              </div>
              
              <button className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                Add Branch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};