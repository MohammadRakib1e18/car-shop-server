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
