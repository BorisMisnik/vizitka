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
query.equalTo('send', false);

new CronJob('* * * * *', function(){
	query.find({
		success: function(cards) {
			async.each(cards, function (item, callback){
				var base64Data = item.get('dataimg').replace(/^data:image\/png;base64,/,"");
				var id = item.id;

				var name = randomName();
				var html = '';
				html += '<h1>Привіт!</h1>'
				html += '<p>Підкреслюй свій стиль за допомогою персональної візитки у додатку.<br/><br/>Приємного дня!</p>';

				var imageToEmail = {
					type: 'image/png',
					name: name,
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
				message.to.push({
					"email" : item.get('type')
				});
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
								},
								error : function ( err ){
									console.log( 'Parse update error' );
									console.log( err );
								}
							});
						}
						else{
							callback( 'ERROR ' + item.get('type') );
						}
				}, function(e) {
					callback( 'A mandrill error occurred: ' + e.name + ' - ' + e.message )
				});
			},
			function (err){
				if( err ) return console.log( err );
				console.log( 'Email sent' );
			});
		},
		error : function ( err ){
			console.log( 'Parse find error' );
			console.log( err );
		}
	});
}, null, true, "America/Los_Angeles");



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

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});