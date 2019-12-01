const express = require('express');
const app = express();
const fs = require('fs');
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
// your mongourl doesn't work!!!
const mongourl = 'mongo "mongodb+srv://cluster0-rjree.mongodb.net/test" --username g1211533';
// check your db name
const dbName = 'Project';
app.set('view engine', 'ejs');
//const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(express.static('public'));
//app.use(bodyParser.urlencoded({extend: true}));

var restaurant = {
      name : ' ' ,
      borough : '',
      cuisine : '', 
      street : '',
      building : '',
      zipcode : '',
      latitude : '',
      longitude : '',
      owner : '' 
};

app.get('/',(req,res) => {
    res.render('upload');
})

app.post('/upload', function(req,res){
    /*
    var name = req.body.name;
    var borough = req.body.borough;
    var cuisine = req.body.cuisine;
    var street = req.body.street;
    var building = req.body.building;
    var zipcode = req.body.zipcode;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var owner = req.body.owner;
    */
    var form = new formidable.IncomingForm();
    form.parse(req,(err,fields,files) => {
        console.log(fields.name);
        restaurant.name = fields.name;
        restaurant.cuisine = fields.cuisine;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null,err);
            console.log("Connected successfully to mongodb server");
            const db = client.db(dbName);
            db.collection('albert').insertOne(restaurant,(err, result) => {
                assert.equal(err, null);
                console.log("1 document inserted.");
                client.close();
            });
        });
    });
})

/*
const insertDocument = (db, callback) => {
db.collection('restaurant').insertOne (restaurant,function (err, collection) {
    collection:{
     name : String
}
     
}, (err, result) => {
   assert.equal(err,null);
   callback(result);
      });
   };

const client = new MongoClient(mongourl);
client.connect((err) => {
 assert.equal(null,err);
 
const db = client.db(dbName);
insertDocument(db, () => {
   client.close();
  });
});

app.get('/upload', function(req,res) {
  
res.write(`name: ${req.body.name}`);
res.redirect('restaurant.ejs');
});
*/

app.listen(process.env.POST || 8099);