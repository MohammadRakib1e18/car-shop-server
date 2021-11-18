const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.np0as.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("carShop");
        const productCollection = database.collection("products");

        // GET API
        app.get("/products", async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        const orderCollection = database.collection("order");
        

        // POST API
        app.post("/order", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.json({ result });
        });
        app.get('/order', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email}
            console.log(query);
            const cursor = orderCollection.find(query);
            const getOrders = await cursor.toArray();
            res.send(getOrders);
        })

        // POST for review
        const reviewCollection = database.collection("review");
        app.post("/review", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json({ result });
        });
        app.post("/productAdded", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log(result);
            res.json({ result });
        });

        // GET for review
        app.get("/review", async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            console.log(reviews);
            res.send(reviews);
        });

        // save user
        const userCollection = database.collection('users');
        // POST
        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        app.put('/users/admin', async(req, res)=>{
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set:{role:'admin'}};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        app.get('/users/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role == 'admin'){
                isAdmin=true;
            }
            res.json({admin: isAdmin});
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello Car Lovers!");
});

app.listen(port, () => {
    console.log(`listening at ${port}`);
});
