const express = require('express')
const app = express()
const port = 7000


const data_model = require('./model')
const { response } = require('express')

app.use(express.json())
app.get('/', (req, res) => {
  res.status(200).send('SpeedTester API');
})

// DEBUG: enable cors
var cors = require('cors')
app.use(cors())

app.get('/speed', (req, res) => {
  data_model.getAllSpeeds().then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/speed/count', (req, res) => {
  data_model.getSpeedPageCount().then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/speed/pages/:page', (req, res) => {
  data_model.getSpeedPage(req.params.page).then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/settings', (req, res) => {
  data_model.getSettings().then(response => {
    res.status(200).send(response);
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/settings/interval/:count', (req, res) => {
  data_model.setInterval(req.params.count).then(response => {
    res.status(200).send(response)
  })
  .catch(error => {
    res.status(500).send(error)
  })
})

app.get('/settings/flag', (req, res) => {
  data_model.setFlag(true).then(response => {
    res.status(200).send(response)
  })
  .catch(error => {
    res.status(500).send(error)
  })
})

app.get('/tags', (req, res) => {
  data_model.getTags().then(response => {
    res.status(200).send(response)
  })
  .catch(error => {
    res.status(500).send(error)
  })
})

app.get('/tags/delete/:id', (req, res) => {
  data_model.removeTag(req.params.id).then(response => {
    res.status(200).send(response)
  })
  .catch(error => {
    res.status(500).send(error)
  })
})

app.get('/tags/link/:tag/:speed', (req, res) => {
  data_model.linkTag(req.params.tag, req.params.speed).then(response => {
    res.status(200).send(response)
  })
  .catch(error => {
    res.status(500).send(error)
  })
})

app.get('/tags/unlink/:tag/:speed', (req, res) => {
  data_model.removeTagLink(req.params.tag, req.params.speed).then(response => {
    res.status(200).send(response)
  })
  .catch(error => {
    res.status(500).send(error)
  })
})

app.get('/tags/create/:name', (req, res) => {
  data_model.addTag(req.params.name).then(response => {
    res.status(200).send(response)
  })
  .catch(error => {
    res.status(500).send(error)
  })
})

// run the application
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})