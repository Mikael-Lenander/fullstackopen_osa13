const router = require('express').Router()
const { ReadingList, User } = require('../models')
const { tokenExtractor } = require('../utils/middleware')

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.token.id)
    let content = await ReadingList.create({ ...req.body, userId: user.id })
    content = content.toJSON()
    res.json({ blog_id: content.blogId, user_id: req.token.id })
  } catch (error) {
    next(error)
  }
})
  
router.put('/:id', tokenExtractor, async (req, res) => {
  const blogId = parseInt(req.params.id)
  const user = await User.findByPk(req.token.id)
  const readings = await ReadingList.findAll({ where: { userId: user.id }, attributes: ['id'] })
  const readingList = readings.map(r => r.toJSON().id)
  if (!readingList.includes(blogId)) return res.status(400).json({ error: 'You can only modify your own readings' })
  await ReadingList.update({ isRead: req.body.read }, { where: { id: blogId }})
  res.sendStatus(204)
})



module.exports = router