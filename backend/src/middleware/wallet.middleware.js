function log(tag, msg, data) {
  const prefix = `[NotifDebug:backend:wallet-mw]`
  if (data !== undefined) {
    console.log(`${prefix} ${tag} — ${msg}`, data)
  } else {
    console.log(`${prefix} ${tag} — ${msg}`)
  }
}

function warn(tag, msg, err) {
  console.warn(`[NotifDebug:backend:wallet-mw] ${tag} — ${msg}`, err || '')
}

export const extractWalletAddress = (req, res, next) => {
  const path = req.originalUrl || req.url
  log('EXTRACT', `>>> extractWalletAddress | ${req.method} ${path}`)
  log('EXTRACT', `Headers: x-wallet-address=${req.headers['x-wallet-address'] ? req.headers['x-wallet-address'].slice(0, 16) + '...' : 'NOT_SET'} | wallet-address=${req.headers['wallet-address'] ? req.headers['wallet-address'].slice(0, 16) + '...' : 'NOT_SET'}`)

  try {
    let walletAddress = req.headers['x-wallet-address'] || req.headers['wallet-address']

    if (!walletAddress && req.body && req.body.walletAddress) {
      log('EXTRACT', `Falling back to body.walletAddress`)
      walletAddress = req.body.walletAddress
    }

    if (!walletAddress) {
      log('EXTRACT', `No wallet address found in headers or body — returning 400`)
      return res.status(400).json({
        message: 'Wallet address required',
        error: 'MISSING_WALLET_ADDRESS'
      })
    }

    req.walletAddress = walletAddress.toLowerCase().trim()
    log('EXTRACT', `Extracted and normalized: ${req.walletAddress.slice(0, 16)}...`)
    next()
  } catch (error) {
    warn('EXTRACT', `Exception: ${error.message}`, error)
    return res.status(500).json({
      message: 'Internal server error',
      error: 'WALLET_EXTRACTION_ERROR'
    })
  }
}

export const optionalWalletAddress = (req, res, next) => {
  const path = req.originalUrl || req.url
  log('OPT_EXTRACT', `>>> optionalWalletAddress | ${req.method} ${path}`)

  try {
    let walletAddress = req.headers['x-wallet-address'] || req.headers['wallet-address']

    if (!walletAddress && req.body && req.body.walletAddress) {
      walletAddress = req.body.walletAddress
    }

    req.walletAddress = walletAddress ? walletAddress.toLowerCase().trim() : null
    log('OPT_EXTRACT', `Result: ${req.walletAddress ? req.walletAddress.slice(0, 16) + '...' : 'null (optional)'}`)
    next()
  } catch (error) {
    req.walletAddress = null
    log('OPT_EXTRACT', `Exception — setting null and continuing`)
    next()
  }
}

export const validateWalletAddress = (req, res, next) => {
  const walletAddress = req.walletAddress || req.body.walletAddress || req.params.walletAddress
  log('VALIDATE', `>>> validateWalletAddress | input=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('VALIDATE', 'No wallet address found — 400')
      return res.status(400).json({
        message: 'Wallet address is required',
        error: 'MISSING_WALLET_ADDRESS'
      })
    }

    const normalizedAddress = walletAddress.toLowerCase().trim()
    const validPrefixes = ['bitcoincash:', 'bchtest:', 'chipnet:']
    const hasValidPrefix = validPrefixes.some(prefix => normalizedAddress.startsWith(prefix))

    if (!hasValidPrefix && normalizedAddress.length < 25) {
      log('VALIDATE', `Invalid format | hasValidPrefix=${hasValidPrefix} | length=${normalizedAddress.length} — 400`)
      return res.status(400).json({
        message: 'Invalid wallet address format',
        error: 'INVALID_WALLET_ADDRESS'
      })
    }

    req.walletAddress = normalizedAddress
    log('VALIDATE', `Validated OK: ${normalizedAddress.slice(0, 16)}...`)
    next()
  } catch (error) {
    warn('VALIDATE', `Exception: ${error.message}`, error)
    return res.status(500).json({
      message: 'Internal server error',
      error: 'WALLET_VALIDATION_ERROR'
    })
  }
}
