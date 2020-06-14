const express = require('express')
const app = express()
const port = 7000

const data_model = require('./model')
const { response } = require('express')

app.use(express.json())
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
})

app.get('/speed', (req, res) => {
  data_model.getSpeeds().then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

// run the application
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})