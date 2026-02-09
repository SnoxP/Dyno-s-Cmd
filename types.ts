export interface Tag {
  name: string;
  content: string;
  author: string;
  createdAt: number;
}

export interface User {
  username: string;
  avatar: string;
  isBot?: boolean;
  botTag?: boolean;
}

export interface Message {
  id: string;
  user: User;
  content: string;
  timestamp: number;
  embeds?: Embed[];
  isCommand?: boolean;
  replyTo?: string; // ID of message replying to
}

export interface Embed {
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  image?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
}

export enum CommandType {
  TAG_GET = 'TAG_GET',
  TAG_CREATE = 'TAG_CREATE',
  TAG_DELETE = 'TAG_DELETE',
  TAG_EDIT = 'TAG_EDIT',
  TAG_LIST = 'TAG_LIST', // /tags
  HELP = 'HELP',
  UNKNOWN = 'UNKNOWN'
}