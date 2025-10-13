// Chat system backend - WebSocket and REST API endpoints
import express, { Request, Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db";
import {
  messages,
  conversations,
  users,
  onlineStatus,
} from "../../shared/schema";
import { eq, and, or, sql, desc, asc, inArray } from "drizzle-orm";
import { isAdmin } from "../auth-admin";
import { Server } from "http";

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Store WebSocket connections
const wsClients = new Map<string, WebSocket>();

// Create WebSocket server
export function createChatWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: "/ws/chat",
  });

  wss.on("connection", async (ws, req) => {
    let userId: string | null = null;

    // Handle messages from client
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "auth":
            // Authenticate WebSocket connection
            userId = message.userId;
            if (userId) {
              wsClients.set(userId, ws);
              
              // Update online status
              await db
                .insert(onlineStatus)
                .values({
                  userId,
                  isOnline: true,
                  lastSeenAt: new Date(),
                  socketId: generateSocketId(),
                })
                .onConflictDoUpdate({
                  target: onlineStatus.userId,
                  set: {
                    isOnline: true,
                    lastSeenAt: new Date(),
                    socketId: generateSocketId(),
                  },
                });

              // Notify other users about online status
              broadcastOnlineStatus(userId, true);

              // Send initial data
              ws.send(
                JSON.stringify({
                  type: "auth_success",
                  userId,
                })
              );
            }
            break;

          case "message":
            // Handle new message
            if (!userId) {
              ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
              return;
            }

            const { conversationId, content, receiverId } = message;

            // Create or get conversation
            let convId = conversationId;
            if (!convId && receiverId) {
              // Create new conversation if it doesn't exist
              const existingConv = await findOrCreateConversation(userId, receiverId);
              convId = existingConv.id;
            }

            if (!convId) {
              ws.send(JSON.stringify({ type: "error", message: "Invalid conversation" }));
              return;
            }

            // Save message to database
            const [newMessage] = await db
              .insert(messages)
              .values({
                conversationId: convId,
                senderId: userId,
                receiverId,
                content,
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning();

            // Update conversation
            await db
              .update(conversations)
              .set({
                lastMessageAt: new Date(),
                lastMessagePreview: content.substring(0, 100),
                updatedAt: new Date(),
              })
              .where(eq(conversations.id, convId));

            // Get sender info
            const [sender] = await db
              .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                profileImageUrl: users.profileImageUrl,
              })
              .from(users)
              .where(eq(users.id, userId))
              .limit(1);

            const messageData = {
              ...newMessage,
              sender,
            };

            // Send to sender
            ws.send(
              JSON.stringify({
                type: "message_sent",
                message: messageData,
              })
            );

            // Send to receiver if online
            if (receiverId && wsClients.has(receiverId)) {
              const receiverWs = wsClients.get(receiverId);
              receiverWs?.send(
                JSON.stringify({
                  type: "new_message",
                  message: messageData,
                })
              );
            }

            // Update unread count for receiver
            if (receiverId) {
              const unreadCountData = await db
                .select()
                .from(conversations)
                .where(eq(conversations.id, convId))
                .limit(1);
              
              if (unreadCountData.length > 0) {
                const unreadCount = unreadCountData[0].unreadCount as any || {};
                unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;
                
                await db
                  .update(conversations)
                  .set({ unreadCount })
                  .where(eq(conversations.id, convId));
              }
            }
            break;

          case "typing":
            // Handle typing indicator
            if (!userId) return;
            
            const { conversationId: typingConvId, isTyping } = message;
            
            if (isTyping) {
              await db
                .update(onlineStatus)
                .set({
                  currentlyTypingIn: typingConvId,
                  updatedAt: new Date(),
                })
                .where(eq(onlineStatus.userId, userId));
            } else {
              await db
                .update(onlineStatus)
                .set({
                  currentlyTypingIn: null,
                  updatedAt: new Date(),
                })
                .where(eq(onlineStatus.userId, userId));
            }

            // Broadcast typing status to conversation participants
            broadcastTypingStatus(userId, typingConvId, isTyping);
            break;

          case "read":
            // Mark messages as read
            if (!userId) return;

            const { messageIds } = message;
            
            await db
              .update(messages)
              .set({
                isRead: true,
                readAt: new Date(),
              })
              .where(
                and(
                  inArray(messages.id, messageIds),
                  eq(messages.receiverId, userId)
                )
              );

            // Update unread count in conversation
            const convMessages = await db
              .select({ conversationId: messages.conversationId })
              .from(messages)
              .where(inArray(messages.id, messageIds))
              .limit(1);

            if (convMessages.length > 0) {
              const convId = convMessages[0].conversationId;
              const conv = await db
                .select()
                .from(conversations)
                .where(eq(conversations.id, convId))
                .limit(1);
              
              if (conv.length > 0) {
                const unreadCount = conv[0].unreadCount as any || {};
                unreadCount[userId] = 0;
                
                await db
                  .update(conversations)
                  .set({ unreadCount })
                  .where(eq(conversations.id, convId));
              }
            }

            // Notify sender about read status
            for (const messageId of messageIds) {
              const [msg] = await db
                .select({ senderId: messages.senderId })
                .from(messages)
                .where(eq(messages.id, messageId))
                .limit(1);

              if (msg?.senderId && wsClients.has(msg.senderId)) {
                const senderWs = wsClients.get(msg.senderId);
                senderWs?.send(
                  JSON.stringify({
                    type: "message_read",
                    messageId,
                    readBy: userId,
                  })
                );
              }
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Processing error" }));
      }
    });

    // Handle disconnection
    ws.on("close", async () => {
      if (userId) {
        wsClients.delete(userId);
        
        // Update online status
        await db
          .update(onlineStatus)
          .set({
            isOnline: false,
            lastSeenAt: new Date(),
            currentlyTypingIn: null,
          })
          .where(eq(onlineStatus.userId, userId));

        // Notify other users
        broadcastOnlineStatus(userId, false);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}

// Helper functions
function generateSocketId(): string {
  return Math.random().toString(36).substring(7);
}

function broadcastOnlineStatus(userId: string, isOnline: boolean) {
  // Broadcast to all connected admin users
  wsClients.forEach((ws, clientUserId) => {
    if (clientUserId !== userId) {
      ws.send(
        JSON.stringify({
          type: "user_status",
          userId,
          isOnline,
        })
      );
    }
  });
}

function broadcastTypingStatus(userId: string, conversationId: string, isTyping: boolean) {
  // Get conversation participants and notify them
  db.select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)
    .then((convs) => {
      if (convs.length > 0) {
        const participants = convs[0].participants as string[];
        participants.forEach((participantId) => {
          if (participantId !== userId && wsClients.has(participantId)) {
            const ws = wsClients.get(participantId);
            ws?.send(
              JSON.stringify({
                type: "typing_status",
                userId,
                conversationId,
                isTyping,
              })
            );
          }
        });
      }
    });
}

async function findOrCreateConversation(userId1: string, userId2: string) {
  // Check if conversation exists
  const existingConv = await db
    .select()
    .from(conversations)
    .where(
      sql`${conversations.participants} @> ${JSON.stringify([userId1, userId2])} 
           OR ${conversations.participants} @> ${JSON.stringify([userId2, userId1])}`
    )
    .limit(1);

  if (existingConv.length > 0) {
    return existingConv[0];
  }

  // Create new conversation
  const [newConv] = await db
    .insert(conversations)
    .values({
      participants: [userId1, userId2],
      type: "direct",
      unreadCount: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newConv;
}

// REST API Endpoints

// Get user's conversations
router.get("/conversations", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get conversations where user is a participant
    const userConversations = await db
      .select({
        id: conversations.id,
        participants: conversations.participants,
        lastMessageAt: conversations.lastMessageAt,
        lastMessagePreview: conversations.lastMessagePreview,
        unreadCount: conversations.unreadCount,
        type: conversations.type,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(sql`${conversations.participants} @> ${JSON.stringify([userId])}`)
      .orderBy(desc(conversations.lastMessageAt));

    // Get participant details for each conversation
    const conversationsWithParticipants = await Promise.all(
      userConversations.map(async (conv) => {
        const participantIds = (conv.participants as string[]).filter(
          (id) => id !== userId
        );

        const participants = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            profileImageUrl: users.profileImageUrl,
            role: users.role,
          })
          .from(users)
          .where(inArray(users.id, participantIds));

        // Get online status for participants
        const onlineStatuses = await db
          .select({
            userId: onlineStatus.userId,
            isOnline: onlineStatus.isOnline,
            lastSeenAt: onlineStatus.lastSeenAt,
          })
          .from(onlineStatus)
          .where(inArray(onlineStatus.userId, participantIds));

        const participantsWithStatus = participants.map((p) => {
          const status = onlineStatuses.find((s) => s.userId === p.id);
          return {
            ...p,
            isOnline: status?.isOnline || false,
            lastSeenAt: status?.lastSeenAt,
          };
        });

        return {
          ...conv,
          participants: participantsWithStatus,
          unreadCount: (conv.unreadCount as any)?.[userId] || 0,
        };
      })
    );

    res.json(conversationsWithParticipants);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a conversation
router.get("/messages/:conversationId", isAdmin, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversationMessages = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        readAt: messages.readAt,
        isEdited: messages.isEdited,
        attachments: messages.attachments,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(conversationMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/messages", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId, receiverId, content } = req.body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Message content is required" });
    }

    if (!conversationId && !receiverId) {
      return res.status(400).json({ error: "Conversation ID or receiver ID is required" });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId && receiverId) {
      const conv = await findOrCreateConversation(userId, receiverId);
      convId = conv.id;
    }

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId: convId,
        senderId: userId,
        receiverId,
        content: content.trim(),
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update conversation
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, convId));

    // Get sender details
    const [sender] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.json({
      ...newMessage,
      sender,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark messages as read
router.put("/messages/:id/read", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    await db
      .update(messages)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(eq(messages.id, id), eq(messages.receiverId, userId)));

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

// Search messages
router.get("/search", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    // Get user's conversations
    const userConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(sql`${conversations.participants} @> ${JSON.stringify([userId])}`);

    const conversationIds = userConversations.map((c) => c.id);

    // Search messages
    const searchResults = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        content: messages.content,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          inArray(messages.conversationId, conversationIds),
          sql`${messages.content} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(50);

    res.json(searchResults);
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ error: "Failed to search messages" });
  }
});

// Get online users
router.get("/online-users", isAdmin, async (req: Request, res: Response) => {
  try {
    // Get admin users who can use chat
    const adminUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
      })
      .from(users)
      .where(
        or(
          eq(users.role, "owner"),
          eq(users.role, "admin"),
          eq(users.role, "editor")
        )
      );

    // Get online status for each user
    const onlineStatuses = await db
      .select({
        userId: onlineStatus.userId,
        isOnline: onlineStatus.isOnline,
        lastSeenAt: onlineStatus.lastSeenAt,
      })
      .from(onlineStatus)
      .where(
        inArray(
          onlineStatus.userId,
          adminUsers.map((u) => u.id)
        )
      );

    const usersWithStatus = adminUsers.map((user) => {
      const status = onlineStatuses.find((s) => s.userId === user.id);
      return {
        ...user,
        isOnline: status?.isOnline || false,
        lastSeenAt: status?.lastSeenAt,
      };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).json({ error: "Failed to fetch online users" });
  }
});

// Gemini AI Chatbot endpoint
router.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a medical context for the chatbot
    const context = `Tu es Dr. Mimi, un assistant médical virtuel amical et professionnel pour les étudiants en médecine. 
    Tu fournis des informations médicales précises, aides avec les révisions, et réponds aux questions sur l'anatomie, 
    la physiologie, la pathologie et la pharmacologie. Tu es toujours encourageant et bienveillant. 
    Réponds en français sauf si on te parle dans une autre langue.
    
    Question de l'utilisateur: ${message}`;

    // Generate response
    const result = await model.generateContent(context);
    const response = result.response;
    const text = response.text();

    // Return the response
    res.json({ 
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error with Gemini AI chatbot:", error);
    res.status(500).json({ 
      error: "Failed to generate response",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;