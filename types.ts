
export enum Author {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  author: Author;
  content: string;
}
