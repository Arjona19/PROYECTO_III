var express = require('express');
var router = express.Router();
var conn = require("../conexion/conn");
/* GET users listing. */

router.get('/', function(req, res, next) {
  conn.query("SELECT * FROM productos", (err, result) =>{
    res.json(result);
  });
});

router.post('/',(req, res) => {
  const {title, imagen, descripcion, precio} = req.body;
  if(title && imagen && descripcion && precio){
    conn.query("INSERT INTO productos (ID, titulo, imagen, descripcion, precio) VALUES (NULL, '"+title+"', '"+imagen+"', '"+descripcion+"', '"+precio+"');", (err, result)=>{
      res.status(200).send("Producto agregado");
    });
  }else{res.status(500).send()}
});

router.delete('/:id',(req, res) => {
  const { id } = req.params;
  if(id != null){
    conn.query("DELETE FROM productos WHERE '"+id+"'", (err, result)=>{
      res.status(200).send("Producto eliminado");
    });
  }else{res.status(500).send()}
});

module.exports = router;
