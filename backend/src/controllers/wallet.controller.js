import { getAddressBalance } from '../utils/blockchain.js'

export const getBalance = async (req, res) => {
  const t0 = performance.now()
  try {
    const { address } = req.params
    const decodedAddr = decodeURIComponent(address)
    console.log(`[BAL_TRACE] getBalance handler | raw param: "${address}" | decoded: "${decodedAddr}"`)

    if (!decodedAddr) {
      return res.status(400).json({ success: false, message: 'Address parameter required' })
    }

    const balanceSats = await getAddressBalance(decodedAddr)
    const elapsed = (performance.now() - t0).toFixed(1)
    console.log(`[BAL_TRACE] getBalance handler | address="${decodedAddr}" | balance=${Number(balanceSats)} sats | took=${elapsed}ms`)
    res.json({
      success: true,
      address: decodedAddr,
      balanceSats: Number(balanceSats),
    })
  } catch (error) {
    const elapsed = (performance.now() - t0).toFixed(1)
    console.error(`[BAL_TRACE] getBalance handler | ERROR after ${elapsed}ms: ${error.message}`)
    res.status(500).json({ success: false, message: error.message })
  }
}
