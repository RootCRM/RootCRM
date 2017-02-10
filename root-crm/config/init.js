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
	*  init.js handles the basic initial constants
	**/
	
	var mongodbRe = require('mongodb')
	var MongoClient = mongodbRe.MongoClient;
	
	// Connection URL. This is where your mongodb server is running.
	var url = 'mongodb://localhost:27017/root_cms';
	var _db;
	var definedAdminTablesArr= new Array("groups", "users", "modules", "system_templates", "systems");
	module.exports = {
    	mongodb : mongodbRe,
    	MongoClient : MongoClient,
    	mongoConnUrl : url,
    	port : 3001,
		cookieName : "root_login",
		backendDirectoryPath : "/rootcms",
		backendDirectoryName : "rootcms",
		adminTablesArr : definedAdminTablesArr
	};