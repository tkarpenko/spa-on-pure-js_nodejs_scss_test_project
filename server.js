'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(express.static('./public'));

app.use('/customers/update', require('./serverjs/routes/update'));
app.use('/customers/delete', require('./serverjs/routes/delete'));
app.use('/customers/create', require('./serverjs/routes/create'));
app.use('/customers', require('./serverjs/routes/list'));

app.listen(3000);