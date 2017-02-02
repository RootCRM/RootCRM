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
	*  server.js handles the whole app
	**/
	
'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init');
var initFunctions = require('./config/functions');	
var passwordHash = require('password-hash');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//db connection
var db;
init.MongoClient.connect(init.mongoConnUrl, function (err, database) {
	db=database;
  	if (err) {
    	console.log('Unable to connect to the mongoDB server. Error:', err);
  	} else {
   		console.log('Connection established to', init.mongoConnUrl);
   		
   		//add basic modules first & assign to admin user
   		
   		
   		//create admin user
   		initFunctions.crudOpertions(db, 'users', 'findOne', null, 'email', 'admin', null, function(result) {
   			if(result.aaData){
   				console.log("Amin user already exists!");
   				var userDetails=result.aaData;
   				
   				createAdminGroup(userDetails._id, function(g_response) {
      				console.log(g_response);
      			});
   			}	else	{
				var hashPasswordStr=passwordHash.generate('admin');
   				db.collection("users").save({"username" : "admin", "firstname" : "Webmaster", "lastname" : "", "gender" : "m", "email" : "webmaster@tenthtmatrix.co.uk", "password" : hashPasswordStr,  "access_rights_code" : "11", "status" : "1", "Created" : initFunctions.currentTimestamp()}, (err, result) => {
      				if (err) console.log(err);
      				if(result){
      					console.log("Created admin user successfully with _id : "+result["ops"][0]["_id"]);
      					createAdminGroup(result["ops"][0]["_id"], function(g_response) {
      						console.log(g_response);
      					});
    				}
  				});
  			}
  		});
  		
//create admin group
var createAdminGroup =function (createdMongoID, cb) {
	initFunctions.crudOpertions(db, 'groups', 'findOne', null, 'code', 'admin', null, function(result) {
   		if(result.aaData){
   			var groupDetails=result.aaData;
   			var usersArr=groupDetails.users_list;
   			var alreadyExistsBool=false;
   			
   			for(var key in usersArr) {
   				if(usersArr[key]==createdMongoID){
					alreadyExistsBool=true;
					break;
   				}
			}
			if(alreadyExistsBool){
				console.log("User already exists in admin group");
			} else{
				db.collection("groups").update({_id:groupDetails._id}, { $push: { "users_list": createdMongoID } }, (err, result) => {
   					console.log("Created admin user successfully!");
   				});
			}
   			
   		}	else	{
			db.collection("groups").save({"name" : "Admin", "code" : "admin", "status" : 1, "users_list" : new Array(createdMongoID), "modified" : initFunctions.currentTimestamp(), "Created" : initFunctions.currentTimestamp()}, (err, result) => {
      			if (err) return cb(null);
      			if(result){
    				console.log("Created admin user successfully!");
    				return cb(result["ops"][0]["_id"]);
    			}
  			});
    	}
  	});
}  		
  		
  		
  	}
});
