-- Fix infinite recursion in RLS policies by creating security definer functions

-- Create function to check if user is participant in a meeting
CREATE OR REPLACE FUNCTION public.is_meeting_participant(_user_id uuid, _meeting_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.participants
    WHERE user_id = _user_id
      AND meeting_id = _meeting_id
  )
$$;

-- Create function to check if user is meeting host
CREATE OR REPLACE FUNCTION public.is_meeting_host(_user_id uuid, _meeting_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE host_id = _user_id
      AND id = _meeting_id
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view participants in their meetings" ON public.participants;
DROP POLICY IF EXISTS "Users can view meetings they participate in" ON public.meetings;
DROP POLICY IF EXISTS "Users can view action items from their meetings" ON public.action_items;
DROP POLICY IF EXISTS "Users can view mind maps from their meetings" ON public.mind_maps;
DROP POLICY IF EXISTS "Users can view transcripts from their meetings" ON public.transcripts;
DROP POLICY IF EXISTS "Users can view recordings from their meetings" ON public.recordings;
DROP POLICY IF EXISTS "Participants can create action items" ON public.action_items;
DROP POLICY IF EXISTS "Participants can create mind maps" ON public.mind_maps;
DROP POLICY IF EXISTS "Participants can create transcripts" ON public.transcripts;

-- Create new policies using security definer functions
CREATE POLICY "Users can view participants in their meetings" 
ON public.participants 
FOR SELECT 
USING (
  public.is_meeting_host(auth.uid(), meeting_id) OR 
  public.is_meeting_participant(auth.uid(), meeting_id)
);

CREATE POLICY "Users can view meetings they participate in" 
ON public.meetings 
FOR SELECT 
USING (
  host_id = auth.uid() OR 
  public.is_meeting_participant(auth.uid(), id)
);

CREATE POLICY "Users can view action items from their meetings" 
ON public.action_items 
FOR SELECT 
USING (
  public.is_meeting_host(auth.uid(), meeting_id) OR 
  public.is_meeting_participant(auth.uid(), meeting_id)
);

CREATE POLICY "Users can view mind maps from their meetings" 
ON public.mind_maps 
FOR SELECT 
USING (
  public.is_meeting_host(auth.uid(), meeting_id) OR 
  public.is_meeting_participant(auth.uid(), meeting_id)
);

CREATE POLICY "Users can view transcripts from their meetings" 
ON public.transcripts 
FOR SELECT 
USING (
  public.is_meeting_host(auth.uid(), meeting_id) OR 
  public.is_meeting_participant(auth.uid(), meeting_id)
);

CREATE POLICY "Users can view recordings from their meetings" 
ON public.recordings 
FOR SELECT 
USING (
  public.is_meeting_host(auth.uid(), meeting_id) OR 
  public.is_meeting_participant(auth.uid(), meeting_id)
);

CREATE POLICY "Participants can create action items" 
ON public.action_items 
FOR INSERT 
WITH CHECK (
  public.is_meeting_participant(auth.uid(), meeting_id) AND 
  created_by = auth.uid()
);

CREATE POLICY "Participants can create mind maps" 
ON public.mind_maps 
FOR INSERT 
WITH CHECK (
  public.is_meeting_participant(auth.uid(), meeting_id) AND 
  created_by = auth.uid()
);

CREATE POLICY "Participants can create transcripts" 
ON public.transcripts 
FOR INSERT 
WITH CHECK (
  public.is_meeting_participant(auth.uid(), meeting_id)
);