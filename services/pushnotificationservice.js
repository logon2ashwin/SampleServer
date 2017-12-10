module.exports = {
	send:function(data,callback){
		var request = require('request');
		var FIREBASE_NOTIFICATION_URL = "https://fcm.googleapis.com/fcm/send";
		var AUTHORIZATION_KEY = "key=AAAA27BBYGI:APA91bFgaxvkq61FxnWArhOnPZHCUHnhZgBlInE4LC7RSS74MP7bl881fj6toBNpjmtTuRw973fy-txNhyl-rQJq8vEg3989Q0Q4hu8uRQ_MN8dcFSDbjgTJEDZuCZ-bcv12SDNpuu0a";

		var pushnotifications = require("../models/pushnotifications").getModel();

		data.notification_type = "all";


		var notificationdata = {};
			notificationdata.notification = {};
			notificationdata.notification.title = data.matchdetails.team_1.teamid.team_name+ " vs " + data.matchdetails.team_2.teamid.team_name;
			notificationdata.to = "/topics/M_"+data.match_id+"_"+data.notification_type;


		var options = {}	

			if(data.notification_msg_type == "match_status"){
				//console.log("INNINGS OVERS");
				options.match_id = data.match_id;
				options.innings = data.innings;
				options.notification_type = data.notification_msg_type;
				notificationdata.notification.body = data.notification_body;
			}
			else if(data.notification_msg_type == "wicket"){
				options.match_id = data.match_id;
				options.innings  = data.innings;
				options.wicket = data.wicket;
				options.notification_type = data.notification_msg_type;
				notificationdata.notification.body = data.notification_body;
			}
			
		//console.log("PUSH NOTIFICATION SERVICE");	
		//console.log(options);
		//console.log(notificationdata);

		pushnotifications.find(options).exec(function(err,results){
			if(!err){
				
				//console.log(results.length);

				if(results.length==0){
					//console.log("PUSH NOTIFICATION SEND SERVICE");	
					request({
						"method":"POST",
						 "headers": {
						 	"Content-Type":"application/json",
						 	"Authorization":AUTHORIZATION_KEY
						 },
			            "url":FIREBASE_NOTIFICATION_URL,
			            "json": true, 
			            "body":notificationdata
			        }, function (error, response, body) {
			        	//console.log(body);
			        	if(!error){
			        		//console.log("PUSH NOTIFICATION PUSHED");
			        		var newpushnotification = new pushnotifications({
			        			"match_id":data.match_id,
			        			"title":data.title,
			        			"body":data.body,
			        			"innings":data.innings,
			        			"over":data.over,
			        			"ball":data.balls,
			        			"match_result":data.match_result,
			        			"notification_type":data.notification_msg_type,
			        			"created_At":new Date(),
			        			"updated_At": new Date()
			        		});

			        		newpushnotification.save(function (err,data) {
			        			//console.log("PUSH NOTIFICATION SAVED");
						      if (!err) {
						        callback({"status":"success","msg":"notification sent"});
						      }else {
						        callback({"status":"error","msg":"error in save notification"});
						      }
						    });

			        	}
			        	else{
			        		callback({"status":"error","msg":"error in sending request"});
			        	}
			        });		
				}
				else{
					callback({"status":"success","msg":"notification already sent"});
				}
			}
			else{
				callback({"status":"error","msg":"error in find"});
			}
		})		
	},
	pushwicket:function(data,callback){
		var request = require('request');
		var FIREBASE_NOTIFICATION_URL = "https://fcm.googleapis.com/fcm/send";
		var AUTHORIZATION_KEY = "key=AAAA27BBYGI:APA91bFgaxvkq61FxnWArhOnPZHCUHnhZgBlInE4LC7RSS74MP7bl881fj6toBNpjmtTuRw973fy-txNhyl-rQJq8vEg3989Q0Q4hu8uRQ_MN8dcFSDbjgTJEDZuCZ-bcv12SDNpuu0a";
		var pushnotifications = require("../models/pushnotifications").getModel();
		var currentinningsteam = "none";
		var currentfallofwickets = [];
		var wickettopush = [];

		var notificationdata = {};
			notificationdata.notification = {};
			notificationdata.notification.title = data.matchdetails.match_details+" - "+data.matchdetails.team_1.teamid.team_name+ " vs " + data.matchdetails.team_2.teamid.team_name;
			notificationdata.to = "/topics/M_"+data.matchdetails._id+"_all";
			/*notificationdata.notification.body = "Match status: "+data.matchdetails.current_match_status +" "+ data.matchdetails.team_1.teamid.alias+" "
				+data.matchdetails.team_1.scores+"/"+data.matchdetails.team_1.wickets+ " " +data.matchdetails.team_2.teamid.alias+" "
				+data.matchdetails.team_2.scores+"/"+data.matchdetails.team_2.wickets
*/
		if(data.matchdetails.innings.current == "1"){
			 currentinningsteam = data.matchdetails.innings.first;
		}
		else if(data.matchdetails.innings.current == "2"){
			currentinningsteam = data.matchdetails.innings.second;
		}
		else if(data.matchdetails.innings.current == "3"){
			currentinningsteam = data.matchdetails.innings.third;
		}
		else if(data.matchdetails.innings.current == "4"){
			currentinningsteam = data.matchdetails.innings.fourth;
		}			

		if(currentinningsteam == 'team1'){
			currentfallofwickets = data.matchdetails.team_1.fall_of_wickets;
			currentteamdetails = data.matchdetails.team_1;
		}
		else if(currentinningsteam == 'team2'){
			currentfallofwickets = data.matchdetails.team_2.fall_of_wickets;
			currentteamdetails = data.matchdetails.team_2;
		}

		if(currentinningsteam!="none" && currentfallofwickets.length>0){
			var wickettopush = currentfallofwickets[currentfallofwickets.length-1];
			notificationdata.notification.body = " Wicket: "+wickettopush.player_name+", " + currentteamdetails.teamid.alias+" "+wickettopush.score+"/"
			+wickettopush.wicket_position+" Overs "+wickettopush.overs+"."+wickettopush.balls;

			pushnotifications.find({
				"match_id":data.matchdetails._id,
				"innings":data.matchdetails.innings.current,
				"wicket":wickettopush.wicket_position,
				"notification_type":"wickets"
			}).exec(function(err, pushedwickets){
				if(pushedwickets.length==0){
					sendrequest(function(){});
				}
			})
		}

		function sendrequest(callback){
			//console.log("SEND REQUEST RECEIVE");
			var newpushnotification = new pushnotifications({
				match_id:data.matchdetails._id,
				"notification_type":"wickets",
				"innings":data.matchdetails.innings.current,
				"wicket":wickettopush.wicket_position,
				"title":notificationdata.notification.title,
				"body":notificationdata.notification.body,
				"topic":notificationdata.to,
				"created_At":new Date()
			});
			//console.log(notificationdata);
			newpushnotification.save(function(err,data){
				//console.log("SAVE NOTIFICATIONS");
				//console.log(err);
				if(!err){
					request({
					"method":"POST",
					 "headers": {
					 	"Content-Type":"application/json",
					 	"Authorization":AUTHORIZATION_KEY
					 },
				        "url":FIREBASE_NOTIFICATION_URL,
				        "json": true, 
				        "body":notificationdata
				    }, function (error, response, body) {
				   		callback();
				    })	
				}
			})
		}

	},

	pushmatchresult:function(data,callback){
		var request = require('request');
		var FIREBASE_NOTIFICATION_URL = "https://fcm.googleapis.com/fcm/send";
		var AUTHORIZATION_KEY = "key=AAAA27BBYGI:APA91bFgaxvkq61FxnWArhOnPZHCUHnhZgBlInE4LC7RSS74MP7bl881fj6toBNpjmtTuRw973fy-txNhyl-rQJq8vEg3989Q0Q4hu8uRQ_MN8dcFSDbjgTJEDZuCZ-bcv12SDNpuu0a";
		var pushnotifications = require("../models/pushnotifications").getModel();

		var notificationdata = {};
			notificationdata.notification = {};
			notificationdata.notification.title = data.matchdetails.match_details+" - "+data.matchdetails.team_1.teamid.team_name+ " vs " + data.matchdetails.team_2.teamid.team_name;
			notificationdata.to = "/topics/M_"+data.matchdetails._id+"_all";
			notificationdata.notification.body = "Match status: "+data.matchdetails.current_match_status +" "+ data.matchdetails.team_1.teamid.alias+" "
				+data.matchdetails.team_1.scores+"/"+data.matchdetails.team_1.wickets+ " " +data.matchdetails.team_2.teamid.alias+" "
				+data.matchdetails.team_2.scores+"/"+data.matchdetails.team_2.wickets

			if(data.matchdetails.match_type == "test"){
				notificationdata.notification.body = "Match status: "+data.matchdetails.current_match_status+" " + data.matchdetails.team_1.teamid.alias+" "
				+data.matchdetails.team_1.scores+"/"+data.matchdetails.team_1.wickets+ " & "+data.matchdetails.team_1.second_innings_scores+"/" 
				+data.matchdetails.team_1.second_innings_wickets+" "+data.matchdetails.team_2.teamid.alias+" "+data.matchdetails.team_2.scores+"/"+
				data.matchdetails.team_2.wickets+ " & "+data.matchdetails.team_2.second_innings_scores+"/" +data.matchdetails.team_2.second_innings_wickets
			}
			


		//console.log("PUSH MATHCH RESULT");

		//console.log(notificationdata);


		var pushnotificationsarray = [];

		//pushnotificationsarray.push({})

		if(data.matchdetails.current_match_status && (data.matchdetails.team_1.scores!="0" || data.matchdetails.team_2.scores!="0")){
			pushnotifications.find({
				"match_id":data.matchdetails._id,
				"notification_type":"match_result"
			})
			.sort({"created_At": -1})
			.exec(function(err,allpushnotifications){
				if(!err){
					//console.log("ALL PUSH NOTIFICATIONS");
					//console.log(allpushnotifications);

					if(allpushnotifications.length==0){
						sendrequest(function(){
							callback();
						});
					}
					else if(allpushnotifications.length>0){
						var latestpushnotification = allpushnotifications[allpushnotifications.length - 1];
						if(latestpushnotification.match_result !=  data.matchdetails.current_match_status){
							sendrequest(function(){
								callback();
							});
						} 
					}
				}
			})
		}

		function sendrequest(callback){
			//console.log("SEND REQUEST RECEIVE");
			var newpushnotification = new pushnotifications({
				match_id:data.matchdetails._id,
				"notification_type":"match_result",
				"match_result":data.matchdetails.current_match_status,
				"title":notificationdata.notification.title,
				"body":notificationdata.notification.body,
				"topic":notificationdata.to,
				"created_At":new Date()
			});
			//console.log(notificationdata);
			newpushnotification.save(function(err,data){
				//console.log("SAVE NOTIFICATIONS");
				//console.log(err);
				if(!err){
					request({
					"method":"POST",
					 "headers": {
					 	"Content-Type":"application/json",
					 	"Authorization":AUTHORIZATION_KEY
					 },
				        "url":FIREBASE_NOTIFICATION_URL,
				        "json": true, 
				        "body":notificationdata
				    }, function (error, response, body) {
				   		callback();
				    })	
				}
			})
		}
		
	},
	pushsession:function(data,callback){
		var request = require('request');
		var FIREBASE_NOTIFICATION_URL = "https://fcm.googleapis.com/fcm/send";
		var AUTHORIZATION_KEY = "key=AAAA27BBYGI:APA91bFgaxvkq61FxnWArhOnPZHCUHnhZgBlInE4LC7RSS74MP7bl881fj6toBNpjmtTuRw973fy-txNhyl-rQJq8vEg3989Q0Q4hu8uRQ_MN8dcFSDbjgTJEDZuCZ-bcv12SDNpuu0a";
		var notificationdata = {};
			notificationdata.notification = {};
			notificationdata.notification.title = data.matchdetails.match_details+" - "+data.matchdetails.team_1.teamid.team_name+ " vs " + data.matchdetails.team_2.teamid.team_name;
			notificationdata.to = "/topics/M_"+data.matchdetails._id+"_all";
			notificationdata.notification.body = "Favourite Team: "+data.matchdetails.fav_team+ "  Market Rate: "+data.matchdetails.market_rate 
			+ " - " +data.matchdetails.market_rate1+ " Session Rate: (Over "+data.matchdetails.session_overs+" / Rate "+data.matchdetails.session_rate
			+" - "+data.matchdetails.session_rate1+")";

		//console.log("PUSH SESSION");

		//console.log(notificationdata);

		request({
			"method":"POST",
			 "headers": {
			 	"Content-Type":"application/json",
			 	"Authorization":AUTHORIZATION_KEY
			 },
            "url":FIREBASE_NOTIFICATION_URL,
            "json": true, 
            "body":notificationdata
        }, function (error, response, body) {
       		callback();
        })
	}
}