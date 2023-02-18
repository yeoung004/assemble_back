const express = require('express')
const router = express.Router()
const axios = require('axios')
const params = require('../config/key')

const client_id = params.CLIENT_ID;
const client_secret = params.CLIENT_SECRET;

router.post('/github/access_token', (req, res, next) => {
  const request_token = req.body.code;
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${request_token}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then((response) => {
      res.send(JSON.stringify(response.data))
    })
    .catch((error) => {
      console.log('error')
    })
})

router.get('/github/user-info', function (req, res) {
  axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': req.get('Authorization')
    }
  }).then((response) => {
    response.data.sub = response.data.bio;
    response.data.email = response.data.bio;
    res.send(JSON.stringify(response.data))
  }).catch((error) => {
    console.log('error')
  })
})

module.exports = router;
