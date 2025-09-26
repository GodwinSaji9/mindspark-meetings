import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'central' | 'branch' | 'leaf';
  parentId?: string;
  color?: string;
}

interface MindMap {
  id: string;
  title: string;
  content: {
    nodes: MindMapNode[];
    connections: Array<{ from: string; to: string; }>;
  };
  meeting_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useMindMap = (meetingId?: string) => {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [currentMindMap, setCurrentMindMap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadMindMaps = async () => {
    if (!meetingId) return;
    
    setLoading(true);
    try {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError || !meeting) return;

      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('meeting_id', meeting.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMindMaps((data || []) as unknown as MindMap[]);
      if (data && data.length > 0) {
        setCurrentMindMap(data[0] as unknown as MindMap);
      }
    } catch (error) {
      console.error('Error loading mind maps:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMindMap = async (title: string, centralTopic: string) => {
    if (!meetingId || !title.trim() || !centralTopic.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError || !meeting) throw new Error('Meeting not found');

      const initialContent = {
        nodes: [
          {
            id: 'central',
            text: centralTopic,
            x: 400,
            y: 300,
            type: 'central' as const,
            color: '#8b5cf6'
          }
        ],
        connections: []
      };

      const { data, error } = await supabase
        .from('mind_maps')
        .insert({
          meeting_id: meeting.id,
          title: title.trim(),
          content: initialContent,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newMindMap = data as unknown as MindMap;
      setMindMaps(prev => [newMindMap, ...prev]);
      setCurrentMindMap(newMindMap);

      toast({
        title: "Mind Map Created",
        description: "New mind map has been created successfully"
      });
      
      return newMindMap;
    } catch (error) {
      console.error('Error creating mind map:', error);
      toast({
        title: "Error",
        description: "Failed to create mind map",
        variant: "destructive"
      });
    }
  };

  const addNode = async (text: string, parentId?: string) => {
    if (!currentMindMap || !text.trim()) return;

    try {
      const newNode: MindMapNode = {
        id: `node_${Date.now()}`,
        text: text.trim(),
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        type: parentId ? 'branch' : 'leaf',
        parentId,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      };

      const updatedContent = {
        ...currentMindMap.content,
        nodes: [...currentMindMap.content.nodes, newNode],
        connections: parentId 
          ? [...currentMindMap.content.connections, { from: parentId, to: newNode.id }]
          : currentMindMap.content.connections
      };

      const { error } = await supabase
        .from('mind_maps')
        .update({ content: updatedContent as any })
        .eq('id', currentMindMap.id);

      if (error) throw error;

      const updatedMindMap = { ...currentMindMap, content: updatedContent };
      setCurrentMindMap(updatedMindMap);
      setMindMaps(prev => 
        prev.map(map => map.id === currentMindMap.id ? updatedMindMap : map)
      );

      toast({
        title: "Node Added",
        description: "New idea has been added to the mind map"
      });
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        title: "Error",
        description: "Failed to add node",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadMindMaps();

    if (!meetingId) return;

    // Subscribe to real-time updates
    const channel = supabase
      .channel('mindmap-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mind_maps'
      }, (payload) => {
        setMindMaps(prev => [payload.new as MindMap, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'mind_maps'
      }, (payload) => {
        const updatedMap = payload.new as MindMap;
        setMindMaps(prev => 
          prev.map(map => map.id === updatedMap.id ? updatedMap : map)
        );
        if (currentMindMap?.id === updatedMap.id) {
          setCurrentMindMap(updatedMap);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  return {
    mindMaps,
    currentMindMap,
    loading,
    createMindMap,
    addNode,
    loadMindMaps
  };
};