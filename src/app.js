import express from "express";
import userRoutes from './routes/user.routes.js'
import loginRoutes from './routes/login.routes.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/', loginRoutes)
app.use('/api/', userRoutes)

app.use((req, res, next) => {
  res.status(404).json({
    message: 'endpoint not found'
  })
})

export default app;