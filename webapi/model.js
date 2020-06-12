const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'TODO',
  database: 'my_database',
  password: 'pwd',
  port: TODO,
});