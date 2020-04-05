const ListInfo = require('./models/list.js');
const express = require('express');
const path = require('path');
const randomString = require('randomstring');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ListMaker',
});

connection.connect((err) => {
  if (!err) {
    console.log('Connected');
  } else {
    console.log('Connection failed');
  }
});

router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/views/main.html'));
});

router.post('/newlist', function (req, res, next) {
  const text = req.body.list;
  const textArray = text.split(/\r?\n/);

  if (textArray.length > 0) {
    for (let data of textArray) {
      let databaseInput = new ListInfo(data, 1, randomString.generate(8));
      console.log(databaseInput);
      connection.query(
        "INSERT INTO ListInfo (nameOfItem, bought, listId) VALUES ('databaseInput.nameOfItem', 'databaseInput.bought', 'databaseInput.listId')",
        function (err, rows, fields) {
          if (err) {
            console.log(err);
            res.status(404).json({ err });
            return;
          }
        }
      );
    }
  }
  //return res.redirect('/');
});

//lists
router.get('/listItems', function (req, res, next) {
  connection.query('SELECT * FROM ListInfo', function (err, rows, fields) {
    if (!err) {
      res.send(rows);
    } else {
      res.status(500).json(err);
    }
  });
});

app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');
