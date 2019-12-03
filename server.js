const url  = require('url');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const mongoDBurl = 'mongodb+srv://g1211533:g1211533@cluster0-rjree.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'project';
const session = require('cookie-session');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var timestamp = null;

const SECRETKEY1 = 'I want to pass COMPS381F';
const SECRETKEY2 = 'Keep this to yourself';

app.set('view engine', 'ejs');

app.use(session({
  	name: 'session',
	keys: [SECRETKEY1,SECRETKEY2]
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const setCurrentTimestamp = (req, res, next) => {
	timestamp = new Date().toISOString();
	console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);
	next();
}

app.get('/', setCurrentTimestamp, (req, res) => {
	console.log(req.session);
	if (!req.session.authenticated) {
		res.redirect('/login');
	}
});


app.get('/login', (req,res) => {
	res.status(200).render('login');
});

app.post('/login', setCurrentTimestamp, (req, res) => {
	const client = new MongoClient(mongoDBurl);
	client.connect(
		(err) => {
			assert.equal(null, err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			const findUser = (db, callback) => {
				let cursor = db.collection('user').find()
				cursor.forEach((account) => {
					if (account.name == req.body.name && account.password == req.body.password) {
						req.session.authenticated = true;
						req.session.username = account.name;
						res.status(200).render('register_success');
					}
					else{
						res.status(200).render('fail');
						console.log('Invalid!');
					}
				});
				callback();
			}
			client.connect((err) => {
				assert.equal(null,err);
				console.log("Connected successfully to server");
				const db = client.db(dbName);
				findUser(db,() => {
					client.close();
				});
			});

		}
	);
});

app.listen(process.env.PORT || 8099);
