import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { SERVER_CONFIG } from './config.js';
import { authRouter } from './routes/auth.js';
import { discordRouter } from './routes/discord.js';
import { supportRouter } from './routes/support.js';
import { startDiscordGateway } from './discordGateway.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/discord', discordRouter);
app.use('/api/support', supportRouter);

// Base API endpoint
app.get('/api', (_req, res) => {
  res.json({
    status: 'healthy',
    message: 'LovePixels API Server is running',
    endpoints: {
      health: '/api/health',
      discordStatus: '/api/discord/status',
      communityStats: '/api/discord/community-stats',
    },
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.nodeEnv,
    guildId: SERVER_CONFIG.guildId,
  });
});

const server = app.listen(SERVER_CONFIG.port, () => {
  console.log(`[LovePixels Server] Backend listening on port ${SERVER_CONFIG.port}`);
  console.log(`[LovePixels Server] Guild ID: ${SERVER_CONFIG.guildId}`);

  // Initiate real Discord Gateway WebSocket client
  startDiscordGateway();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[LovePixels Server] Shutting down gracefully...');
  server.close();
});
