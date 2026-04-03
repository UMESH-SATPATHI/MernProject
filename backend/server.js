require("dotenv").config();
const mongoose = require("mongoose");
const express  = require('express');
const cors = require("cors");

mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("mongoose connected!"))
    .catch(err=>console.log(err))

// console.log(process.env.MONGO_URI)

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("server running successfully!");
});

app.listen(5000, ()=>{
    console.log("server running on port 5000");
})