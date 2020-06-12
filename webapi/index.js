const express = require('express')
const app = express()
const port = 3001

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
})

// TODO: add pathes here

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})