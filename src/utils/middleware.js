const jwt = require('jsonwebtoken')
const { ACCESS_TOKEN_SECRET } = require('./config')
const { User, Session } = require('../models')

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7)
      const session = await Session.findByPk(token)
      if (session == null) return res.status(401)
      req.token = jwt.verify(token, ACCESS_TOKEN_SECRET)
      const user = await User.findByPk(req.token.id)
      if (user.disabled) return res.status(401).json({ error: 'Account disabled' })
    } catch (error){
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const errorHandler = (err, req, res, next) => {
  console.log('error handler')

  if ('errors' in err) {
    console.log('sisäl')
    res.status(400).json({ error: err.errors.map(e => e.message) })
  }

  next(err)
}

module.exports = {
  errorHandler,
  tokenExtractor
}