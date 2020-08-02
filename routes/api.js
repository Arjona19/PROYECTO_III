var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const { isNullOrUndefined } = require('util');

//-------------- paypay
var http = require('http');
var paypal = require('paypal-rest-sdk');
//var bodyParser = require('body-parser');

var client_id = 'ARrKRLwRFMCiZfQPhkhMUYVz2NSpK-jNFIj3T6vNh-ItcMuOdpky01RaEbejcLGKMa1hUcglBg2QpM3e';
var secret = 'EBz7SW_Kh0EBnXd1q7Pek2Z6ai47ZFg1ENlsF-HgOeKb_51KByolButiqr03Qpbb_dh0FNtAwbRYnZWD';

//allow parsing of JSON bodies
//app.use(bodyParser.json());

//configure for sandbox environment
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': client_id,
    'client_secret': secret
});
//--------- payapl--------------

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


  router.get('/user/:iduser', function(req, res, next) {
    try {
      const {iduser} = req.params;
      conn.query("SELECT * FROM heroku_e12b52604cab367.users where iduser = '"+ iduser +"';", (err, result) =>{
        res.json(result);
      });
    } catch (error) {
      res.send(error);
    }
  });

  router.put('user/:iduser' ,(req, res) => {
    try {
      const { iduser } = req.params;
      const { username, name, email, phone} = req.body;
      if(username && name && email && phone){
        console.log('d');
        conn.query("UPDATE users SET username = '"+username+"', name = '"+name+"', email = '"+email+"', phone = '"+phone+"' WHERE iduser = '"+iduser+"';", (err, result)=>{
          res.status(200).send(result);
        });
      }else{res.status(500).send()}
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

          res.status(200).send({
            'iduser':result[0].iduser,
            'token':token,
            'username':result[0].username,
            'name':result[0].name,
            'email':result[0].email,
            'phone':result[0].phone
          });
          
        }else{
          res.status(401).send({'message':'Usuario no registrado.'})
        }
      });
    }else{res.status(401).send("Los campos estan vacios.")}
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
  });

//------------ CRUD ------------------
router.get('/' ,function(req, res, next) {
 try {
  conn.query("SELECT * FROM heroku_e12b52604cab367.productos", (err, result) =>{
    res.json(result);
  });
 } catch (error) {
    res.status(500).send(error);
 }
});

router.get('/GetProduct/:id', function(req, res, next) {
  try {
    const {id} = req.params;
    conn.query("SELECT * FROM heroku_e12b52604cab367.productos where ID = '"+ id +"';", (err, result) =>{
      res.json(result);
    });
  } catch (error) {
    res.send(error);
  }
});
/*
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

*/
router.post('/', verifyToken ,(req, res) => {
try {
  const {title, imagen, descripcion, precio, autor, tecnologia} = req.body;
  if(title && imagen && descripcion && precio && autor && tecnologia){
    conn.query("INSERT INTO heroku_e12b52604cab367.productos (ID, titulo, imagen, descripcion, precio, autor, tecnologia) VALUES (NULL, '"+title+"', '"+imagen+"', '"+descripcion+"', '"+precio+"', '"+autor+"', '"+tecnologia+"');", (err, result)=>{
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
      conn.query("DELETE FROM heroku_e12b52604cab367.productos WHERE ID = '"+id+"'", (err, result)=>{
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
    const { title, imagen, descripcion, precio, autor, tecnologia} = req.body;
    if(title && imagen && descripcion && precio && id && autor && tecnologia){
      conn.query("UPDATE heroku_e12b52604cab367.productos SET titulo = '"+title+"', imagen = '"+imagen+"', descripcion = '"+descripcion+"', precio = '"+precio+"', autor = '"+autor+"', tecnologia = '"+tecnologia+"' WHERE ID = '"+id+"';", (err, result)=>{
        res.status(200).send(result);
      });
    }else{res.status(500).send()}
  } catch (error) {
    res.status(500).send(error)
  }
});


router.post('/pay' ,(req, res) => {
  try {
    const data = {userId, products, total} = req.body;
    console.log(data);

    if(data.userId && data.products && data.total){

      var payReq = JSON.stringify({
        'intent':'sale',
        'redirect_urls':{
            'return_url':'http://localhost:3000/api/process',
            'cancel_url':'http://localhost:3000/api/cancel'
        },
        'payer':{
            'payment_method':'paypal'
        },
        'transactions':[{
            'amount':{
                'total': total,
                'currency':'MXN'
            },
            'description':'Compra de manuales - DevLoopers'
        }]
      });

      paypal.payment.create(payReq, function(error, payment){
        if(error){
            console.error(error);
        } else {

          let claveTransaccionPaypal = payment.id;
          let claveCompradorPaypal = "none";
          let estadoPaypal = "NotApproved";
          let userId = JSON.parse(data.userId);
          let total = data.total;

          conn.query("INSERT INTO heroku_e12b52604cab367.ventasmaster (ventaMasterId, usuarioId, fecha, total, claveTransaccionPaypal, claveCompradorPaypal, estadoPaypal) VALUES (NULL,'"+userId+"',CURDATE(), '"+total+"', '"+claveTransaccionPaypal+"', '"+claveCompradorPaypal+"','"+estadoPaypal+"'); ", (err, result) =>{
            
            let ventaMasterId  = result.insertId;

            let products = JSON.parse(data.products);

            products.forEach(element => {

              let productId = element.ID;

              conn.query("INSERT INTO heroku_e12b52604cab367.detallesventa (detallesVentaId, ventaMasterId, productoId) VALUES (NULL, '"+ventaMasterId +"', '"+productId+"');", (err, result) =>{
                console.log('producto_detalleVenta insertado'+ result.insertId);
              });

            });

          });
    
            //capture HATEOAS links
            var links = {};
            console.log(payment);
            payment.links.forEach(function(linkObj){
                links[linkObj.rel] = {
                    'href': linkObj.href,
                    'method': linkObj.method
                };
            })
        
            //if redirect url present, redirect user
            if (links.hasOwnProperty('approval_url')){
                //res.redirect(links['approval_url'].href);
                
                res.status(200).send({"paypal_link" : links['approval_url'].href});
            } else {
                console.error('no redirect URI present');
            }
        }
      });

    }else{res.status(500).send("Producto rechazado")}
  } catch (error) {
    res.status(500).send(error)
  }

});




/*
router.get('/pay/:total', function(req, res){

  const {total} = req.params;

  //build PayPal payment request
  var payReq = JSON.stringify({
      'intent':'sale',
      'redirect_urls':{
          'return_url':'http://localhost:3000/api/process',
          'cancel_url':'http://localhost:3000/api/cancel'
      },
      'payer':{
          'payment_method':'paypal'
      },
      'transactions':[{
          'amount':{
              'total': total,
              'currency':'MXN'
          },
          'description':'Compra de manuales - DevLoopers'
      }]
  });

  paypal.payment.create(payReq, function(error, payment){
      if(error){
          console.error(error);
      } else {
          //capture HATEOAS links
          var links = {};
          console.log(payment);
          payment.links.forEach(function(linkObj){
              links[linkObj.rel] = {
                  'href': linkObj.href,
                  'method': linkObj.method
              };
          })
      
          //if redirect url present, redirect user
          if (links.hasOwnProperty('approval_url')){
              //res.redirect(links['approval_url'].href);
              
              res.status(200).send({"paypal_link" : links['approval_url'].href});
          } else {
              console.error('no redirect URI present');
          }
      }
  });
});

*/

router.get('/process', function(req, res){
  var paymentId = req.query.paymentId;
  console.log(req.query);
  var payerId = { 'payer_id': req.query.PayerID };

  let claveCompradorPaypal = req.query.PayerID;

  


  paypal.payment.execute(paymentId, payerId, function(error, payment){
      if(error){
          console.error(error);
      } else {
          if (payment.state == 'approved'){ 

            let estadoPaypal = "Approved";

            conn.query("UPDATE heroku_e12b52604cab367.ventasmaster SET claveCompradorPaypal = '"+claveCompradorPaypal+"', estadoPaypal = '"+estadoPaypal+"' WHERE claveTransaccionPaypal = '"+paymentId+"' ;", (err, result) =>{
              //res.json(result);
             });

              //res.send('payment completed successfully');
              res.redirect('http://localhost:3001/paypal-page');
          } else {
              res.send('payment not successful');
          }
      }
  });
});



router.get('/prueba', ()=> {

  paypal.payment.get('PAYID-L4SFH2Q1DV244733L834203B',function(error, payment){
    console.log(payment);
    //res.send(payment);
  });


});


router.get('/cancel', ()=> res.send('cancelado'));

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
  if (token === 'null' || token === 'undefined') {
    return req.status(401).send("Acceso denegado.")
  }

  const payload = jwt.verify(token, 'secretKey');
  req.userId = payload._id;
  next();
}