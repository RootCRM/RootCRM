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

//call defined admin tables array which are independent of system table
var definedAdminTablesArr= init.adminTablesArr;

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

//post action for sub objects
app.post(backendDirectoryPath+'/saveplayers', (req, res) => {
	var myObj = new Object();
	var postContent= req.body;
	var table_nameStr="teams", tableID="", actionStr="", subObject;
	
	if(postContent.id){
		tableID=postContent.id;
		delete postContent['id']; 
	}
		
	if(postContent.action){
		actionStr=postContent.action;
		delete postContent['action']; 
	}
	
	if(postContent.aaData){
		subObject=JSON.parse(postContent.aaData);
		delete postContent['aaData']; 
	}
		
	if(tableID!=""){
		var mongoIDField= new mongodb.ObjectID(tableID);
		
		if(actionStr=="create"){
			initFunctions.returnFindOneByMongoID(db, table_nameStr, tableID, function(resultObject) {
				if(resultObject.aaData){
					var teamsData=resultObject.aaData;
					var playersArr=teamsData.players;
					
					var playersUUIDArr= new Array();
					var sortOrderNum=1;
					
					if(playersArr.length>0){
						for(var i=0; i<playersArr.length; i++){
							playersUUIDArr.push(playersArr[i].user_uuid);
							if(playersArr[i].sort_order >= sortOrderNum){
								sortOrderNum=parseInt(playersArr[i].sort_order);
							}
						}
					}
					
					if(subObject.length>0){
						for(var i=0; i<subObject.length; i++){
							var userUUIDSTR=subObject[i].user_uuid;
							if(playersUUIDArr.indexOf(userUUIDSTR)!==-1){
								//console.log('update');
							} else{
								subObject[i].sort_order=sortOrderNum+1;
								playersArr.push(subObject[i]);
							}
						}
						
						db.collection(table_nameStr).update({_id:mongoIDField}, { $set: { "players": playersArr } }, (err, result) => {
    						if(result){
    							myObj["success"]   = "Players added successfully!";
								res.send(myObj);
    						}else{
    							myObj["error"]   = "Error while adding players, please try again later!!!";
								res.send(myObj);
    						}
    					});
					}else{
						myObj["error"]   = "Error occured, please try again later!!!";
						res.send(myObj);
					}
				}
				else{
					myObj["error"]   = "Error occured, please try again later!!!";
					res.send(myObj);
				}
	 		});
	 	}
  		else if(actionStr=="update"){
			myObj["error"]   = "Work in progress";
			res.send(myObj);
  		}
  		else if(actionStr=="delete"){
  			myObj["error"]   = "Work in progress";
			res.send(myObj);
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
				var subjectStr='Reset your ROOTCRM password';
				
				var urlStr= "http://"+req.headers.host+backendDirectoryPath;
				var bodyStr ='Hi '+document.firstname+',<br>Please click on the below link to reset your password:<br><a href="'+urlStr+'/reset_password?token='+result._id+'">'+urlStr+'/reset_password?token='+result._id+'</a>';
				var recipientStr='bwalia@tenthmatrix.co.uk';
				
				initFunctions.send_email(db, recipientStr, document.firstname, postJson.email, subjectStr, bodyStr, bodyStr, function(email_response) {
					if(email_response.error){
						res.redirect(backendDirectoryPath+'/forgot_password?error=email');
					}else{
						res.redirect(backendDirectoryPath+'/forgot_password?success=OK');
					}
				});
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
				initFunctions.saveSessionBeforeLogin(db, document._id, document.uuid_default_system, function(result) {
					if (result.success){
      					res.cookie(init.cookieName , result.cookie)
      					res.redirect(backendDirectoryPath+result.link);
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
						initFunctions.saveSessionBeforeLogin(db, document._id, document.uuid_default_system, function(result) {
							if (result.success){
      								res.cookie(init.cookieName , result.cookie)
      								res.redirect(backendDirectoryPath+result.link);
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
	
	db.collection(collectionStr).find({ $and:[ { timestamp_start: { $gte: schedulerFrom } },  { timestamp_start: { $lte: schedulerTo } } ] }).sort({modified: 1}).toArray(function(err, items) {
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
			/**if(uniqueFieldNameStr=="_id" && actionStr=="findOne"){
				initFunctions.returnFindOneByMongoID(db, collectionStr, uniqueFieldValueStr, function(resultObject) {
					res.send(resultObject);
				});
			}	else	{**/
				initFunctions.crudOpertions(db, collectionStr, actionStr, postContent, uniqueFieldNameStr, uniqueFieldValueStr, null, function(result) {
					res.send(result);
				});	
			//}
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

//change session for user selected system
app.get(backendDirectoryPath+'/swtich_user_system/', requireLogin, function(req, res) {
	var outputObj = new Object();
	
	if(req.authenticationBool){
		var tempID=req.query.id;
		tempID=new mongodb.ObjectID(tempID);
			
		db.collection("sessions").update({'user_id':req.authenticatedUser._id}, {'$set' : {"active_system_uuid" : tempID}}, (err, result) => {
			if(result){
    			outputObj["success"]   = "OK";
				res.send(outputObj);
    		}else{
    			outputObj["error"]   = "Error occurred while switch!";
				res.send(outputObj);
			}
    	});
	}else{
		outputObj["error"]   = "You are not authorizied!";
		res.send(outputObj);
	}
});

//get logged in user systems
app.get(backendDirectoryPath+'/fetch_user_systems/', requireLogin, function(req, res) {
	var outputObj = new Object();
	
	if(req.authenticationBool){
		var userSysArr= req.authenticatedUser.user_systems;
		if(typeof(columnsArr)!=="array" || typeof(columnsArr)!=="object"){
			userSysArr = JSON.parse(userSysArr);
		}
		
		var definedSystemArr=new Array();
		//loop and convert in mongo object id
		for (var i=0; i < userSysArr.length; i++) {
			var tempID=new mongodb.ObjectID(userSysArr[i]);
			definedSystemArr.push(tempID);
		}
		
		db.collection('systems').find({_id : { '$in': definedSystemArr }}).sort({name: 1}).toArray(function(err, items) {
			if (err) {
				outputObj["error"]   = 'not found';
				res.send(outputObj);
      		} else if (items) {
      			outputObj["aaData"]   = items;
      			res.send(outputObj);
      		}
		});
	}else{
		outputObj["error"]   = "You are not authorizied!";
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
				outputObj["error"]   = "no record found!";
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
	if(req.query.start){
		pageNum=parseInt(req.query.start);
	}
	if(req.query.limit){
		itemsPerPage=parseInt(req.query.limit);
	}
	if(pageNum==0){
		pageNum=1;
	}
	if(req.authenticationBool){
		var activeSystemsStr=req.authenticatedUser.active_system_uuid;
		if (typeof activeSystemsStr !== 'undefined' && activeSystemsStr !== null && activeSystemsStr!="") {
			
			if(templateStr!=""){
				initFunctions.templateSearch(db, templateStr, activeSystemsStr, req, function(resultObject) {
					res.send(resultObject);
				});
			}else if(collectionStr!=""){
				//var query="{ 'system_uuid': { $in: "+activeSystemsStr+" } ";
				var query="{";
				
				if(definedAdminTablesArr.indexOf(collectionStr)==-1){
					query+=" 'uuid_system': { $in: ['"+activeSystemsStr+"'] } ";
				}
				var total_records=0;
				var coll= db.collection(collectionStr);
				if(req.query.s){
     				//create text index
     				coll.createIndex({ "$**": "text" },{ name: "TextIndex" });
     				if(query!="{"){
     					query+=",";
     				}
     				query+=" '$text': { '$search': '"+req.query.s+"' } ";
     			}
     			query+= "}";
     			//console.log(query);
     			eval('var queryObj='+query);
     			
     			/**coll.find(queryObj).count(function (e, count) {
      				total_records= count;
      			});**/
				coll.find(queryObj).sort({modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
					if (err) {
						outputObj["total"]   = 0;
      					outputObj["error"]   = 'not found';
						res.send(outputObj);
      				} else if (items) {
      					total_records=items.length;
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
      		outputObj["error"]   = "No such page exists!";
			res.send(outputObj);
		}
	}else{
		outputObj["total"]   = 0;
      	outputObj["error"]   = "Authorization error!";
		res.send(outputObj);
	}
}); 

// fetch record detail api
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

//players list View
app.get(backendDirectoryPath+'/players', requireLogin, function(req, res) {
	if(req.authenticationBool){
		var queryString= req.query;
		var keywordStr="";
	
		if(queryString.keyword){
			keywordStr=queryString.keyword;
		}
		res.render(accessFilePath+'players', {
       		currentTemplate : '',
        	searched_keyword : keywordStr,
        	authenticatedUser : req.authenticatedUser
    	});
		/**initFunctions.crudOpertions(db, "system_templates", 'findOne', null, "code", "players", null, function(result) {
			if(result.success){
				res.render(accessFilePath+'players', {
       	 			currentTemplate : 'players',
        			searched_keyword : keywordStr,
        			authenticatedUser : req.authenticatedUser
    			});
    		}else{
    			res.render(accessFilePath+'players', {
       	 			currentTemplate : '',
        			searched_keyword : keywordStr,
        			authenticatedUser : req.authenticatedUser
    			});
    		}
    	});**/
    }else{
		res.redirect(backendDirectoryPath+'/sign-in');
	}
});

//separate listing api for players to search by various other options
app.get(backendDirectoryPath+'/api_fetch_players/', requireLogin, function(req, res) {
	var itemsPerPage = 10, pageNum=1, collectionStr="users";
	var outputObj = new Object();
		
	if(req.authenticationBool){
		var activeSystemsStr=req.authenticatedUser.active_system_uuid;
		if (typeof activeSystemsStr !== 'undefined' && activeSystemsStr !== null && activeSystemsStr!="") {
			
			if(collectionStr!=""){
				var coll= db.collection(collectionStr);    			
     			if(req.query.team){
     				initFunctions.returnFindOneByMongoID(db, 'teams', req.query.team, function(result) {
     					if(result.aaData)	{
     						var teamsData=result.aaData;
     						var usersListArr=teamsData.players;
     						
     						if(usersListArr.length>0){
     							var selectedUsersID=new Array();

     							for(var i=0; i<usersListArr.length; i++){
     								var tempID=new mongodb.ObjectID(usersListArr[i].user_uuid);
     								selectedUsersID.push(tempID);
     							}
     							var player_type_uuid="", searchTermStr="";
     							if(req.query.player_type_uuid){
									player_type_uuid= req.query.player_type_uuid;
     							}
     			
								if(req.query.s){
     								searchTermStr=req.query.s;	
     							}
     							
     							if(player_type_uuid!="" && searchTermStr==""){
     							coll.find({_id : { '$in': selectedUsersID }, player_type_uuid : req.query.player_type_uuid }).sort({modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
     								if (err) {
										outputObj["total"]   = 0;
      									outputObj["error"]   = 'not found';
										res.send(outputObj);
      								} else if (items) {
      									outputObj["total"]   = items.length;
      									outputObj["aaData"]   = items;
										res.send(outputObj);
     								}
								});
     							}
     							else if(player_type_uuid=="" && searchTermStr!=""){
     							coll.find({_id : { '$in': selectedUsersID }, $text: { '$search': searchTermStr } }).sort({modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
     								if (err) {
										outputObj["total"]   = 0;
      									outputObj["error"]   = 'not found';
										res.send(outputObj);
      								} else if (items) {
      									outputObj["total"]   = items.length;
      									outputObj["aaData"]   = items;
										res.send(outputObj);
     								}
								});
     							}
     							else if(player_type_uuid!="" && searchTermStr!=""){
     							coll.find({_id : { '$in': selectedUsersID }, player_type_uuid : req.query.player_type_uuid, $text: { '$search': searchTermStr } }).sort({modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
     								if (err) {
										outputObj["total"]   = 0;
      									outputObj["error"]   = 'not found';
										res.send(outputObj);
      								} else if (items) {
      									outputObj["total"]   = items.length;
      									outputObj["aaData"]   = items;
										res.send(outputObj);
     								}
								});
     							}
     							else{
     							coll.find({_id : { '$in': selectedUsersID } }).sort({modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
     								if (err) {
										outputObj["total"]   = 0;
      									outputObj["error"]   = 'not found';
										res.send(outputObj);
      								} else if (items) {
      									outputObj["total"]   = items.length;
      									outputObj["aaData"]   = items;
										res.send(outputObj);
     								}
								});
								}
							}else{
								outputObj["total"]   = 0;
      							outputObj["error"]   = 'not found';
								res.send(outputObj);
							}
     					}	else	{
     						outputObj["total"]   = 0;
      						outputObj["error"]   = 'not found';
							res.send(outputObj);
     					}
     				});
     			}	else	{
     				var query="{";
				
					/**if(definedAdminTablesArr.indexOf(collectionStr)==-1){
						query+=" 'uuid_system': { $in: ['"+activeSystemsStr+"'] } ";
					}**/
								
					if(req.query.player_type_uuid){
						if(query!="{"){
     						query+=",";
     					}
     					query+=" 'player_type_uuid' : '"+req.query.player_type_uuid+"' ";
     				}
     			
					if(req.query.s){
     					//create text index
     					coll.createIndex({ "$**": "text" },{ name: "TextIndex" });
     					if(query!="{"){
     						query+=",";
     					}
     					query+=" '$text': { '$search': '"+req.query.s+"' } ";
     				}
     				
     				query+= "}";
     				
     				eval('var queryObj='+query);
     			
					coll.find(queryObj).sort({modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
						if (err) {
							outputObj["total"]   = 0;
      						outputObj["error"]   = 'not found';
							res.send(outputObj);
      					} else if (items) {
      						outputObj["total"]   = items.length;
      						outputObj["aaData"]   = items;
							res.send(outputObj);
     					}
					});
				}
			}else{
				outputObj["total"]   = 0;
      			outputObj["error"]   = "No such page exists!";
				res.send(outputObj);
			}
			
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

// update players status
app.get(backendDirectoryPath+'/update_user_status', requireLogin, (req, res) => {
	var outputObj = new Object();
	if(req.authenticationBool){
		var search_id = req.query.id;
		var allow_web_access = req.query.allow_web_access;
	
		if(search_id!="" && allow_web_access!=""){
			db.collection('users').findAndModify({_id:new mongodb.ObjectID(search_id)}, [['_id','asc']], { $set: {"allow_web_access" : parseInt(allow_web_access)} }, {}, function(err, result) {
				if(err){
					outputObj["error"]   = "No such player found!";
					res.send(outputObj);
				}	else if (result){
					if(result.lastErrorObject.updatedExisting){
						outputObj["success"] ="OK";
      				}else{
      					outputObj["error"]   = 'Sorry, can\'t update player info, please try again!';
					}
      				res.send(outputObj);
      			}
  			});
		}else{
			outputObj["error"]   = "Please pass the required fields!";
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

//generate basic modules (have to add this option)
app.post(backendDirectoryPath+'/add_basic_modules', requireLogin, (req, res) => {
	if(req.authenticationBool){
		
	}else{
		res.redirect('/sign-in');
	}
})

//save default system for admin
app.post(backendDirectoryPath+'/default_system', requireLogin, (req, res) => {
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
	
		initFunctions.crudOpertions(db, table_nameStr, 'create', contentJson, unique_fieldStr, unique_fieldVal, null,function(result) {
    		if(result.success){
    			db.collection("users").update({_id:req.authenticatedUser._id}, {'$set' : {"uuid_default_system" : result._id, "user_systems" : new Array(result._id)}}, (err1	, result) => {
    				db.collection("session").update({'user_id':req.authenticatedUser._id}, {'$set' : {"active_system_uuid" : result._id}}, (err2	, result2) => {
    					res.redirect(backendDirectoryPath+'/default_system?success=Saved the basic details successfully!');
    				});
  				});
    		}
  		});

	}else{
		res.redirect('/sign-in');
	}
})

//save form
app.post(backendDirectoryPath+'/save/:id', requireLogin, (req, res) => {
	if(req.authenticationBool){
	var postJson=req.body;
	
	var contentJson = JSON.parse(req.body.data);	//all form content will be posted in field name="data"
	
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
	
	if(definedAdminTablesArr.indexOf(table_nameStr)==-1){
		contentJson['uuid_system'] = req.authenticatedUser.active_system_uuid.toString();
	}
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
      	
		initFunctions.crudOpertions(db, table_nameStr, 'findOne', null, null, null, checkForExistence, function(result) {
			if (result.success=="OK") {
      			var document=result.aaData;
      			
      			if(mongoIDField!="" && mongoIDField!="undefined" && mongoIDField!=null){
      				initFunctions.returnFindOneByMongoID(db, table_nameStr, mongoIDField, function(existingDoc) {
      					if (existingDoc.aaData) {
      						var existingDocument=existingDoc.aaData;
      						contentJson["created"]=existingDocument.created;
      						
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
      			contentJson.created=initFunctions.currentTimestamp();
      			
      			initFunctions.returnFindOneByMongoID(db, table_nameStr, mongoIDField, function(existingDoc) {
      				if (existingDoc.aaData) {
      					var existingDocument=existingDoc.aaData;
      					contentJson["created"]=existingDocument.created;
      				
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
				if(session_result.status==true || session_result.status=="true"){
				var returnUserDetsils = new Array();
				initFunctions.returnFindOneByMongoID(db, 'users', session_result.user_id, function(userDetails) {
					if(userDetails.error) return cb(null);
					if(userDetails.aaData){
						returnUserDetsils=userDetails.aaData;
						if(session_result.active_system_uuid){
							returnUserDetsils['active_system_uuid']=session_result.active_system_uuid;
						}
						return cb(returnUserDetsils);
					}
				});
				}else{
					return cb(null);
				}
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
