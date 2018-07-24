var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Github Bot', nodeName: process.env.MY_NODE_NAME, podName: process.env.MY_POD_NAME, podIp: process.env.MY_POD_IP, podNameSpace: process.env.MY_POD_NAMESPACE, podServiceAccount: process.env.MY_POD_SERVICE_ACCOUNT });
});

module.exports = router;
