const Pool = require('pg').Pool

// retrieve the variables

const pool = new Pool({
  user: 'postgres',
  host: process.argv[2],
  database: 'my_database',
  password: 'pwd',
  port: process.argv[3],
});

const getMerchants = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM merchants ORDER BY id ASC', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}
const createMerchant = (body) => {
  return new Promise(function(resolve, reject) {
    const { name, email } = body
    pool.query('INSERT INTO merchants (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`A new merchant has been added added: ${results.rows[0]}`)
    })
  })
}
const deleteMerchant = () => {
  return new Promise(function(resolve, reject) {
    const id = parseInt(request.params.id)
    pool.query('DELETE FROM merchants WHERE id = $1', [id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Merchant deleted with ID: ${id}`)
    })
  })
}

module.exports = {
  getMerchants,
  createMerchant,
  deleteMerchant,
}