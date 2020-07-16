var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database:'api_rest'
});

connection.connect(
    (err)=>{
     if(!err){ console.log("conexion establecida")} else { console.log("conexion fallida")}  
    }
);

module.exports = connection;