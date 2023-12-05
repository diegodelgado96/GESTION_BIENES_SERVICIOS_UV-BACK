import { Router } from 'express'
import { getActions, updateAction, newAction } from '../controllers/actions.controller.js'
import { verifyTokenAdmin } from '../controllers/verifyToken.controller.js'

const router = Router()

router.get('/actions/:idProvider', verifyTokenAdmin, getActions)
router.post('/actions/', verifyTokenAdmin, newAction)
router.patch('/actions/:idAction', verifyTokenAdmin, updateAction)

export default router