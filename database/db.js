const mysql = require('mysql2/promise');

const connectDatabase = () => {
  // Create a MySQL connection pool
  // const pool = mysql.createPool({
  //   connectionLimit: 10, 
  //   host: 'localhost', 
  //   user: 'root', 
  //   password: '', 
  //   database: 'project_200424' ,
  //   port: 3306
  // });
  const pool = mysql.createPool({
    connectionLimit: 10, 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASS, 
    database: process.env.DB_NAME ,
    port: process.env.DB_PORT
  });

  // Attempt to connect to the MySQL server
  pool.getConnection()
    .then(connection => {
      console.log('Connected to MySQL database');
      connection.release(); // Release the connection back to the pool
    })
    .catch(error => {
      console.error('Error connecting to MySQL:', error.message);
    });

  // Handle MySQL connection errors
  pool.on('error', (error) => {
    console.error('MySQL pool connection error:', error.message);
  });

  // Return the pool object
  return pool;
  
};

module.exports = { connectDatabase };
