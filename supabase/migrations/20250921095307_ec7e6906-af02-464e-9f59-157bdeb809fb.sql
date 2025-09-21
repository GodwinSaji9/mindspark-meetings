-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_on BOOLEAN NOT NULL DEFAULT true,
  is_speaking BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy')),
  UNIQUE(meeting_id, user_id)
);

-- Create recordings table
CREATE TABLE public.recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transcripts table
CREATE TABLE public.transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  speaker_name TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mind_maps table
CREATE TABLE public.mind_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create action_items table
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meetings
CREATE POLICY "Users can view meetings they participate in" 
ON public.meetings FOR SELECT
USING (
  host_id = auth.uid() OR 
  id IN (SELECT meeting_id FROM public.participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create meetings" 
ON public.meetings FOR INSERT
WITH CHECK (host_id = auth.uid());

CREATE POLICY "Host can update their meetings" 
ON public.meetings FOR UPDATE
USING (host_id = auth.uid());

-- Create RLS policies for participants
CREATE POLICY "Users can view participants in their meetings" 
ON public.participants FOR SELECT
USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE host_id = auth.uid() OR 
    id IN (SELECT meeting_id FROM public.participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can join meetings" 
ON public.participants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation" 
ON public.participants FOR UPDATE
USING (user_id = auth.uid());

-- Create RLS policies for recordings
CREATE POLICY "Users can view recordings from their meetings" 
ON public.recordings FOR SELECT
USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE host_id = auth.uid() OR 
    id IN (SELECT meeting_id FROM public.participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Host can create recordings" 
ON public.recordings FOR INSERT
WITH CHECK (
  meeting_id IN (SELECT id FROM public.meetings WHERE host_id = auth.uid())
);

-- Create RLS policies for transcripts
CREATE POLICY "Users can view transcripts from their meetings" 
ON public.transcripts FOR SELECT
USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE host_id = auth.uid() OR 
    id IN (SELECT meeting_id FROM public.participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Participants can create transcripts" 
ON public.transcripts FOR INSERT
WITH CHECK (
  meeting_id IN (
    SELECT meeting_id FROM public.participants WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for mind_maps
CREATE POLICY "Users can view mind maps from their meetings" 
ON public.mind_maps FOR SELECT
USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE host_id = auth.uid() OR 
    id IN (SELECT meeting_id FROM public.participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Participants can create mind maps" 
ON public.mind_maps FOR INSERT
WITH CHECK (
  meeting_id IN (
    SELECT meeting_id FROM public.participants WHERE user_id = auth.uid()
  ) AND created_by = auth.uid()
);

CREATE POLICY "Users can update their mind maps" 
ON public.mind_maps FOR UPDATE
USING (created_by = auth.uid());

-- Create RLS policies for action_items
CREATE POLICY "Users can view action items from their meetings" 
ON public.action_items FOR SELECT
USING (
  meeting_id IN (
    SELECT id FROM public.meetings 
    WHERE host_id = auth.uid() OR 
    id IN (SELECT meeting_id FROM public.participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Participants can create action items" 
ON public.action_items FOR INSERT
WITH CHECK (
  meeting_id IN (
    SELECT meeting_id FROM public.participants WHERE user_id = auth.uid()
  ) AND created_by = auth.uid()
);

CREATE POLICY "Users can update action items they created or are assigned to" 
ON public.action_items FOR UPDATE
USING (created_by = auth.uid() OR assigned_to = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mind_maps_updated_at
  BEFORE UPDATE ON public.mind_maps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('meeting-recordings', 'meeting-recordings', false);

-- Create storage policies for recordings
CREATE POLICY "Users can view recordings from their meetings" 
ON storage.objects FOR SELECT
USING (
  bucket_id = 'meeting-recordings' AND 
  (storage.foldername(name))[1] IN (
    SELECT meeting_id::text FROM public.meetings 
    WHERE host_id = auth.uid() OR 
    id IN (SELECT meeting_id FROM public.participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can upload recordings to their meetings" 
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'meeting-recordings' AND 
  (storage.foldername(name))[1] IN (
    SELECT meeting_id::text FROM public.meetings WHERE host_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_meetings_meeting_id ON public.meetings(meeting_id);
CREATE INDEX idx_participants_meeting_id ON public.participants(meeting_id);
CREATE INDEX idx_participants_user_id ON public.participants(user_id);
CREATE INDEX idx_transcripts_meeting_id ON public.transcripts(meeting_id);
CREATE INDEX idx_recordings_meeting_id ON public.recordings(meeting_id);