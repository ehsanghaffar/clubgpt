export interface GetChannelMessagesResponse {
  success: boolean;
  messages: Message[];
  next_cursor: string;
  num_messages: number;
}

export interface Message {
  message_id: string;
  user_profile: UserProfile;
  message: string;
  message_type: number;
  time_created: string;
}

export interface UserProfile {
  user_id: number;
  name: string;
  photo_url: string;
  can_chat: boolean;
}
