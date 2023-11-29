import { CLIENT } from './config.js'
import actionRoutes from './routes/action.routes.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import express from 'express'
import userRoutes from './routes/user.routes.js'
import loginRoutes from './routes/login.routes.js'
import providerRoutes from './routes/provider.routes.js'
import reportRoutes from './routes/report.routes.js'
import requestRoutes from './routes/request.routes.js'

const app = express()

app.use(bodyParser.json({ limit: '50mb'}))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true}))
app.use(cors({ origin: CLIENT, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/', actionRoutes)
app.use('/api/', loginRoutes)
app.use('/api/', userRoutes)
app.use('/api/', reportRoutes)
app.use('/api/', providerRoutes)
app.use('/api/', requestRoutes)

app.use((req, res) => {
  res.status(404).json({
    message: 'endpoint not found'
  })
})

export default app