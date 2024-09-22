const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dhkkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    // Connect the client to the server
    await client.connect();

    // Access the target database:
    const db = client.db("brianCaceres-Rci-DB");

    // Access collections correctly
    const allResortDataCollection = db.collection("allResorts");
    const usersCollection = db.collection("users");
    const allBookingsCollection = db.collection("allBookings");
    const paymentInfoCollection = db.collection("paymentInfo");



     // Get paginated and filtered resorts data from MongoDB Database
     app.get("/resorts", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const resorts = await allResortDataCollection.find().skip(skip).limit(limit).toArray();
        const count = await allResortDataCollection.countDocuments();

        res.send({
          resorts,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          totalResorts: count // Include the total count of resorts
        });
      } catch (error) {
        console.error("Error fetching resort data:", error);
        res.status(500).send("Internal Server Error");
      }
    });


    // Get all resort data without pagination
    app.get('/all-resorts', async (req, res) => {
      try {
        const resorts = await allResortDataCollection.find().toArray();
        res.send(resorts);
      } catch (error) {
        console.error("Error fetching all resort data:", error);
        res.status(500).send("Internal Server Error");
      }
    });


    // Posting resort data to MongoDB database
    app.post("/resorts", async (req, res) => {
      try {
        const resort = req.body;
        console.log(resort); // Logs posted resort data for debugging (optional)
        const result = await allResortDataCollection.insertOne(resort);
        res.send(result);
      } catch (error) {
        console.error("Error adding resort data:", error);
        res.status(500).send("Internal Server Error");
      }
    });














    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Set up your routes here

    // Start the server after successful connection
    app.listen(port, () => {
      console.log(`Airbnb server is running on Port ${port}`);
    });
  } catch (error) {
    console.error('Error running the server:', error);
  }
}

// Route for health check
app.get('/', (req, res) => {
  res.send('Brian Caceres RCI server is running');
});

run().catch(console.dir);
