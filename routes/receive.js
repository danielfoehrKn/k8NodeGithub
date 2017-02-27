var express = require('express');
var router = express.Router();
var fs = require("fs");
var HttpsProxyAgent = require('https-proxy-agent');
var request = require('request');
var Models = require('../Database/dbuser');
async = require("async");
var config = require('../config/production.json');

var star = "*";

router.post('/', function(req, res, next) {

    jsonData = req.body;

    Models.Channel.find({ 'githubRepo':     jsonData.repository.full_name}, function (err, channels) {
        if (err) return res.send(err);
        if (channels == null || channels[0] == null) {var reply = "Repo with name: ".concat(jsonData.repository.full_name).concat("could not be found");
            return res.send(reply);
        };

        switch (jsonData.eventType) {

            case 'push':

                var message = "[ " + jsonData.sender.login.concat(" pushed ").concat(jsonData.commits.length).concat(" commit(s)").concat("  to repository ").concat(star).concat(jsonData.repository.full_name).concat(star);


                for (var i = 0; i < jsonData.commits.length; i++) {
                    message = message.concat("| Commit Number : ").concat(i + 1).concat(" by ").concat(jsonData.commits[i].committer.name).concat(" | URL :" + jsonData.commits[i].url).concat(". | Commit Message: ").concat(star).concat(jsonData.commits[i].message).concat(star).concat(" | Files modified : ");
                    if (jsonData.commits[i].modified.length != 0) {
                        for (var x = 0; x < jsonData.commits[i].modified.length; x++) {
                            message = message.concat(star).concat(jsonData.commits[i].modified[x]).concat(star).concat(" ");
                        }
                    }

                    if (jsonData.commits[i].added.length != 0){
                        message = message.concat( " | Files added : ")
                        for (var y = 0; y < jsonData.commits[i].added.length; y++) {
                            message = message.concat(star).concat(jsonData.commits[i].added[y]).concat(star).concat(" ");
                        }
                    }

                    if (jsonData.commits[i].removed.length != 0) {
                        message = message.concat(" | Files removed : ")
                        for (var z = 0; z < jsonData.commits[i].removed.length; z++) {
                            message = message.concat(star).concat(jsonData.commits[i].removed[z]).concat(star).concat(" ");
                        }
                    }
                }
                message = message + " ]";

                break;
            case 'pull':
                var message = "[ Pull Request ";

                if (jsonData.action == "closed" && jsonData.pull_request.merged == true){
                    message = message.concat(star).concat("merged and closed").concat(star);
                } else {
                    message = message.concat(star).concat(jsonData.action).concat(star);
                };
                 message = message.concat(" | Repository: " + jsonData.repository.full_name).concat(" | User: " + jsonData.sender.login).concat(" | Titel : " + jsonData.pull_request.title).concat(" | URL: ").concat(jsonData.pull_request.html_url).concat(" ]");

                break;
            case 'project_card':
                var message = "[ Project Card ".concat(star).concat(jsonData.action).concat(star).concat(" by user: " + jsonData.sender.login).concat(" | Repository: " + jsonData.repository.full_name).concat(" | URL: " + jsonData.repository.html_url).concat(" ]");

                break;

            case 'issue':
                var message = "[ Issue ".concat(star).concat(jsonData.action).concat(star).concat(" | Titel : " + jsonData.issue.title).concat(" | Repository: " + jsonData.repository.full_name).concat(" | User: " + jsonData.sender.login).concat(" | URL: ").concat(jsonData.issue.html_url).concat(" ]");

                break;

            case 'issueComment':
                var message = "[".concat(jsonData.sender.login).concat(" " +jsonData.action).concat(" a comment on the issue with the title : ").concat(star).concat(jsonData.issue.title).concat(star).concat(" | Comment: ").concat(star).concat(jsonData.comment.body).concat(star).concat(" | URL: ").concat(jsonData.comment.html_url).concat(" ]");

                break;

            case 'createDeleteBranch':
                var message = "[ ".concat(jsonData.sender.login).concat(" " +req.headers['x-github-event']).concat("d ").concat(jsonData.ref_type + " ").concat(star).concat(jsonData.ref).concat(star).concat(" in repository: " + jsonData.repository.full_name).concat(" | URL: ").concat(jsonData.repository.html_url).concat(" ]");

                break;

            case 'commitComment':
                var message = "[ ".concat(jsonData.sender.login).concat(" " +jsonData.action).concat(" ").concat(" a comment on a commit ").concat(" in repository: " + jsonData.repository.full_name).concat(" | URL: ").concat(jsonData.comment.html_url).concat(" ]");

                break;

            case 'pullRequestReview':
                var message = "[ ".concat(jsonData.sender.login).concat(" " +jsonData.action).concat(" ").concat(" a pull request review with status ").concat(star).concat(jsonData.review.state).concat(star).concat(" on pull request with title ").concat(star).concat(jsonData.pull_request.title).concat(star).concat(" in repository: " + jsonData.repository.full_name).concat(" | Review Comment : ").concat(jsonData.review.body).concat(" | Review URL: ").concat(jsonData.review.html_url).concat(" ]");

                break;

            case 'pullRequestReviewComment':
                var message = "[ ".concat(jsonData.sender.login).concat(" " +jsonData.action).concat(" ").concat(" a comment on a pull request with the title ").concat(star).concat(jsonData.pull_request.title).concat(star).concat(" in repository: " + jsonData.repository.full_name).concat(" | Comment : ").concat(jsonData.comment.body).concat(" |  URL: ").concat(jsonData.comment.html_url).concat(" ]");

                break;

            default:
                return res.send("Unsupported event type");
        }


        console.log("Found " + channels.length + " corresponding channels")

        var asyncTasks = [];

        //ip address instead of proxy.wdf.sap.corp:8080
        var proxy = 'http://147.204.6.136:8080';
        var agent = new HttpsProxyAgent(proxy);

        console.log('{"type":"TEXT", "content":"' + message +'"}');
        channels.forEach(function(channel){

            asyncTasks.push(function(callback){
                console.log(config.production.oAuth.token);
                request.post({
                    headers: {'content-type' : 'application/json',
                        'Authorization' : config.production.oAuth.token},
                    url:     channel.channel,
                    body:    '{"type":"TEXT", "content":"' + message.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\"/g, " ") +'"}',
                    agent: agent,
                    followRedirect: true,
                    maxRedirects: 10,
                }, function(error, response, body){
                    if (error) {
                        console.log(error);
                        return callback(error, null);
                    }

                    console.log(body);
                    callback(null, body);
                });

            });
        });

        async.parallel(asyncTasks, function(err, results){
            if (err) return res.send(err);

            var response = "Executed post request to  " + channels.length + " channel(s). : ";

            Models.Count.findOne({}, function (err, doc){
                console.log(doc);
                if (doc === null)  {
                    var count = new Models.Count({
                        countMessages: 1
                    });

                    count.save(function(err){
                        console.log("Count set to 1");
                    })
                }else {
                    doc.countMessages = doc.countMessages + channels.length;
                    doc.save();
                }

            });

            results.forEach( function (result) {
                response = response.concat(" || " + result)
            });


            res.send(response + " | Message sent: " + message);
        });
    })
});

module.exports = router;