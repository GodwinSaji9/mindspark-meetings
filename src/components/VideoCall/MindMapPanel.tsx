import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Download, Maximize2, Plus, Minus, RotateCcw } from 'lucide-react';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  children: string[];
  parent?: string;
  color: string;
}

interface MindMapPanelProps {
  isEnabled: boolean;
}

export const MindMapPanel: React.FC<MindMapPanelProps> = ({ isEnabled }) => {
  const [nodes, setNodes] = useState<MindMapNode[]>([
    {
      id: 'root',
      text: 'Meeting Topics',
      x: 150,
      y: 120,
      level: 0,
      children: [],
      color: '#8B5CF6'
    }
  ]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // AI mind mapping would generate nodes based on conversation when enabled

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const exportMindMap = () => {
    if (!svgRef.current) return;
    
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${new Date().toISOString().split('T')[0]}.svg`;
    a.click();
  };

  // Generate connection lines
  const getConnections = () => {
    const connections = [];
    for (const node of nodes) {
      if (node.parent) {
        const parent = nodes.find(n => n.id === node.parent);
        if (parent) {
          connections.push({
            x1: parent.x + 60,
            y1: parent.y + 15,
            x2: node.x + 60,
            y2: node.y + 15
          });
        }
      }
    }
    return connections;
  };

  if (!isEnabled) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Mind Map Paused</h3>
          <p className="text-sm text-muted-foreground">
            Enable mind mapping to visualize meeting topics and connections
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
          <h3 className="font-semibold text-foreground gradient-text">AI Mind Map</h3>
          <Button onClick={exportMindMap} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={zoomOut} size="sm" variant="outline">
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {Math.round(zoom * 100)}%
          </span>
          <Button onClick={zoomIn} size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
          <Button onClick={resetView} size="sm" variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 relative overflow-hidden bg-mindmap-bg">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* Connections */}
          {getConnections().map((conn, index) => (
            <line
              key={index}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity={0.6}
            />
          ))}
          
          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width="120"
                height="30"
                rx="15"
                fill={node.color}
                fillOpacity={0.8}
                stroke={node.color}
                strokeWidth="2"
                className="animate-slide-up"
                style={{
                  filter: node.level === 0 ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
                }}
              />
              <text
                x={node.x + 60}
                y={node.y + 20}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight={node.level === 0 ? 'bold' : 'normal'}
                className="pointer-events-none"
              >
                {node.text.length > 15 ? `${node.text.substring(0, 15)}...` : node.text}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Live indicator */}
        {isEnabled && (
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-ai-primary animate-pulse-glow">
              <Brain className="w-3 h-3 mr-1" />
              AI Mapping
            </Badge>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Topic Categories</div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 rounded-full bg-primary mr-1" />
            Main Topics
          </Badge>
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 rounded-full bg-success mr-1" />
            Metrics
          </Badge>
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 rounded-full bg-warning mr-1" />
            Actions
          </Badge>
        </div>
      </div>
    </div>
  );
};