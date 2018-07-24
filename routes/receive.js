var express = require('express');
var router = express.Router();
var request = require('request');
var Models = require('../Database/dbuser');
const fetch = require("node-fetch");

const port = process.env.BACKEND_SERVICE_PORT;
const javaBackendService = 'http://backend-service:' + port + "/";
const javaBackendApiPath = 'echo/api/db/repositories/';

const frontendPort = process.env.FRONTEND_SERVICE_PORT;
const frontendService = 'http://frontend-service:' + frontendPort + "/";
const frontendApiPath = 'api/issues';


router.post('/', function (req, res, next) {

    //Middleware only forwards issue event types!
    var repoName = req.body.repository.full_name.replace("/", "");
    console.log("Checking if repo is registered" + repoName);

    fetch(javaBackendService + javaBackendApiPath + repoName)
        .then(res => res.json())
        .then(json => {

            console.log("Received response from java backend" + JSON.stringify(json));
            console.log("Label: " + JSON.stringify(req.body.label));

            var id = json.id;

            var label = "";
            if (req.body.label != null && req.body.label != 'undefined') {
                label = req.body.label.name;
            }

            let action = req.body.action;

            console.log("Action: " + action + " Repo: " + id + " label: " + label);

            //Insert into db to be analyzed by goHelper
            var channel = new Models.Channel({
                action: action,
                githubRepo: id,
                label: label
            });

            channel.save(function (err) {
                if (err) throw err;
                console.log("Issue data saved successfully");
            });

            // Execute post request to nodeReact frontend
            fetch(frontendService + frontendApiPath, {
                method: 'POST',
                body: JSON.stringify({
                    "id": "".concat(id).concat(""),
                    "action": "".concat(action).concat(""),
                    "label": "".concat(label).concat("")
                }),
                headers: {'Content-Type': 'application/json'},
            })
                .then(response => {
                    console.log("Received response from posting to frontend" + response);
                    res.status(200).send(response);
                }).catch((response) => {
                console.log("Error response from posting to frontend: " + response)
                res.status(500).send({error: response})
            });
            // res.status(200).send(json);
        }).catch((error) => {
        console.log("Error from java backend: " + error);
        res.status(500).send(error);
    });
});

module.exports = router;