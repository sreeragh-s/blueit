
import { Database } from "@/integrations/supabase/types";

// Update existing interfaces to match Supabase database schema
export type Thread = Database['public']['Tables']['threads']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type ThreadTag = Database['public']['Tables']['thread_tags']['Row'];
export type Community = Database['public']['Tables']['communities']['Row'];
export type CommunityMember = Database['public']['Tables']['community_members']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Enhanced type for threads with relations
export interface ThreadWithRelations extends Thread {
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  community: {
    id: string;
    name: string;
  };
  votes: number;
  commentCount: number;
  tags: string[];
  createdAt?: string; // Add this optional field for formatted date string
}

// Helper interface for ThreadCard component
export interface ThreadCardProps {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  community: {
    name: string;
    id: number;
  };
  votes: number;
  commentCount: number;
  tags?: string[];
  createdAt: string;
}

// Enhanced types for Supabase query results
export interface ThreadQueryResult {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  community_id: string;
  communities?: {
    id: string;
    name: string;
  } | null;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
  } | null;
}

export interface CommentQueryResult {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  thread_id: string;
  parent_id?: string | null;
  user_id: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
  } | null;
}
