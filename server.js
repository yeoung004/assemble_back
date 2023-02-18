const express = require('express')
const path = require('path')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const RateLimit = require('express-rate-limit')
const server = express()

const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const postRouter = require('./routes/post')
const systemRouter = require('./routes/system')
// const mainRouter = require('./routes/main')
const projectSchema = require('./schema/project')
const expressIP = require('express-ip')
const { graphqlHTTP } = require('express-graphql')

//Server Security
const apiLimiter = RateLimit({
  windowMs: 60 * 1000, //Limit 100 request per a minute
  max: 50,
  delayMs: 0,
  handler(req, res) {
    res.status(429).json({ error: 'too much request' })
  },
})
server.disable('x-powered-by')
server.use(helmet())

server.set('view engine', 'ejs')
server.use(apiLimiter)
server.use(expressIP().getIpInfoMiddleware)
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())
server.use(express.static(path.join(__dirname, 'views')))

// if (process.env.NODE_ENV === 'dev')
//     server.use('/', mainRouter)
server.use('/auth', authRouter)
server.use('/users', usersRouter)
server.use('/post', postRouter)
server.use('/system', systemRouter)
server.use('/project', graphqlHTTP({
  schema: projectSchema,
  graphiql: false,
  // graphiql: true,
  pretty: true
}))

server.listen('3000', () => {
  console.log('Assemble server is started...')
})

module.exports = server
