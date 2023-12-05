import { Router } from 'express'
import { createRequest, getAll, updateRequest } from '../controllers/request.controller.js'
import { verifyToken, verifyTokenAdmin } from '../controllers/verifyToken.controller.js'

const router = Router()

router.post('/request', createRequest)
router.get('/request/getAll', getAll)
router.patch('/request/:idRequest', verifyTokenAdmin, updateRequest)

export default router