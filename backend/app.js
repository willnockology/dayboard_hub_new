const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const itemRoutes = require('./routes/itemRoutes');
const formRoutes = require('./routes/formRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

console.log('Registering user routes...');
app.use('/api/users', userRoutes);

console.log('Registering document routes...');
app.use('/api/documents', documentRoutes);

console.log('Registering chat routes...');
app.use('/api/chats', chatRoutes);

console.log('Registering item routes...');
app.use('/api/items', itemRoutes);

console.log('Registering form routes...');
app.use('/api/forms', formRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
