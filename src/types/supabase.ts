
// Define types for our database schema
export interface Thread {
  id: string;
  title: string;
  content: string;
  user_id: string;
  community_id: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  thread_id: string | null;
  comment_id: string | null;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  thread_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  thread_id: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface ThreadTag {
  id: string;
  thread_id: string;
  tag_id: string;
  created_at: string;
}
