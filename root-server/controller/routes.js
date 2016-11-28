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
	db.collection('authentication_token').findOne({"_id" : mongoIDField, "status" :true}, function(err, document) {
		if (document) {
			//console.log(document);
			if (typeof postJson.password !== 'undefined' && postJson.password !== null && postJson.password != "") {
      			postJson['password'] = passwordHash.generate(postJson.password);
      		}
			db.collection('users').findAndModify({_id:document.user_id}, [['_id','asc']], { $set: {"password" : postJson.password} }, {}, function(err, result) {
				db.collection('authentication_token').remove({"_id":mongoIDField},function(err,result){
    				res.redirect(backendDirectoryPath+'/sign-in?success=reset');
    			});
			});
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
	eval('var obj='+checkForExistence);
	db.collection('users').findOne(obj, function(err, document) {
		if (document) {
			db.collection('authentication_token').save({"user_id": document._id, "status" : true}, (err, result) => {
				var insertEmail=new Object();
				insertEmail["sender_name"]=document.firstname;
				insertEmail["sender_email"]=postJson.email;
				insertEmail["subject"]='Reset your ROOTCRM password';
				insertEmail["body"]='Hi '+document.firstname+',<br>Please click on the below link to reset your password:<br><a href="'+backendDirectoryPath+'/reset_password?token='+result["ops"][0]["_id"]+'">'+backendDirectoryPath+'/reset_password?token='+result["ops"][0]["_id"]+'</a>';
				insertEmail["created"]=initFunctions.currentTimestamp();
				insertEmail["modified"]=initFunctions.currentTimestamp();
				insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
				insertEmail["status"]=0;
				db.collection("email_queue").save(insertEmail, (err, e_result) => {
					if(err){
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
	eval('var obj='+checkForExistence);
	db.collection('users').findOne(obj, function(err, document) {
		if (document) {
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
					//console.log(err);
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

//api to insert, update or delete
app.get(backendDirectoryPath+'/api_crud/', requireLogin, function(req, res) {
	var uniqueFieldNameStr = "", uniqueFieldValueStr="", actionStr="", collectionStr="";
	var outputObj = new Object();
	
	if(req.authenticationBool){
		var postContent=req.query;
		console.log(postContent);
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
		postContent.Modified=initFunctions.currentTimestamp();
		
		if(collectionStr!=""){
			if(uniqueFieldNameStr!="" && uniqueFieldValueStr!=""){
			var checkForExistenceObj= '{'+uniqueFieldNameStr +': \''+uniqueFieldValueStr+'\'}';
			eval('var findStr='+checkForExistenceObj);
			switch (actionStr) {
    			case 'findOne':
        			db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
        				if(document){
      						outputObj["success"] = uniqueFieldValueStr+" exists!";
      						outputObj["aaData"] = document;
      						res.send(outputObj);
      					}else{
      						outputObj["error"]   = "No results found!";
							res.send(outputObj);
      					}
					});
        			break;
        		case 'create':
        			db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
        				if (searchErr) {
        					outputObj["error"]   = "Error occurred while saving ["+searchErr+"], please try after some time!";
							res.send(outputObj);
      					}else if(document){
      						outputObj["error"] = "This "+uniqueFieldValueStr+" already exists!"
      						res.send(outputObj);
      					}else{
      						postContent.Created=initFunctions.currentTimestamp();
      						db.collection(collectionStr).save(postContent, (err4, result) => {
      							if (err4) outputObj["error"]  = "Error occurred while saving ["+err4+"], please try after some time!";
    							outputObj["success"]  = uniqueFieldValueStr+" saved successfully!";
    							res.send(outputObj);
  							});
      					}
					});
        			break;
    			case 'update':
    				db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
        				if(document){
      						db.collection(collectionStr).update(findStr, postContent, (err1	, result) => {
    							if (err1) outputObj["error"]="Error occurred while updating ["+err1+"], please try after some time!";
    							outputObj["success"]= uniqueFieldValueStr+" updated successfully!";
    							res.send(outputObj);
  							});
						}else{
							outputObj["error"]   = "Error occurred while updating ["+searchErr+"], please try after some time!";
							res.send(outputObj);
						}
					});
       				break;
       			case 'delete':
       				db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
       					if(document){
							db.collection(table_nameStr).remove(findStr, function(err, result){
    							if (err1) outputObj["error"]="Error occurred while deleting ["+err1+"], please try after some time!";
    							outputObj["success"]="Deleted successfully!";
    							res.send(outputObj);
  							});
						}else {
							outputObj["error"]   = "Error occurred while deleting, please try after some time!";
							res.send(outputObj);
						}
					});
       				break;
    			default:
        			outputObj["error"]   = "Please specify the action!";
					res.send(outputObj);
			}
			}else{
				outputObj["error"]   = "Please specify unique field name and its value!";
				res.send(outputObj);
			}
		}else{
			outputObj["error"]   = "Please pass the collection name!";
			res.send(outputObj);
		}
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
			db.collection('system_templates').findOne({"code": templateStr , "status": { $in: [ 1, "1" ] } }, function(err, templateResponse) {
				if(err){
					outputObj["error"]   = "No such page exists!";
					res.send(outputObj);
				}
				if(templateResponse){
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
	pageRequested=accessFilePath+pageRequested;
	
	if(table_name!=""){
		var tokensArr= new Array();
		if (typeof editFieldVal !== 'undefined' && editFieldVal !== null) {
			
			if(editFieldName=="_id"){
				 initFunctions.returnFindOneByMongoID(db, table_name, editFieldVal, function(resultObject) {
					if(resultObject.error){
		   				//console.log(resultObject.error);
      				} else if (resultObject.aaData) {
      					contentObj=resultObject.aaData;
      				} 
      				if(table_name=="templates"){
      					initFunctions.returnActivetokens(db, function(result) {
      						res.render(pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : result,
       							authenticatedUser : req.authenticatedUser
       						});
    					});
      				}else if(table_name=="bookmarks"){
      					initFunctions.returnActiveCategories(db,function(result) {
      						res.render(pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							categoriesdropdown : result,
       							authenticatedUser : req.authenticatedUser 
       						});
    					});
      				}else if(table_name=="system_templates"  || table_name=="modules"){
      					initFunctions.returnAllCollections(db, function(result) {	
							res.render(pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
      	 						collectionsArr : result,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : tokensArr,
       							authenticatedUser : req.authenticatedUser
    						});
						});
      				}else{
      					res.render(pageRequested, {
      	 					editorField : editFieldName,
      	 					editorValue : editFieldVal,
       						queryStr : req.query,
       						contentObj : contentObj,
       						tokens : tokensArr,
       						authenticatedUser : req.authenticatedUser
    					});
    				}
    			}); 
			}else{
				var queryStr="{'"+editFieldName+"': '"+editFieldVal+"'}";
				eval('var queryObj='+queryStr);
				db.collection(table_name).findOne(queryObj, function(err, document) {
					if (err) {
        				//console.log(err);
      				} else if (document) {
      					contentObj=document;
      				} 
      				//console.log(contentObj);
      				if(table_name=="templates"){
      					initFunctions.returnActivetokens(db, function(result) {
      						res.render(pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : result,
       							authenticatedUser : req.authenticatedUser
       						});
    					});
      				}else if(table_name=="bookmarks"){
      					initFunctions.returnActiveCategories(db,function(result) {
      						res.render(pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							categoriesdropdown : result,
       							authenticatedUser : req.authenticatedUser 
       						});
    					});
      				}else if(table_name=="system_templates" || table_name=="modules"){
      					initFunctions.returnAllCollections(db, function(result) {	
							res.render(pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
      	 						collectionsArr : result,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : tokensArr,
       							authenticatedUser : req.authenticatedUser
    						});
						});
      				}else{
      					res.render(pageRequested, {
      	 					editorField : editFieldName,
      	 					editorValue : editFieldVal,
       						queryStr : req.query,
       						contentObj : contentObj,
       						tokens : tokensArr,
       						authenticatedUser : req.authenticatedUser
    					});
    				}
    			});
    		} 
		}else{
			if(table_name=="templates"){
      			initFunctions.returnActivetokens(db, function(result) {
      				res.render(pageRequested, {
      	 				queryStr : req.query,
       					contentObj : contentObj,
       					tokens : result,
       					authenticatedUser : req.authenticatedUser 
       				});
    			});
      		}else if(table_name=="system_templates" || table_name=="modules"){
      			initFunctions.returnAllCollections(db, function(result) {	
					res.render(pageRequested, {
      	 				collectionsArr : result,
       					queryStr : req.query,
       					contentObj : contentObj,
       					authenticatedUser : req.authenticatedUser
    				});
						
				});
      		}else if(table_name=="bookmarks"){
      			initFunctions.returnActiveCategories(db,function(result) {
      				res.render(pageRequested, {
      	 				queryStr : req.query,
       					contentObj : contentObj,
       					categoriesdropdown : result,
       					authenticatedUser : req.authenticatedUser 
       				});
    			});
      		}else{
      			res.render(pageRequested, {
      	 			queryStr : req.query,
       				contentObj : contentObj,
       				tokens : tokensArr,
       				authenticatedUser : req.authenticatedUser
    			});
    		}	
  	  	}
  	}else {
    	res.redirect(backendDirectoryPath+'/index');
    }
    
    }else {
    	res.redirect(backendDirectoryPath+'/sign-in');
    }	
}); 

//save form
app.post(backendDirectoryPath+'/save/:id', requireLogin, (req, res) => {
	if(req.authenticationBool){
	var postJson=req.body;
	var idField="", editorFieldName="", editorFieldVal="", checkForExistence="";
	postJson.Modified=initFunctions.currentTimestamp();
	postJson.Created=initFunctions.currentTimestamp();
	var table_nameStr=postJson.table_name;
	var unique_fieldStr=postJson.unique_field;
	var unique_fieldVal="";
	var link =backendDirectoryPath+"/"+req.params.id;
	
	for(var key in postJson) {
		if(key==unique_fieldStr){
   		 unique_fieldVal= postJson[key];
   		}
	}
	if (typeof postJson.editorField !== 'undefined' && postJson.editorField !== null && postJson.editorField !== "") { 
		editorFieldName=postJson.editorField;
		delete postJson.editorField;
	}else if(postJson.editorField){
		delete postJson.editorField;
	}
	
	if (typeof postJson.editorValue !== 'undefined' && postJson.editorValue !== null && postJson.editorValue !== null) { 
		editorFieldVal=postJson.editorValue;
		delete postJson.editorValue;
	}else if(postJson.editorValue){
		delete postJson.editorValue;
	}
	if(postJson.id){
		idField=postJson.id;
		var mongoIDField= new mongodb.ObjectID(idField);
		delete postJson.id;
		if(editorFieldName=="" && editorFieldVal==""){
    		editorFieldName="id";
    		editorFieldVal=idField;
    	}
	}
	if(postJson.table_name){
		delete postJson.table_name;
	}
	if(postJson.unique_field){
		delete postJson.unique_field;
	}
	
	if(table_nameStr=="documents"){
		var insertDocument=new Object();
		insertDocument["Document"]=req.body.Document;
		insertDocument["Code"]=req.body.Code;
		insertDocument["Title"]=req.body.Title;
		insertDocument["MetaTagDescription"]=req.body.MetaTagDescription;
		insertDocument["MetaTagKeywords"]=req.body.MetaTagKeywords;
		insertDocument["PageTitle"]=req.body.PageTitle;
		insertDocument["Body"]=req.body.Body;
		insertDocument["Type"]=req.body.type;
		var publishedTimestamp=req.body.Published_timestamp;
		var publishedTimestampNum= (new Date(publishedTimestamp).getTime() / 1000).toFixed(0);
		insertDocument["Published_timestamp"]=publishedTimestampNum;
		
		if(req.body.image_path){
			var virtualObject = new Object();
			virtualObject["image_path"]=req.body.image_path;
			insertDocument["virtualFields"]=virtualObject;
		}
		
		
		if(req.body.chk_manual){
			insertDocument["AutoFormat"]=1;
		}else{
			insertDocument["AutoFormat"]=0;
		}
		
		if(req.body.chk_manual_metatags){
			insertDocument["AutoFormatMetaData"]=1;
		}else{
			insertDocument["AutoFormatMetaData"]=0;
		}
		
		if(req.body.Status==1 || req.body.Status=="1"){
			insertDocument["Status"]=1;
		}else{
			insertDocument["Status"]=0;
		}
		
		insertDocument["Modified"]=initFunctions.currentTimestamp();
		var objectArr= new Array();
		if(req.body.new_obj_code!="" && req.body.new_obj_code!=null && req.body.new_obj_code!="undefined"){
			var insertObject = new Object();
			insertObject["uuid"]=initFunctions.guid();
			insertObject["code"]=req.body.new_obj_code;
			insertObject["Modified"]=initFunctions.currentTimestamp();
			insertObject["name"]=req.body.new_obj_heading;
			insertObject["content"]=req.body.new_obj_content;
			insertObject["order_by"]=req.body.new_obj_order;
			insertObject["status"]=req.body.new_obj_status;
			if(req.body.new_obj_chk_manual){
				insertObject["chk_manual"]=1;
			}else{
				insertObject["chk_manual"]=0;
			}
			objectArr.push(insertObject);
		}
		
		if(req.body.obj_id){
			var subObjects=req.body.obj_id;
			for(var count=0; count < subObjects.length; count++){
				var uniqueStr=subObjects[count];
				if(req.body["obj_code_"+uniqueStr]!="" && req.body["obj_code_"+uniqueStr]!=null && req.body["obj_code_"+uniqueStr]!="undefined"){
				
				var insertObject = new Object();
				insertObject["uuid"]=initFunctions.guid();
				insertObject["code"]=req.body["obj_code_"+uniqueStr];
				insertObject["Modified"]=initFunctions.currentTimestamp();
				insertObject["name"]=req.body["obj_heading_"+uniqueStr];
				insertObject["content"]=req.body["obj_content__"+uniqueStr];
				insertObject["order_by"]=req.body["obj_order__"+uniqueStr];
				insertObject["status"]=req.body["obj_status_"+uniqueStr];
				if(req.body["obj_chk_manual__"+uniqueStr]){
					insertObject["chk_manual"]=1;
				}else{
					insertObject["chk_manual"]=0;
				}
				objectArr.push(insertObject);
				}
			}
		}
		insertDocument["Objects"]=objectArr;
		
		if(req.body.type=="blog"){
			var BlogCommentsArr= new Array();
			if(req.body.blog_id){
				var blogComments=req.body.blog_id;
				for(var count=0; count < blogComments.length; count++){
					var uniqueStr=blogComments[count];
					if(req.body["blog_name_"+uniqueStr]!="" && req.body["blog_name_"+uniqueStr]!=null && req.body["blog_name_"+uniqueStr]!="undefined"){
						var insertComment = new Object();
						insertComment["uuid"]=initFunctions.guid();
						insertComment["modified"]=initFunctions.currentTimestamp();
						insertComment["name"]=req.body["blog_name_"+uniqueStr];
						insertComment["email"]=req.body["blog_email_"+uniqueStr];
						insertComment["website"]=req.body["blog_website_"+uniqueStr];
						insertComment["comment"]=req.body["blog_comment_"+uniqueStr];
						insertComment["created"]=req.body["blog_created__"+uniqueStr];
						insertComment["status"]=req.body["blog_status__"+uniqueStr];
						BlogCommentsArr.push(insertComment);
					}
				}
			}
			insertDocument["BlogComments"]=BlogCommentsArr;
		}
		
		initFunctions.saveEntry(db, table_nameStr, checkForExistence, insertDocument, req.params.id, mongoIDField, unique_fieldStr, unique_fieldVal, function(result) {
			var tempLink="";
			if(editorFieldName!="" && editorFieldVal!=""){
    			tempLink+="?"+editorFieldName+"="+editorFieldVal;
    			link+=tempLink;
    		}
    		if(result){
    			if(tempLink!=""){
    				link+="&"+result;
    			}else{
    				link+="?"+result;
    			}
    		}
    		
			res.redirect(link);
  		});
		
	}
	else if(table_nameStr=="bookmarks"){
		checkForExistence= '{\''+unique_fieldStr +'\': \''+unique_fieldVal+'\', "categories": \''+req.body.categories+'\'}';

		initFunctions.saveEntry(db, table_nameStr, checkForExistence, postJson, req.params.id, mongoIDField, unique_fieldStr, unique_fieldVal, function(result) {
			var tempLink="";
			if(editorFieldName!="" && editorFieldVal!=""){
    			tempLink+="?"+editorFieldName+"="+editorFieldVal;
    			link+=tempLink;
    		}
    		if(result){
    			if(tempLink!=""){
    				link+="&"+result;
    			}else{
    				link+="?"+result;
    			}
    		}
    		
			res.redirect(link);
  		});
	}
	else if(table_nameStr=="email_queue"){
		db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      		if (existingDocument) {
      			postJson["Created"]=existingDocument.Created;
      			db.collection(table_nameStr).update({_id:mongoIDField}, postJson, (err, result) => {
    				if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
					if(editorFieldName!="" && editorFieldVal!=""){
    					link+="?"+editorFieldName+"="+editorFieldVal;
    				}else{
						link+="?_id="+idField;
					}
    				res.redirect(link)
  				});
      		}else{
      			postJson.Created=initFunctions.currentTimestamp();
      			db.collection(table_nameStr).save(postJson, (err, result) => {
      				if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
    				link+="?success_msg=Saved successfully!";
    				res.redirect(link)
  				});
      		}
      	});
	}
	else if(table_nameStr=="users"){
		if (typeof postJson.password !== 'undefined' && postJson.password !== null && postJson.password != "") {
      		postJson['password'] = passwordHash.generate(postJson.password);
      	}
      	checkForExistence= '{'+unique_fieldStr +': \''+unique_fieldVal+'\'}';
      	eval('var obj='+checkForExistence);
		db.collection(table_nameStr).findOne(obj, function(err, document) {
			if (err) {
        		if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
      		} else if (document) {
      			db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      				if (existingDocument) {
      					postJson["Created"]=existingDocument.Created;
      				
      					var  updaTeContent="{ $set: { ";
      					for(var key in postJson) {
							updaTeContent+="'"+key+"' : '"+postJson[key]+"',";
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
      					link+="?error_msg=This "+req.params.id+" already exists!"
      					res.redirect(link)
      				}
      			});
      		} else {
      			postJson.Created=initFunctions.currentTimestamp();
      			db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      				if (existingDocument) {
      					postJson["Created"]=existingDocument.Created;
      				
      					var  updaTeContent="{ $set: { ";
      					for(var key in postJson) {
							updaTeContent+="'"+key+"' : '"+postJson[key]+"',";
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
      					db.collection(table_nameStr).save(postJson, (err, result) => {
      						if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
    						link+="?success_msg=Saved successfully!";
    						res.redirect(link)
  						});
      				}
      			});
      		}
      	});
	}
	else{
		initFunctions.saveEntry(db, table_nameStr, checkForExistence, postJson, req.params.id, mongoIDField, unique_fieldStr, unique_fieldVal, function(result) {
			var tempLink="";
			if(editorFieldName!="" && editorFieldVal!=""){
    			tempLink+="?"+editorFieldName+"="+editorFieldVal;
    			link+=tempLink;		
    		}
    		if(result){
    			if(table_nameStr=="system_templates" && postJson!=""){
    				if(postJson.index_columns){
    					initFunctions.createIndexes(db, postJson.table, postJson.index_columns);
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
   		db.collection('sessions').findOne({_id: mongoIDField, "status" : true}, (err, session_result) => {
   			if(err)  return cb(null)
			db.collection("users").findOne({_id : session_result.user_id}, function(err1, userDetails) {
				if(err1) return cb(null)
				return cb(userDetails);
			});
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
