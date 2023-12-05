import { Router } from 'express'
import { addDoc, createReport, getReport, updateReport } from '../controllers/report.controller.js'
import { verifyToken, verifyTokenAdmin } from '../controllers/verifyToken.controller.js'

const router = Router()

router.post('/report', verifyToken, createReport)
router.get('/report/:ticket', verifyToken, getReport)
router.post('/report/doc/:ticket', addDoc)
router.patch('/report/:idReport', verifyTokenAdmin, updateReport)


export default router