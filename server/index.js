// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
};

const io = new Server(server, { cors: corsOptions });





const rooms = {};

const generateRoomId = (length) => {
    const digits = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        code += digits.charAt(randomIndex);
    }

    return code;
};

const doesRoomExist = (roomid) => {
    const room = io.sockets.adapter.rooms.get(roomid);
    return room && room.size > 0; // Check if the room exists and has at least one member
};

io.on('connection', (socket) => {
    console.log(`USER CONNECTED: ${socket.id}`);

    socket.on('create_room', () => {
        const roomId = generateRoomId(6);
        console.log(`Generated Room ID: ${roomId}`);
        rooms[roomId] = [socket.id];
        socket.join(roomId);
        socket.emit('room_created', { roomId });
    });

    socket.on('join_room', ({ roomId }) => {
        socket.join(roomId);
    });

    socket.on("send_message", (data) => {
        const { content, sender, roomid } = data;

        // socket.to(roomid).emit("receive_message", { content, sender });
        // io.emit('receive_message', { content, sender })
        // console.log(data);
        socket.join(roomid);

        if (doesRoomExist(roomid)) {

            // socket.to(roomid).emit('receive_message', { content, sender });
            io.emit('receive_message', { content, sender })
            console.log(data);


        } else {
            console.log(`Room ${roomid} does not exist.`);
            // Handle accordingly, e.g., notify the sender or take other actions
        }

    });

});

server.listen(8080, () => {
    console.log("Server is running on http://localhost:8080'");
});
