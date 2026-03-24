export interface TutorialVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TutorialVideoPayload {
  title: string;
  description?: string | null;
  youtube_url: string;
  is_published?: boolean;
}
