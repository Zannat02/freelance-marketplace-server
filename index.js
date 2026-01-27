const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pvt1qcu.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    const tasksCollection = client.db('taskDB').collection('tasks');

    //Get all tasks
    app.get('/alltasks', async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    })


    //get specific task information
    app.get('/alltasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.findOne(query);
      res.send(result);
    })


    // // Get tasks with deadline from today -1 day on wards

    app.get('/tasks', async (req, res) => {
      const result = await tasksCollection.find().sort({ deadline: 1 }).limit(6).toArray();
      res.send(result);
    })


    // Get tasks by user email (My Posted Tasks)
    app.get('/mytasks', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.send([]);
      }

      const result = await tasksCollection.find({ email }).toArray();
      res.send(result);
    });


    // Update task
    app.put('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;

      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          title: updatedTask.title,
          category: updatedTask.category,
          description: updatedTask.description,
          deadline: updatedTask.deadline,
          budget: updatedTask.budget,
        }
      };

      const result = await tasksCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // Get single task for update
    app.get('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await tasksCollection.findOne(query);
      res.send(result);
    });


    // Post a new task
    app.post('/tasks', async (req, res) => {
      const newTask = req.body;
      console.log(newTask);
      const result = await tasksCollection.insertOne(newTask)
      res.send(result);
    })

    // Delete a task
    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Freelance marketplace server is running..')
})

app.listen(port, () => {
  console.log(`Freelance MarketPlace is running on port ${port}`)
})