"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class SocketService {
    constructor(server) {
        this.connectedUsers = [];
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);
            // Handle user authentication
            socket.on('authenticate', (user) => {
                const connectedUser = {
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
    notifyAdminsUserCount() {
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
    getOnlineUsersCount() {
        return this.connectedUsers.length;
    }
    // Get list of online users
    getOnlineUsers() {
        return [...this.connectedUsers];
    }
}
exports.default = SocketService;
