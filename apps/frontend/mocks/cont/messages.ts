export interface Message {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: number
  participantId: number
  participantName: string
  participantAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export const mockConversations: Conversation[] = [
  {
    id: 1,
    participantId: 2,
    participantName: "Ion Ionescu",
    participantAvatar: "/avatar-1.jpg",
    lastMessage: "Mulțumesc pentru informații! Aș dori să discut...",
    lastMessageTime: "2024-12-22T14:30:00Z",
    unreadCount: 2,
  },
  {
    id: 2,
    participantId: 3,
    participantName: "Ana Marinescu",
    participantAvatar: "/avatar-2.jpg",
    lastMessage: "Locația arată minunat! Care este disponibilitatea pentru...",
    lastMessageTime: "2024-12-21T16:45:00Z",
    unreadCount: 0,
  },
]

export const mockMessages: Message[] = [
  {
    id: 1,
    conversationId: 1,
    senderId: 2,
    senderName: "Ion Ionescu",
    senderAvatar: "/avatar-1.jpg",
    content: "Bună ziua! Sunt interesat de locația dumneavoastră pentru o nuntă în iulie 2025.",
    timestamp: "2024-12-22T13:00:00Z",
    read: true,
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 1,
    senderName: "Maria Popescu",
    senderAvatar: "/professional-avatar.png",
    content: "Bună ziua! Cu plăcere vă pot ajuta. Ce dată aveți în vedere?",
    timestamp: "2024-12-22T13:15:00Z",
    read: true,
  },
  {
    id: 3,
    conversationId: 1,
    senderId: 2,
    senderName: "Ion Ionescu",
    senderAvatar: "/avatar-1.jpg",
    content: "Mulțumesc pentru informații! Aș dori să discut mai multe detalii despre pachetele disponibile.",
    timestamp: "2024-12-22T14:30:00Z",
    read: false,
  },
]
