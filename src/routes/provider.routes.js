import { Router } from 'express'
import { getProviders, createProviders, updateProvider } from '../controllers/provider.controller.js'
import { verifyToken, verifyTokenAdmin } from '../controllers/verifyToken.controller.js'

const router = Router()

router.get('/provider', verifyTokenAdmin, getProviders)
router.post('/provider', verifyTokenAdmin, createProviders)
router.patch('/provider/:idProvider', updateProvider)

export default router