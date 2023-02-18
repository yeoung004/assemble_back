const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const userQuery = require('../models/user')
const { ADMIN_ID, ADMIN_PASSWORD } = require('../config/key')
const hash = bcrypt.hashSync(ADMIN_PASSWORD, bcrypt.genSaltSync(10))
const { pushNotification } = require('../middleware/expoPusher')

router.get('/', (req, res) => {
  res.render('index')
})

router.post('/login', (req, res) => {
  const { id, pwd } = req.body
  const isAdmin = bcrypt.compareSync(pwd, hash)

  if (ADMIN_ID === id && isAdmin) {
    try {
      res.cookie('admin', hash, { maxAge: 360000 }).redirect('/admin')
    } catch (error) {
      res.render('error')
    }
  } else
    res.render('error')
})

router.get('/admin', (req, res) => {
  try {
    if (req.cookies.admin === hash) {
      userQuery.getAllUsers()
        .then((users) => {
          if (users) {
            const payload = { 'users': JSON.parse(JSON.stringify(users)) }
            res.render('admin', payload)
          }
        }).catch((err) => {
          console.log(err)
        })
    } else
      res.render('error')
  } catch (error) {
    res.render('error')
  }

})

router.post('/push', (req, res) => {
  if (req.cookies.admin === hash) {
    console.log(req.body)
    res.redirect('/admin')
  } else {
    res.render('error')
  }
})

router.get('/logout', (req, res) => {
  res.clearCookie('admin')
  res.redirect('/')
})

router.get('/error', (req, res) => {
  res.render('error')
})

module.exports = router;
