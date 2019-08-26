// = Packages =================================================
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
var mutipart= require('connect-multiparty');
const zeroFill = require('zero-fill');
var bigInt = require("big-integer");
const { base64encode, base64decode } = require('nodejs-base64');
// = Connection to MySQL =============================================
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "toor",
  database: "FYPV2",
  multipleStatements: true
});

con.connect(function(err) {
  if (err) throw err;
  console.log("mySQL Database Connected!");
});

// = Basic set-up =============================================
var mutipartMiddeware = mutipart();
const app = express();
// open port 3000 for server
var server = app.listen(3001, function () {
	var host = server.address().address
	var port = server.address().port
	
	console.log("Example app listening at http://%s:%s", host, port)
 })

app.use(express.static(path.join(__dirname, 'AdminLTE-2.4.10'))); // set as a default path to access the web application
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
// set up view engine for render
var engines = require('consolidate');
app.set('views', __dirname + '/AdminLTE-2.4.10/pages_new');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

// Page routing (Get Methods) =======================================================================
//Default Page is login.html
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/AdminLTE-2.4.10/login.html'));
});

app.get('/home', function(req, res) {
	if (req.session.loggedin) {
		// var sqlTopicQuery = "SELECT t.topicid, t.topicNAme, t.description FROM topic t";
		var sqlTopicQuery = "SELECT sr.userid, t.topicid, t.topicName, t.description FROM topic t \
		LEFT JOIN studentRecord sr on t.topicid = sr.topicid";

		con.query(sqlTopicQuery, function(error, results, fields){
			console.log("loginUser is "+req.session.username);
			console.log("userid is "+req.session.userid);
			console.log("FullName is "+req.session.fullName);
			console.log("UserType is "+req.session.userType);
			console.log()
			res.render("home.html",{username:req.session.username, userid:req.session.userid, fullName:req.session.fullName, 
			userType:req.session.userType, topicresults:JSON.stringify(results)}); // send with userID
		});
	} else {
		res.redirect('/');
	}
});

app.get('/profile', function(req, res) {
	if (req.session.loggedin) {
		var sqlProfileQuery = "SELECT c.userid, s.fullName, c.chattime, c.content FROM chat c INNER JOIN student s on c.userid = s.userid \
						UNION ALL \
						SELECT c.userid, l.fullName, c.chattime, c.content FROM chat c INNER JOIN lecturer l on c.userid = l.userid\
						ORDER BY chattime";
		con.query(sqlProfileQuery, function(error, results, fields){
		
			console.log("loginUser is "+req.session.username);
			console.log("userid is "+req.session.userid);
			console.log("FullName is "+req.session.fullName);
			console.log("UserType is "+req.session.userType);
			console.log("numOfTopicCompleted is "+req.session.numOfTopicCompleted);
			console.log("totalPoints is "+req.session.totalPoints);
			res.render("profile.html",{username:req.session.username, userid:req.session.userid, fullName:req.session.fullName, 
				userType:req.session.userType, numOfTopicCompleted:req.session.numOfTopicCompleted, totalPoints:req.session.totalPoints, 
				chatresults:JSON.stringify(results)}); // send with userID
		});
	} else {
		res.redirect('/');
	}
});

app.get('/signout', function(req, res) {
	if (req.session.loggedin) {
		req.session.destroy();
		res.redirect('/');
	} else {
		res.redirect('/');
	}
});

// = CJ ==================================================
// for admin to manage topics
app.get('/manageTopic', function(req, res) {
	if (req.session.loggedin) {
		con.query('SELECT * FROM topic LEFT JOIN lecturer ON topic.creator = lecturer.userid', function(error, results, fields) {
			//console.log(results)
			res.render("manageTopic.html",{userid:req.session.userid,fullName:req.session.fullName, 
			userType:req.session.userType, topicData:JSON.stringify(results)}); // send with userID
		});
	}else {
		res.redirect('/');
	}
});

// redirect the page to topic overview with the data
app.get('/topicOverview/:topicid', function(req, res){
	if (req.session.loggedin) {
		var sqlQuery = " \
		SELECT srecord.userid, srecord.topicid, lessonid, IFNULL(marks, 'NA') marks, fullName from studentRecord srecord \
		LEFT JOIN studentResult sresult ON srecord.userid = sresult.userid \
		LEFT JOIN student s ON srecord.userid = s.userid \
		WHERE srecord.topicid = ? ;\
		SELECT * FROM topic LEFT JOIN lecturer ON topic.creator = lecturer.userid where topicid = ?";

		con.query(sqlQuery,[req.params.topicid,req.params.topicid], function(error, results, fields) {
			console.log(results)
			var userid = results[1][0].userid;
			var numOfLesson = results[1][0].numOfLesson;
			var creator = results[1][0].fullName;
			var studentRecords = JSON.stringify(results[0]);
			
			res.render("topicOverview.html",{userid:userid, numOfLesson:numOfLesson, creator:creator, studentRecords:studentRecords,fullName:req.session.fullName, 
			userType:req.session.userType}); // send with userID
		});
	}else {
		res.redirect('/');
	}
});

app.get('/manage_Lesson/:topicid', function(req,res){
	if (req.session.loggedin) {
		var creator = req.session.fullName;
		var sqlQuery = "SELECT lesson.lessonid, lesson.topicid, lesson.title, lesson.details , lecturer.fullName, lesson.description, lesson.file from lesson \
		LEFT Join topic ON topic.topicid = lesson.topicid \
		LEFT Join lecturer ON topic.creator = lecturer.userid \
		WHERE lesson.topicid = ?";

		con.query(sqlQuery,[req.params.topicid], function(error, results, fields) {
			if(results.length >=1){
				var lessonList = JSON.stringify(results);
				//console.log(lessonDetails);
			}else{
				var lessonList = {};
				lessonList["lessonid"] = "-999";
				lessonList["topicid"] = req.params.topicid;
				lessonList = JSON.stringify(lessonList);
			}

			res.render("manageLesson.html",{creator:creator, lessonList:lessonList,fullName:req.session.fullName, 
			userType:req.session.userType}); // send with userID
		});
	}else {
		res.redirect('/');
	}
});

app.get('/manage_Quiz/:topicid', function(req, res){
	if (req.session.loggedin) {
		var creator = req.session.fullName;
		var sqlQuery = "select * from quiz where topicid = ?";
		con.query(sqlQuery,[req.params.topicid], function(err, results, fileds){
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				if(results.length > 0){ // have quiz created before
					var quizDetails = JSON.stringify(results);
				}else{ // no quiz
					var quizDetails = {}; // create the json 
					quizDetails["topicid"] = req.params.topicid;
					quizDetails["questionid"] = 0;
					quizDetails = JSON.stringify(quizDetails);
				}
				console.log(quizDetails);
				res.render("manageQuiz.html",{creator:creator,quizDetails:quizDetails,fullName:req.session.fullName, 
			userType:req.session.userType});
			}
		});
	}else {
		res.redirect('/');
	}
});

app.get('/manage_Lesson/:topicid/:fileName', function(req, res){
	const file = base64decode(req.params.fileName);
	res.download(file); // Set disposition and send it.
});

app.get('/viewHTMLLesson/:topicid/:lessonid', function(req, res){
	// TODO: all the creator might can use session function to pass
	if (req.session.loggedin) {
		var creator = req.session.fullName;

		var sqlQuery = "SELECT * FROM lesson where topicid = ? and lessonid = ?";
		con.query(sqlQuery,[req.params.topicid, req.params.lessonid], function(error, results, fields) {
			var lessonDetails = JSON.stringify(results);
			res.render("lessonHTML.html",{creator:creator,lessonDetails:lessonDetails,fullName:req.session.fullName, 
			userType:req.session.userType}); // send with userID
		});
	}else {
		res.redirect('/');
	}
});

app.get('/attendQuiz/:topicid', function(req, res){
	if (req.session.loggedin) {
		// TODO: change to based on session
		var studentName = req.session.fullName;
		var userid = req.session.userid;
		var topicid = req.params.topicid;

		var sqlQuery = "SELECT * FROM studentResult WHERE userid = ? AND topicid = ?;"; // get the current student quiz record for this topic
		sqlQuery += "SELECT * FROM quiz where topicid = ?"; //get all the question
		
		con.query(sqlQuery,[userid, topicid, topicid],function(err, results, fields){
			
			if(results[0][0]!=null){ // if the student attend before
				var quizDetails = JSON.stringify(results[0][0]);
			}else{ // if the student do not attend the quiz before
				//console.log(results[1]);
				var quizDetails = JSON.stringify(results[1]);
			}
			res.render("attendQuiz.html",{userid:userid,studentName:studentName,quizDetails:quizDetails,fullName:req.session.fullName, 
			userType:req.session.userType});
		});
	}else {
		res.redirect('/');
	}
});

app.get('/trapdoorAnimation', function(req, res){
	// TODO: change to based on session
	if (req.session.loggedin) {
		var studentName = req.session.fullName;
		var userid = req.session.userid;
			
		res.render("trapdoorCalculation.html",{userid:userid,studentName:studentName,fullName:req.session.fullName, userType:req.session.userType});
	}else {
		res.redirect('/');
	}
});

app.get('/attendLesson/:topicid/:lessonid', function(req, res){
	// TODO: change to based on session
	if (req.session.loggedin) {
		var studentName = req.session.fullName;
		var userid = req.session.userid;
		var topicid = req.params.topicid;
		var lessonid= req.params.lessonid;
	
		var sqlQuery = "SELECT * from studentRecord where topicid = ? and userid = ?;"; // check current user records
		sqlQuery += "SELECT count(*) maxLesson from lesson where topicid = ?;";
		sqlQuery += "SELECT * from lesson where topicid = ? and lessonid = ?"; // get the lesson records
		con.query(sqlQuery,[topicid,userid,topicid,topicid,lessonid],function(err, results, fields){
			
			if(results[0][0]!=null){ // student attend this topic before
				var currentRecord = results[0][0].lessonid;
				if(currentRecord != 0 && lessonid > currentRecord){
					//console.log("currentRecord:"+currentRecord+"  vs   "+lessonid);
	
					// update student recordsss
					sqlQuery = "UPDATE studentRecord set lessonid = ? where topicid = ? and userid = ?";
					con.query(sqlQuery,[lessonid,topicid,userid,],function(err1, results1, fields1){
						if (err1) throw err1; 
						console.log("Student lesson checkpoint updated, current lesson: " + lessonid); 
					});
				}
			}else{
				sqlQuery = "INSERT INTO studentRecord values (?,?,?)";
				con.query(sqlQuery,[userid,topicid,lessonid],function(err1, results1, fields1){
					if (err1) throw err1; 
					console.log("Student lesson checkpoint updated, current lesson: " + lessonid); 
				});
			}
			var maxLesson = results[1][0].maxLesson;
			if(lessonid==maxLesson){ // student hit the last lesson
				// update student recordsss
				sqlQuery = "UPDATE studentRecord set lessonid = 0 where topicid = ? and userid = ?";
				con.query(sqlQuery,[topicid,userid,],function(err1, results1, fields1){
					if (err1) throw err1; 
					console.log("Student lesson checkpoint updated (completed), current lesson: " + 0); 
				});
			}
			var lessonDetails = JSON.stringify(results[2]);
			
			res.render("attendLesson.html",{userid:userid,studentName:studentName,lessonDetails:lessonDetails,maxLesson:maxLesson,fullName:req.session.fullName, 
			userType:req.session.userType});
		});
	}else {
		res.redirect('/');
	}
});

app.get('/attendTopic/:topicid', function(req,res){
	if (req.session.loggedin) {
		var studentName = req.session.fullName;
		console.log(req.params.topicid);
	
		var topicid = req.params.topicid;
		var sqlQuery = "SELECT * FROM topic where topicid = ?;";
		sqlQuery += "SELECT * FROM lesson where topicid = ?";
	
		con.query(sqlQuery,[topicid, topicid],function(err, results, fields){
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				var topicDetails = JSON.stringify(results[0][0]);
				var lessonDetails = JSON.stringify(results[1]);
				console.log(lessonDetails);
				res.render("attendTopic.html", {studentName:studentName, topicDetails:topicDetails,lessonDetails:lessonDetails, fullName:req.session.fullName, 
			userType:req.session.userType});
			}
		}); 
	} else {
		res.redirect('/');
	}
});

// = /CJ=================================================

//ERROR 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
	if (req.session.loggedin) {
		res.sendFile( __dirname + "/AdminLTE-2.4.10/pages_new/" + "home.html" );
	} else {
		res.redirect('/');
	}
});

// Post methods ====================================================================================
app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
		con.query('SELECT user.userid, user.userType, s.fullName, s.numOfTopicCompleted, s.totalPoints \
			FROM user INNER JOIN student s ON user.userid = s.userid WHERE user.userid = ? AND user.password = ?'
		, [username, password], function(error, results, fields){
			if (results.length > 0) {
				req.session.username = username;
				req.session.userid = results[0].userid;
				req.session.userType = results[0].userType;
				req.session.fullName = results[0].fullName;
				req.session.numOfTopicCompleted = results[0].numOfTopicCompleted;
				req.session.totalPoints = results[0].totalPoints;
				req.session.loggedin = true;

				res.redirect('/home');
				res.end();
			} else {
				con.query('SELECT user.userid, user.userType, l.fullName \
					FROM user INNER JOIN lecturer l ON user.userid = l.userid WHERE user.userid = ? AND user.password = ?'
				, [username, password], function(error, results, fields){
					if (results.length > 0) {
						req.session.username = username;
						req.session.userid = results[0].userid;
						req.session.userType = results[0].userType;
						req.session.fullName = results[0].fullName;
						req.session.loggedin = true;

						res.redirect('/manageTopic');
						res.end();
					} else {
						res.send('Incorrect Username and/or Password!');
					}	
				});
			}
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

//Marcus's Post Methods
app.post('/chat_updateContent', function(req, res){
	// console.log("Nodejs >> /chat_updateContent")
	var userID = req.body.ajaxUserID;
	var chattime = req.body.ajaxChatTime;
	var chatcontent = req.body.ajaxContent;
	console.log(userID + " | " + chattime + " | " +chatcontent);	

	var sqlQuery = "INSERT INTO chat values (?,?,?)"; // userID, chattime, chatcontent
	con.query(sqlQuery, [userID, chattime, chatcontent], function(err, results) {
		if (err) {
			res.send(JSON.stringify(err));
		}else{
			// console.log("Chat recorded: " + results.affectedRows);
			res.redirect('/profile');
		}
	});

});

app.post('/student_enrollTopicID', function(req, res){
	// console.log("Nodejs >> /student_enrollTopicID")
	var userID = req.body.ajaxUserID;
	var enrollTopicID = req.body.ajaxEnrollTopicID;
	console.log(userID + " | " + enrollTopicID);	

	var sqlQuery = "INSERT INTO studentRecord values (?,?, -1)"; // userID, enrollTopicID, -1
	con.query(sqlQuery, [userID, enrollTopicID], function(err, results) {
		if (err) {
			res.send(JSON.stringify(err));
		}else{
			// console.log("Enroll recorded: " + results.affectedRows);
			res.redirect('/home');
		}
	});

});
// End of Marcus's Post Methods

// CJ ==================================================================
app.post('/manage_deleteTopic', function(req, res){
	console.log("Nodejs >> /manage_deleteTopic")
	var topicID = req.body.ajaxTopicID;
	console.log("The topic going to delete >> " + topicID);

	con.query('DELETE FROM topic WHERE topicid = ?', [topicID], function(err, results) {
		if (err) throw err; 
		console.log("Number of records deleted: " + results.affectedRows);  
	});

});

app.post('/manage_updateTopic', function(req, res){
	console.log("Nodejs >> /manage_udpateTopic")
	var topicID = req.body.ajaxTopicID;
	var topicName = req.body.ajaxNewTopicName;
	var topicDesc = req.body.ajaxNewTopicDescription;
	console.log("The topic going to update >> " + topicID);

	var sqlQuery = "UPDATE topic SET topicname = ?, description = ? WHERE topicid = ?";
	con.query(sqlQuery, [topicName, topicDesc, topicID], function(err, results) {
		if (err) throw err; 
		console.log("Number of records updated: " + results.affectedRows);
		res.send("Update successfully! (Please refresh the page)");
	});

});

app.post('/manage_createTopic', function(req, res){

	var topicid = req.body.ajaxNewTopicID;
	var creator = req.body.ajaxUserid;
	var topicName = req.body.ajaxNewTopicName;
	var topicDesc = req.body.ajaxNewTopicDescription;

	console.log(creator + " | " + topicName + " | " +topicDesc);
	var sqlQuery = "INSERT INTO topic values (?,?,?,0,?)"; // topic id, topic name, topic desc, num of lesson, creator
	con.query(sqlQuery, [topicid, topicName, topicDesc, creator], function(err, results) {
		if (err) {
			res.send(JSON.stringify(err));
		}else{
			console.log("Number of records inserted: " + results.affectedRows);
			res.send("Topic created successfully! (Please refresh the page!)");
		}
	});
});

app.post('/uploadFileAsLesson', mutipartMiddeware, function(req,res){
	console.log("In the file upload");
	console.log(req);
	console.log(req.body.actionType);

	var filePath = req.files.fileUpload.path;
	var origName = req.files.fileUpload.originalFilename;
	var fullDetail = origName + "-!@#@!-" + filePath;

	console.log(fullDetail); // the uploaded file object

	if(req.body.actionType=="update"){
		var sqlQuery = "Update lesson SET title = ?, details = ?, description = ? where topicid = ? and lessonid = ?"; 
		con.query(sqlQuery, [req.body.formlessonTitle, fullDetail, req.body.formlessonDesc, req.body.currentTopicID, req.body.lessonID], function(err, results) {
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				console.log("Number of records inserted: " + results.affectedRows);
				res.send('Update successfully created! Please back to the manage lesson page!');
			}
		});
	}else{
		var sqlQuery = "INSERT INTO lesson values (?,?,?,?,'Y',?)"; // lesson id, topic id, title, details, file, description
		con.query(sqlQuery, [req.body.lessonID, req.body.currentTopicID, req.body.formlessonTitle, fullDetail, req.body.formlessonDesc], function(err, results) {
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				sqlQuery = "UPDATE topic SET numOfLesson = numOfLesson + 1 WHERE topicid = ?";
				con.query(sqlQuery,[req.body.currentTopicID],function(err1, results1){
					if (err1) {
						console.log(err1);
					}else{
						console.log("Topic:NumOfLesson Updated");
					}
				});
				console.log("Number of records inserted: " + results.affectedRows);
				res.send('New lesson successfully created! Please back to the manage lesson page!');
			}
		});
	}
});

app.post('/lessonHTML',function(req, res){
	//console.log(req);
	if(req.body.ajaxActionType == "update"){
		var sqlQuery = "Update lesson SET title = ?, details = ?, description = ? where topicid = ? and lessonid = ?"; // lesson id, topic id, title, details, file, description
		con.query(sqlQuery, [req.body.ajaxLessonTitle, req.body.ajaxLessonText, req.body.ajaxLessonDesc,req.body.ajaxCurrentTopicID,req.body.ajaxLessonID], function(err, results) {
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				console.log("Number of records inserted: " + results.affectedRows);
				res.send('Lesson(HTML) successfully updated! Please refresh the page!');
			}
		});
	}else{ // insert a new lesson
		var sqlQuery = "INSERT INTO lesson values (?,?,?,?,'N',?)"; // lesson id, topic id, title, details, file, description
		con.query(sqlQuery, [req.body.ajaxLessonID, req.body.ajaxCurrentTopicID, req.body.ajaxLessonTitle, req.body.ajaxLessonText, req.body.ajaxLessonDesc], function(err, results) {
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				sqlQuery = "UPDATE topic SET numOfLesson = numOfLesson + 1 WHERE topicid = ?";
				con.query(sqlQuery,[req.body.ajaxCurrentTopicID],function(err1, results1){
					if (err1) {
						console.log(err1);
					}else{
						console.log("Topic:NumOfLesson Updated");
					}
				});
				console.log("Number of records inserted: " + results.affectedRows);
				res.send('New lesson(HTML) successfully created! Please refresh the page!');
			}
		});
	}
});

app.post('/updateQuizQuestion', function(req, res){
	//console.log(req);
	if(req.body.ajaxActionType == "update"){
		var sqlQuery = "Update quiz SET question = ?, answer = ?, rightAns = ? where topicid = ? and questionid = ?";
		con.query(sqlQuery,[req.body.ajaxQues, req.body.ajaxAns, req.body.ajaxRightAns, req.body.ajaxTopicID, req.body.ajaxQuesID],function(err, results, fields){
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				console.log("Number of records updated: " + results.affectedRows);
				res.send('Question updated!! Please refresh the page!');
			}
		});
	}else{
		var sqlQuery = "INSERT INTO quiz values (?,?,?,?,?)"; // questionid, topicid, question, answer, right ans
		con.query(sqlQuery,[req.body.ajaxQuesID, req.body.ajaxTopicID, req.body.ajaxQues, req.body.ajaxAns, req.body.ajaxRightAns],function(err, results, fields){
			if (err) {
				res.send(JSON.stringify(err));
			}else{
				console.log("Number of records inserted: " + results.affectedRows);
				res.send('New Question created! Please refresh the page!');
			}
		});
	}
});

app.post('/updateStudentResult', function(req, res){
	var sqlQuery = "INSERT INTO studentResult values (?,?,?);"; // insert new record for the quiz
	sqlQuery += "UPDATE student SET totalPoints = totalPoints + ? WHERE userid = ?"; // update student records
	con.query(sqlQuery,[req.body.ajaxUserID,req.body.ajaxTopicID,req.body.ajaxTotalPoint,req.body.ajaxTotalPoint,req.body.ajaxUserID],function(err,results,fields){
		if (err) {
			res.send(JSON.stringify(err));
		}else{
			res.send('Congrats! You have completed the quiz! <br />Your score is ');
		}
	});
});

// /CJ ==================================================================
//JH include start
// Set-up Trapdoor elements - Chujun 19/06
app.post('/initSetupFunc', function (req, res) {
   console.log("In Func::initSetup")

   // Variables creation
   var returnJson = {}; // a json object to return html
   var tempVar = 0;
   var tempString = "";
   var messageInBinary = [];
   var cipherText = [];
   var cipherElement = 0;
   var current = 0;
   var publicKey = [];
   var y = [];
   var decryptedMsgBinary = [];
   var decryptedMsg = "";

   // Get user init-setup value from html
   var tempPK = req.body.ajaxPrivateKey;
   var privateKey = tempPK.split(","); // split by ","
   var trapdoorSize = privateKey.length;
   var prime =  req.body.ajaxPrime;
   var multiplier = bigInt(req.body.ajaxMultiplier);
   var message = req.body.ajaxMessage;

   // Get the inverse of the multiplier
   var multiplierInverse = bigInt(multiplier).modInv(prime);
   console.log("multiplierInverse >> " + multiplierInverse);
   returnJson["multiplierInverse"] = multiplierInverse;

   // *** THE FOR LOOP MIGHT BE TOO MUCH, CAN BE BETTER ***

   // Computing public key = private key x multiplier mod prime
   for(var i = 0; i < trapdoorSize;i++){
      tempVar = privateKey[i] * multiplier % prime;
      publicKey[i] = tempVar;
   }
   console.log("publicKey >> " + publicKey);
   returnJson["publicKey"] = publicKey.toString();

   // Conver message to binary based on ascii
   for(var i = 0; i < message.length;i++){
      tempVar = message.charCodeAt(i).toString(2); // conver per char to binary
      tempVar = zeroFill(8, tempVar); // zero padding (size for ascii should be 8)
      tempString = tempString + tempVar;
      //messageInBinary[i] = tempVar;
   }
   // Split message to the block
   var regex = ".{1,"+trapdoorSize+"}";
   messageInBinary = tempString.match(new RegExp(regex,'g'));
   // Pad 0 for the last block
   console.log("messageInBinary >> "+messageInBinary[0]);
   returnJson["messageInBinary"] = messageInBinary.toString();

   // Encrypt messageBinary with public key (count from the back)
   for(var position = 0; position < messageInBinary.length; position++){
      cipherElement = 0;
      current = messageInBinary[position];
      
      for (var i = current.length-1; i >=0; i--){
         tempVar = current.charAt(i);
         if (tempVar == '1'){
            cipherElement = cipherElement + publicKey[i];
         }
      }
      cipherText[position] = cipherElement;
   }
   console.log("cipherText >> "+cipherText);
   returnJson["cipherText"] = cipherText.toString();

   // Decrypt the message
   for(var position = 0; position < cipherText.length; position++){
      current = multiplierInverse * cipherText[position] % prime; // y = a^-1 x T mod p
      y[position] = current;

      tempVar = "";
      for(var i = trapdoorSize-1; i >= 0; i--){
         // Compare current cipher text with trapdoor element
         if(current >= privateKey[i]){ // if cipher text is bigger append 1 infront
            current = current - privateKey[i];
            tempVar = "1" + tempVar;
         }else{
            tempVar = "0" + tempVar; // append 0 infront
         }
      }
      decryptedMsgBinary[position] = tempVar; // binary format
   }
   console.log("y >> "+y);
   returnJson["y"] = y.toString();
   console.log("decryptedMsgBinary >> "+decryptedMsgBinary);
   returnJson["decryptedMsgBinary"] = decryptedMsgBinary.toString();

   tempString = "";
   for(var i = 0; i < decryptedMsgBinary.length; i++){
      tempString = tempString + decryptedMsgBinary[i];
      // tempVar = String.fromCharCode(parseInt(decryptedMsgBinary[i], 2).toString(10));
      // decryptedMsg = decryptedMsg + tempVar;
   }
   console.log("tempString: "+tempString);
   var tempArray = tempString.match(/.{1,8}/g);
   for(var i = 0; i < tempArray.length; i++){
      tempVar = String.fromCharCode(parseInt(tempArray[i], 2).toString(10));
      decryptedMsg = decryptedMsg + tempVar;
   }
   console.log("decryptedMsg >> "+decryptedMsg);
   returnJson["decryptedMsg"] = decryptedMsg;

   res.send(returnJson);
});
//JH include end