/**
 * Oracle Service (Backend)
 * Fetches BCH price data from the General Protocols Oracle API.
 * Caches results to avoid rate limiting.
 */

export const ORACLE_PUBKEY = '02891f242b141f43f0c983ad00a1bebb3578f092d7c7051c5b4415cf80ff609f90' // PHP/BCH Oracle

const ORACLE_API_URL = 'https://oracles.generalprotocols.com/api/v1/oracles'
const CACHE_TTL_MS = 60 * 1000 // Cache for 60 seconds

let cachedData = null
let cachedAt = 0

/**
 * Fetch the latest oracle price, message, and signature.
 * Results are cached for 60 seconds.
 * @returns {Promise<{ priceInCents: number, messageHex: string, signatureHex: string, timestamp: number }>}
 */
export async function fetchOraclePrice() {
  const now = Date.now()

  // Return cached data if still fresh
  if (cachedData && now - cachedAt < CACHE_TTL_MS) {
    return cachedData
  }

  try {
    // Fetch oracle list and messages IN PARALLEL (neither depends on the other)
    const [oraclesResponse, messageResponse] = await Promise.all([
      fetch(ORACLE_API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(
        `https://oracles.generalprotocols.com/api/v1/oracleMessages?publicKey=${ORACLE_PUBKEY}&count=1`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        },
      ),
    ])

    if (!oraclesResponse.ok) {
      throw new Error(`Oracle API returned status: ${oraclesResponse.status}`)
    }
    if (!messageResponse.ok) {
      throw new Error(`Oracle messages API returned status: ${messageResponse.status}`)
    }

    const [oraclesData, messageData] = await Promise.all([
      oraclesResponse.json(),
      messageResponse.json(),
    ])

    // Find the PHP/BCH oracle
    const phpBchOracle = oraclesData.oracles.find((oracle) => oracle.publicKey === ORACLE_PUBKEY)

    if (!phpBchOracle || !phpBchOracle.messageMetrics) {
      throw new Error('PHP/BCH oracle not found or has no message metrics')
    }

    const currentPrice = phpBchOracle.messageMetrics.currentPrice

    if (!currentPrice) {
      throw new Error('No current price available from oracle metrics')
    }

    // PHP oracle returns price in whole pesos (not cents like USD oracle)
    // Example: 27356 means ₱27,356 per BCH
    const priceInPHP = currentPrice
    if (priceInPHP < 1000 || priceInPHP > 1000000) {
      throw new Error(`Oracle price out of reasonable range: ₱${priceInPHP}`)
    }

    const oracleMessage = messageData.oracleMessages[0]

    if (!oracleMessage) {
      throw new Error('No oracle messages available')
    }

    const result = {
      priceInCents: Math.round(priceInPHP * 100), // Convert to cents for contract compatibility
      messageHex: oracleMessage.message,
      signatureHex: oracleMessage.signature,
      timestamp: phpBchOracle.messageMetrics.maxMessageTimestamp,
    }

    // Update cache
    cachedData = result
    cachedAt = now

    console.log(
      `[Oracle] Price: ₱${priceInPHP.toFixed(2)} (whole pesos), cached for ${CACHE_TTL_MS / 1000}s`,
    )

    return result
  } catch (error) {
    console.error('[Oracle] Price fetch failed:', error.message)

    // Return stale cache if available, otherwise throw
    if (cachedData) {
      console.warn('[Oracle] Using stale cached data')
      return cachedData
    }

    throw error
  }
}
