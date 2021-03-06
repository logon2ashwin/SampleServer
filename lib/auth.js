module.exports = function(req, res, next) {
    var express = require("express");
	var moment = require('moment');
	var config = require("../lib/configuration").getconfig();			

    var oauth = require("../models/oauth").getModel();
    var account = require("../models/account").getModel();

    var htoken = req.headers["authorization"];
        
        route = req.url;
		
	if(route.indexOf('/api/') == -1 || route.indexOf('/api/'+config.service.apiversion+'/file') >-1){
		next(); 
        }else if(route.indexOf('/account/login')>-1|| route.indexOf('/account')>-1 
            || route.indexOf('/account/confirmEmail')>-1 || route.indexOf('/matchlists/getmatchdetails')>-1  
            || route.indexOf('/account/forgotPassword')>-1 || route.indexOf('/account/resetPassword')>-1
            ||route.indexOf('/banner')>-1||route.indexOf('/pushdata')>-1
            || route.indexOf('/matchlists/scorelist')>-1 || route.indexOf('/autogenerate/matches')>-1 || route.indexOf('/autogenerate/scores')>-1 || route.indexOf('/newsfeed/create')>-1 ||route.indexOf('/newsfeed/latest')>-1){
            req.query.userrole = "admin";
            next(); 
        } else {
            if(htoken){
                oauth.findOne({token: htoken}).exec().then(function (data) {
                    if(data){
						oauth.update({_id: data._id}, {session: new Date()}).exec();
							account.findOne({_id:data.user_id}).exec().then(function(user){
								if(user){
									req.query.userid = data.user_id;
									req.query.userrole = user.role;
									next();
									/*if(user.status=="block"){
										return res.send([{
											status:"Your account has been blocked"
										}]);
									}else if(user.status=='inactive'){
										return res.send([{
											status:"Please verify your account"
										}]);
									}else{
										console.log("Token pass");
										
									}*/
								}
							})
                    }else{
                        console.log("Invalid access token");
                        return res.send([{
                            status:"Invalid access token"
                        }]);
                    }
                })
            } else {
                console.log("Session invalid");
                return res.send([{
                    status:"Session invalid"
                }]);
            }
        }	
};
