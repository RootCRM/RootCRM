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
	*  init.js
	**/
	
	var mongodbRe = require('mongodb')
	var MongoClient = mongodbRe.MongoClient;
	
	// Connection URL. This is where your mongodb server is running.
	var url = 'mongodb://localhost:27017/jobshout_db';
	var _db;
	module.exports = {
    	mongodb : mongodbRe,
    	MongoClient : MongoClient,
    	mongoConnUrl : url,
    	port : 3000
	};