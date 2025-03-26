import { Server, Socket } from "socket.io";
import { createSocketConnectionForVideo } from "./videoCall";
// import { sendMessage } from "../../application/usecases/sendMessage";
// import { MessageRepositoryImpl } from "../database/repositories/MessageRepositoryImpl";
import { MessageModel } from "../database/models/messageModel";
import { UserModel } from "../database/models/userModel";
import { createSocketConnectionForAudio } from "./audioCall";
// import { getUserName } from "../../application/usecases/user/getUserName";
// import { UserRepositoryImpl } from "../database/repositories/UserRepositoryImpl";
declare module "socket.io" {
  interface Socket {
    userId?: string;
  }
}

export const createSocketConnectionForChat = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://play-book.xyz"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    createSocketConnectionForVideo(io, socket);
    createSocketConnectionForAudio(io, socket);
    socket.on("joinTurf", async ({ turfId, userId }) => {
      console.log(userId);
      socket.userId = userId;
      await UserModel.findByIdAndUpdate(
        userId,
        {
          isOnline: true,
          $unset: { lastSeen: "" },
        },
        { new: true }
      );
      socket.join(turfId);
      console.log(`User ${socket.id} joined turf: ${turfId}`);
    });
    socket.on(
      "sendMessage",
      async ({ message, senderId, recieverId, time, type }) => {
        const newMessage = new MessageModel({
          message,
          senderId,
          recieverId,
          type,
        });
        await newMessage.save();
        // const userName = await getUserName(UserRepositoryImpl, senderId);
        const user = await UserModel.findById(senderId);
        const userName = user ? user.firstName : null;
        console.log("ajjajjajajajajjaja",message,senderId,recieverId,time)
        io.to(recieverId).emit("newMessageNotification", {
          userName,
          senderId,
          message,
          time,
        });
        io.to(recieverId).emit("message", {
          message,
          senderId,
          recieverId,
          time,
        });
      }
    );
    socket.on(
      "respondToMessage",
      async ({
        responseMessage,
        responderId,
        receiverId,
        turfId,
        time,
        type,
      }) => {
        console.log({ responseMessage, responderId, receiverId });
        const newMessage = new MessageModel({
          message: responseMessage,
          senderId: responderId,
          recieverId: receiverId,
          type,
        });
        await newMessage.save();
        console.log(Date.now());
        io.to(turfId).emit("message", {
          message: responseMessage,
          senderId: responderId,
          receiverId,
          time,
          type,
        });
        socket.emit("responseSent", { status: "success", responseMessage });
      }
    );

    socket.on('user-online', (userId) => {
      console.log(`${userId} is onlines`);
      io.emit('user-status', { userId, status: 'online' }); // Notify other users
    });

    socket.on('user-offline', (userId) => {
      console.log(`${userId} is offline`);
      io.emit('user-status', { userId, status: 'offline' }); // Notify other users
    });

    socket.on("delete-message", async (messageId) => {
      try {
        const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
        if (deletedMessage) {
          io.emit("message-deleted", messageId);
        } else {
          console.error("Message not found:", messageId);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });
    socket.on("send-notification", (notificationData) => {
      console.log(`Notification from ${notificationData.firstName}:`, notificationData);
      io.emit("receive-notification", notificationData);
    });
    socket.on("cancel", ({ turfId }) => {
      io.to(turfId).emit("cancelNotification", {
        turfId,
      });
    });
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      await UserModel.findByIdAndUpdate(
        userId,
        {
          isOnline: false,
          lastSeen: Date.now(), // Directly set lastSeen to current timestamp
        },
        { new: true } // Return the updated document
      );
      console.log(`User ${userId} is now offline, last seen updated.`);
      console.log("User disconnected");
    });
  });
  return io;
};
