const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pvt1qcu.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let tasksCollection;

// Mongo connect once
async function connectDB() {
  if (!tasksCollection) {
    await client.connect();
    const db = client.db('taskDB');
    tasksCollection = db.collection('tasks');
    console.log("MongoDB connected");
  }
}

connectDB().catch(console.dir);

/* ---------------- ROUTES (UNCHANGED) ---------------- */

// Get all tasks
app.get('/alltasks', async (req, res) => {
  const result = await tasksCollection.find().toArray();
  res.send(result);
});

// Get specific task
app.get('/alltasks/:id', async (req, res) => {
  const id = req.params.id;
  const result = await tasksCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

// Get tasks (latest 6)
app.get('/tasks', async (req, res) => {
  const result = await tasksCollection.find().sort({ deadline: 1 }).limit(6).toArray();
  res.send(result);
});

// My tasks
app.get('/mytasks', async (req, res) => {
  const email = req.query.email;

  if (!email) return res.send([]);

  const result = await tasksCollection.find({ email }).toArray();
  res.send(result);
});

// Update task
app.put('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const updatedTask = req.body;

  const result = await tasksCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        title: updatedTask.title,
        category: updatedTask.category,
        description: updatedTask.description,
        deadline: updatedTask.deadline,
        budget: updatedTask.budget,
      }
    }
  );

  res.send(result);
});

// Get single task
app.get('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const result = await tasksCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

// Post task
app.post('/tasks', async (req, res) => {
  const newTask = req.body;
  const result = await tasksCollection.insertOne(newTask);
  res.send(result);
});

// Increase bid count
app.patch('/tasks/bid/:id', async (req, res) => {
  const id = req.params.id;

  const result = await tasksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { bidsCount: 1 } }
  );

  res.send(result);
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

/* ---------------- ROOT ---------------- */

app.get('/', (req, res) => {
  res.send('Freelance marketplace server is running..');
});



module.exports = app;