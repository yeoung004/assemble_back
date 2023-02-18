const express = require('express')
const router = express.Router()
const postQuery = require('../models/post')
const imageUploader = require('../middleware/ImageUploader')
const imageRemover = require('../middleware/ImageRemover')

router.get('/posts/:ID', (req, res) => {
  postQuery.selectPost(req.params)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.get('/project/:ID', (req, res) => {
  postQuery.selectProject(req.params)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.get('/tag/:POSTID', (req, res) => {
  postQuery.selectPostTag(req.params)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.get('/posts', (req, res) => {
  postQuery.selectPosts(req.query)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.get('/comment/:POSTID', (req, res) => {
  postQuery.selectComment(req.params)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.get('/liked/:POSTID', (req, res) => {
  postQuery.selectLiked(req.params)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.get('/count/:POSTID', (req, res) => {
  postQuery.selectCommentAndLikedCount(req.params)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      res.status(400).send('error')
    })
})

router.post('/post', async (req, res) => {
  try {
    const data = await postQuery.insertPost(req.body)
    if (data && req.body?.TAGS)
      postQuery.insertPostTag(req.body)
    res.status(200).json({ 'isUploaded': true })
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

router.post('/liked', async (req, res) => {
  try {
    const data = await postQuery.insertLiked(req.body)
    res.status(200).json({ 'isUploaded': true })
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

router.post('/comment', async (req, res) => {
  try {
    await postQuery.insertComment(req.body)
    const data = await postQuery.selectComment(req.body)
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

router.post('/picture', (req, res) => {
  const upload = imageUploader.single('image')
  upload(req, res, (error) => {
    if (error) {
      res.status(503).json({ 'isUploaded': false })
    } else {
      res.status(201).json({ 'isUploaded': true })
    }
  })
})

router.delete('/unliked', async (req, res) => {
  try {
    const data = await postQuery.deleteLiked(req.body)
    res.status(200).json({ 'isUpdated': true })
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

router.put('/post', async (req, res) => {
  try {
    await postQuery.updatePost(req.body)
    if (req.body?.key)
      imageRemover.deleteImage(req.body.key)
    const POSTID = await postQuery.getRecentPostedPostID(req.body.WRITER)
    await postQuery.deletePostTag(POSTID)
    await postQuery.insertPostTag(req.body)
    res.status(200).json({ 'isUploaded': true })
  } catch (error) {
    console.log(error)
    res.status(400).json({ 'error': true })
  }
})

router.put('/comment', async (req, res) => {
  try {
    await postQuery.updateComment(req.body)
    res.status(200).json({ 'isUploaded': true })
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

router.delete('/post', async (req, res) => {
  try {
    if (req.body?.key)
      imageRemover.deleteImage(req.body.key)
    await postQuery.deletePost(req.body)
    res.status(200).json({ 'isDeleted': true })
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

router.delete('/comment', async (req, res) => {
  try {
    await postQuery.deleteComment(req.body)
    const data = await postQuery.selectComment(req.body)
    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})


router.post('/test', async (req, res) => {
  try {
    postQuery.test(req.body)
    res.status(200).json({ 'isUploaded': true })
  } catch (error) {
    res.status(400).json({ 'error': true })
  }
})

module.exports = router;