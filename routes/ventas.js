var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
const moment = require('moment');
/* GET users listing. */

router.get('/', verifyUser ,function(req, res, next) {
  try {
    conn.query("call heroku_e12b52604cab367.GetAllSales();", (err, result) =>{
       res.render('partials/ventas', { data: result[0] , user:req.session.user });
     });
    } catch (error) {
       res.status(500).send(error);
    }
});

router.get('/getDaySales', verifyUser ,function(req, res, next) {
  try {
    conn.query("call heroku_e12b52604cab367.GetDaySales('"+moment().format('YYYY-MM-DD')+"');", (err, result) =>{
       res.render('partials/ventas', { data: result[0] , user:req.session.user });
     });
    } catch (error) {
       res.status(500).send(error);
    }
});

router.get('/getMonthSales', verifyUser ,function(req, res, next) {
  try {
    conn.query("call heroku_e12b52604cab367.GetMonthSales('"+moment().format('YYYY-MM-DD')+"');", (err, result) =>{
       res.render('partials/ventas', { data: result[0] , user:req.session.user });
     });
    } catch (error) {
       res.status(500).send(error);
    }
});

router.get('/getYearSales', verifyUser ,function(req, res, next) {
  try {
    conn.query("call heroku_e12b52604cab367.GetYearSales('"+moment().format('YYYY-MM-DD')+"');", (err, result) =>{
       res.render('partials/ventas', { data: result[0] , user:req.session.user });
     });
    } catch (error) {
       res.status(500).send(error);
    }
});

module.exports = router;
function verifyUser(req, res, next){
  if (req.session && req.session.user && req.session.admin)
    return next();
  else
    return res.render('login');
}
