var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'us-cdbr-east-02.cleardb.com',
  user     : 'be6abcdb612529',
  password : 'f8880b7e',
  database:'heroku_e12b52604cab367'
});

//User: be6abcdb612529
//Password: f8880b7e
//Host: us-cdbr-east-02.cleardb.com

connection.connect(
    (err)=>{
     if(!err){ console.log("conexion establecida")} else { console.log("conexion fallida")}  
    }
);

//La conexion al servidor se cierra cada 10s despues de inactividad, se implementó un interval para que
//la conexion siga activa.
setInterval(function () {
  connection.query('SELECT 1');
}, 5000);

module.exports = connection;