export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
}

export interface ChatRoom {
    id: string;
    participants: string[];
    lastMessage?: Message;
}
