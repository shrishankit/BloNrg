import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import prisma from './prisma';
import expenseRoutes from './routes/expenseRoutes';
import userRoutes from './routes/userRoutes';
import SocketService from './services/socketService';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);

app.get('/', async (req, res) => {
  res.json({ message: 'API is running!' });
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io service
const socketService = new SocketService(httpServer);

// Make socketService available globally
(global as any).socketService = socketService;

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
