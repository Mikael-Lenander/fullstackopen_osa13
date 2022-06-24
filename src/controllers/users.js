const router = require('express').Router()
const { tokenExtractor } = require('../utils/middleware')
const { User, Blog, ReadingList } = require('../models')

router.get('/', async (req, res) => {
  let blogLists = await BlogList.findAll({ attributes: ['id'], where: { userId: req.token.id }})
  blogLists = blogLists.map(list => list.toJSON().id)
  console.log('blogLists', blogLists)
  
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.get('/:id', async (req, res) => {
  const where = req.query.read == 'true' ? { isRead: true } : req.query.read == 'false' ? { isRead: false } : {}
  console.log('where', where)
  const user = await User.findByPk(req.params.id, {
    include: {
      model: Blog,
      as: 'readings',
      attributes: {
        exclude: ['userId']
      },
      through: {
        attributes: ['id', 'isRead'],
        where
      },
    },
  })
  res.json(user)
})

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    next(error)
  }
})

router.put('/:username', tokenExtractor, async (req, res) => {
  const newUsername = req.params.username
  try {
    const user = await User.findOne({ where: { username: req.token.username }})
    user.username = newUsername
    await user.save()
    res.json(user)
  } catch(error) {
    res.status(400).json({ error })
  }
})

module.exports = router