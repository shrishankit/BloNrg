"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const socketService_1 = __importDefault(require("./services/socketService"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.get('/', async (req, res) => {
    res.json({ message: 'API is running!' });
});
// Create HTTP server
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.io service
const socketService = new socketService_1.default(httpServer);
// Make socketService available globally
global.socketService = socketService;
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
