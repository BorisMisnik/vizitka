var express = require("express");
var app = express();
var Parse = require('parse').Parse;
var fs = require('fs');
var async = require('async');
var CronJob = require('cron').CronJob;

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('SHEcyBuLZHi6eUGzQCHTEA');

var APP_ID = "wPfUNl194r9U53Ag5VCSBsl6E7iEMLJTKUb6lFmg";
var JS_KEY = "Eaprg5rnlfp7GfpmPFN8q6w66toFyiOG8OYWKFki";

Parse.initialize(APP_ID, JS_KEY);

var BCard = Parse.Object.extend('BCard');
var query = new Parse.Query(BCard);
var job = new CronJob ('* * * * *', function (){
	var message = {
					"html": 'Hello',
					"subject": "Твоя візитка готова!",
					"from_email": "rothmans@com.ua",
					"from_name": "Rothmans",
					"to": [{email : 'misnikb@gmail.com'}],
					"attachments" : []
				};
fs.readFile('/img/ctmp1.png', 'binary', function(err, fon){
	if( err ) console.log(err);
	fonBase64 = new Buffer(fon, 'binary').toString('base64');
	var fon = {
		type: 'image/png',
		name: 'BACK.png',
		content : fonBase64
	}
	message.attachments.push(fon);
	mandrill_client.messages.send({
						"message": message, 
						"async": false, 
						"ip_pool": "Main Pool"}, function(result) {
							if( result[0].status === 'queued' || result[0].status === 'sent' ){
								console.log( result )
							}
							else{
								callback( 'ERROR ' + item.get('type') );
							}
					}, function(e) {
						callback( 'A mandrill error occurred: ' + e.name + ' - ' + e.message )
					});
})

})



query.equalTo('send', false);
	query.find({
		success: function(cards) {
			async.each(cards, function (item, callback){
				var base64Data = item.get('dataimg').replace(/^data:image\/png;base64,/,"");
				var fon = item.get('fon');
				var id = item.id;
				var fonBase64 = '';

				var email = item.get('type');

				if( !validateEmail (email) ) return;

				var html = '';
				html += '<h1>Привіт!</h1>'
				html += '<p>Підкреслюй свій стиль за допомогою персональної візитки у додатку.<br/><br/>Приємного дня!</p>';

				var imageToEmail = {
					type: 'image/png',
					name: 'FRONT.png',
					content : base64Data
				};

				var message = {
					"html": html,
					"subject": "Твоя візитка готова!",
					"from_email": "rothmans@com.ua",
					"from_name": "Rothmans",
					"to": [],
					"attachments" : []
				};

				message.attachments.push(imageToEmail);
				message.to.push({"email" : email});

				if( !fon ){
					sendEmail ();
				}
				else{
					fs.readFile(fon, 'binary', function(err, fon){
						if( err ) return;
						fonBase64 = new Buffer(fon, 'binary').toString('base64');
						var fon = {
							type: 'image/png',
							name: 'BACK.png',
							content : fonBase64
						}
						message.attachments.push(fon);
						sendEmail();
					})
				}

				function sendEmail (){
					mandrill_client.messages.send({
						"message": message, 
						"async": false, 
						"ip_pool": "Main Pool"}, function(result) {
							if( result[0].status === 'queued' || result[0].status === 'sent' ){
								query.get(id, {
									success: function(email) {
										email.set("send", true);
										email.save();
										callback( null );
										console.log( 'Email sent' );
									},
									error : function ( err ){
										console.log( 'Parse update error' );
										console.log( err );
										callback ( 'Parse update error' );
									}
								});
							}
							else{
								callback( 'ERROR ' + item.get('type') );
							}
					}, function(e) {
						callback( 'A mandrill error occurred: ' + e.name + ' - ' + e.message )
					});
				}
			},
			function (err){
				if( err ) return console.log( err );
			});
		},
		error : function ( err ){
			console.log( 'Parse find error' );
			console.log( err );
		}
	});



function randomName(){
	var str = '12345677890qwertyuioplkjhgfdsazxcvbnm';
	var result = '';
	var i = 5;
	while( i > 0 ){
		var number = Math.floor((Math.random() * str.length));
		result = result + str[number];
		i--;
	}
	return result + '.png';
};

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

var http = require('http');
http.createServer(function (req, res) {
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

