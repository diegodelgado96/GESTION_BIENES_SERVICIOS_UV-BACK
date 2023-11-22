import { Router } from 'express'
import {signup, signin} from '../controllers/login.controller.js'

const router = Router()

router.post('/signup', signup)
router.post('/signin', signin)
/*router.get('/user/:id', getUser)
router.post('/user', createUser)
router.patch('/user/:id', updateUser)
router.delete('/user/:id', deleteUser)*/

export default router