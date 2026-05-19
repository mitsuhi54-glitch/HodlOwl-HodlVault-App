import { Router } from 'express'
import { getBalance } from '../controllers/wallet.controller.js'

const router = Router()

router.get('/:address/balance', getBalance)

export default router
