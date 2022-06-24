const router = require('express').Router()
const { Op } = require('sequelize')
const { Blog, User } = require('../models')
const { tokenExtractor } = require('../utils/middleware')

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    where[Op.or] = [
      {
      title: { [Op.iLike]: `%${req.query.search}%` }
      }, 
      {
        author: { [Op.iLike]: `%${req.query.search}%` }
      }
    ]
  }

  const blogs = await Blog.findAll({
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [
        ['likes', 'DESC']
      ]
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.token.id)
  const blog = await Blog.create({ ...req.body, userId: user.id })
  return res.json(blog)
})

router.delete('/:id', tokenExtractor, async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id)
    console.log('blog', blog)
    if (blog.userId !== req.token.id) return res.sendStatus(401)
    await Blog.destroy({
      where: {
        id: req.params.id
      }
    })
    res.sendStatus(204)
  } catch (error) {
    console.log('error', error)
    res.status(400).json({ error })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id)
    if (!blog) return res.sendStatus(404)
    blog.likes += 1
    await blog.save()
    res.json({ likes: blog.likes })
  } catch (err) {
    console.log(err)
  }
})

module.exports = router