var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
var multer  = require('multer')

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      cb(null, 'public/assets/images/portadas');
    } else if(file.fieldname === 'zip'){
      cb(null, 'manuales');
    }
  },filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

router.get('/', verifyUser,async function(req, res, next) {
  try {
   await conn.query("SELECT * FROM productos", (err, result) =>{
      res.render('partials/index', { data: result, user:req.session.user });
    });
   } catch (error) {
      res.status(500).send(error);
   }
});

router.get('/NewProduct',verifyUser, function(req, res, next) {
  res.render('partials/addProduct',{ user: req.session.user });
});
var _upInsert = multer({ storage: storage });
let uploadInsert = _upInsert.fields([ {  name: 'imagen'}, {  name: 'zip'}]);
router.post('/', uploadInsert ,(req, res) => {
  try {
    files = JSON.parse(JSON.stringify(req.files));
    req.body.imagen = files.imagen[0].originalname;
    req.body.archivo = files.zip[0].originalname;
    req.body.estatus = 'Disponible';
    console.log(req.body);
    const {title, imagen, descripcion, precio, autor, tecnologia, archivo, estatus, preview} = req.body;
    if(title && imagen && descripcion && precio && autor && tecnologia){
      conn.query("INSERT INTO heroku_e12b52604cab367.productos (ID, titulo, imagen, descripcion, precio, autor, tecnologia, archivo, estatus, preview) VALUES (NULL, '"+title+"', '"+imagen+"', '"+descripcion+"', '"+precio+"', '"+autor+"', '"+tecnologia+"', '"+archivo+"', '"+estatus+"', '"+preview+"');", (err, result)=>{
        res.redirect('/');
      });
    }else{JSAlert.alert("Nel", "Files Saved", "Got it");}
  } catch (error) {
    res.status(500).send(error)
  }
});

var _upUpdate = multer({ storage: storage });
let uploadUpdate = _upUpdate.fields([ {  name: 'imagen'}, {  name: 'zip'}]);
router.post('/update/:id', uploadUpdate, (req, res, next) => {
    console.log(req.files);
    console.log(req.body);
    files = JSON.parse(JSON.stringify(req.files));
    req.body.imagen = files.imagen[0].originalname;
    req.body.archivo = files.zip[0].originalname;
    req.body.estatus = 'Disponible';
    const { title, descripcion, precio, autor, tecnologia, estatus, imagen, archivo, preview} = req.body;
    conn.query("UPDATE productos SET titulo = '"+title+"', descripcion = '"+descripcion+"', precio = '"+precio+"', autor = '"+autor+"', tecnologia = '"+tecnologia+"', estatus = '"+estatus+"', imagen = '"+imagen+"', archivo = '"+archivo+"', preview = '"+preview+"' WHERE ID = '"+req.params.id+"';", (err, result)=>{
      res.redirect('/');
    });
});

router.post('/show/:id', function(req, res, next) {
    try {
      const {id} = req.params;
      conn.query("SELECT * FROM heroku_e12b52604cab367.productos where ID = '"+ id +"';", (err, result) =>{
        res.render('partials/editProduct',{user: req.session.user, data:result})
      });
    } catch (error) {
      res.send(error);
    }
  });

router.post('/delete/:id' ,(req, res) => {
      const { id } = req.params;
      if(id){
        conn.query("DELETE FROM productos WHERE ID = "+id+";", (err, result)=>{
          res.redirect('/');
        });
      }else{res.status(500).send()}
  });




module.exports = router;


function verifyUser(req, res, next){
  if (req.session && req.session.user && req.session.admin)
    return next();
  else
    return res.render('login');
}


