import { createApp } from './app.js';

const PORT = Number(process.env.PORT ?? 3000);
const server = createApp();

server.listen(PORT, () => {
  console.log(`core-api listening on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing server');
  server.close(() => process.exit(0));
});