var express = require('express');
var router = express.Router();
var jsonToken = require('jwt-simple');
var mongojs = require("mongojs"),
  config = require('config.json'),
  db = mongojs(config.connectionString);
var crypto = require('crypto');
var moment = require("moment")
require("moment-duration-format");
var ObjectID = mongojs.ObjectID;

var algorithm = 'aes-256-ctr',
password = 'd6F3Efeq';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
}); 

var encrypt = function(text) {
var cipher = crypto.createCipher(algorithm, password);
var crypted = cipher.update(text, 'utf8', 'hex')
crypted += cipher.final('hex');
return crypted;
}
//console.log(encrypt("test"));

var decrypt = function(text) {
var decipher = crypto.createDecipher(algorithm, password)
var dec = decipher.update(text, 'hex', 'utf8')
dec += decipher.final('utf8');
return dec;
}
//console.log(decrypt("108bc784"))
var authenticate = require('../middlewares/validateRequest'); 

router.post('/authLog', function (req, res, next) {
  console.log(req.body);
  console.log(encrypt(req.body.password));
  db.collection('users').find({ username: req.body.username, password: encrypt(req.body.password) }, function (error, data) {
    if (error) {
      res.json({ status: "false", msg: error });
      return;
    }
    if (data.length === 0) {
      res.json({ status: "false", data: "Please enter valid ID and password" });
      return;
    }
  
    res.json(genToken(data));
  });
});

function genToken(data) {
  var expires = expiresIn(5000000);
  //var expires = Date.now()+120000; // 7 days
  var token = jsonToken.encode({ exp: expires },
    require('../config/secret')());
  return {
    status: "true",
    path: '/home',
    data: data,
    token: token,
    expires: expires
  };
}

function expiresIn(numDays) {
  var dateObj = Date.now() + numDays;
  return dateObj;
}


module.exports = router;
