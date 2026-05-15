import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.mjs';
import { connectDatabase } from './config/database.mjs';
import { env } from './config/env.mjs';
import { registerSockets } from './sockets/index.mjs';
import { logger } from './utils/logger.mjs';

const httpServer = http.createServer();
const io = new Server(httpServer, { cors: { origin: env.corsOrigin, credentials: true } });
const app = createApp(io);

httpServer.on('request', app);
registerSockets(io);

await connectDatabase();

httpServer.listen(env.port, () => {
  logger.info(`HRMS API listening on ${env.port}`);
});
