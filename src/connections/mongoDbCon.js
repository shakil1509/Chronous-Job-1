const mongoose=require('mongoose');
const config=require('../configs/config');
const MongoDB_URI=config.MongoDB_URI;


if(process.env.NODE_ENV!='test'){
    try 
    {
         mongoose.connect(MongoDB_URI, {
        // mongoose.connect('mongodb://localhost:27017/chronosLocalDB',{

            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("Connected to the db");
    } catch (err) {
        console.log("Error connecting to the db:", err);
    }
}


