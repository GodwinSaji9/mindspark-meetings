import React, { useState } from 'react';
import { Brain, Plus, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindMap } from '@/hooks/useMindMap';

interface MindMapPanelProps {
  meetingId: string | null;
}

export const MindMapPanel: React.FC<MindMapPanelProps> = ({ meetingId }) => {
  const [newTopic, setNewTopic] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { currentMindMap, loading, createMindMap, addNode } = useMindMap(meetingId || undefined);
  if (!meetingId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active meeting</p>
        <p className="text-sm mt-1">Join a meeting to create mind maps</p>
      </div>
    );
  }

  const handleCreateMindMap = async () => {
    if (newTopic.trim()) {
      await createMindMap('Meeting Mind Map', newTopic);
      setNewTopic('');
      setShowCreateForm(false);
    }
  };

  const handleAddBranch = async () => {
    if (newBranch.trim() && currentMindMap) {
      const centralNode = currentMindMap.content.nodes.find(node => node.type === 'central');
      await addNode(newBranch, centralNode?.id);
      setNewBranch('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            Mind Map
          </h3>
          {!currentMindMap && (
            <Button 
              size="sm" 
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading mind map...</p>
          </div>
        ) : !currentMindMap ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-2">Create Your Mind Map</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Start creating your mind map by adding key points and ideas from the meeting.
            </p>
            
            {showCreateForm ? (
              <div className="text-left max-w-md mx-auto">
                <div className="bg-card border rounded-lg p-4 space-y-4">
                  <input 
                    type="text" 
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Enter main topic..." 
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateMindMap()}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleCreateMindMap}
                      disabled={!newTopic.trim()}
                      className="flex-1"
                    >
                      Create Mind Map
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowCreateForm(true)}>
                <Brain className="w-4 h-4 mr-2" />
                Create Mind Map
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mind map visualization */}
            <div className="bg-card border rounded-lg p-4 min-h-[300px] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Central node */}
                {currentMindMap.content.nodes
                  .filter(node => node.type === 'central')
                  .map(node => (
                    <div
                      key={node.id}
                      className="bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium text-center min-w-[120px] shadow-lg"
                    >
                      {node.text}
                    </div>
                  ))
                }
              </div>
              
              {/* Branch nodes */}
              <div className="absolute inset-0">
                {currentMindMap.content.nodes
                  .filter(node => node.type !== 'central')
                  .map((node, index) => {
                    const angle = (index * 60) - 90; // Distribute around circle
                    const radius = 150;
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    
                    return (
                      <div
                        key={node.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                        }}
                      >
                        <div className="bg-accent text-accent-foreground rounded-lg px-4 py-2 text-sm shadow-md border-2 border-accent/30">
                          {node.text}
                        </div>
                        {/* Connection line */}
                        <div
                          className="absolute border-t border-muted-foreground/30"
                          style={{
                            width: `${radius}px`,
                            left: `calc(50% - ${x}px)`,
                            top: '50%',
                            transform: `rotate(${angle + 180}deg)`,
                            transformOrigin: 'right center'
                          }}
                        />
                      </div>
                    );
                  })
                }
              </div>
            </div>
            
            {/* Add new branch */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h5 className="font-medium text-sm">Add New Branch</h5>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  placeholder="Enter new idea..." 
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBranch()}
                />
                <Button 
                  size="sm" 
                  onClick={handleAddBranch}
                  disabled={!newBranch.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Nodes summary */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Ideas ({currentMindMap.content.nodes.length})</h5>
              <div className="space-y-1">
                {currentMindMap.content.nodes.map(node => (
                  <div key={node.id} className="flex items-center space-x-2 text-sm">
                    <Circle 
                      className={`w-3 h-3 ${
                        node.type === 'central' ? 'text-primary' : 'text-accent'
                      }`} 
                      fill="currentColor" 
                    />
                    <span className={node.type === 'central' ? 'font-medium' : ''}>
                      {node.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};