// Base interfaces for common properties
interface BaseNode {
  id: string;
}

interface TimestampedNode extends BaseNode {
  created_at: string;
}

// Node type definitions
export interface Topic extends TimestampedNode {
  name: string;
  display_name: string;
  taggings_count: number;
  image_url?: string;
}

export interface Publication extends TimestampedNode {
  name: string;
  display_name: string;
  avatar_small_url?: string;
  num_id: number;
  total_liked_count: number;
  total_article_count: number;
}

export interface User extends BaseNode {
  display_name: string;
  name: string;
  avatar_small_url?: string;
  num_id: number;
}

export interface Article extends BaseNode {
  post_type: string;
  title: string;
  slug: string;
  liked_count: number;
  body_letters_count: number;
  emoji?: string;
  published_at: string;
  path: string;
  user_id: string; // Foreign key to User
}

// Relationship type definitions
export interface BaseRelationship {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface TimestampedRelationship extends BaseRelationship {
  created_at: string;
}

export interface PublicationUserRelation extends TimestampedRelationship {
  label: 'HAS_MEMBER';
}

export interface ArticleTopicRelation extends TimestampedRelationship {
  label: 'HAS_TOPIC';
}

export interface UserArticleRelation extends BaseRelationship {
  label: 'WROTE';
}

// Graph data structure for visualization
export interface GraphData {
  elements: {
    nodes: Array<{
      data: Topic | Publication | User | Article;
    }>;
    edges: Array<{
      data: PublicationUserRelation | ArticleTopicRelation | UserArticleRelation;
    }>;
  };
}

// Node type discriminator
export type NodeType = 'Topic' | 'Publication' | 'User' | 'Article';

// Edge type discriminator
export type EdgeType = 'HAS_MEMBER' | 'HAS_TOPIC' | 'WROTE';

// Helper type for node properties
export type NodeProperties = {
  Topic: Topic;
  Publication: Publication;
  User: User;
  Article: Article;
};