module.exports = {
	fetch:function(Mongoose,data,callback){
		
		var request = require('request');
		var moment = require('moment');

		var Newsfeed = require("../models/newsfeed").getModel(Mongoose);

		var NEWSFEEDS_URL = "http://www.espncricinfo.com/rss/content/story/feeds/0.xml";
    	var parseString = require('xml2js').parseString;

    	request({
            "url":NEWSFEEDS_URL,
            "jar":true
        }, function (error, response, body) {
			if(!error){
				parseString(body, function (err, result) {
					if(!err){
						Newsfeed.remove({}).exec(function(err, data) {
			                if(!err){
			                    removeandstorenewsfeed(result.rss.channel[0].item);
			                    callback({"status":"success","result":result});
			                }
			                else{
			                    callback({"status":"error","result":{}});
			                }
			            })
					}
					else{
						callback({"status":"error","result":{}});
					}
				})
			}
			else{
				callback({"status":"error","result":{}});
			}
		});

		function removeandstorenewsfeed(newsfeeditems){
			if(newsfeeditems.length>0){
				var currentnewsfeed = newsfeeditems.pop();
				request({
		            "url":currentnewsfeed.link[0],
		            "jar":true
		        }, function (error, response, newsfeedbody) {
					
					const cheerio = require('cheerio');
		        	var $ = cheerio.load(newsfeedbody);

		        	try{
			        	var newfeednewdata = {
							"title":currentnewsfeed.title[0],
							"description":currentnewsfeed.description[0],
							"content":currentnewsfeed.description[0],
							"link":currentnewsfeed.link[0],
							"guid":currentnewsfeed.guid[0],
							"pubdate":currentnewsfeed.pubDate[0],
							"created_At":moment(currentnewsfeed.pubDate[0]),
							"updated_At":new Date()
						};

			        	if(!error){
			        		var content;
			        		var headerimage;

			        		$('.article').each(function(i){
			        			if(i==0){
			        				content = $(this).find('.article-body>p').text();
			        				headerimage = $(this).find('picture>source').attr('srcset');
			        			}
			        		})

			        		if(content){
			        			newfeednewdata.content = content;
			        			newfeednewdata.headerimage = headerimage;
			        		}
			        		else{
			        			var alt_content = $('.story-content-main>p').text();
	        					if(alt_content){
	        						newfeednewdata.content = alt_content;
	        						newfeednewdata.headerimage = $('.story-content-main').find('.first-image>img').attr('src');
	        					}
	        					//console.log(newfeednewdata);
	        					//console.log("=================NEWSFEED CONTENT EMPTY =====================");	
			        		}
			        		
			        	}
			        	
			        	var newsfeednew = new Newsfeed(newfeednewdata);

					    newsfeednew.save(function (err,data) {
					      if (!err) {
					        removeandstorenewsfeed(newsfeeditems);
					      } else {
					        removeandstorenewsfeed(newsfeeditems);
					      }
					    });
				    }
		        	catch(e){
		        		
		        	}
		        })
				
			}
			else{
				//console.log("fetch newsfeed completed");
			}
		}		
	}
}