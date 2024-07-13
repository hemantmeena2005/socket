import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIoServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000; // Vercel provides the PORT environment variable

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIoServer(server, {
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('sendMessage', (message) => {
      io.emit('receiveMessage', message);
    });
  });

  server.listen(port, (err) => {
    if (err) {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to prepare the app:', err);
  process.exit(1);
});
