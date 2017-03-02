var Models = require('../Database/dbuser');
async = require("async");
var config = require('../config/production.json');
var WebSocket = require('ws');

var request = require('request');
var HttpsProxyAgent = require('https-proxy-agent');
var Models = require('../Database/dbuser');
var url = require('url');
var validUrl = require('valid-url');


function openWebsocketConnection() {
    var HttpsProxyAgent = require('https-proxy-agent');

    var opts = {
        host: "147.204.6.136",
        port: 8080,
        secureEndpoint: true
    };

    var agent = new HttpsProxyAgent(opts);

    var ws = new WebSocket('wss://relay.hana.ondemand.com/websocket',
        {agent: agent,
         headers : {
             Authorization: config.production.oAuth.token
         }
        }
    );

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    ws.on('message', function(data) {
        var message = JSON.parse(data);

        // console.log("Triggered Action : " + message.action);

        switch (message.action) {

            case 'ONLINE_STATUS_CHANGED':
                console.log("Websocket connected");

                break;

            case 'MESSAGE_CREATED':
                if(message.content.type === "TEXT"  && (message.content.attributes.MENTIONS === config.production.oAuth.RelayUserID || message.content.attributes.MENTIONS === config.production.oAuth.oAuthClientID)){console.log("true")}else {console.log("false")}
                console.log("Mentions: " + message.content.attributes.MENTIONS);

                console.log('Message TYPE : ' + message.type + " | EVENT Type " + message.content.attributes.EVENT_TYPE + " | User ID : " + message.content.attributes.USER_ID);
                if (message.content.type == "EVENT" && message.content.attributes.EVENT_TYPE == "ADD" && message.content.attributes.USER_ID == config.production.oAuth.RelayUserID){
                    console.log("Github Bot added to Channel");
                    //send welcome message

                    sendMessage(message.content.channel.id,"Hi! I'm the GitHub Bot running on Relay. I can let you know if there are changes to your SAP Github Repository e.g if someone pushes a new commit or creates a new issue. When you talk to me, please always mention my name by writing @github.bot. In case you are stuck, you can always write * @github.bot help * to get the available commands.","Let's get started and setup your repository. Please write * @github.bot register repositoryUrl *, where repositoryUrl is the address of your GitHub repository, for example https://github.wdf.sap.corp/relay/relay-server");
                }

                if (message.content.type == "EVENT" && message.content.attributes.EVENT_TYPE == "KICK" && message.content.attributes.USER_ID == config.production.oAuth.RelayUserID){
                    console.log("Github Bot kicked from Channel");
                    //delete all chanells

                }

                else if (message.content.type === "TEXT"  && (message.content.attributes.MENTIONS === config.production.oAuth.RelayUserID || message.content.attributes.MENTIONS === config.production.oAuth.oAuthClientID)) {

                    console.log("Relaybot got mentioned ");

                    //read register command
                    var content = message.content.content.toString();
                    var registerPosition = content.search(/register/i);
                    var unregisterPosition = content.search(/unregister/i);
                    var helpPosition = content.search(/help/i);
                    if (registerPosition != -1 || unregisterPosition != -1) {
                        console.log("Https Position: " + content.search(/https/i));
                        var url = content.substring(content.search(/https/i));

                        if (validUrl.isHttpsUri(url)) {

                            var positionRepo = url.indexOfEnd("https://github.wdf.sap.corp/");
                            console.log("Position ends:" + positionRepo);
                            if (positionRepo != -1) {
                                console.log("correct form: " + url.substring(positionRepo));
                                if (unregisterPosition == -1) {
                                    registerChannel(message.content.channel.id, url.substring(positionRepo).replace(/\s/g, "").replace(/\n/g, "").replace(/\r/g, ""));
                                }

                                else {
                                    unregisterChannel(message.content.channel.id, url.substring(positionRepo).replace(/\s/g, "").replace(/\n/g, "").replace(/\r/g, ""));
                                }
                            }
                            else {
                                console.log("Incorrect form -> not a SAP Github URL");
                                sendMessage(message.content.channel.id, "Hi, I am sorry but it seems like you did not tell me a SAP Github URL. For security reasons I do not support public available repositories. Please type: register https://yourSAPGithubRepoURl");

                            }
                        }
                        else {
                            console.log("Incorrect form: Not a https URL: " + url);
                            sendMessage(message.content.channel.id, "Hi, I am sorry but you told me an invalid URL to your SAP Github Repository. Please type:  * @github.bot register repositoryUrl *");

                        }
                    }

                    else if (helpPosition != -1) {
                        console.log("help triggered");
                        sendMessage(message.content.channel.id, "All available commands: 2. Register Github repository to this chat :  * @github.bot register repositoryUrl *  || Unregister:  * @github.bot unregister repositoryUrl *");
                    }

                    else {
                        sendMessage(message.content.channel.id, "Hi " + message.content.user.firstname + ". I feel honored that you mentioned me but I do not understand your message. If you want to see all available commands please type in * @github.bot help *. If you just need somebody to talk to please keep in mind that I am only a bot and not the best conversationalist :)" );
                    }
                }

        }

        console.log('Received: ' + data);
    });

    ws.on('close', function(code) {
        console.log('Disconnected: ' + code);

        setTimeout(function(){
            openWebsocketConnection() }, 3000);
    });

    ws.on('error', function(error) {
        console.log('Websocket disconnected -> Error: ' + error.toString());
        setTimeout(function(){
            openWebsocketConnection()
        }, 3000);

    });
}


function sendMessage(channelID,message,sendFollowUpMessage) {
    //var proxy = 'http://147.204.6.136:8083';
    var proxy = 'http://147.204.6.136:8080';
    var agent = new HttpsProxyAgent(proxy);

    request.post({
        headers: {'content-type' : 'application/json',
            'Authorization' : config.production.oAuth.token},
        url:     'https://relay.hana.ondemand.com/api/v2/channels/'.concat(channelID).concat('/messages'),
        body:    '{"type":"TEXT", "content":"' + message.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\"/g, " ") +'"}',
        agent: agent,
        followRedirect: true,
        maxRedirects: 10,
    }, function(error, response, body){
        if (error) {
            return console.log(error);

        }
        if(typeof(sendFollowUpMessage)!=='undefined'){
            setTimeout(function(){
                sendMessage(channelID,sendFollowUpMessage); }, 3000);
        }

        console.log(body);
    });
}

function registerChannel(channelID, GithubRepo) {

    var channel = new Models.Channel({
        channel: 'https://relay.hana.ondemand.com/api/v2/channels/'.concat(channelID).concat('/messages'),
        githubRepo: GithubRepo
    });

    channel.save(function (err) {
        if (err) {
            return sendMessage(channelID,"Something went wrong :( . If this error keeps on appearing, please contact Daniel Föhr (D060239)");

        };

        console.log("channel saved successfully");
        sendMessage(channelID,"Awesome! I registered your Github Repository: " + GithubRepo + " | There is only one step missing: Please add this bot as a webhook in Github. I show you how: Go to settings in your repository -> Hooks and Services -> Add Webhook. Now set the Payload URL to: http://10.97.95.217:3000/receive  - Content type to: application/json.  You can also configure which Github events should be sent to you. By the way: Just remove me from this channel if you no longer like to receive messages. Thats it! Enjoy :)" );
    })
 }

function unregisterChannel(channelID, GithubRepo) {
    Models.Channel.find({ 'githubRepo':     GithubRepo, 'channel': 'https://relay.hana.ondemand.com/api/v2/channels/'.concat(channelID).concat('/messages')},function(err, channels) {
        console.log(channels.length);

        async.each(channels, function(dataItem, callback) {
            dataItem.remove();
        });

        if (channels.length != 0){
            sendMessage(channelID, "Alright. I unregistered this channel from the Repository: " + GithubRepo);
        }

        else {
            sendMessage(channelID,"I could not find your Github repository. Did you already register it?");
        }
    });

}

String.prototype.indexOfEnd = function(string) {
    var io = this.indexOf(string);
    return io == -1 ? -1 : io + string.length;
}



module.exports.openWebsocketConnection = openWebsocketConnection;