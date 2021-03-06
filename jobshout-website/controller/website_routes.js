	/**********************************************************************
	*  Author: Neha Kapoor (neha@jobshout.org)
	*  Project Lead: Balinder WALIA (bwalia@jobshout.org)
	*  Project Lead Web...: https://twitter.com/balinderwalia
	*  Name..: Jobshout Server NodeJS
	*  Desc..: Jobshout Server (part of Jobshout Suite of Apps)
	*  Web: http://jobshout.org
	*  License: http://jobshout.org/LICENSE.txt
	**/

	/**********************************************************************
	*  website_routes.js handles the http requests
	**/
	
var initFunctions = require('../config/functions');	

module.exports = function(init, app, db){
	var mongodb=init.mongodb;
	
	//index page
	app.get('/', checkForCookie, function(req, res) {
		initFunctions.returnNavigation(db, function(resultNav) {
			res.render('index', {
      	 		navigation : resultNav,
      	 		displayCookieBool : req.ucsCookie 
       		});
    	});
	});
	
	app.get('/index', checkForCookie, function(req, res) {
		initFunctions.returnNavigation(db, function(resultNav) {
			res.render('index', {
      	 		navigation : resultNav,
      	 		displayCookieBool : req.ucsCookie 
       		});
    	});
	});
	
	
	//case studies
	app.get('/case-studies', checkForCookie, function(req, res) {
		initFunctions.returnNavigation(db, function(resultNav) {
      		res.render('case-studies', {
      	 		navigation : resultNav ,
      	 		displayCookieBool : req.ucsCookie 
       		});
   	 	});
	});
	
	//signup
	app.get('/signup', checkForCookie, function(req, res) {
		initFunctions.returnNavigation(db, function(resultNav) {
      		res.render('signup', {
      	 		navigation : resultNav,
      	 		displayCookieBool : req.ucsCookie  
       		});
   	 	});
	});
	
	//tour slider
	app.get('/tour-slider', function(req, res) {
		res.render('tour-slider');
	}); 

	//our clients
	app.get('/our-clients', checkForCookie, function(req, res) {
		initFunctions.returnNavigation(db, function(resultNav) {
      		db.collection('documents').findOne({"Code" : "our-clients"}, function(err, document) {
      			if (err) {
      				res.redirect('/not_found');
      			}else if(document){
      				res.render('our-clients', {
      					resultData : document,
      	 				navigation : resultNav,
      	 				displayCookieBool : req.ucsCookie  
       				});
       			}else{
       				res.redirect('/not_found');
       			}
			});
		});
	});

	//search page
	app.get('/search', checkForCookie, function(req, res) {
		initFunctions.returnNavigation(db, function(result) {
     	 	res.render('search', {
      			queryString : req.query.s,
      	 		navigation : result,
      	 		displayCookieBool : req.ucsCookie 
       		});
    	});
	});

//unsubscribe
app.get('/unsubscribe', function(req, res) {
	var email_to='', contact_uuid= '', uuid='', unsubscribed=1, status="unsubscribe";
	if(req.query.email_to){
		email_to=req.query.email_to;
	}
	if(req.query.contact_uuid){
		contact_uuid=req.query.contact_uuid;
	}
	if(req.query.uuid){
		uuid=req.query.uuid;
	}
	if(req.query.s){
		unsubscribed=req.query.s;
	}
	if(unsubscribed==0){
		status="subscribe";
	}
	if(email_to!="" && uuid!=""){
		var queryStr='email_to='+email_to+'&contact_uuid='+contact_uuid+'&uuid='+uuid+'&s=0';
		db.collection('mailing_preferences').findOne({"email_address" : email_to, "uuid" : uuid}, function(err, foundRecord) {
			if (typeof foundRecord !== 'undefined' && foundRecord !== null && foundRecord.uuid!="") {
    	  		var updateContent=new Object();
    	  		updateContent["modified"]=initFunctions.nowTimestamp();
    	  		updateContent["uuid"]=foundRecord.uuid;
    	  		updateContent["contact_uuid"]=foundRecord.contact_uuid;
    	  		updateContent["email_address"]=email_to;
    	  		updateContent["unsubscribed"]=unsubscribed;
    	  		updateContent["status"]=status;
    	  		db.collection('mailing_preferences').update({"email_address" : email_to, "uuid" : uuid}, updateContent, (updateErr, result) => {
    	  			var tokenFlag=false;
    	  			if(result){
    	  				tokenFlag=true;
    	  			}
    	  			initFunctions.returnNavigation(db, function(resultNav) {
      					res.render('unsubscribe', {
      	 					navigation : resultNav,
      	 					tokenBool : tokenFlag,
      	 					emailAddress : email_to,
      	 					queryString : queryStr,
      	 					unsubscribed : unsubscribed
       					});
    				});
    	  		});
    	  	}else{
    	  		var addContent=new Object();
    	  		addContent["modified"]=initFunctions.nowTimestamp();
    	  		addContent["uuid"]=uuid;
    	  		addContent["contact_uuid"]=contact_uuid;
    	  		addContent["unsubscribed"]=unsubscribed;
    	  		addContent["email_address"]=email_to;
    	  		addContent["status"]=status;
    	  		db.collection("mailing_preferences").save(addContent, (insertErr, result) => {
    	  			var tokenFlag=false;
    	  			if(result){
    	  				tokenFlag=true;
    	  			}
    	  			initFunctions.returnNavigation(db, function(resultNav) {
      					res.render('unsubscribe', {
      	 					navigation : resultNav,
      	 					tokenBool : tokenFlag,
      	 					emailAddress : email_to,
      	 					queryString : queryStr,
      	 					unsubscribed : unsubscribed
       					});
    				});
    			});
    	  	}
    	});
    }else{
    	initFunctions.returnNavigation(db, function(resultNav) {
      		res.render('unsubscribe', {
      	 		navigation : resultNav,
      	 		tokenBool : false
       		});
    	});
    }
})

//search page
app.get('/sitemap', checkForCookie, function(req, res) {
	initFunctions.returnNavigation(db, function(resultNav) {
       	db.collection('bookmarks').find({"categories" : "sitemap"}).toArray(function(err, document) {
			res.render('sitemap', {
      	 		resultData : document,
      	 		navigation : resultNav,
      	 		displayCookieBool : req.ucsCookie 
       		});
		});
    });
});

//search results page
app.get('/search-results', function(req, res) {
	var itemsPerPage = 10, pageNum=1;
	if(req.query.start){
		pageNum=parseInt(req.query.start);
	}
	if(req.query.limit){
		itemsPerPage=parseInt(req.query.limit);
	}
	if(pageNum==0){
		pageNum=1;
	}
	var type = req.query.type, data='', truncate = 250;
	var query="{}", fetchFieldsObj="{}";
	if(req.query.s){
		var searchStr = req.query.s;
		var regex = new RegExp(searchStr, "i");
		
		if(type=="site"){
			query= '{'
		}else{
			query= '{ "Type" : "'+type+'", "Status": { $in: [ 1, "1" ] },  ';
		}
		query+= '$or:[';
		query+="{'Document' : "+regex+" }, {'Code' :  "+regex+"}, {'Body' :  "+regex+" }, {'MetaTagDescription' :  "+regex+" }";
		query+=']';
		query+='}';
		fetchFieldsObj='{"Document" : 1, "Code" : 1, "Body" : 1}';
	}	else	{
		query= '{ "Type" : "'+type+'", "Status": { $in: [ 1, "1" ] } }';
	}
		eval('var obj='+query);
		eval('var fetchFieldsobj='+fetchFieldsObj);
		
		if(req.query.showResultsNum){
			var definedLimitNum=parseInt(req.query.showResultsNum);
			if(itemsPerPage>=definedLimitNum){
				itemsPerPage=definedLimitNum;
			}
		}
		//console.log(itemsPerPage * (pageNum-1));
		db.collection('documents').find(obj, fetchFieldsobj).skip(pageNum-1).limit(itemsPerPage).sort( { Published_timestamp: 1 } ).toArray(function(err, document) {
			
			if (err) {
				var myObj = new Object();
      			myObj["total"]   = 0;
      			myObj["error"]   = 'not found';
				res.send(myObj);
      		} else if (document) {
      			if(document!=""){
      				
      				if(req.query.showResultsNum){
      					console.log(req.showResultsNum)
      					db.collection('documents').find(obj).limit(parseInt(req.query.showResultsNum)).count(function (e, count) {
      						console.log(count)
      						var myObj = new Object();
      						myObj["total"]   = count;
      						myObj["aaData"]   = document;
							res.send(myObj);
     					});
      				}else{
      					db.collection('documents').find(obj).count(function (e, count) {
      						var myObj = new Object();
      						myObj["total"]   = count;
      						myObj["aaData"]   = document;
							res.send(myObj);
     					});
					}
				}else{
					var myObj = new Object();
      				myObj["total"]   = 0;
      				myObj["error"]   = 'not found';
					res.send(myObj);
				}
      		}
      	});
    /**}else{
    	var errMsg= "{ 'error' : 'not found'} ";
    	eval('var errMsg='+errMsg);
        res.send(errMsg);
    }**/
});

//404 page
app.get('/not_found', checkForCookie, function(req, res) {
	initFunctions.returnNavigation(db, function(resultNav) {
      	res.render('not_found', {
      	 	navigation : resultNav,
      	 	displayCookieBool : req.ucsCookie 
       	});
    });
	
});

//blog page
app.get('/blog', checkForCookie, function(req, res) {
	initFunctions.returnNavigation(db, function(resultNav) {
      	res.render('blog', {
      	 	navigation : resultNav,
      	 	queryStr : req.query,
			displayCookieBool : req.ucsCookie 
       	});
    });
});

//news page
app.get('/news', checkForCookie, function(req, res) {
	initFunctions.returnNavigation(db, function(resultNav) {
      	res.render('news', {
      	 	navigation : resultNav,
      	 	queryStr : req.query,
      	 	displayCookieBool : req.ucsCookie  
       	});
    });
});

//resource-centre page
app.get('/resource-centre', checkForCookie, function(req, res) {
	initFunctions.returnNavigation(db, function(resultNav) {
      	res.render('resource-centre', {
      	 	navigation : resultNav,
      	 	queryStr : req.query,
      	 	displayCookieBool : req.ucsCookie 
       	});
    });
});


//contact page
app.get('/contact', checkForCookie, function(req, res) {
    initFunctions.returnNavigation(db, function(resultNav) {
    	db.collection('tokens').findOne({"code" : "contact-page-address"}, function(errdoc, addressContent) {
    		res.render('contact', {
      	 		navigation : resultNav ,
      	 		address_token: addressContent,
      	 		queryStr : req.query,
      	 		displayCookieBool : req.ucsCookie 
       		});
		});
   	});
});

//save contact
app.post('/contact/save', (req, res) => {
	var link="/contact";
	var postJson=req.body;
	postJson.Created=init.currentTimestamp;
    db.collection("contacts").save(postJson, (err, result) => {
		if (err){
    		return console.log(err);
    		link+="?msg=error";
    		res.redirect(link)
    	}else{ 
    		link+="?msg=success";
    		
    		var insertEmail=new Object();
			insertEmail["sender_name"]=req.body.name;
			insertEmail["sender_email"]=req.body.email;
			insertEmail["subject"]=req.body.subject;
			insertEmail["body"]=req.body.message;
			insertEmail["created"]=init.currentTimestamp;
			insertEmail["modified"]=init.currentTimestamp;
			insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
			insertEmail["status"]=0;
			db.collection("email_queue").save(insertEmail, (err, e_result) => {
				//console.log(e_result)
				res.redirect(link);
			})
    	} 	
  	});	
})

//save blog comment
app.post('/saveblogcomment', (req, res) => {
	var postJson=req.body;
	postJson.created=init.currentTimestamp;
	postJson.modified=init.currentTimestamp;
	postJson.status=0;
	postJson.uuid=initFunctions.guid();
	var blogID= req.body.blog_uuid;
	if(blogID!=""){
		var mongoIDField= new mongodb.ObjectID(blogID);
		var table_nameStr="documents";
		initFunctions.returnFindOneByMongoID(db, table_nameStr, blogID, function(resultObject) {
			var myObj = new Object();
			if(resultObject.aaData){
				db.collection(table_nameStr).update({_id:mongoIDField}, { $push: { "BlogComments": postJson } }, (err, result) => {
    				if(result){
    					var insertEmail=new Object();
    					var nameStr=req.body.name;
						insertEmail["sender_name"]=nameStr;
						insertEmail["sender_email"]=req.body.email;
						insertEmail["subject"]=nameStr+" has posted a comment";;
						insertEmail["body"]=req.body.comment;
						insertEmail["created"]=init.currentTimestamp;
						insertEmail["modified"]=init.currentTimestamp;
						insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
						insertEmail["status"]=0;
						db.collection("email_queue").save(insertEmail, (err, e_result) => {
							myObj["success"]   = "Thanks your comment has been posted OK and will be visible soon!";
							res.send(myObj);
						})
    				}else{
    					myObj["error"]   = "Error posting comment. Please try again later!!!";
						res.send(myObj);
    				}
    			});
				
			}else{
				myObj["error"]   = "Error posting comment. Please try again later!!!";
				res.send(myObj);
			}	
  		});	
  	}
})

//save wi_users
app.post('/savewiusers', (req, res) => {
	var postJson=req.body;
	postJson.created=currentTimestamp;
	postJson.modified=currentTimestamp;
	postJson.status=0;
	postJson.uuid=guid();
	var email= postJson.email;
	var myObj = new Object();
	if(email!=""){
		var table_nameStr="wi_users";
    	db.collection(table_nameStr).findOne({"email" : email}, function(err, existingDocument) {
			if(existingDocument){
				myObj["error"]   = "You are already a registered user!";
				res.send(myObj);
				
			}else{
				
				db.collection(table_nameStr).save(postJson, (err, result) => {
    				if(result){
    					var insertEmail=new Object();
    					var nameStr=req.body.name;
						insertEmail["sender_name"]=nameStr;
						insertEmail["sender_email"]=req.body.email;
						insertEmail["subject"]=nameStr+" has registered to Jobshout";
						insertEmail["body"]=req.body.comment;
						insertEmail["created"]=currentTimestamp;
						insertEmail["modified"]=currentTimestamp;
						insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
						insertEmail["status"]=0;
						db.collection("email_queue").save(insertEmail, (err, e_result) => {
							myObj["success"]   = "Thank you for registering with us, we will contact you soon!";
							res.send(myObj);
						})
    				}else{
    					myObj["error"]   = "Error while registration, please try again later!";
						res.send(myObj);
    				}
    			});
			}	
  		});	
  	}else{
  		myObj["error"]   = "Please specify your email address!";
		res.send(myObj);
  	}
})

//content page
app.get('/:id', checkForCookie, function(req, res) {
	initFunctions.returnNavigation(db, function(resultNav) {
      	db.collection('documents').findOne({Code: req.params.id}, function(err, document) {
			if (err) {
        		console.log(err);
      		} else if (document) {
      			res.render('content', {
        			document_details: document,
        			db_connection : db,
        			navigation : resultNav,
      	 			displayCookieBool : req.ucsCookie 
    			});
      		} else {
        		res.redirect('/not_found');
      		}
    	}); 
    });
});

function checkForCookie (req, res, next) {
	if(req.cookies){
		if(req.cookies["ucs"] != null && req.cookies["ucs"] != 'undefined' && req.cookies["ucs"]=="ok"){
   			req.ucsCookie = false;
		}else{
   			req.ucsCookie = true;
   		}
   	}else{
   		req.ucsCookie = true;
   	}
   	next();
}

}