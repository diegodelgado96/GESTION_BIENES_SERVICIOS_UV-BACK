import { Router } from 'express'
import { createRequest, getAll } from '../controllers/request.controller.js'
import { verifyToken, verifyTokenAdmin } from '../controllers/verifyToken.controller.js'

const router = Router()

router.post('/request', createRequest)
router.get('/request/getAll', getAll)

export default router