var express = require('express');
var app = express();

var mysql = require('mysql');

var http = require('request');



var alarm = '0';
var message = '';
var emergency_id='0';

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@iceenco@2018',
  database: 'ICE'
});




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function Emergency_notification(){
	
}

function topicSubscribe(token){
	
}

function topicUnsubscribe(token){
	
}


connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
})

connection.query('select * from ice_setting',
	function(err, results) {
	if (err) throw err
		Object.keys(results).forEach(function(key) {
		var row = results[key];
		if(row.option == 'CURRENT_STATUS')
			alarm = row.value;
		if(row.option == 'CURRENT_MESSAGE')
			message = row.value;
		if(row.option == 'LAST_EMERGENCY_ID')
			emergency_id = row.value;
	});
	if(alarm=='0'){
		message='';
		emergency_id='0';
	}
	
});

app.get('/', (req, res) => {
  res.send('OK')
})

app.post('/login', (req, res) => {
	if(req.body.username && req.body.password && req.body.notiToken){
		/*
		connection.query('select FirstName,LastName,EmployeeNumber,b.Description Department,c.Description Building'
		+',\'\' Floor ,\'\' Phone,username,uuid,img_profile from PersonTable a '
		+'left join DepartmentTable b on a.DepartmentId=b.Id '
		+'left join FacilityTable c on a.FacilityId=c.Id WHERE username="'+req.body.username+'" '
		+'and password="'+req.body.password+'" LIMIT 1', 
		*/
		connection.query('select * from ice_users WHERE username="'+req.body.username+'" '
		+'and password="'+req.body.password+'" order by Id desc LIMIT 1',
		function(err, results) {
			if (err) throw err;
			if(results.length > 0){
				if(req.body.uuid == results[0].uuid){
					results[0].success = true;
					results[0].message = 'Logged in succesful.';
					res.send(JSON.stringify(results[0]));
				}else /*if(results[0].uuid == '')*/{
						
						connection.query('update ice_users set uuid="'+req.body.uuid+'",active=1,notiToken="'+req.body.notiToken+'" WHERE username="'+req.body.username+'" '
						+'and password="'+req.body.password+'" order by Id desc LIMIT 1', function(err, results1) {
							if (err) throw err
							//if(results1.changedRows > 0){
								results[0].uuid = req.body.uuid;
								results[0].success = true;
								results[0].message = 'Logged in succesful.';
								
								
								http.post({
									url: 'https://iid.googleapis.com/iid/v1/'+req.body.notiToken+'/rel/topics/ice', 
									headers: {
										'Content-Type': 'application/json',
										'Authorization': 'key=AAAAupraLxs:APA91bGSdQ1qaLTb7oIpNAIGbMSySwxU3omr65z33zpXFLnHswKS-bJPzKsmesG8lXo1V0jnQFkUETcDWOTQr1CYbXlFuS8Ujcf7foSQW6jyyfxDW4cT63op5quySTnoGi-Ny5lZDr2XWQvsaMzL0UPTJUEH8C7X8g'
									}
								}, function(error, response, body) {
									res.send(JSON.stringify(results[0]));
								})
												
								
							//}else
							//	res.send({success : false, message : 'Please check your input.'});
						})
					
				}/*else{
					res.send({success : false, message : 'Wrong UUID. Please contact administrator .'});
				}*/
				
			}else{
				res.send({success : false, message : 'Please check your username or password.'});
			}
			
		})
	}else{
		res.send({success : false, message : 'Please inform all data.'});
	}

})

app.post('/changepass', (req, res) => {
	if(req.body.Id && req.body.oldpass && req.body.newpass){
		connection.query('update ice_users set password="'+req.body.newpass+'" WHERE Id='+req.body.Id+' '
		+'and password="'+req.body.oldpass+'"', 
		function(err, results) {
			if (err) throw err
			console.log(results)
			if(results.changedRows > 0)
				res.send({success : true, message : 'Your password has been changed.'});
			else
				res.send({success : false, message : 'Please check your input.'});
		})
	}else{
		res.send({success : false, message : 'Please inform all data.'})
	}

})

app.post('/uploadProfile', (req, res) => {
	if(req.body.Id && req.body.img_profile){
		connection.query('update ice_users set imgProfile="'+req.body.img_profile+'" WHERE Id='+req.body.Id+' ', 
		function(err, results) {
			if (err) throw err
			console.log(results)
			if(results.changedRows > 0)
				res.send({success : true, message : 'Your profile picture has been updated.'});
			else
				res.send({success : false, message : 'Please check your input.'});
		})
	}else{
		res.send({success : false, message : 'Please inform all data.'})
	}

})

app.post('/updateVital', (req, res) => {
	if(req.body.Id && req.body.department && req.body.building && req.body.floor && req.body.phone && req.body.phoneemer && req.body.email){
		connection.query('update ice_users set Department="'+req.body.department+'",Building="'+req.body.building+'",Floor="'+req.body.floor+'",Phone="'+req.body.phone+'",PhoneEmer="'+req.body.phoneemer+'",email="'+req.body.email+'" WHERE Id='+req.body.Id+' ', 
		function(err, results) {
			if (err) throw err
			console.log(results)
			if(results.changedRows > 0)
				res.send({success : true, message : 'Your vital data has been set.'});
			else
				res.send({success : false, message : 'Please check your input.'});
		})
	}else{
		res.send({success : false, message : 'Please inform all data.'})
	}

})

app.post('/updateMedical', (req, res) => {
	if(req.body.Id && req.body.dateofbirth && req.body.allergies && req.body.bloodtype && req.body.weight && req.body.height){
		connection.query('update ice_users set DateOfBirth="'+req.body.dateofbirth+'",Allergies="'+req.body.allergies+'",BloodType="'+req.body.bloodtype
		+'",Weight'+req.body.weight+'",Height="'+req.body.height
		+'" WHERE Id='+req.body.Id+' ', 
		function(err, results) {
			if (err) throw err
			console.log(results)
			if(results.changedRows > 0)
				res.send({success : true, message : 'Your medical data has been set.'});
			else
				res.send({success : false, message : 'Please check your input.'});
		})
	}else{
		res.send({success : false, message : 'Please inform all data.'})
	}

}) 

app.post('/checkin', (req, res) => {
	if(req.body.Id){
		
		if(emergency_id == '0')
			res.send({success : true, message : 'Your are already safe. No alarm right now'});
		else{
			connection.query('update ice_user_emergency set user_emer_status=1 WHERE emergency_id='+emergency_id+' and user_id='+req.body.Id+' ', 
			function(err, results) {
				if (err) throw err
				console.log(results)
				if(results.changedRows > 0)
					res.send({success : true, message : 'Your are safe.'});
				else
					res.send({success : false, message : 'Please check your input.'});
			})
		}
		
	}else{
		res.send({success : false, message : 'Please inform all data.'})
	}

})


app.post('/emergency', (req, res) => {
	if(req.body.Id){
		connection.query('update ice_user_emergency set user_emer_status=2 WHERE emergency_id='+emergency_id+' and user_id='+req.body.Id+' ', 
		function(err, results) {
			if (err) throw err
			console.log(results)
			if(results.changedRows > 0)
				res.send({success : true, message : 'Wait for help.'});
			else
				res.send({success : false, message : 'Please check your input.'});
		})
	}else{
		res.send({success : false, message : 'Please inform all data.'})
	}

}) 

var count=0;
app.post('/getAlarm', function(request, response){
   response.send({'alarm' : emergency_id,'message' : message});    // echo the result back
})

app.get('/setAlarm', function(request, response){
	connection.query('select * from ice_setting',
		function(err, results) {
		if (err) throw err
			Object.keys(results).forEach(function(key) {
			var row = results[key];
			if(row.option == 'CURRENT_STATUS')
				alarm = row.value;
				if(row.option == 'CURRENT_MESSAGE')
					message = row.value;
				if(row.option == 'LAST_EMERGENCY_ID')
					emergency_id = row.value;
				 

			    // echo the result back
		});
		
		if(alarm == 1){
			http.post({
				url: 'https://fcm.googleapis.com/fcm/send', 
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'key=AAAAupraLxs:APA91bGSdQ1qaLTb7oIpNAIGbMSySwxU3omr65z33zpXFLnHswKS-bJPzKsmesG8lXo1V0jnQFkUETcDWOTQr1CYbXlFuS8Ujcf7foSQW6jyyfxDW4cT63op5quySTnoGi-Ny5lZDr2XWQvsaMzL0UPTJUEH8C7X8g'
				},
				 json: {
						  "to" : "/topics/ice",
						  "priority" : "high",
						  "notification" : {
							"title" : "Alert",
							"body" : message,
							"icon" : "ic_launcher",
							"color" : "#f1c40f",
							"sound" : "default"
						  },
						  "collapse_key" : "1",
						  "time_to_live" : 86400
						}
			}, function(error, response, body) {
				//console.log(response) 
				//response.send('OK');
			})
		}else{
			emergency_id='0';
			message='';
		}
		response.send({success:true});
	});
   
})

app.post('/subscribe', function(request, response){
	if(req.body.token){
		http.post({
			url: 'https://iid.googleapis.com/iid/v1/'+req.body.token+'/rel/topics/ice', 
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'key=AAAAupraLxs:APA91bGSdQ1qaLTb7oIpNAIGbMSySwxU3omr65z33zpXFLnHswKS-bJPzKsmesG8lXo1V0jnQFkUETcDWOTQr1CYbXlFuS8Ujcf7foSQW6jyyfxDW4cT63op5quySTnoGi-Ny5lZDr2XWQvsaMzL0UPTJUEH8C7X8g'
			}
		}, function(error, response, body) {
			response.send({success:true});
		})
	}
})

app.post('/unsubscribe', function(request, response){
	if(req.body.token){
		http.post({
			url: 'https://iid.googleapis.com/iid/v1:batchRemove', 
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'key=AAAAupraLxs:APA91bGSdQ1qaLTb7oIpNAIGbMSySwxU3omr65z33zpXFLnHswKS-bJPzKsmesG8lXo1V0jnQFkUETcDWOTQr1CYbXlFuS8Ujcf7foSQW6jyyfxDW4cT63op5quySTnoGi-Ny5lZDr2XWQvsaMzL0UPTJUEH8C7X8g'
			},
			json: 
				{
				  "to" : "/topics/ice",
				  "registration_tokens" : [req.body.token]
				}

		}, function(error, response, body) {
			response.send({success:true});
		})
	}
})


app.listen(8080, () => {
  console.log('Start server at port 8080.')
  
})