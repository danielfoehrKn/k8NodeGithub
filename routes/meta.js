var express = require('express');
var router = express.Router();
var Models = require('../Database/dbuser');

router.post('/unregisterChannel', function(req, res, next) {

Models.Channel.find({ 'githubRepo':     req.body.githubRepo, 'channel': req.body.channel},function(err, channels) {
  // data will equal the number of docs removed, not the document itself
  console.log(channels.length);

  async.each(channels, function(dataItem, callback) {
    dataItem.remove();
    });

  return res.send("Removed " + channels.length + " channel(s)")
});
  
});

router.post('/registerChannel', function(req, res, next) {

  var channel = new Models.Channel({
    channel: req.body.channel,
    githubRepo:  req.body.githubRepo
  });

  channel.save(function(err){
    if (err) throw err;

    console.log("channel saved successfully");
    return res.send(channel);
  })

});

router.get('/all', function(req, res, next) {

  Models.Channel.find({},function(err, channels){
    if (err) return res.send(err);
    return res.send("Found " + channels.length + " channels. " + channels.toString());
  })

});

router.get('/countMessages', function(req, res, next) {

  Models.Count.findOne({},function(err, count){
    if (err) return res.send(err);
    return res.send("Messages sent in total : " + count.countMessages);
  })

});

module.exports = router;
