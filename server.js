const express = require('express');
const app = express();

const url  = require('url');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const mongoDBurl = 'mongodb+srv://g1211533:g1211533@cluster0-rjree.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'project';
const session = require('cookie-session');
const qs = require ('querystring');
const formidable = require('formidable');
const fs = require('fs');

var timestamp = null;

app.set('view engine', 'ejs');

const setCurrentTimestamp = (req, res, next) => {
	timestamp = new Date().toISOString();
	console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);
	next();
}

app.get('/', setCurrentTimestamp, (req, res) => {
	res.render('index', {});
});

app.post('/register', setCurrentTimestamp, (req, res) => {

	const data = req.body;
	const postdata = qs.parse(data);

	if (postdata.regpassword == postdata.confirmpassword) {

		const client = new MongoClient(mongoDBurl);
		client.connect(
			(err) => {

				assert.equal(null, err);
				console.log("Connected successfully to server");
				const db = client.db(dbName);
				try{
					let temp = '{ "name" :  "'+ postdata.regid + '", "password" : "' + postdata.regpassword + '"}';
					let obj ={};
					obj = JSON.parse(temp);
				} catch (err) {
					console.log('Invalid!');
				}

				db.collection('user').insertOne(obj,(err,result) => {
					res.send('<a href="/">Register Successfully!</a>');
				});

			}
		);

	} else {
		res.send('<a href="/">Confirm password should be match with the password!</a>');
	}
});

app.post('/login', setCurrentTimestamp, (req, res) => {

	const data = req.body;
	const postdata = qs.parse(data);

	const client = new MongoClient(mongoDBurl);
	client.connect(
		(err) => {

			assert.equal(null, err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			try{
				let temp = '{ "name" :  "'+ postdata.logid + '", "password" : "' + postdata.password + '"}';
				let obj ={};
				obj = JSON.parse(temp);
			} catch (err) {
				console.log('Invalid!');
			}

			db.collection('user').find(obj,(err,result) => {
				read_n_print(res,parseInt(max));
		   	});

		}
	);

});

const read_n_print = (res,max,criteria={}) => {
	const client = new MongoClient(mongoDBurl);
	client.connect((err) => {
		assert.equal(null,err);
		console.log("Connected successfully to server!");

		const db = client.db(dbName);
		findRestaurants(db, max, criteria, (restaurants) => {
			client.close();
			console.log('Disconnected MongoDB');
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write('<html><head><title>Restaurant</title></head>');
			res.write('<body><H1>Restaurants</H1>');
			res.write('<H2>Showing '+restaurants.length+' document(s)</H2>');
			res.write('<ol>');
			for (r of restaurants) {
				//console.log(r._id);
				res.write(`<li><a href='/showdetails?_id=${r._id}'>${r.name}</a></li>`)
			}
			res.write('</ol>');
			res.write('<br><a href="/insert">Create New Restaurant</a>')
			res.end('</body></html>');
		});
	});
}


var server = app.listen(8081, () => console.log('Listening on port 8081'));

