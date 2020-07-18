var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
/* GET users listing. */

router.get('/', function(req, res, next) {
 try {
  conn.query("SELECT * FROM productos", (err, result) =>{
    res.json(result);
  });
 } catch (error) {
    res.status(500).send(error);
 }
});

router.get('/GetProduct/:id', function(req, res, next) {
  try {
    const {id} = req.params;
    conn.query("SELECT * FROM productos where ID = '"+id+"';", (err, result) =>{
      res.json(result);
    });
  } catch (error) {
    res.send(error);
  }
});

router.post('/',(req, res) => {
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

router.delete('/:id',(req, res) => {
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

router.put('/:id',(req, res) => {
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
