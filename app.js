var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var loginRouter = require('./routes/login');
var manualesRouter = require('./routes/manuales');
var ventasRouter = require('./routes/ventas');
var apiRouter = require('./routes/api');
const session = require('express-session');
const cors = require('cors');

var app = express();
app.use(session({
  secret: 'secretKey',
  resave: true,
  saveUninitialized: true
}));
//-------------- paypay
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.locals.moment = require('moment');
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var whitelist = ['https://dev-loopers-market.herokuapp.com'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));

app.use('/', manualesRouter);
app.use('/ventas', ventasRouter);
app.use('/login', loginRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
//primero corres la api y despues el de react
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





module.exports = app;
