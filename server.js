const http = require('http');
const url  = require('url');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const mongoDBurl = 'mongodb+srv://g1211533:g1211533@cluster0-rjree.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'project';
var session = require('cookie-session');
var express = require('express');
const qs = require ('querystring');
var formidable = require('formidable');
var fs = require('fs');

app = express();

const server = http.createServer((req,res) => {
	let timestamp = new Date().toISOString();
	console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);

	let parsedURL = url.parse(req.url,true); // true to get query as object
	let max = (parsedURL.query.max) ? parsedURL.query.max : 20;

	switch(parsedURL.pathname) {
		case '/register':
					if (req.method == 'POST') {
					let data = '';  // message body data
					// process data in message body
					req.on('data', (payload) => {
					   data += payload;
					});

					req.on('end', () => {
						let postdata = qs.parse(data);
						if (postdata.regpassword==postdata.confirmpassword){
						const client = new MongoClient(mongoDBurl);
						client.connect((err) => {
							assert.equal(null,err);
							console.log("Connected successfully to server");
							const db = client.db(dbName);
							try{
						temp = '{ "name" :  "'+ postdata.regid + '", "password" : "' + postdata.regpassword + '"}';
							obj ={};
							obj = JSON.parse(temp);
							} catch (err) {
								console.log('Invalid!');}

							db.collection('user').insertOne(obj,(err,result) => {
								res.writeHead(200, {'Content-Type': 'text/html'});
         						res.write('<html>')
         						res.write('<br><a href="/">Register Successfully!</a>')
        						res.end('</html>')
								});
						});

						} else {
								res.writeHead(200, {'Content-Type': 'text/html'});
								res.write('<html>')
         						res.write('<br><a href="/">Confirm password should be match with the password!</a>')
        						res.end('</html>')
								}

					 	})

				} else {
					res.writeHead(404, {'Content-Type': 'text/plain'});
					res.end('Error!')
				}

			break;
		case '/login':
				if (req.method == 'POST') {
					let data = '';  // message body data

					// process data in message body
					req.on('data', (payload) => {
					   data += payload;
					});

					req.on('end', () => {
						let postdata = qs.parse(data);

							const client = new MongoClient(mongoDBurl);
						client.connect((err) => {
							assert.equal(null,err);
							console.log("Connected successfully to server!");
							const db = client.db(dbName);
							try{
							temp = '{ "name" :  "'+ postdata.logid + '", "password" : "' + postdata.password + '"}';
							obj ={};
							obj = JSON.parse(temp);
							} catch (err) {
								console.log('Invalid!');
								}
							db.collection('user').find(obj,(err,result) => {
         							read_n_print(res,parseInt(max));
								});
						});


					 })
				} else {
					res.writeHead(404, {'Content-Type': 'text/plain'});
					res.end('Error!')
				}

			break;

		case '/read':
			read_n_print(res,parseInt(max));
			break;
		case '/showdetails':
			showdetails(res,parsedURL.query._id);
			break;
		case '/search':
			read_n_print(res,parseInt(max),parsedURL.query.criteria);
			break;
		case '/insert':
			res.writeHead(200, {'Content-Type': 'text/html'});
    			res.write('<form action="/create" method="post" enctype="multipart/form-data">');
    			res.write('Name: <input type="text" name="name"><br><br>');
   			res.write('Borough: <input type="text" name="borough"><br><br>');
			res.write('Cuisine: <input type="text" name="cuisine"><br><br>');
			res.write('Street: <input type="text" name="street"><br><br>');
			res.write('Building: <input type="text" name="building"><br><br>');
			res.write('Zipcode: <input type="text" name="zipcode"><br><br>');
			res.write('Latitude: <input type="text" name="latitude"><br><br>');
			res.write('Longitude: <input type="text" name="longitude"><br><br>');
			res.write('Score: <input type="text" name="Score"><br><br>');
   			res.write('<input type="file" name="filetoupload"><br><br>');
			res.write('<input type="submit" value="Create a Restaurant">')
			res.end('</form></body></html>');
			break;
		case '/create':
			const form = new formidable.IncomingForm();
    			form.parse(req, (err, fields, files) => {
				if (files.filetoupload.size == 0) {
					res.writeHead(500,{"Content-Type":"text/plain"});
       					res.end("No file uploaded!");
      				}
				const filename = files.filetoupload.path;
				let mimetype = "images/jpeg"
      				if (fields.name && fields.name.length > 0) {
					name = fields.name;
      				}
				if (fields.borough && fields.borough.length > 0) {
					borough = fields.borough;
      				}
				if (fields.cuisine && fields.cuisine.length > 0) {
					cuisine = fields.cuisine;
      				}
				if (fields.street && fields.street.length > 0) {
					street = fields.street;
      				}
				if (fields.building && fields.building.length > 0) {
					building = fields.building;
      				}
				if (fields.zipcode && fields.zipcode.length > 0) {
					zipcode = fields.zipcode;
      				}
				if (fields.latitude && fields.latitude.length > 0) {
					latitude = fields.latitude;
      				}
				if (fields.longitude && fields.longitude.length > 0) {
					longitude = fields.longitude;
      				}
				if (fields.score && fields.score.length > 0) {
					score = fields.score;
      				}
				if (files.filetoupload.type) {
					mimetype = files.filetoupload.type;
				}
				fs.readFile(files.filetoupload.path, (err,data) => {
					let client = new MongoClient(mongoDBurl);
        				client.connect((err) => {
         					try {
              						assert.equal(err,null);
           				 	} catch (err) {
              						res.writeHead(500,{"Content-Type":"text/plain"});
              						res.end("MongoClient connect() failed!");
              						return(-1);
          					}
          					const db = client.db(dbName);
          					let new_r = {};
						new_r['name'] = name;
						new_r['borough'] = borough;
						new_r['cuisine'] = cuisine;
						new_r['address'] = {"street" : "'+ street + '", "building" : "' + building + '",
								    "zipcode" : "' + zipcode + '", "latitude" : "' + latitude + '",
								    "longitude" : "' + longitude '"};
						new_r['grades'] = {"user" : "'+ score + '", "score" : "' + score '"};
						new_r['mimetype'] = mimetype;
						new_r['image'] = new Buffer.from(data).toString('base64');
						insertRestaurant(db,new_r,(result) => {
           						client.close();
            						res.writeHead(200, {"Content-Type": "text/html"});
            						res.write('<html><body>Photo was inserted into MongoDB!<br>');
            						res.end('<a href="/photos">Back</a></body></html>')
          					})
        				});
  				})
    			});
		break;
		case '/delete':
			deleteDoc(res,parsedURL.query.criteria);
			break;
		case '/edit':
			res.writeHead(200,{"Content-Type": "text/html"});
			res.write('<html><body>');
			res.write('<form action="/update">');
			res.write(`name<input type="text" name="name" value="${parsedURL.query.name}"><br>`);
			res.write(`borough<input type="text" name="borough" value="${parsedURL.query.borough}"><br>`);
			res.write(`<input type="text" name="cuisine" value="${parsedURL.query.cuisine}"><br>`);
			res.write(`<input type="text" name="Street" value="${parsedURL.query.Street}"><br>`);
			res.write(`<input type="text" name="Building" value="${parsedURL.query.Building}"><br>`);
			res.write(`<input type="text" name="Zipcode" value="${parsedURL.query.Zipcode}"><br>`);
			res.write(`<input type="text" name="Latitude" value="${parsedURL.query.Latitude}"><br>`);
			res.write(`<input type="text" name="Longitude" value="${parsedURL.query.Longitude}"><br>`);
			res.write(`<input type="text" name="Score" value="${parsedURL.query.Score}"><br>`);
			res.write(`<input type="hidden" name="_id" value="${parsedURL.query._id}"><br>`);
			res.write('<input type="submit" value="Update">')
			res.end('</form></body></html>');
			break;
		case '/update':
			updateDoc(res,parsedURL.query);
			break;
		default:
			res.writeHead(200,{"Content-Type": "text/html"});
			res.write('<html><head>');
			res.write('<title>Login</title>');
			res.write('</head><body>');
        	res.write(' <header class="w3-container w3-teal">');
			res.write('<h1>Sign in/Sign up</h1>');
			res.write('</header>    ');
        	res.write(' <h2>Sign in</h2>');
        	res.write(' <form action="/login" method="post" class="w3-container w3-card-2">');
			res.write('	 <p>');
			res.write(`	 User Name:<br></br><input name="logid" class="w3-input" type="text" style="width:10%" required="">`);

			res.write('	  <p>');
			res.write(`	  Password:<br></br><input name="password" class="w3-input" type="password" style="width:10%">`);

			res.write('	 <p>');
			res.write(`	  <button class="w3-btn w3-section w3-teal w3-ripple"> Sign in </button></p>`);
			res.write('	 </form><br></br><br></br>  ');

            res.write('      <h2>Sign up</h2>');
            res.write('      <form action="/register" method="post" class="w3-container w3-card-2">');
            res.write('         <p>');
            res.write(`         User Name:<br></br><input name="regid" class="w3-input" type="text" style="width:10%" required="">`);

            res.write('         <p>');
            res.write(`         Password:<br></br><input name="regpassword" class="w3-input" type="password" style="width:10%">`);
            res.write('         </p>');
            res.write('         <p>');
            res.write('         <p>');
            res.write(`         Confirm password:<br></br><input name="confirmpassword" class="w3-input" type="password" style="width:10%">`);

            res.write('         <p>   ');
            res.write(`          <button class="w3-btn w3-section w3-teal w3-ripple"> Sign up </button></p>`);
            res.write('      </form>');
            res.write('</div> ');
			res.end('</body></html>	');

	}
});






const insertUser = (db,r,callback) => {
	db.collection('user').insertOne(r,(err,result) => {
	  assert.equal(err,null);
	  console.log("Insert was successful!");
	  console.log(JSON.stringify(result));
	  callback(result);
	});
}


const findRestaurants = (db, max, criteria, callback) => {
	//console.log(`findRestaurants(), criteria = ${JSON.stringify(criteria)}`);
	let criteriaObj = {};
	try {
		criteriaObj = JSON.parse(criteria);
	} catch (err) {
		console.log('Invalid criteria!  Default to {}');
	}
	cursor = db.collection('restaurants').find(criteriaObj).sort({name: -1}).limit(max);
	cursor.toArray((err,docs) => {
		assert.equal(err,null);
		//console.log(docs);
		callback(docs);
	});
}

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

const showdetails = (res,_id) => {
	const client = new MongoClient(mongoDBurl);
	client.connect((err) => {
		assert.equal(null,err);
		console.log("Connected successfully to server");

		const db = client.db(dbName);

		cursor = db.collection('restaurants').find({_id: ObjectId(_id)});
		cursor.toArray((err,docs) => {
			assert.equal(err,null);
			client.close();
			console.log('Disconnected MongoDB');
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write(`<html><head><title>${docs[0].name}</title></head>`);
			res.write('<h3>')
			res.write(`<p>Name: ${docs[0].name}</p>`);
			res.write(`<p>Location: ${docs[0].borough}</p>`);
			res.write(`<p>Cuisine: ${docs[0].cuisine}</p>`);
			res.write('</h3>')
			res.write(`<br><a href="/edit?_id=${_id}&name=${docs[0].name}&borough=${docs[0].borough}&cuisine=${docs[0].cuisine}">Edit</a>`)
			res.write('<br>')
			res.write('<br><a href="/read?max=20">Home</a>')
			res.end('</body></html>');
		});
	});
}

const insertDoc = (res,doc) => {
	let docObj = {};
	try {
		docObj = JSON.parse(doc);
		//console.log(Object.keys(docObj).length);
	} catch (err) {
		console.log(`${doc} : Invalid document!`);
	}
	if (Object.keys(docObj).length > 0) {  // document has at least 1 name/value pair
		const client = new MongoClient(mongoDBurl);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			db.collection('restaurant').insertOne(docObj,(err,result) => {
				assert.equal(err,null);
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write(`Inserted ${result.insertedCount} document(s) \n`);
				res.end('<br><a href=/read?max=5>Home</a>');
			});
		});
	} else {
		res.writeHead(404, {"Content-Type": "text/html"});
		res.write('<html>123<body>');
		res.write(`${doc} : Invalid document!\n`);
		res.end('<br><a href=/read?max=5>Home</a>');
	}
}

const deleteDoc = (res,criteria) => {
	let criteriaObj = {};
	try {
		criteriaObj = JSON.parse(criteria);
	} catch (err) {
		console.log(`${criteria} : Invalid criteria!`);
	}
	if (Object.keys(criteriaObj).length > 0) {
		const client = new MongoClient(mongoDBurl);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			db.collection('restaurant').deleteOne(criteriaObj,(err,result) => {
				console.log(result);
				assert.equal(err,null);
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write(`Deleted ${result.deletedCount} document(s)\n`);
				res.end('<br><a href=/read?max=5>Home</a>');
			});
		});
	} else {
		res.writeHead(404, {"Content-Type": "text/html"});
		res.write('<html>5555<body>');
		res.write("Invalid criteria!\n");
		res.write(criteria);
		res.end('<br><a href=/read?max=5>Home</a>');
	}
}

const updateDoc = (res,newDoc) => {
	console.log(`updateDoc() - ${JSON.stringify(newDoc)}`);
	if (Object.keys(newDoc).length > 0) {
		const client = new MongoClient(mongoDBurl);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			let criteria = {};
			criteria['_id'] = ObjectId(newDoc._id);
			delete newDoc._id;
			db.collection('restaurant').replaceOne(criteria,newDoc,(err,result) => {
				assert.equal(err,null);
				console.log(JSON.stringify(result));
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write(`Updated ${result.modifiedCount} document(s).\n`);
				res.end('<br><a href=/read?max=5>Home</a>');
			});
		});
	} else {
		res.writeHead(404, {"Content-Type": "text/html"});
		res.write('<html>44444<body>');
		res.write("Updated failed!\n");
		res.write(newDoc);
		res.end('<br><a href=/read?max=5>Home</a>');
	}

}

const insertRestaurant = (db,r,callback) => {
	db.collection('restaurants').insertOne(r,(err,result) => {
		assert.equal(err,null);
			console.log("insert was successful!");
			console.log(JSON.stringify(result));
	callback(result);
	});
}

server.listen(process.env.PORT || 8099);
