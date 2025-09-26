import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  meeting_id?: string;
  created_at: string;
  updated_at: string;
}

export const useActionItems = (meetingId?: string) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadActionItems = async () => {
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
        .from('action_items')
        .select('*')
        .eq('meeting_id', meeting.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActionItems((data || []) as ActionItem[]);
    } catch (error) {
      console.error('Error loading action items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActionItem = async (title: string, description?: string, assignedTo?: string, dueDate?: string) => {
    if (!meetingId || !title.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError || !meeting) throw new Error('Meeting not found');

      const { data, error } = await supabase
        .from('action_items')
        .insert({
          meeting_id: meeting.id,
          title: title.trim(),
          description: description?.trim(),
          assigned_to: assignedTo || user.id,
          created_by: user.id,
          due_date: dueDate,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setActionItems(prev => [data as ActionItem, ...prev]);
      toast({
        title: "Action Item Added",
        description: "New action item has been created successfully"
      });
    } catch (error) {
      console.error('Error adding action item:', error);
      toast({
        title: "Error",
        description: "Failed to add action item",
        variant: "destructive"
      });
    }
  };

  const updateActionItem = async (id: string, updates: Partial<ActionItem>) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setActionItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );

      toast({
        title: "Action Item Updated",
        description: "Changes have been saved successfully"
      });
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: "Error",
        description: "Failed to update action item",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadActionItems();

    if (!meetingId) return;

    // Subscribe to real-time updates
    const channel = supabase
      .channel('action-items-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'action_items'
      }, (payload) => {
        setActionItems(prev => [payload.new as ActionItem, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'action_items'
      }, (payload) => {
        setActionItems(prev => 
          prev.map(item => item.id === payload.new.id ? payload.new as ActionItem : item)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  return {
    actionItems,
    loading,
    addActionItem,
    updateActionItem,
    loadActionItems
  };
};