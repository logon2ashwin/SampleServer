var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require("fs");
var http = require('http');

var config = require("./lib/configuration").getconfig();			
var Mongoose = require('./lib/mongooseConnect').initialize();



var app = express();
var server = http.createServer(app);

var Socket = require('./lib/socket').init(server);

app.set('socketio', Socket);

var timeout = require('connect-timeout'); //express v4
app.use(timeout(120000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('./lib/cors'));

app.use(require('./lib/auth'));





app.use(function(req, res, next){
    res.setTimeout(480000, function(){ // 4 minute timeout adjust for larger uploads
        console.log('Request has timed out.');
            res.send(408);
        });

    next();
});

// Start the server
/*
var routePath = "./routes/"; //add one folder then put your route files there my router folder name is routers
  fs.readdirSync(routePath).forEach(function (file) {
      if (file != ".DS_Store") {
          var route = "/api/"+config.service.apiversion + "/" + file.split(".")[0];
          var routeDef = require("./routes/" + file)(express, Mongoose);
          app.use(route, routeDef);
          console.log("Route Enabled: " + route);
      }
  });

veteams.js")(express, Mongoose));
app.use(route, require("./routes/api.js")(express, Mongoose));
app.use(route, require("./routes/autogenerate.js")(express, Mongoose));
app.use(route, require("./routes/commentary.js")(express, Mongoose));
app.use(route, require("./routes/email.js")(express, Mongoose));
app.use(route, require("./routes/file.js")(express, Mongoose));
app.use(route, require("./routes/gifs.js")(express, Mongoose));
app.use(route, require("./routes/matchlists.js")(express, Mongoose));
app.use(route, require("./routes/newsfeed.js")(express, Mongoose));
app.use(route, require("./routes/players.js")(express, Mongoose));
app.use(route, require("./routes/pushdata.js")(express, Mongoose));
app.use(route, require("./routes/scores.js")(express, Mongoose));
app.use(route, require("./routes/tournaments.js")(express, Mongoose));
*/

app.use("/api/"+config.service.apiversion + "/account", require("./routes/account.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/activeteams", require("./routes/activeteams.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/api", require("./routes/api.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/autogenerate", require("./routes/autogenerate.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/commentary", require("./routes/commentary.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/email", require("./routes/email.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/file", require("./routes/file.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/gifs", require("./routes/gifs.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/matchlists", require("./routes/matchlists.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/newsfeed", require("./routes/newsfeed.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/players", require("./routes/players.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/pushdata", require("./routes/pushdata.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/scores", require("./routes/scores.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/tournaments", require("./routes/tournaments.js")(express, Mongoose));
app.use("/api/"+config.service.apiversion + "/banner", require("./routes/banner.js")(express, Mongoose));

// static webserver
//app.use('/',express.static(__dirname + '/client/app'));
//app.use('/demo', express.static('demo'));
/*
app.all("/*", function(req, res, next) {
    res.sendFile("index.html", { root: __dirname + "/client/app" });
});


// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  console.log("route not found")
  next();
});
*/

app.get('/', function (req, res) {
  res.send('Hello World!')
});


// Starting cronjob schedulers
// cronjob.init(Socket);


//console.log(config)
app.set('port', config.service.port || 8080);

server.listen(app.get('port'),'0.0.0.0', function () {
  console.log('Server listening at port %d',app.get('port'));
});


/*var server = app.listen(app.get('port'),'0.0.0.0', function() {
  console.log('Express server listening on port ' + server.address().port);
});*/
