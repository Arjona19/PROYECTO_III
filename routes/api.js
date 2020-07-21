var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const { isNullOrUndefined } = require('util');
const { count } = require('console');
//-------- Authentication ----------
router.post('/register', verifyExistUser, (req, res) => {
  try {
    const {username, password, name, email, phone} = req.body;
    if(username && password && name && email && phone){
      var id = uniqid();
      var passwordHash = crypto.createHash('sha256').update(password).digest('base64');
      conn.query("INSERT INTO users (iduser, username, password, name, email, phone) VALUES ('"
      +id+"','"
      +username+"','"
      +passwordHash+"','"
      +name+"','"
      +email+"','"
      +phone+"');",
      (err, result)=>{
        if (isNullOrUndefined(result[0])) {
          res.status(200).send({'message':'Usuario registrado.'});
        }else{res.status(401).send("Hubo un problema con los datos.");}
      });
    }else{res.status(401).send("Campos vacios.")}
  } catch (error) {
    res.status(500).send(error)
  }
  });

  router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if(username && password){
      var passwordHash = crypto.createHash('sha256').update(password).digest('base64');
      conn.query("SELECT * FROM users where username = '"+username+"' and password = '"+passwordHash+"';", (err, result)=>{
        if(!isNullOrUndefined(result[0])){
          const token = jwt.sign({_id:result[0].iduser}, 'secretKey');
          res.status(200).send({'token':token});
        }else{
          res.status(401).send({'message':'Usuario no registrado.'})
        }
        if(isNullOrUndefined(err)){
          res.status(500).send(err);
        }
      });
    }else{res.status(401).send("Los campos estan vacios.")}
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
  });

//------------ CRUD ------------------
router.get('/', verifyToken ,function(req, res, next) {
 try {
  conn.query("SELECT * FROM productos", (err, result) =>{
    res.json(result);
  });
 } catch (error) {
    res.status(500).send(error);
 }
});

router.get('/GetProduct/:id', verifyToken ,function(req, res, next) {
  try {
    const {id} = req.params;
    conn.query("SELECT * FROM productos where ID = '"+id+"';", (err, result) =>{
      res.json(result);
    });
  } catch (error) {
    res.send(error);
  }
});

router.post('/', verifyToken ,(req, res) => {
try {
  const {title, imagen, descripcion, precio} = req.body;
  if(title && imagen && descripcion && precio){
    conn.query("INSERT INTO productos (ID, titulo, imagen, descripcion, precio) VALUES (NULL, '"+title+"', '"+imagen+"', '"+descripcion+"', '"+precio+"');", (err, result)=>{
      res.status(200).send("Producto agregado");
    });
  }else{res.status(500).send("Producto rechazado")}
} catch (error) {
  res.status(500).send(error)
}
});


router.delete('/:id', verifyToken ,(req, res) => {
  try {
    const { id } = req.params;
    if(id != null){
      conn.query("DELETE FROM productos WHERE '"+id+"'", (err, result)=>{
        res.status(200).send("Producto eliminado");
      });
    }else{res.status(500).send()}
  } catch (error) {
    res.status(500).send(error)
  }
});

router.put('/:id',verifyToken ,(req, res) => {
  try {
    const { id } = req.params;
    const { title, imagen, descripcion, precio } = req.body;
    if(title && imagen && descripcion && precio && id){
      conn.query("UPDATE productos SET titulo = '"+title+"', imagen = '"+imagen+"', descripcion = '"+descripcion+"', precio = '"+precio+"' WHERE ID = '"+id+"';", (err, result)=>{
        res.status(200).send(result);
      });
    }else{res.status(500).send()}
  } catch (error) {
    res.status(500).send(error)
  }
});

module.exports = router;

//Verificacion de usuario existente.
function verifyExistUser(req, res, next) {
  const { username , email } = req.body;
  conn.query("SELECT * FROM heroku_e12b52604cab367.users where users.username = '"
  +username+"' and users.email = '"
  +email+"';", (err, result)=>{
    if(!isNullOrUndefined(result[0])){
      res.status(401).send({'message':"El correo:"+result[0].email+" y el usuario:"+username+" ya existen."})
    }else{
      next();
    }
  });
}

//Validacion de token.
function verifyToken(req, res, next){
  if (!req.headers.authorization) {
    return res.status(401).send("Acceso denegado.");
  }

  const token = req.headers.authorization.split(' ')[1];
  if (token === 'null') {
    return req.status(401).send("Acceso denegado.")
  }

  const payload = jwt.verify(token, 'secretKey');
  req.userId = payload._id;
  next();
}