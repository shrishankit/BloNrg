import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { User } from '../types/user';

interface ConnectedUser {
  userId: number;
  username: string;
  role: string;
  socketId: string;
}

class SocketService {
  private io: SocketServer;
  private connectedUsers: ConnectedUser[] = [];

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (user: User) => {
        const connectedUser: ConnectedUser = {
          userId: user.id,
          username: user.username,
          role: user.role,
          socketId: socket.id
        };

        // Add user to connected users list
        this.connectedUsers.push(connectedUser);
        
        // Notify all admin users about the new connection
        this.notifyAdminsUserCount();
        
        console.log(`User ${user.username} authenticated`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove user from connected users list
        this.connectedUsers = this.connectedUsers.filter(user => user.socketId !== socket.id);
        
        // Notify all admin users about the updated count
        this.notifyAdminsUserCount();
      });
    });
  }

  private notifyAdminsUserCount(): void {
    const onlineUsersCount = this.connectedUsers.length;
    const onlineUsers = this.connectedUsers.map(user => ({
      userId: user.userId,
      username: user.username,
      role: user.role
    }));

    // Emit to all admin users
    this.io.emit('onlineUsersUpdate', {
      count: onlineUsersCount,
      users: onlineUsers
    });
  }

  // Get current online users count
  public getOnlineUsersCount(): number {
    return this.connectedUsers.length;
  }

  // Get list of online users
  public getOnlineUsers(): ConnectedUser[] {
    return [...this.connectedUsers];
  }
}

export default SocketService; 