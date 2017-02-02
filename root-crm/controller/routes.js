	/**********************************************************************
	*  Author: Neha Kapoor (neha@rootcrm.org)
	*  Project Lead: Balinder WALIA (bwalia@rootcrm.org)
	*  Project Lead Web...: https://twitter.com/balinderwalia
	*  Name..: ROOTCRM
	*  Desc..: Root CRM (part of RootCrm Suite of Apps)
	*  Web: http://rootcrm.org
	*  License: http://rootcrm.org/LICENSE.txt
	**/

	/**********************************************************************
	*  routes.js handles the http requests
	**/
	
var initFunctions = require('../config/functions');	
var passwordHash = require('password-hash'),
	cookieParser = require('cookie-parser');
	
module.exports = function(init, app,db){
var mongodb=init.mongodb;

var accessFilePath=init.backendDirectoryName+"/";
var backendDirectoryPath=init.backendDirectoryPath;

//sign in page
app.get(backendDirectoryPath+'/sign-in', function(req, res) {
	res.render(accessFilePath+'sign-in', {
      	 queryStr : req.query
    });   
})

//reset password
app.get(backendDirectoryPath+'/reset_password', function(req, res) {
	res.render(accessFilePath+'reset_password', {
      	 queryStr : req.query
    });   
})

//post action for save notes
app.post(backendDirectoryPath+'/savenotes', (req, res) => {
	var myObj = new Object();
	var tableID= req.body.uuid;
	var insertNote=new Object();
	insertNote["note"]=req.body.note;
	insertNote["user_uuid"]=req.body.added_by;
	insertNote["user_name"]=req.body.user_name;
	insertNote["modified"]=initFunctions.currentTimestamp();
	insertNote["created"]=initFunctions.currentTimestamp();
	insertNote["uuid"]=initFunctions.guid();
	
	if(tableID!=""){
		var mongoIDField= new mongodb.ObjectID(tableID);
		var table_nameStr=req.body.table;
		if(req.body.action=="create"){
			initFunctions.returnFindOneByMongoID(db, table_nameStr, tableID, function(resultObject) {
				if(resultObject.aaData){
					db.collection(table_nameStr).update({_id:mongoIDField}, { $push: { "notes": insertNote } }, (err, result) => {
    					if(result){
    						myObj["success"]   = "Note added successfully!";
							res.send(myObj);
    					}else{
    						myObj["error"]   = "Error posting comment. Please try again later!!!";
							res.send(myObj);
    					}
    				});
				}else{
					myObj["error"]   = "Error adding note. Please try again later!!!";
					res.send(myObj);
				}	
  			});	
  		}else if(req.body.action=="update"){
			initFunctions.returnFindOneByMongoID(db, table_nameStr, tableID, function(resultObject) {
				if(resultObject.aaData){
					db.collection(table_nameStr).update({_id:mongoIDField}, { $pull: { "notes": { "uuid": req.body.note_uuid } } }, (err, result) => {
    					if(result){
    						insertNote["uuid"]=req.body.note_uuid;
    						
    						db.collection(table_nameStr).update({_id:mongoIDField}, { $push: { "notes": insertNote } }, (err, result) => {
    							if(result){
    								myObj["success"]   = "Note updated successfully!";
									res.send(myObj);
    							}else{
    								myObj["error"]   = "Error posting comment. Please try again later!!!";
									res.send(myObj);
    							}
    						});
    					}else{
    						myObj["error"]   = "Error in update note. Please try again later!!!";
							res.send(myObj);
    					}
    				});
				}else{
					myObj["error"]   = "Error adding note. Please try again later!!!";
					res.send(myObj);
				}	
  			});	
  		}else if(req.body.action=="delete"){
  			initFunctions.returnFindOneByMongoID(db, table_nameStr, tableID, function(resultObject) {
  				if(resultObject.aaData){
  					db.collection(table_nameStr).update({_id:mongoIDField}, { $pull: { "notes": { "uuid": req.body.note_uuid } } }, (err, result) => {
    					if(result){
    						myObj["success"]   = "Note deleted successfully!";
							res.send(myObj);
    					}else{
    						myObj["error"]   = "Error in deleting note. Please try again later!!!";
							res.send(myObj);
    					}
    				});
  				}else{
  					myObj["error"]   = "Error in deleting note. Please try again later!!!";
					res.send(myObj);
  				}
  			});
  		}
  	}
});

//post action of reset password
app.post(backendDirectoryPath+'/reset_password', (req, res) => {
	var postJson=req.body;
	var mongoIDField= new mongodb.ObjectID(postJson.token);
	
	initFunctions.returnFindOneByMongoID(db, 'authentication_token', mongoIDField, function(result) {
		if (result.aaData) {
			var document=result.aaData;
			if(document.status==true){
				if (typeof postJson.password !== 'undefined' && postJson.password !== null && postJson.password != "") {
      				postJson['password'] = passwordHash.generate(postJson.password);
      			}
				db.collection('users').findAndModify({_id:document.user_id}, [['_id','asc']], { $set: {"password" : postJson.password} }, {}, function(err, result) {
					db.collection('authentication_token').remove({"_id":mongoIDField},function(err,result){
    					res.redirect(backendDirectoryPath+'/sign-in?success=reset');
    				});
				});
			}else{
				res.redirect(backendDirectoryPath+'/reset_password?error=invalid');
			}
      	} else {
      		res.redirect(backendDirectoryPath+'/reset_password?error=invalid');
        }
    });
})

//forgot password
app.get(backendDirectoryPath+'/forgot_password', function(req, res) {
	res.render(accessFilePath+'forgot_password', {
      	 queryStr : req.query
    });   
})

//jobshout_server pages
app.get(backendDirectoryPath+'/', requireLogin, function(req, res) {
	if(req.authenticationBool){
		res.render(accessFilePath+'index', {
      		 authenticatedUser : req.authenticatedUser
   		});
    }else{
		res.redirect(backendDirectoryPath+'/sign-in');
	}
}); 

//index
app.get(backendDirectoryPath+'/index', requireLogin, function(req, res) {
	if(req.authenticationBool){
		res.render(accessFilePath+'index', {
      		 authenticatedUser : req.authenticatedUser
   		});
    }else{
		res.redirect(backendDirectoryPath+'/sign-in');
	}
}); 

//jobshout_server logout
app.get(backendDirectoryPath+'/logout', function(req, res) {
	if(req.cookies[init.cookieName] != null && req.cookies[init.cookieName] != 'undefined' && req.cookies[init.cookieName]!=""){
		var mongoIDField= new mongodb.ObjectID(req.cookies[init.cookieName]);
		res.clearCookie(init.cookieName);
		db.collection('sessions').remove({"_id":mongoIDField},function(err,result){
    		res.redirect(backendDirectoryPath+'/sign-in');
    	});
   	}else{
   		res.redirect(backendDirectoryPath+'/sign-in');
   	}	
}); 

//forgot password post
app.post(backendDirectoryPath+'/forgot_password', (req, res) => {
	var postJson=req.body;
	
	var checkForExistence= '{"email": \''+postJson.email+'\', "status": { $in: [ 1, "1" ] }}';
	//eval('var obj='+checkForExistence);
	//db.collection('users').findOne(obj, function(err, document) {
	
	initFunctions.crudOpertions(db, 'users', 'findOne', null, null, null, checkForExistence, function(result) {
		if (result.aaData) {
			var document= result.aaData;
			
			var addAuthToken=new Object();
			addAuthToken["user_id"]=document._id;
			addAuthToken["status"]=true;
				
			//db.collection('authentication_token').save({"user_id": document._id, "status" : true}, (err, result) => {
			initFunctions.crudOpertions(db, 'authentication_token', 'create', addAuthToken, null, null, null,function(result) {
				console.log(result);
				var insertEmail=new Object();
				insertEmail["sender_name"]=document.firstname;
				insertEmail["sender_email"]=postJson.email;
				insertEmail["subject"]='Reset your ROOTCRM password';
				insertEmail["body"]='Hi '+document.firstname+',<br>Please click on the below link to reset your password:<br><a href="'+backendDirectoryPath+'/reset_password?token='+result._id+'">'+backendDirectoryPath+'/reset_password?token='+result._id+'</a>';
				insertEmail["created"]=initFunctions.currentTimestamp();
				insertEmail["modified"]=initFunctions.currentTimestamp();
				insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
				insertEmail["status"]=0;
				
				//db.collection("email_queue").save(insertEmail, (err, e_result) => {
				initFunctions.crudOpertions(db, 'email_queue', 'create', insertEmail, null, null, null,function(email_response) {
					if(email_response.error){
						res.redirect(backendDirectoryPath+'/forgot_password?error=email');
					}else{
						res.redirect(backendDirectoryPath+'/forgot_password?success=OK');
					}
				})
			});
      	} else {
      		res.redirect(backendDirectoryPath+'/forgot_password?error=not_exist');
        }
      
	});
})

//validate user
app.post(backendDirectoryPath+'/validlogin', (req, res) => {
	var postJson=req.body;
	
	var checkForExistence= '{"email": \''+postJson.email+'\', "status": { $in: [ 1, "1" ] }}';
	//eval('var obj='+checkForExistence);
	//db.collection('users').findOne(obj, function(err, document) {
	
	initFunctions.crudOpertions(db, 'users', 'findOne', null, null, null, checkForExistence, function(result) {
		if (result.aaData) {
			var document= result.aaData;
			if(passwordHash.verify(postJson.password, document.password)){
				db.collection('sessions').save({"user_id": document._id, "status" : true}, (err, result) => {
					if (result){
      					res.cookie(init.cookieName , result["ops"][0]["_id"])
      					res.redirect(backendDirectoryPath+'/index');
      				}else{
      					res.redirect(backendDirectoryPath+'/sign-in?error=no');
    				}
  				});
				
			}else{
      			res.redirect(backendDirectoryPath+'/sign-in?error=password');
      		}
      	} else {
      		// search user by username
      		var checkForExistence= '{"username": \''+postJson.email+'\', "status": { $in: [ 1, "1" ] }}';
      		initFunctions.crudOpertions(db, 'users', 'findOne', null, null, null, checkForExistence, function(result) {
				if (result.aaData) {
					var document= result.aaData;
					if(passwordHash.verify(postJson.password, document.password)){
						db.collection('sessions').save({"user_id": document._id, "status" : true}, (err, result) => {
							if (result){
      								res.cookie(init.cookieName , result["ops"][0]["_id"])
      								res.redirect(backendDirectoryPath+'/index');
      						}else{
      							res.redirect(backendDirectoryPath+'/sign-in?error=no');
    						}
  						});
					}else{
      					res.redirect(backendDirectoryPath+'/sign-in?error=password');
      				}
      			} else {
      				res.redirect(backendDirectoryPath+'/sign-in?error=no');
      		  	}
    		});
        }
      
	});
})

// task scheduler
app.get(backendDirectoryPath+'/task_scheduler', (req, res) => {
	var schedulerFrom = req.query.schedulerFrom, schedulerTo=req.query.schedulerTo, collectionStr=req.query.collection;
	var outputObj = new Object();
	
	db.collection(collectionStr).find({ $and:[ { timestamp_start: { $gte: schedulerFrom } },  { timestamp_start: { $lte: schedulerTo } } ] }).sort({Modified: 1}).toArray(function(err, items) {
		if (err) {
			outputObj["error"]   = 'no records found';
			res.send(outputObj);
      	} else if (items) {
      		outputObj["aaData"]   = items;
			res.send(outputObj);
     	}
	});
	
});

//post request to save task scheduler
app.get(backendDirectoryPath+'/save_task_scheduler', (req, res) => {
	var getJson=req.query;
	var outputObj = new Object();
	var table_nameStr='calendar-events';
	
	if(getJson.action=="create"){
		initFunctions.returnFindOneByMongoID(db, 'tasks', getJson.task_id, function(resultObject) {
			if(resultObject.aaData){
				var contentObj=resultObject.aaData;
				var startTimeStr=parseInt(getJson.datetimestart);
				var addHours=1;
				if(contentObj.task_estimated_hours && contentObj.task_estimated_hours!=null){
					addHours=parseInt(contentObj.task_estimated_hours);
				}
				
				var endTimeStr=parseInt(startTimeStr+(addHours*60*60*1000));
				db.collection(table_nameStr).save({"title": contentObj.name, "reported_by": contentObj.reported_by, "assigned_to": contentObj.assigned_to, "description": contentObj.description, "task_id": getJson.task_id, "employee_id" : getJson.emp_id, "timestamp_start" : getJson.datetimestart, "timestamp_end" : endTimeStr}, (err, result) => {
					if(err){
						outputObj["errormessage"]   = 'Timeslip can\'t be added';
						res.send(outputObj);
					}	else if (result){
      					outputObj["success"] ="OK";
      					outputObj["aaData"] =result["ops"];
      					res.send(outputObj);
      				}
  				});
			}else if(resultObject.error){
				outputObj["errormessage"]   = resultObject.error;
				res.send(outputObj);
			}
			
		});	
	}else if(getJson.action=="update"){
		if(getJson.timeslip_id){
			var timeslipMongoID= new mongodb.ObjectID(getJson.timeslip_id);
			db.collection(table_nameStr).findAndModify({_id:timeslipMongoID}, [['_id','asc']], { $set: {"employee_id" : getJson.emp_id, "timestamp_start" : getJson.datetimestart, "timestamp_end" : getJson.datetimeend} }, {}, function(err, result) {
				if(err){
					outputObj["errormessage"]   = 'Timeslip can\'t be updated';
					res.send(outputObj);
				}	else if (result){
					if(result.lastErrorObject.updatedExisting){
						outputObj["success"] ="OK";
      				}else{
      					outputObj["errormessage"]   = 'Timeslip can\'t be updated';
					}
      				res.send(outputObj);
      			}
  			});
  		}else{
  			outputObj["errormessage"]   = 'Invalid timeslip passed';
			res.send(outputObj);
  		}
	}else if(getJson.action=="delete"){
		if(getJson.timeslip_id){
			var timeslipMongoID= new mongodb.ObjectID(getJson.timeslip_id);
			db.collection(table_nameStr).remove({_id:timeslipMongoID}, function(err, result){
				if(err){
					outputObj["errormessage"]   = 'Timeslip can\'t be deleted';
					res.send(outputObj);
				}	else if (result){
					outputObj["success"] ="OK";
      				res.send(outputObj);
      			}
  			});
  		}else{
  			outputObj["errormessage"]   = 'Invalid timeslip passed';
			res.send(outputObj);
  		}
	}
})

//post api of CRUD
app.post(backendDirectoryPath+'/api_crud_post/', requireLogin, function(req, res) {
	var uniqueFieldNameStr = "", uniqueFieldValueStr="", actionStr="", collectionStr="";
	var outputObj = new Object();
	
	if(req.authenticationBool){
		var postContent=req.body;
		
		if(req.body.collection){
			collectionStr=req.body.collection;
			delete postContent['collection']; 
		}
	
		if(req.body.action){
			actionStr=req.body.action;
			delete postContent['action']; 
		}
	
		if(req.body.fieldName){
			uniqueFieldNameStr=req.body.fieldName;
			delete postContent['fieldName']; 
		}
	
		if(req.body.fieldValue){
			uniqueFieldValueStr=req.body.fieldValue;
			delete postContent['fieldValue']; 
		}
		
		if(collectionStr!=""){
			initFunctions.crudOpertions(db, collectionStr, actionStr, postContent, uniqueFieldNameStr, uniqueFieldValueStr, null, function(result) {
				res.send(result);
			});	
		}else{
			outputObj["error"]   = "Please pass the collection name!";
			res.send(outputObj);
		}
	}else{
		outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
}); 

//get api of CRUD
app.get(backendDirectoryPath+'/api_crud_get/', requireLogin, function(req, res) {
	var uniqueFieldNameStr = "", uniqueFieldValueStr="", actionStr="", collectionStr="";
	var outputObj = new Object();
	
	if(req.authenticationBool){
		var postContent=req.query;
		
		if(req.query.collection){
			collectionStr=req.query.collection;
			delete postContent['collection']; 
		}
	
		if(req.query.action){
			actionStr=req.query.action;
			delete postContent['action']; 
		}
	
		if(req.query.fieldName){
			uniqueFieldNameStr=req.query.fieldName;
			delete postContent['fieldName']; 
		}
	
		if(req.query.fieldValue){
			uniqueFieldValueStr=req.query.fieldValue;
			delete postContent['fieldValue']; 
		}
		
		if(collectionStr!=""){
			initFunctions.crudOpertions(db, collectionStr, actionStr, postContent, uniqueFieldNameStr, uniqueFieldValueStr, null, function(result) {
				res.send(result);
			});	
		}else{
			outputObj["error"]   = "Please pass the collection name!";
			res.send(outputObj);
		}
	}else{
		outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
}); 

//api to fetch all collection names
app.get(backendDirectoryPath+'/api_fetch_collections/', requireLogin, function(req, res) {
	var outputObj = new Object();
	
	if(req.authenticationBool){
		initFunctions.returnAllCollections(db, function(result) {	
			res.send(result);
		});
	}else{
		outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
}); 


//load navigator
app.get(backendDirectoryPath+'/load_navigator/', requireLogin, function(req, res) {
	var collectionStr="modules";
	var outputObj = new Object();
		
	if(req.authenticationBool){
		var loggedInUser = req.authenticatedUser;
		var loggedInUserID= new mongodb.ObjectID(loggedInUser._id);
		var checkForExistence= '{"users_list": { $in: ["'+loggedInUserID+'"] }, "status": { $in: [ 1, "1" ] }}';
		eval('var obj='+checkForExistence);
		
		db.collection('groups').find(obj).toArray(function(g_err, g_details) {
			if(g_err){
				outputObj["aaData"]   = items;
				res.send(outputObj);
			}	else	{
				var modulesStrArr = new Array();
				var modulesArr = new Array();
				var isUserAdmin= false;
				for (var count=0; count < g_details.length; count++) {
					if(g_details[count].code=="admin"){
						isUserAdmin=true;
					}
					var assigned_modulesArr =g_details[count].assigned_modules;
 					if(assigned_modulesArr.length>0){
 						for (var i=0; i < assigned_modulesArr.length; i++) {
 							modulesStrArr.push("'"+assigned_modulesArr[i]+"'");
 							modulesArr.push(assigned_modulesArr[i]);
 						}
 					}
 				}
 				var uniqueModuleArr = modulesStrArr.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
 				var modulesArr = modulesArr.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
 				
 				var coll= db.collection(collectionStr);
				var query="{ 'active': { $in: [ 1, '1' ] }";
				if(!isUserAdmin){
					query+=", 'module_items.uuid' : {$in: ["+uniqueModuleArr+"]}";
				}
				if(req.query.s){
     				//create text index
     				coll.createIndex({ "$**": "text" },{ name: "TextIndex" });
     				query+=", '$text': { '$search': '"+req.query.s+"' } ";
     			}
     			query+=" } ";
     			eval('var queryObj='+query);
     			//console.log(query);
				
				coll.find(queryObj).sort({sort_order: -1}).toArray(function(err, items) {
					if (err) {
						outputObj["error"]   = 'not found';
						res.send(outputObj);
      				} else if (items) {
      					if(isUserAdmin){
      						outputObj["aaData"]   = items;
      						res.send(outputObj);
      					}else{
      						var outputContentJson=new Array();
      						for (var j=0; j < items.length; j++) {
      							var moduleObj={};
      							var moduleContentArr=items[j];
								for(var key in moduleContentArr) {
									if(key=="module_items"){
										var moduleItemsArr = new Array();
										if(moduleContentArr[key].length>0){
											var addInArrayNum=0;
 											for (var i=0; i < moduleContentArr[key].length; i++) {
 												var existingModuleItemsArr=moduleContentArr[key][i];
 												if(modulesArr.indexOf(existingModuleItemsArr.uuid)!==-1){
 													moduleItemsArr[addInArrayNum] = existingModuleItemsArr;
 													addInArrayNum++;
 												}
 											}
 										}
 									
 										if(moduleItemsArr.length>0){
 											moduleObj[key] = moduleItemsArr;
 										}
   									} else	{
   										moduleObj[key] = moduleContentArr[key];
   									}
								}
								outputContentJson[j]=moduleObj;
							}
							outputObj["aaData"]   = outputContentJson;
							res.send(outputObj);
 						}
 					}
				});
			}
		});
	}else{
		outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
});

//GENERIC: fetch listing depending upon collection or template passed
app.get(backendDirectoryPath+'/api_fetch_list/', requireLogin, function(req, res) {
	var itemsPerPage = 10, pageNum=1, templateStr="", collectionStr="";
	var outputObj = new Object();
	if(req.query.templateStr){
		templateStr=req.query.templateStr;
	}
	if(req.query.collection){
		collectionStr=req.query.collection;
	}
	
	if(req.authenticationBool){
		if(templateStr!=""){
			initFunctions.templateSearch(db, templateStr, req, function(resultObject) {
				res.send(resultObject);
			});
		}else if(collectionStr!=""){
			var query="{}";
			var total_records=0;
			var coll= db.collection(collectionStr);
			if(req.query.s){
     			//create text index
     			coll.createIndex({ "$**": "text" },{ name: "TextIndex" });
     			query="{ '$text': { '$search': '"+req.query.s+"' } }";
     		}
     		eval('var queryObj='+query);
     		coll.find(queryObj).count(function (e, count) {
      			total_records= count;
     		});
			coll.find(queryObj).sort({Modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
				if (err) {
					outputObj["total"]   = 0;
      				outputObj["error"]   = 'not found';
					res.send(outputObj);
      			} else if (items) {
      				outputObj["total"]   = total_records;
      				outputObj["aaData"]   = items;
					res.send(outputObj);
     			}
			});
		}else{
			outputObj["total"]   = 0;
      		outputObj["error"]   = "No such page exists!";
			res.send(outputObj);
		}
	}else{
		outputObj["total"]   = 0;
      	outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
}); 

// fetch record detail
app.get(backendDirectoryPath+'/collection_details/', requireLogin, function(req, res) {
	var templateStr="", collectionStr="", search_id="";
	var outputObj = new Object();
	if(req.query.templateStr){
		templateStr=req.query.templateStr;
	}
	if(req.query.collection){
		collectionStr=req.query.collection;
	}
	if(req.query.id){
		search_id=req.query.id;
	}
	if(req.authenticationBool){
		if(templateStr!=""){
			var checkForExistence= '{"code": \''+templateStr+'\', "status": { $in: [ 1, "1" ] }}';
			initFunctions.crudOpertions(db, 'system_templates', 'findOne', null, null, null, checkForExistence, function(result) {
				//db.collection('system_templates').findOne({"code": templateStr , "status": { $in: [ 1, "1" ] } }, function(err, templateResponse) {
				if(result.error){
					outputObj["error"]   = "No such page exists!";
					res.send(outputObj);
				}
				if(result.aaData){
					var templateResponse= result.aaData;
					 var collectionStr= templateResponse.table ;
					 initFunctions.returnFindOneByMongoID(db, collectionStr, search_id, function(resultObject) {
						res.send(resultObject);
					 });
				}
			});
		}else if(collectionStr!=""){
			initFunctions.returnFindOneByMongoID(db, collectionStr, search_id, function(resultObject) {
				res.send(resultObject);
			 });
		}else{
			outputObj["total"]   = 0;
      		outputObj["error"]   = "No results found!";
			res.send(outputObj);
		}
	}else{
		outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
}); 

// listing pages ui
app.get(backendDirectoryPath+'/list/:id', requireLogin, function(req, res) {
	if(req.authenticationBool){
		var pageRequested = req.params.id;
		var queryString= req.query;
		var keywordStr="";
	
		if(queryString.keyword){
			keywordStr=queryString.keyword;
		}
	
		res.render(accessFilePath+'standard_listing', {
       	 	currentTemplate : pageRequested,
        	searched_keyword : keywordStr,
        	authenticatedUser : req.authenticatedUser
    	});
    }else{
		res.redirect(backendDirectoryPath+'/sign-in');
	}
})

//fetch Table fields
app.get(backendDirectoryPath+'/fetchTableColumns', requireLogin, function(req, res) {
	if(req.authenticationBool){
		initFunctions.fetchTableColumns(db, req.query.e, function(result) {	
			res.send(result);
		});
	}else{
		var outputObj = new Object();
		outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
});

// render pages
app.get(backendDirectoryPath+'/:id', requireLogin, function(req, res) {
	if(req.authenticationBool){
	var pageRequested = req.params.id;
	var queryString= req.url;
	var removeUrl=backendDirectoryPath+'/'+req.params.id+'?';
	queryString= queryString.substr(removeUrl.length);
	if(queryString.indexOf("&")>-1){
		queryString= queryString.substr(0,queryString.indexOf("&"));
	}
	
	var editFieldName="", editFieldVal="";
	
	if(queryString.indexOf("=")>-1){
		editFieldName=queryString.substr(0,queryString.indexOf("="));
		editFieldVal=queryString.substr(queryString.indexOf("=")+1);
	}
	
	var contentObj= "";
	var table_name =initFunctions.fetchTableName(pageRequested);
	//console.log(table_name);
	pageRequested=accessFilePath+pageRequested;
	
		if(table_name==""){
			res.render(pageRequested, {
      			queryStr : req.query,
       			contentObj : contentObj,
       			authenticatedUser : req.authenticatedUser
    		});
		}else{
		if (typeof editFieldVal !== 'undefined' && editFieldVal !== null) {
			if(editFieldName=="_id"){
				 initFunctions.returnFindOneByMongoID(db, table_name, editFieldVal, function(resultObject) {
					if (resultObject.aaData) {
      					contentObj=resultObject.aaData;
      				} 
      				
      				res.render(pageRequested, {
      	 				editorField : editFieldName,
      	 				editorValue : editFieldVal,
       					queryStr : req.query,
       					contentObj : contentObj,
       					authenticatedUser : req.authenticatedUser
    				});
    			}); 
			}else{
				var queryStr="{'"+editFieldName+"': '"+editFieldVal+"'}";
				//eval('var queryObj='+queryStr);
				//db.collection(table_name).findOne(queryObj, function(err, document) {
				
				initFunctions.crudOpertions(db, table_name, 'findOne', null, editFieldName, editFieldVal, queryStr, function(result) {
					if (result.aaData) {
      					contentObj=result.aaData;
      				} 
      			
      				res.render(pageRequested, {
      	 				editorField : editFieldName,
      	 				editorValue : editFieldVal,
       					queryStr : req.query,
       					contentObj : contentObj,
       					authenticatedUser : req.authenticatedUser
    				});
    			});
    		} 
		}else{
      		res.render(pageRequested, {
      			queryStr : req.query,
       			contentObj : contentObj,
       			authenticatedUser : req.authenticatedUser
    		});
    	}
    	}
  	}else {
    	res.redirect(backendDirectoryPath+'/sign-in');
    }	
}); 

//save form
app.post(backendDirectoryPath+'/save/:id', requireLogin, (req, res) => {
	if(req.authenticationBool){
	var postJson=req.body;
	
	var contentJson = JSON.parse(req.body.data);
	
	var idField="", editorFieldName="", editorFieldVal="", checkForExistence="";
	
	var table_nameStr=postJson.table_name;
	var unique_fieldStr=postJson.unique_field;
	if(unique_fieldStr=="_id"){
		unique_fieldStr="id";
	}
	var unique_fieldVal="";
	var link =backendDirectoryPath+"/"+req.params.id;
	
	for(var key in contentJson) {
		if(key==unique_fieldStr){
			unique_fieldVal= contentJson[key];
   		}
	}
	
	if(unique_fieldVal==""){
		for(var key in postJson) {
			if(key==unique_fieldStr){
				unique_fieldVal= postJson[key];
   			}
		}
	}
	if (typeof postJson.editorField !== 'undefined' && postJson.editorField !== null && postJson.editorField !== "") { 
		editorFieldName=postJson.editorField;
	}
	
	if (typeof postJson.editorValue !== 'undefined' && postJson.editorValue !== null && postJson.editorValue !== null) { 
		editorFieldVal=postJson.editorValue;
	}
	if(postJson.id){
		idField=postJson.id;
		var mongoIDField= new mongodb.ObjectID(idField);
		if(editorFieldName=="" && editorFieldVal==""){
    		editorFieldName="id";
    		editorFieldVal=idField;
    	}
	}
	
	var callMongoQueriesBool=true; // set true to save in db after this if-else condition
	
	if(table_nameStr=="bookmarks"){
		checkForExistence= '{\''+unique_fieldStr +'\': \''+unique_fieldVal+'\', "categories": \''+req.body.categories+'\'}';
	}
	else if(table_nameStr=="email_queue"){
		callMongoQueriesBool=true; 
	}else if(table_nameStr=="users"){
		callMongoQueriesBool=false; 
		if (typeof contentJson.password !== 'undefined' && contentJson.password !== null && contentJson.password != "") {
      		contentJson['password'] = passwordHash.generate(contentJson.password);
      	}
      	checkForExistence= '{\''+unique_fieldStr +'\': \''+unique_fieldVal+'\'}';
      	//eval('var obj='+checkForExistence);
		//db.collection(table_nameStr).findOne(obj, function(err, document) {
		
		initFunctions.crudOpertions(db, table_nameStr, 'findOne', null, null, null, checkForExistence, function(result) {
			if (result.success=="OK") {
      			var document=result.aaData;
      			
      			if(mongoIDField!="" && mongoIDField!="undefined" && mongoIDField!=null){
      				initFunctions.returnFindOneByMongoID(db, table_nameStr, mongoIDField, function(existingDoc) {
      					if (existingDoc.aaData) {
      						var existingDocument=existingDoc.aaData;
      						contentJson["Created"]=existingDocument.Created;
      				
      						var  updaTeContent="{ $set: { ";
      						for(var key in contentJson) {
								updaTeContent+="'"+key+"' : '"+contentJson[key]+"',";
							}
							updaTeContent = updaTeContent.replace(/,([^,]*)$/,'$1');
							updaTeContent+="}	} ";
					 
							eval('var obj='+updaTeContent);
							db.collection(table_nameStr).update({_id:mongoIDField}, obj, (err, result) => {
								if (err) {
    								link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
								}
								if(editorFieldName!="" && editorFieldVal!=""){
    								link+="?"+editorFieldName+"="+editorFieldVal;
    							}
    							if(result){
    								link+="&success_msg=Saved successfully!";
    							}
    							res.redirect(link);
  							});
      					}else{
      						link+="?error_msg=This "+req.params.id+" already exists!"
      						res.redirect(link);
      					}
      				});
      			}	else	{
      				link+="?error_msg=This user already exists!"
      				res.redirect(link);
      			}
      		} else {
      			contentJson.Created=initFunctions.currentTimestamp();
      			
      			
      			initFunctions.returnFindOneByMongoID(db, table_nameStr, mongoIDField, function(existingDoc) {
      				if (existingDoc.aaData) {
      					var existingDocument=existingDoc.aaData;
      					contentJson["Created"]=existingDocument.Created;
      				
      					var  updaTeContent="{ $set: { ";
      					for(var key in contentJson) {
							updaTeContent+="'"+key+"' : '"+contentJson[key]+"',";
						}
						updaTeContent = updaTeContent.replace(/,([^,]*)$/,'$1');
						updaTeContent+="}	} ";
					 
						eval('var obj='+updaTeContent);
					 
						db.collection(table_nameStr).update({_id:mongoIDField}, obj, (err, result) => {
    						if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
							
							if(editorFieldName!="" && editorFieldVal!=""){
    							link+="?"+editorFieldName+"="+editorFieldVal;
    						}
    						res.redirect(link)
  						});
      				}else{
      					db.collection(table_nameStr).save(contentJson, (err, result) => {
      						if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
    						link+="?success_msg=Saved successfully!";
    						res.redirect(link)
  						});
      				}
      			});
      			
      		}
      	});
	}
	
	if(callMongoQueriesBool){
		//console.log("checkForExistence: "+checkForExistence+", id="+req.params.id+ ", mongoId= "+mongoIDField+", uniquefield: "+unique_fieldStr+", unique value="+unique_fieldVal);
		initFunctions.saveEntry(db, table_nameStr, checkForExistence, contentJson, req.params.id, mongoIDField, unique_fieldStr, unique_fieldVal, function(result) {
			var tempLink="";
			if(editorFieldName!="" && editorFieldVal!=""){
    			tempLink+="?"+editorFieldName+"="+editorFieldVal;
    			link+=tempLink;		
    		}
    		if(result){
    			if(table_nameStr=="system_templates" && contentJson!=""){
    				if(contentJson.index_columns){
    					initFunctions.createIndexes(db, contentJson.table, contentJson.index_columns);
    				}
    			}
    			if(tempLink!=""){
    				link+="&"+result;
    			}else{
    				link+="?"+result;
    			}
    		}
    		res.redirect(link);
  		});
  	}
	}else{
		res.redirect('/sign-in');
	}
})

function requireLogin (req, res, next) {
	if(req.cookies[init.cookieName] != null && req.cookies[init.cookieName] != 'undefined' && req.cookies[init.cookieName]!=""){
   		authenticatedUser(req, function(user) {
   			if(user === null){
   				req.authenticationBool=false;
   				next();
   			}else{
   				req.authenticationBool=true;
				req.authenticatedUser = user;
				next();
			}
		});
	}/**else if(req.query.token != null && req.query.token != 'undefined' && (req.query.token=="1" || req.query.token==1)){
		req.authenticationBool=true;
		next();
	}**/
	else if(req.headers['token'] != null && req.headers['token'] != 'undefined' && (req.headers['token']=="1" || req.headers['token']==1)){
		req.authenticationBool=true;
		next();
	}else{
		req.authenticationBool=false;
		next();
   	}
}

var authenticatedUser =function (req, cb) {
	if(req.cookies[init.cookieName] != null && req.cookies[init.cookieName] != 'undefined' && req.cookies[init.cookieName]!=""){
		var mongoIDField= new mongodb.ObjectID(req.cookies[init.cookieName]);
		
		initFunctions.returnFindOneByMongoID(db, 'sessions', mongoIDField, function(result) {
			if(result.error) {
				return cb(null);	
			}else if(result.aaData) {
				var session_result= result.aaData;
				initFunctions.returnFindOneByMongoID(db, 'users', session_result.user_id, function(userDetails) {
					if(userDetails.error) return cb(null)
					return cb(userDetails.aaData);
				});
			}else{
				return cb(null);
			}
		});
   	}else{
   		return cb(null);
   	}
}

function checkForCookie (req, res, next) {
	if(req.cookies['ucs'] != null && req.cookies['ucs'] != 'undefined' && req.cookies['ucs']=="ok"){
   		req.ucsCookie = false;
	}else{
   		req.ucsCookie = true;
   	}
   	next();
}

}
