import express from 'express';
import cors from 'cors';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import listsRoutes from './routes/lists.js';
import reportsRoutes from './routes/reports.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: 'gameboxd-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use('/api', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/reports', reportsRoutes);

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
