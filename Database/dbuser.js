//Db set up
var mongoose = require('mongoose');
// creates the db if not yet existing
mongoose.connect('mongodb://mongo-set-0.mongo-service,mongo-set-1.mongo-service,mongo-set-2.mongo-service:27017/github');
// mongoose.connect('mongodb://localhost:27017/relayBot');
db = mongoose.connection;

db.on('error', function handleError(err){
    console.log("Error connecting to db")
});

db.once('open', function logConnectionSuccess() {
    console.log("Connected to db")
});

//Define Schema
var userSchema = mongoose.Schema({
    action: String,
    githubRepo: String,
    label: String
});

//create Model
var Channel = mongoose.model('Channel', userSchema);

module.exports = {
    Channel : Channel
}