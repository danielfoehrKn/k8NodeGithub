//Db set up
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/relayBot');
db = mongoose.connection;

db.on('error', function handleError(err){
    console.log("Error")
});

db.once('open', function logConnectionSuccess() {
    console.log("Connected to db")
});

//Define Schema
var userSchema = mongoose.Schema({
    channel: String,
    githubRepo: String
});

var countSchema = mongoose.Schema({
    countMessages: Number
});

//create Model
var Channel = mongoose.model('Channel', userSchema);
var Count = mongoose.model('Count', countSchema);

module.exports = {
    Channel : Channel,
    Count: Count
}