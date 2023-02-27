const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool }  = require('pg');
var pool;
pool = new Pool ( {
  connectionString: process.env.DATABASE_URL || 'postgres://postgresql-crystalline-32804',
  ssl: {
    rejectUnauthorized: false
  }
  //connectionString: 'postgres://postgres:root@localhost/students'
});

var app = express();

const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req,res) => {
  res.redirect('/students');
})

app.get('/students', (req,res) => {
   pool.query('SELECT * FROM studentinfo ORDER BY id ASC', (error, result) => {
    if (error) {
      throw error
    }
  
  var results = {'students':result.rows}
  res.render('pages/db', results);
  });
});

app.get('/createstudent', function(req,res) {
  res.redirect('addstudent.html')
})

app.post('/createstudent', (req,res) => {
  var fname = req.body.fname;
  var height = req.body.height;
  var weight = req.body.weight;
  var haircolor = req.body.haircolor;
  var gpa = req.body.gpa;
  pool.query(`INSERT INTO studentinfo (fname, height, weight, haircolor, gpa) VALUES ($1, $2, $3, $4, $5)`, [fname, height, weight, haircolor, gpa], (error, results) => {
    if (error) {
      throw error
    }
  })

  var data = {'results': [fname, height, weight, haircolor, gpa]};
    res.render('pages/newstudent', data);
});


app.get('/students/:id', (req,res) => {
 
    var id = req.params.id;
    pool.query('SELECT * FROM studentinfo WHERE id = $1', [id], (error, result) => {
      if (error) {
          throw(error);
      }
      var results = {'students':result.rows}
      res.render('pages/students', results);
    })  
});

app.get('/students/:id/edit', (req,res) => {
  var id = req.params.id;
  pool.query('SELECT * FROM studentinfo WHERE id = $1', [id], (error, result) => {
    if (error) {
        throw(error);
    }
    var results = {'students':result.rows};
    res.render('pages/editstudent', results);
  })  
})

app.post('/students/:id/edit', (req,res) => {
  const id = req.params.id
  var fname = req.body.fname;
  var height = req.body.height;
  var weight = req.body.weight;
  var haircolor = req.body.haircolor;
  var gpa = req.body.gpa;

  pool.query('UPDATE studentinfo SET fname = $1, weight = $2, height = $3, haircolor = $4, gpa = $5 WHERE id = $6', [fname, weight, height, haircolor, gpa, id], (error, results) => {
    if (error) {
      throw error
    }
    res.redirect('../../');
  });
});

app.post('/students/:id', (req,res) => {
  const id = parseInt(req.params.id)
  
  pool.query('DELETE FROM studentinfo WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    res.redirect('back');
  })
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
