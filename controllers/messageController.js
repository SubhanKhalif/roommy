import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import Chat from '../models/chatModel.js';

export const sendMessage = catchAsync(async (req, res, next) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return next(new AppError("Invalid data passed into request", 400));
    }

    const newMessage = {
        sender: req.user._id,
        content,
        chat: chatId
    };

    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
        path: 'chat.users',
        select: 'name pic email'
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    
    res.status(200).json({
        status: 'success',
        data: message
    });
});

export const getAllMessages = catchAsync(async (req, res, next) => {
    const messages = await Message.find({ chat: req.params.chatId })
        .populate('sender', "name pic email");

    if (!messages) {
        return next(new AppError('Something went wrong while fetching messages', 400));
    }
    
    res.status(200).json({
        status: 'success',
        message: messages
    });
});