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
	var url = 'mongodb://localhost:27017/tenthmatrix_live';
	
	var _db;
	var definedAdminTablesArr= new Array("systems", "Country", "availability", "authentication_token", "email_queue");
	module.exports = {
    	mongodb : mongodbRe,
    	MongoClient : MongoClient,
    	mongoConnUrl : url,
    	port : 3004,
		cookieName : "root_login",
		backendDirectoryPath : "/rootcms",
		backendDirectoryName : "rootcms",
		adminTablesArr : definedAdminTablesArr,
		system_name : "HHTCC Club",
		recipientStr : 'bwalia@tenthmatrix.co.uk',
		websiteUrl : 'http://hhtcc.club',
		appUrl : 'http://hhtcc.club/rootcms'
	};