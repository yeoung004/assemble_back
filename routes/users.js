const express = require('express')
const router = express.Router()
const userQuery = require('../models/user')
const imageUploader = require('../middleware/ImageUploader')
const {
  USER_INFO,
  REQUEST
} = require('../models')

router.get('/user/:ID', (req, res) => {
  USER_INFO.findByPk(req.params.ID)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('ERROR'))
})

router.get('/request/assemble/:ID', (req, res) => {
  userQuery.selectRequest(req.params)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('ERROR'))
  // REQUEST.findAll({
  //   attributes: ['ID'],
  //   where: {
  //     RECEIVERID: req.params.ID,
  //     REQUEST_TYPE: 1
  //   },
  //   include:[{ 
  //     model:USER_INFO, 
  //     attributes:[['ID', 'USERID'],'PROFILE_URL','USER_NAME'],
  //   }]
  // }).then((data) => {
  //   res.status(200).json(data)
  // }).catch((error) => {
  //   console.error(error)
  //   res.status(400).send('ERROR')
  // })
})

router.get('/coworker/block/:ID', (req, res) => {
  userQuery.selectBlock(req.params)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('ERROR'))
})

router.get('/notification/:ID', (req, res) => {
  userQuery.selectNotification(req.params)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('ERROR'))
})

router.get('/coworker/:ID', (req, res) => {
  userQuery.selectCoworker(req.params)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('ERROR'))
})

router.get('/chat', (req, res) => {
  let chattingUsers = req.query
  let users = []

  Object.keys(chattingUsers).map((user) => users.push(chattingUsers[user]))

  userQuery.selectChatUsers(users)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('error'))
})

router.get('/userInfo/:ID/:COWORKERID', async (req, res) => {
  try {
    const data = await userQuery.selectUserInfo(req.params)
    if (data.length) {
      let user = data[0];
      Promise.all([userQuery.selectUserCareers(req.params),
      userQuery.selectUserSkills(req.params),
      userQuery.selectUserInterests(req.params)])
        .then((result) => {
          let data = JSON.parse(JSON.stringify(result))
          const careers = JSON.parse(JSON.stringify(data[0]))
          let skills = [];
          let interests = []
          Object.keys(data[1]).forEach((skill) => skills.push(data[1][skill].SKILL))
          Object.keys(data[2]).forEach((interest) => interests.push(data[2][interest].INTEREST))
          user = {
            ...user,
            CAREERS: careers,
            INTERESTS: interests,
            SKILLS: skills
          }
          res.status(200).json(user)
        })
    } else {
      res.status(200).json(null)
    }
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

router.get('/profile/:ID', (req, res) => {
  userQuery.selectUserProfileUrl(req.params)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.patch('/loginInfo', (req, res) => {
  const info = req.ipInfo
  userQuery.updateUserAccessedInfo(req.body, info.country, info.ip, info.city)
    .then((data) => res.status(200).json({ 'isUploaded': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.patch('/coworker', (req, res) => {
  userQuery.updateCoworkerBlockState(req.body)
    .then((data) => res.status(200).json({ 'isUploaded': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.patch('/user/setting/allowing/email', (req, res) => {
  userQuery.updateAllowEmail(req.body)
    .then((data) => res.status(200).json({ 'isUploaded': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.patch('/user/setting/allowing/chat', (req, res) => {
  userQuery.updateAllowChat(req.body)
    .then((data) => res.status(200).json({ 'isUploaded': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.patch('/request/assemble', (req, res) => {
  userQuery.updateCoworker(req.body)
    .then((data) => res.status(200).json({ 'isUploaded': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.put('/info', (req, res) => {
  const user = req.body
  let promiseArray = [userQuery.updateUserInfo(user)]
  if (user?.INTERESTS?.length > 0) {
    promiseArray.push(userQuery.deleteColumns(user, 'USER_INTEREST'))
    promiseArray.push(userQuery.insertUserInterests(user))
  }
  if (user?.SKILLS?.length > 0) {
    promiseArray.push(userQuery.deleteColumns(user, 'USER_SKILL'))
    promiseArray.push(userQuery.insertUserSkills(user))
  }
  if (user?.CAREERS?.length > 0) {
    promiseArray.push(userQuery.deleteColumns(user, 'CAREER'))
    promiseArray.push(userQuery.insertUserCareers(user))
  }
  Promise.all(promiseArray).then((data) => {
    res.status(200).json({ 'isUploaded': true })
  }).catch((error) => res.status(400).json({ 'error': true }))
})

router.post('/info', (req, res) => {
  const info = req.ipInfo;
  userQuery.insertUserInfo(req.body, info.country, info.ip, info.city)
    .then((data) => {
      let infos = []

      if (req.body?.INTERESTS?.length > 0)
        infos.push(userQuery.insertUserInterests(req.body))
      if (req.body?.SKILLS?.length > 0)
        infos.push(userQuery.insertUserSkills(req.body))
      if (req.body?.CAREERS?.length > 0)
        infos.push(userQuery.insertUserCareers(req.body))

      if (infos.length > 0) {
        Promise.all(infos)
          .then(() => res.status(201).json({ 'isUploaded': true }))
          .catch((error) => res.status(400).json({ 'isUploaded': false }))
      } else
        res.status(201).json({ 'isUploaded': true })
    })
    .catch((error) => res.status(400).json({ 'isUploaded': false }))
})

router.post('/request/assemble', (req, res) => {
  userQuery.insertAssemble(req.body)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('ERROR'))
})

router.post('/notification', (req, res) => {
  userQuery.insertNotification(req.body)
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(400).send('ERROR'))
})

router.post('/coworker', (req, res) => {
  userQuery.insertCoworker(req.body)
    .then((data) => res.status(200).json({ 'isUploaded': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.post('/profile', (req, res) => {
  const upload = imageUploader.single('image')
  upload(req, res, (error) => {
    if (error) res.status(503).json({ 'isUploaded': false })
    else res.status(201).json({ 'isUploaded': true })
  })
})

router.delete('/coworker', (req, res) => {
  userQuery.deleteCoworker(req.body)
    .then((data) => res.status(200).json({ 'isDeleted': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.delete('/user', (req, res) => {
  userQuery.deleteUser(req.body)
    .then((data) => res.status(200).json({ 'isDeleted': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.delete('/notification/single', (req, res) => {
  userQuery.deleteANotification(req.body)
    .then((data) => res.status(200).json({ 'isDeleted': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.delete('/notification/multi', (req, res) => {
  userQuery.deleteNotifications(req.body)
    .then((data) => res.status(200).json({ 'isDeleted': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

router.delete('/request/assemble', (req, res) => {
  userQuery.deleteRequest(req.body)
    .then((data) => res.status(200).json({ 'isDeleted': true }))
    .catch((error) => res.status(400).json({ 'error': true }))
})

module.exports = router;