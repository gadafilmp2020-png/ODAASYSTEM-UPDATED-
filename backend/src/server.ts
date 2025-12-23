import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import sequelize from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all for cPanel, or specify your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Basic Health Check
app.get('/', (req, res) => {
  res.send('Odaa System API is running (SQL/cPanel Mode)...');
});

const PORT = process.env.PORT || 5000;

// Authenticate and Sync Database
sequelize.authenticate()
  .then(() => {
    console.log('SQL Database Connected via Sequelize...');
    // Sync creates tables if they don't exist. 
    // alter: true updates schema if changed without deleting data.
    return sequelize.sync({ alter: true }); 
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error('Unable to connect to the database:', err);
  });