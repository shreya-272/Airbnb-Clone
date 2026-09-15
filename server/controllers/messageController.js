import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ $or: [{ senderId: req.user._id }, { recipientId: req.user._id }] })
    .populate('senderId', 'name avatar role').populate('recipientId', 'name avatar role').sort({ createdAt: 1 });
  res.json({ success: true, data: messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, listingId, body } = req.body;
  if (!mongoose.Types.ObjectId.isValid(recipientId) || !body?.trim()) throw new AppError('Recipient and message are required', 400);
  const message = await Message.create({ senderId: req.user._id, recipientId, listingId, body: body.trim() });
  await Notification.create({ userId: recipientId, type: 'message', title: 'New message', body: `${req.user.name} sent you a message.` });
  res.status(201).json({ success: true, data: await message.populate('senderId', 'name avatar role') });
});

export const markMessagesRead = asyncHandler(async (req, res) => {
  await Message.updateMany({ recipientId: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ success: true });
});