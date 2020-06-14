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

const getTags = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM tags', (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const addTag = (tag) => {
  return new Promise(function(resolve, reject) {
    pool.query('INSERT INTO tags (tag) VALUES ($1)', [tag], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Tag Created`)
    })
  })
}

const linkTag = (tag_id, speed_id) => {
  return new Promise(function(resolve, reject) {
    pool.query('INSERT INTO speed2tag (speed, tag) VALUES ($1, $2)', [speed_id, tag_id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Tag Linked`)
    })
  })
}

const removeTagLink = (tag_id, speed_id) => {
  return new Promise(function(resolve, reject) {
    pool.query('DELETE FROM speed2tag WHERE speed=$1 AND tag=$2', [speed_id, tag_id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Tags deleted`)
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


module.exports = {
  getAllSpeeds,
  getSpeedPage,
  setInterval,
  setFlag,
  getSettings,
  addTag,
  getTags,
  linkTag,
  removeTagLink
}