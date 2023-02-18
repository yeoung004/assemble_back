const express = require('express')
const router = express.Router()
const systemQuery = require('../models/system')

router.post('/block', (req, res) => {
  systemQuery.insertBlock(req.body)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.post('/report', (req, res) => {
  systemQuery.insertReport(req.body)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

module.exports = router