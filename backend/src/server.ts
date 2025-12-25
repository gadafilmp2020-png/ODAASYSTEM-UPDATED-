
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
    origin: ['https://etcareproduct.com', 'https://www.etcareproduct.com', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// API Health Check
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'online', message: 'Odaa System API Connected' });
});

// Basic Root Check
app.get('/', (req, res) => {
  res.send('Odaa Backend Server is Running.');
});

const PORT = process.env.PORT || 5000;

// Authenticate and Sync Database
sequelize.authenticate()
  .then(() => {
    console.log('SQL Database Connected via Sequelize...');
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
