const Pool = require('pg').Pool
const pageSize = 100;

// retrieve the variables

const pool = new Pool({
  user: 'postgres',
  host: process.argv[2],
  database: 'speedtest',
  password: process.argv[4],
  port: process.argv[3],
});

const getAllSpeeds = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM speeds ORDER BY measure_time DESC', (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getSpeedPage = (number) => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM speeds ORDER BY measure_time DESC OFFSET $1 LIMIT $2', [pageSize * number, pageSize], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results.rows);
    })
  })
}

const setInterval = (interval) => {
  return new Promise(function(resolve, reject) {
    pool.query('UPDATE settings SET value=$1 WHERE item=$2', [interval.toString(), "interval"], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Updated interval`)
    })
  })
}

const setFlag = (flag) => {
  return new Promise(function(resolve, reject) {
    pool.query('UPDATE settings SET value=$1 WHERE item=$2', [flag.toString(), "run_test"], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Updated flag`)
    })
  })
}

const getSettings = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM settings', (error, results) => {
      if (error) {
        return reject(error)
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
  getAllSpeeds,
  getSpeedPage,
  setInterval,
  setFlag,
  getSettings,
}