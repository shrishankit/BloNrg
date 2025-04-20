import { Injectable, Inject } from '@angular/core';
import { Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';

export interface OnlineUser {
  userId: number;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private onlineUsersSubject = new BehaviorSubject<OnlineUser[]>([]);
  public onlineUsers$ = this.onlineUsersSubject.asObservable();
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private connectionTimeout: any = null;

  constructor(
    private authService: AuthService,
    @Inject('io') private io: any
  ) {
    // Initialize socket connection when user logs in
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.connect(user);
      } else {
        this.disconnect();
      }
    });
  }

  private connect(user: any): void {
    if (this.socket) {
      this.disconnect();
    }

    // Clear any existing timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Reset connection attempts
    this.connectionAttempts = 0;

    // Create socket with proper configuration
    // Use the base URL without the '/api' prefix for WebSocket connections
    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, ''); // Remove '/api' suffix if present
    const socketUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
    console.log('Connecting to socket server at:', socketUrl);
    
    this.socket = this.io(socketUrl, {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      path: '/socket.io/' // Ensure correct path
    });

    this.setupEventHandlers();
    
    // Authenticate the socket connection
    if (this.socket) {
      this.socket.emit('authenticate', user);
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.connectionAttempts = 0; // Reset connection attempts on successful connection
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connectionAttempts++;
      
      // If we've exceeded max attempts, try a different approach
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.log('Max connection attempts reached, trying alternative connection method');
        
        // Try connecting with polling only
        if (this.socket) {
          this.socket.io.opts.transports = ['polling'];
          this.socket.connect();
        }
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('onlineUsersUpdate', (data: { count: number, users: OnlineUser[] }) => {
      console.log('Online users update:', data);
      this.onlineUsersSubject.next(data.users);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  private disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check if a user is online
  isUserOnline(userId: number): boolean {
    const onlineUsers = this.onlineUsersSubject.value;
    return onlineUsers.some(user => user.userId === userId);
  }
} 