var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
var multer  = require('multer')

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'manuales');
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

const upload = multer({ storage:storage });
router.post('/' , upload.array('archivos',2) ,(req, res) => {
  try {
    req.body.archivo = req.files[0].filename;
    req.body.imagen = req.files[1].filename;
    req.body.estatus = 'Disponible';
    const {title, imagen, descripcion, precio, autor, tecnologia, archivo, estatus} = req.body;
    if(title && imagen && descripcion && precio && autor && tecnologia){
      conn.query("INSERT INTO heroku_e12b52604cab367.productos (ID, titulo, imagen, descripcion, precio, autor, tecnologia) VALUES (NULL, '"+title+"', '"+imagen+"', '"+descripcion+"', '"+precio+"', '"+autor+"', '"+tecnologia+"');", (err, result)=>{
        res.redirect('/');
      });
    }else{JSAlert.alert("Nel", "Files Saved", "Got it");}
  } catch (error) {
    res.status(500).send(error)
  }
});

router.post('/update/:id', upload.array('archivos', 2) , (req, res) => {
  try {
    const { id } = req.params;
    req.body.archivo = req.files[0].filename;
    req.body.imagen = req.files[1].filename;
    req.body.estatus = 'Disponible';
    const { title, imagen, descripcion, precio, autor, tecnologia, archivo, estatus} = req.body;
    if(imagen !== undefined && archivo !== undefined){
      if(title && imagen && descripcion && precio && id && autor && tecnologia){
        conn.query("UPDATE heroku_e12b52604cab367.productos SET titulo = '"+title+"', imagen = '"+imagen+"', descripcion = '"+descripcion+"', precio = '"+precio+"', autor = '"+autor+"', tecnologia = '"+tecnologia+"', archivo = '"+archivo+"', estatus = '"+estatus+"' WHERE ID = '"+id+"';", (err, result)=>{
          res.redirect('/');
        });
      }else{res.status(500).send()}
    }else{
      if(title && descripcion && precio && id && autor && tecnologia){
        conn.query("UPDATE heroku_e12b52604cab367.productos SET titulo = '"+title+"', descripcion = '"+descripcion+"', precio = '"+precio+"', autor = '"+autor+"', tecnologia = '"+tecnologia+"' WHERE ID = '"+id+"';", (err, result)=>{
          res.redirect('/');
        });
      }else{res.status(500).send()}
    }

  } catch (error) {
    res.status(500).send(error)
  }
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
    try {
      const { id } = req.params;
      if(id != null){
        conn.query("DELETE FROM heroku_e12b52604cab367.productos WHERE ID = '"+id+"'", (err, result)=>{
          res.redirect('/');
        });
      }else{res.status(500).send()}
    } catch (error) {
      res.status(500).send(error)
    }
  });




module.exports = router;


function verifyUser(req, res, next){
  if (req.session && req.session.user && req.session.admin)
    return next();
  else
    return res.render('login');
}


