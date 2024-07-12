const User = require('./backend/models/userModel'); // Ensure this path is correct

const uri = 'mongodb+srv://willnock:ux7rr3SYGwTXrobV@db.fuk3snj.mongodb.net/mydatabase?retryWrites=true&w=majority'; // Replace <new_password> with your new password

const { MongoClient } = require('mongodb');

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout duration
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('mydatabase'); // Replace with your database name
    const users = database.collection('users');

    const result = await users.deleteMany({ username: { $ne: 'superadmin' } });
    console.log(`Deleted ${result.deletedCount} users`);
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
