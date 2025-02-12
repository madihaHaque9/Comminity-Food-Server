const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app=express();
const port=process.env.PORT || 5000;
// middleware
app.use(cors())
app.use(express.json())
console.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m69k4ra.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const foodCollection=client.db('communityFoodService').collection('foods');
    const requestCollection=client.db('communityFoodService').collection('requestFoods');
    app.get('/foods',async(req,res)=>{
      const cursor=foodCollection.find();
      const result= await cursor.toArray();
      res.send(result)
    })
   
    app.get('/foods/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const options={
          projection:{foodImage:1,foodName:1,foodQuantity:1,pickupLocation:1,expiredDate:1,donatorName:1}
        }
        const result=await foodCollection.findOne(query,options);
        res.send(result)
    })
      // requestFoods
      app.get('/request',async(req,res)=>{
        console.log(req.query.email);
        let query={}
        if(req.query?.email){
          query={email: req.query.email}
        }
        const result=await requestCollection.find(query).toArray();
        res.send(result)
      })
      app.post('/foods',async(req,res)=>{
        const newFood=req.body;
        console.log(newFood);
        const result=await foodCollection.insertOne(newFood)
        res.send(result)
      })
      app.post('/request',async(req,res)=>{
        const request=req.body;
        console.log(request);
        const result=await requestCollection.insertOne(request);
        res.send(result)

      });
      app.patch('/request/:id',async(req,res)=>{
        const updatedRequest=req.body;
        console.log(updatedRequest);


      })
      app.delete('/request/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await requestCollection.deleteOne(query);
        res.send(result)
      })


    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send("server is running")
})
app.listen(port,()=>{
    console.log(`This server is running on port:${port}`)
})