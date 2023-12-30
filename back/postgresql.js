require('dotenv').config();
const port = process.env.postgreSQLPORT || process.argv[2] || 5030;
const table = 'users' || process.env.DB_table || '.env first idiot !' ;
// Import required packages
const express = require('express');
const cors = require('cors');
const multer = require('./configurations/multer');
// const expressFileupload = require('express-fileupload');

// Create an Express application
const app = express();
app.use(cors());
app.use(express.json()); //for req.body to get data from ajax requests payload
// app.use(express.urlencoded({extended:true}));
app.use(multer);
app.use(customParser); //parses the name of the photo in a new variable called "req.PHOTO_PARSED"
// app.use(expressFileupload());

// Connect to PostgreSQL
const {Client} = require('pg');
const client = new Client({
  host: "localhost",
  user: "postgres",
  port:5432, //not necessary
  password: "5432",
  database: "test"
})
client.connect().then((err) => {
    if (err){console.log("'PostgreSQL' initial connection error");}
    else{app.listen(port, ()=>{console.log("PostgreSQL: " + port);

    // client.query("SELECT * FROM "+table, (err, rows)=>{
    //   console.log(rows.rows)
    // })

  });}
})

//API Routes (API endpoints)
//Get All
app.get('/', (req, res) => {
  let q ="SELECT * FROM "+table+" WHERE name LIKE '%"+ req.query._name +"%'";
  if (req.query._age) {q += " AND age = '"+ req.query._age +"'";}
  q += " ORDER BY _id DESC LIMIT "+req.query._limit;
  client.query(q, (err, data)=>{
    res.json(data.rows);
  })
});
//Insert
app.post('/', (req, res) => {
  client.query("INSERT INTO "+table+" (name, age, photo) VALUES ('"+ req.body.name +"', "+ req.body.age +", '"+ req.PHOTO_PARSED +"') RETURNING _id;", (err, data)=>{    
    res.json({"newId":data.rows[0]._id, "photo":req.PHOTO_PARSED});
  })
});
//Update
app.put('/:id', (req, res) => {
  client.query("UPDATE "+table+" SET name='"+ req.body.name +"', age = '"+ req.body.age +"', photo = '"+ req.PHOTO_PARSED +"' WHERE _id='"+ req.params.id +"'", (err, data)=>{
    res.json({"photo":req.PHOTO_PARSED});
  })
});
//Delete
app.delete('/:id', (req, res) => {
  client.query("DELETE FROM "+table+" WHERE _id='"+ req.params.id +"'", (err, data)=>{
      //GET Row to add instead
      client.query("SELECT * FROM "+table+" WHERE _id=(SELECT MAX(_id) from "+table+" where _id < '"+ req.query.lasttableid +"')", (err, rows)=>{
        res.send(rows.rows)
      }) 
  });
});
//404
app.use((req, res) => {
  res.status(404).json("404 , no routes !")
});

function customParser (req, res, next){
  if(req.file){req.PHOTO_PARSED = req.file.filename;}
  else{req.PHOTO_PARSED = req.body.selectedPhotoName;}
  next();
}