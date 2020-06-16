const Pool = require('pg').Pool
const pageSize = 100;
const speedQuery = 'SELECT s.id, MAX(s.download) as download, MAX(s.upload) as upload, MAX(s.ping) as ping, s.measure_time, MAX(s.ip) as ip, MAX(s.country) as country, MAX(s.isp) as isp, MAX(s.description) as description, array_agg(t.tag) AS tags FROM speeds AS s LEFT JOIN speed2tag as st ON s.id=st.speed LEFT JOIN tags AS t ON st.tag = t.id'
const moment = require('moment');

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
    pool.query(speedQuery + ' GROUP BY s.id, s.measure_time ORDER BY s.measure_time DESC LIMIT 1000', (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getNewSpeeds = (time) => {
  let date = moment.unix(parseInt(time) / 1000).toDate();
  return new Promise(function(resolve, reject) {
    pool.query(speedQuery + ' WHERE s.measure_time>$1 GROUP BY s.id, s.measure_time ORDER BY s.measure_time DESC LIMIT 1000', [date,], (error, results) => {
      if (error) {
        return reject({err: error, date: date})
      }
      resolve(results.rows);
    })
  }) 
}

const getSpeed = (id) => {
  return new Promise(function(resolve, reject) {
    pool.query(speedQuery + ' WHERE s.id=$1 GROUP BY s.id, s.measure_time ORDER BY s.measure_time DESC LIMIT 1000', [id,], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results.rows[0]);
    })
  }) 
}

const getSpeedPageCount = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT COUNT(*) as count FROM speeds', (error, result) => {
      if (error) {
        return reject(error)
      }
      resolve({ "items": result.rows[0]["count"], "pages": Math.ceil(parseInt(result.rows[0]["count"]) / pageSize)});
    })
  })
}

const getSpeedPage = (number) => {
  return new Promise(function(resolve, reject) {
    pool.query(speedQuery + ' GROUP BY s.id, s.measure_time ORDER BY s.measure_time DESC OFFSET $1 LIMIT $2', [pageSize * number, pageSize], (error, results) => {
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

const removeTag = (id) => {
  return new Promise(function(resolve, reject) {
    pool.query('DELETE FROM tags WHERE id=$1', [id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Tags deleted`)
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
      resolve(`Tag Link deleted`)
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
  getSpeedPageCount,
  getSpeed,
  getNewSpeeds,
  setInterval,
  setFlag,
  getSettings,
  addTag,
  removeTag,
  getTags,
  linkTag,
  removeTagLink
}