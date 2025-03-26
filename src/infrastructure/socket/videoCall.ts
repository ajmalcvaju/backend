import { Server, Socket } from "socket.io";
// import { getUserDetails } from "../../application/usecases/user/getUserDetails";
// import { UserRepositoryImpl } from "../database/repositories/UserRepositoryImpl";
// import { getUserName } from "../../application/usecases/user/getUserName";
import { UserModel } from "../database/models/userModel";

export const createSocketConnectionForVideo = (io: Server, socket: Socket) => {
    interface IceCandidatePayload {
        roomId: string;
        candidate: RTCIceCandidate;
    }
 
    interface OfferPayload {
        roomId: string;
        caller:string;
        offer: RTCSessionDescriptionInit;
    }

    interface AnswerPayload {
        roomId: string;
        answer: RTCSessionDescriptionInit;
    }

    interface IncomingVideoCallPayload {
        receiverId: string;
    }

    interface CallAcceptedPayload {
        receiverId: string;
    }
    interface UserDetails {
        firstName?: string;
        lastName?: string;
    }
    socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        console.log("1: User joined room:", roomId);
    });

    socket.on("offer",async ({ roomId,caller,offer }: OfferPayload) => {
        console.log(caller)
        // const userName=await getUserName(UserRepositoryImpl,caller)
        // io.to(roomId).emit("offerNotification", { roomId,userName,caller,callType:'Video'});
        socket.to(roomId).emit("offer", offer);
        console.log("2: Offer sent to room:", roomId, offer);
    });
    socket.on("offerNotification",async ({ roomId,caller }) => {
        console.log(`Offer notification received in room ${roomId}`);
        // const userName=await getUserName(UserRepositoryImpl,caller)
        const user = await UserModel.findById(caller);
        const userName = user ? user.firstName : null;
        io.to(roomId).emit("offerNotification", { roomId,userName,caller,callType:'Video'});
      });

    socket.on("answer", ({ roomId, answer }: AnswerPayload) => {
        socket.to(roomId).emit("answer", answer);
        console.log("3: Answer sent to room:", roomId);
    });
    socket.on("ice-candidate", ({ roomId, candidate }: IceCandidatePayload) => {
        socket.to(roomId).emit("ice-candidate", candidate);
        console.log("4: ICE candidate sent to room:", roomId);
    });
    socket.on("leave-room-decline", (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-decline", { roomId, userId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
    });
    socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit("call-disconnected", { roomId, userId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
    });
}