//dependencies
var express = require("express");
var app = express();
var fs = require("fs");
var ejs = require("ejs");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('new.db');


//middleware
var bodyParser = require('body-parser');
var urlencodedBodyParser = bodyParser.urlencoded({
    extended: false
});
app.use(urlencodedBodyParser);
var methodOverride = require('method-override');
app.use(methodOverride('_method'));



app.listen(5000, function() {
    console.log("listening on 5000")
})




app.get("/", function(req, res) {
    var template = fs.readFileSync("./views/index.html", "UTF8")
    db.all('SELECT characters.name, characters.dead, characters.id  FROM characters INNER JOIN teams ON characters.team_id = teams.id WHERE characters.team_id = 1', function(err, rows) {
        if (err) {
            console.log(err)
        } else {
            console.log(rows)
            var goodGuys = rows
            db.all('SELECT characters.name, characters.dead, characters.id FROM characters INNER JOIN teams ON characters.team_id = teams.id WHERE characters.team_id=2', function(err, rows) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(rows)
                }
                var badGuys = rows;
                console.log(badGuys)
                var rendered = ejs.render(template, {
                    goodGuys: goodGuys,
                    badGuys: badGuys
                })
                res.send(rendered)
            })
        }
    })


})


app.get("/characters/new", function(req, res) {
    var newForm = fs.readFileSync("./views/new.html", "UTF8")
    res.send(newForm)
})


app.post("/characters", function(req, res) {
    console.log(req.body)
    db.run('INSERT INTO characters (name,dead,team_id) VALUES(?,?,?)', req.body.name, req.body.dead, req.body.team_id, function(err) {
        if (err) {
            console.log(err)
        }
        res.redirect('/')
    });
});


app.get("/characters/:id", function(req, res) {
    var info = fs.readFileSync("./views/show.html", "UTF8")
    var charID = req.params.id
    db.get('SELECT characters.name, characters.id, characters.dead,teams.name as temp FROM characters INNER JOIN teams ON characters.team_id = teams.id WHERE characters.id=?',charID, function(err, row) {
        console.log(row)
        var rendered = ejs.render(info, row)
        res.send(rendered)
    })
})

app.get("/characters/:id/edit",function(req,res){
  var form = fs.readFileSync("./views/edit.html","UTF8")
  db.get("SELECT * FROM characters WHERE characters.id=?",req.params.id, function(err,row){
    if (err){
      console.log(err)
    } else {
      console.log(row)
      var rendered = ejs.render(form,row)
      res.send(rendered)
    }
  })
})

app.put("/characters/:id", function(req,res){
  console.log(req.body)
  var updatedInfo = req.body;
  db.run("UPDATE characters SET name=?, dead=?, team_id=? WHERE id=?",updatedInfo.name,updatedInfo.dead,updatedInfo.team_id, req.params.id, function(err){
    if (err){
      console.log(err)
    }
      res.redirect("/")
  })
})

app.delete("/characters/:id", function(req,res){
  db.run("DELETE FROM characters WHERE id=?",req.params.id, function(err){
    console.log(err)
  })
  res.redirect("/")
})

