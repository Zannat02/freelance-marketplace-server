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

// cache DB (VERY IMPORTANT for Vercel)
let db;
let tasksCollection;

async function connectDB() {
  if (db) return;

  await client.connect();
  db = client.db('taskDB');
  tasksCollection = db.collection('tasks');

  console.log("MongoDB connected");
}

// middleware ensure DB ready
app.use(async (req, res, next) => {
  await connectDB();
  next();
});


// ---------------- ROUTES (UNCHANGED LOGIC) ----------------

// home
app.get('/', (req, res) => {
  res.send('Freelance marketplace server is running..');
});


// all tasks
app.get('/alltasks', async (req, res) => {
  const result = await tasksCollection.find().toArray();
  res.send(result);
});


// single task
app.get('/alltasks/:id', async (req, res) => {
  const result = await tasksCollection.findOne({
    _id: new ObjectId(req.params.id)
  });
  res.send(result);
});


// latest tasks
// app.get('/tasks', async (req, res) => {
//   const result = await tasksCollection
//     .find()
//     .sort({ deadline: 1 })
//     .limit(6)
//     .toArray();

//   res.send(result);
// });


// latest tasks
app.get('/tasks', async (req, res) => {
  const result = await tasksCollection
    .find({ deadline: { $gte: new Date() } })
    .sort({ deadline: 1 })
    .limit(6)
    .toArray();

  res.send(result);
});


// my tasks
app.get('/mytasks', async (req, res) => {
  const email = req.query.email;

  if (!email) return res.send([]);

  const result = await tasksCollection.find({ email }).toArray();
  res.send(result);
});


// update task
// app.put('/tasks/:id', async (req, res) => {
//   const result = await tasksCollection.updateOne(
//     { _id: new ObjectId(req.params.id) },
//     {
//       $set: {
//         title: req.body.title,
//         category: req.body.category,
//         description: req.body.description,
//         deadline: req.body.deadline,
//         budget: req.body.budget,
//       }
//     }
//   );

//   res.send(result);
// });


app.put('/tasks/:id', async (req, res) => {
  const result = await tasksCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    {
      $set: {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        deadline: new Date(req.body.deadline),
        budget: req.body.budget,
      }
    }
  );

  res.send(result);
});


// get single task
app.get('/tasks/:id', async (req, res) => {
  const result = await tasksCollection.findOne({
    _id: new ObjectId(req.params.id)
  });

  res.send(result);
});


// post task
// app.post('/tasks', async (req, res) => {
//   const result = await tasksCollection.insertOne(req.body);
//   res.send(result);
// });


app.post('/tasks', async (req, res) => {
  const taskData = {
    ...req.body,
    deadline: new Date(req.body.deadline),
    bidsCount: 0,
  };
  const result = await tasksCollection.insertOne(taskData);
  res.send(result);
});


// increase bid
app.patch('/tasks/bid/:id', async (req, res) => {
  const result = await tasksCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $inc: { bidsCount: 1 } }
  );

  res.send(result);
});


// delete task
app.delete('/tasks/:id', async (req, res) => {
  const result = await tasksCollection.deleteOne({
    _id: new ObjectId(req.params.id)
  });

  res.send(result);
});


// ---------------- LOCAL + VERCEL HANDLING ----------------


if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Vercel export
module.exports = app;