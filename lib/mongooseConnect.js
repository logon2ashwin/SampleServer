var mongoose = function () {
    var fs = require("fs");
    var Mongoose = require('mongoose');
 
    var config = require("../lib/configuration").getconfig();
		
    var queryString = require('query-string');
    
    var connecturi, options={};
	
	
	if(config.database.replicaset){
		connecturi = 'mongodb://' + config.database.username + ":" + config.database.password + "@";
		
		var replicaSets = config.database.replicaSets; 
		
		for(var i=0;i<replicaSets.nodes.length;i++){
			if(i>0 && i<replicaSets.nodes.length){
				connecturi = connecturi + ","
			}
			connecturi = connecturi + replicaSets.nodes[i].host + ":" + replicaSets.nodes[i].port
		}
		
		connecturi = connecturi + "/" + config.database.db;
		connecturi = connecturi + "?" + queryString.stringify(replicaSets.options);
		
	}else{	
		connecturi = 'mongodb://'+ config.database.username + ":" + config.database.password + "@" + config.database.host + '/' + config.database.db;
	}

	console.log("Connecting...", connecturi)		
    Mongoose.connect(connecturi);


require("../models/account.js").registerModel(Mongoose); 
require("../models/activeteams.js").registerModel(Mongoose);
require("../models/attachments.js").registerModel(Mongoose);
require("../models/commentary.js").registerModel(Mongoose);
require("../models/emails.js").registerModel(Mongoose);
require("../models/gifs.js").registerModel(Mongoose);
require("../models/matchlists.js").registerModel(Mongoose);
require("../models/newsfeed.js").registerModel(Mongoose);
require("../models/oauth.js").registerModel(Mongoose);
require("../models/players.js").registerModel(Mongoose);
require("../models/pushnotifications.js").registerModel(Mongoose);
require("../models/scores.js").registerModel(Mongoose);
require("../models/scoresauto.js").registerModel(Mongoose);
require("../models/tournaments.js").registerModel(Mongoose);
require("../models/banners.js").registerModel(Mongoose);


    var db = Mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    /*db.once('open', function callback() {
        console.log("Connection with database succeeded - " + config.database.db);
    });*/

    return Mongoose;

};


module.exports = {
    initialize: mongoose
};
