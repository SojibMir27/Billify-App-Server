const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u7ffvmg.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("billify-db");
    const billCollection = db.collection("bills");
    const myBillCollection = db.collection("my-bills");

    // bills apis
    app.get("/bills", async (req, res) => {
      const result = await billCollection.find().toArray();
      res.send(result);
    });

    // filter category api
    app.get("/bills-category", async (req, res) => {
      const category = req.query.category;
      const query = category
        ? { category: { $regex: new RegExp(`^${category}$`, "i") } }
        : {};
      const result = await billCollection.find(query).toArray();
      res.send(result);
    });

    // recent-bill api
    app.get("/bills/recent", async (req, res) => {
      const bills = await billCollection
        .find()
        .sort({ _id: 1 })
        .limit(6)
        .toArray();
      res.send(bills);
    });

    // single bill api
    app.get("/bills/:id", async (req, res) => {
      const { id } = req.params;
      const objId = { _id: new ObjectId(id) };
      const result = await billCollection.findOne(objId);
      res.send(result);
    });

    // my-bills apis start
    app.post("/my-bills", async (req, res) => {
      const data = req.body;
      const result = await myBillCollection.insertOne(data);
      res.send(result);
    });

    // my paid bill filter api
    app.get("/my-bills", async (req, res) => {
      const email = req.query.email;
      const result = await myBillCollection.find({ email }).toArray();
      res.send(result);
    });

    // my single bill api
    app.get("/my-bills/:id", async (req, res) => {
      const { id } = req.params;
      const objId = { _id: new ObjectId(id) };
      const result = await myBillCollection.findOne(objId);
      res.send(result);
    });

    // my bill update api
    app.put("/my-bills/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const objId = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };
      const result = await myBillCollection.updateOne(objId, update);
      res.send(result);
    });

    // my bill delete api
    app.delete("/my-bills/:id", async (req, res) => {
      const { id } = req.params;
      const objId = { _id: new ObjectId(id) };
      const result = await myBillCollection.deleteOne(objId);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bilify Server is Running Now!");
});

app.listen(port, () => {
  console.log(`Bilify app listening on port ${port}`);
});
