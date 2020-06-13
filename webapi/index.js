const express = require('express')
const app = express()
const port = 7000

const data_model = require('./model')

app.use(express.json())
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
})

// TODO: add pathes here

// run the application
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})