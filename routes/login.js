var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { isNullOrUndefined } = require('util');
/* GET users listing. */
router.get('/', verifyExistUser, function(req, res, next) {
    res.render('login');
  });

router.get('/logout', cerrarSession);

router.post("/", (req, res, next)=>{
    try {
      const { username, password } = req.body;
      if(username && password){
        var passwordHash = crypto.createHash('sha256').update(password).digest('base64');
        conn.query("SELECT * FROM users where username = '"+username+"' and password = '"+passwordHash+"';", (err, result)=>{
          if(!isNullOrUndefined(result[0])){
            const token = jwt.sign({_id:result[0].iduser}, 'secretKey');
            req.session.token = token;        
            req.session.user = result[0];
            req.session.admin = true;
            res.redirect('/');
          }else{
            res.render('login');
          }
        });
      }else{res.status(401).send("Los campos estan vacios.")}
    } catch (error) {
      console.log(error);
      res.status(500).send(error)
    }
  });

module.exports = router;

function cerrarSession(req, res, next){
  req.session.destroy();
  return res.redirect('/login');
}
  
function verifyExistUser(req, res, next) {
    if (req.session && req.session.user && req.session.admin)
        return res.redirect('/');
    else
      return next();
  }