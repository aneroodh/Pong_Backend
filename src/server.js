import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the built frontend (after running `npm run build` in client)
app.use(express.static(path.join(__dirname, '../client/dist')));

io.on('connection', (socket) => {
  console.log('A player connected');
  socket.on('disconnect', () => {
    console.log('A player disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});