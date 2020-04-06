const ListInfo = require('./models/list.js');
const express = require('express');
const path = require('path');
const randomString = require('randomstring');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
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

  const generatedRandomString = randomString.generate(8);
  if (textArray.length > 0) {
    for (let data of textArray) {
      let databaseInput = new ListInfo(data, 1, generatedRandomString);
      const sqlQuery =
        'INSERT INTO ListInfo (nameOfItem, bought, listId) VALUES ("' +
        data +
        '", 1, "' +
        generatedRandomString +
        '")';
      connection.query(sqlQuery, function (err, rows, fields) {
        if (err) {
          console.log(err);
          res.status(404).json({ err });
          return;
        }
      });
    }
  }
  return res.json({ baseUrl: generatedRandomString });
});

//lists
router.get('/:listItemId', function (req, res, next) {
  const err = true;
  res.sendFile(path.join(__dirname + '/views/list.html'));
  /*   connection.query(
    'SELECT * FROM ListInfo WHERE listId="' + req.params.listItemId + '"',
    function (err, rows, fieldsListInfo) {
      if (!err) {
        res.sendFile(path.join(__dirname + '/views/list.html'), {
          test: test,
        });
        //res.send(rows);
        //console.log(rows);
      } else {
        res.status(500).json(err);
      }
    }
  ); */
});

router.get('/dataItems/:listItemId', function (req, res, next) {
  connection.query(
    'SELECT * FROM ListInfo WHERE listId="' + req.params.listItemId + '"',
    function (err, rows, fieldsListInfo) {
      if (!err) {
        res.send(rows);
        console.log(rows);
      } else {
        res.status(500).json(err);
      }
    }
  );
});

app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');
