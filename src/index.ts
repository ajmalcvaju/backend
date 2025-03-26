import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import userRoutes from './infrastructure/routes/userRoutes';
import turfRoutes from './infrastructure/routes/turfRoutes';
import adminRoutes from './infrastructure/routes/adminRoutes';
import path from 'path';
import http from 'http';
import { connectDB } from './infrastructure/database/connect';
import cookieParser from "cookie-parser";
import passport from "passport";
import socketIo from 'socket.io';
import { createSocketConnectionForChat } from './infrastructure/socket/socketService';
import { errorMiddleware } from './interfaces/middlewares/errorHandler';

const app = express();
const server = http.createServer(app);
const io = createSocketConnectionForChat(server) 
const PORT = process.env.BACKEND_PORT || 7000;

// const corsOptions = {
//   origin: 'http://localhost:5173',
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(errorMiddleware);


app.use((req, res, next) => {
  const allowedOrigins = [process.env.FRONTEND_URL,'https://play-book.xyz'];
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization' 
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next(); 
  } 
});
app.use(passport.initialize(), (req, res, next) => {
  // console.log('Passport initialized:', passport);
  next();
});
 
app.use(cookieParser());
const paths = path.join(__dirname, 'public');
app.use(express.static('public'));
console.log(paths);

connectDB();
 


app.use('/api/users', userRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/admin', adminRoutes);



server.listen(PORT, () => {
  console.log('Server running at http://localhost:7000');
});
