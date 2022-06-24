const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { ACCESS_TOKEN_SECRET } = require('../utils/config')
const { User, Session } = require('../models')
const { tokenExtractor } = require('../utils/middleware')

router.post('/login', async (req, res) => {
  const body = req.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  if (user.disabled) return res.status(401).json({ error: 'Account disabled' })

  const passwordCorrect = body.password === 'salainen'

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, ACCESS_TOKEN_SECRET)

  await Session.create({ token })

  res.json({ token, username: user.username, name: user.name, id: user.id })
})

router.delete('/logout', async (req, res) => {
  const deleted = await Session.destroy({ where: { token: req.body.token }})
  console.log('deleted', deleted)
  if (deleted) return res.sendStatus(204)
  return res.status(400).json({ error: 'Invalid session' })
})

module.exports = router