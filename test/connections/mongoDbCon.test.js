const { beforeEach, afterEach } = require('mocha');
const config=require('../../src/configs/config');
const chronos_test_db=config.chronos_test_db
const mongoose= require('mongoose');
mongoose.Promise= global.Promise;

before((done)=>{
    console.log('Running before each unit tests');
    try{
        // mongoose.connect(chronos_test_db,{
        mongoose.connect('mongodb://localhost:27017/usersTestDB',{
            useUnifiedTopology:true,
            useNewUrlParser: true
        })
        console.log("connected to the Test db");
        done();  
    }catch(err){
        console.log("Error connecting to the Test db");
        done();  
    }
});

beforeEach(done=>{
    console.log('Running before Each clause');
    mongoose.connection.collections.users.drop(()=>{
        done()
    })
})
afterEach(done=>{
    console.log('Running after Each clause');
    mongoose.connection.collections.users.drop(()=>{
        done()
    })
})

after((done)=>{
    console.log('Running after each unit tests');
    console.log("Disconnecting the database");
    mongoose.disconnect();
    done();
});