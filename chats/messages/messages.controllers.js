import asyncHandler from "express-async-handler";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Get all messages in a private conversation
const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.directMessage.findMany({
      where: {
        conversationId,
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Send a message in a private conversation
const sendConversationMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  try {
    const message = await prisma.directMessage.create({
      data: {
        content,
        employeeId: req.employeeId,
        conversationId,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a message in a private conversation (if permitted)
const deleteConversationMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await prisma.directMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return res
        .status(404)
        .json({ message: `Message ${messageId} not found` });
    }

    await prisma.directMessage.delete({
      where: {
        id: messageId,
      },
    });

    res.status(204).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get the status of a message (read, delivered, sent)
const getMessageStatus = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
      select: {
        read: true,
        delivered: true,
      },
    });

    if (!message) {
      return res
        .status(404)
        .json({ message: `Message ${messageId} not found` });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all unread messages for a user
const getUnreadMessages = asyncHandler(async (req, res) => {
  try {
    const unreadMessages = await prisma.message.findMany({
      where: {
        employeeId: req.employeeId,
        read: false,
      },
    });

    res.status(200).json(unreadMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Search for messages by content or sender
const searchMessages = asyncHandler(async (req, res) => {
  const { content, senderId } = req.query;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            text: {
              contains: content,
            },
          },
          {
            employeeId: senderId,
          },
        ],
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
export {
  getMessageStatus,
  getUnreadMessages,
  searchMessages,
  getConversationMessages,
  sendConversationMessage,
  deleteConversationMessage,
};
