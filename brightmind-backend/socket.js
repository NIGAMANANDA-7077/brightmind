const { Server } = require('socket.io');

let io;

const init = (httpServer, corsOrigins) => {
    io = new Server(httpServer, {
        cors: {
            origin: corsOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        // Join a thread-specific room for scoped updates
        socket.on('join_thread', (threadId) => {
            socket.join(`thread_${threadId}`);
        });

        socket.on('leave_thread', (threadId) => {
            socket.leave(`thread_${threadId}`);
        });

        socket.on('disconnect', () => {});
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io has not been initialized');
    return io;
};

module.exports = { init, getIO };
