import { ElectrumNetworkProvider } from 'cashscript'

const BCH_NETWORK = process.env.BCH_NETWORK || 'chipnet'

const queryProviders = new Map()

// UTXO cache: key = address, value = { utxos, timestamp }
// Reduces redundant Electrum calls within short time windows.
const utxoCache = new Map()
const UTXO_CACHE_TTL_MS = 10000 // 10 seconds

function getFallbackHostnames(network) {
  if (network === 'testnet3') return ['testnet.bitcoincash.network']
  if (network === 'chipnet') return ['chipnet.bch.ninja']
  if (network === 'mainnet') return ['bitcoincash.network']
  return []
}

function getQueryProvider(network, hostname) {
  const key = `${network}|${hostname || '__default__'}`
  if (queryProviders.has(key)) return queryProviders.get(key)
  const provider = hostname
    ? new ElectrumNetworkProvider(network, { hostname })
    : new ElectrumNetworkProvider(network)
  queryProviders.set(key, provider)
  return provider
}

export function inferNetworkFromAddress(address) {
  if (typeof address !== 'string') return BCH_NETWORK
  const prefix = address.includes(':') ? address.split(':')[0] : null
  if (prefix === 'bitcoincash') return 'mainnet'
  if (prefix === 'bchtest') {
    return BCH_NETWORK === 'chipnet' ? 'chipnet' : 'testnet3'
  }
  if (prefix === 'chipnet') return 'chipnet'
  return BCH_NETWORK
}

/**
 * Get balance for any address by querying UTXOs
 * @param {string} address - Bitcoin Cash address
 * @returns {Promise<bigint>} Balance in satoshis
 */
export async function getAddressBalance(address) {
  if (!address) throw new Error('Address is required')

  const now = Date.now()

  // Check cache first
  const cached = utxoCache.get(address)
  if (cached && now - cached.timestamp < UTXO_CACHE_TTL_MS) {
    return cached.balance
  }

  const network = inferNetworkFromAddress(address)
  const hostnames = [null, ...getFallbackHostnames(network)]
  let lastError = null

  console.log(`[BAL_TRACE] getAddressBalance | address="${address}" | network=${network} | hostnames=${JSON.stringify(hostnames)}`)

  for (const hostname of hostnames) {
    try {
      const provider = getQueryProvider(network, hostname)
      const t0 = performance.now()
      const utxos = await provider.getUtxos(address)
      const elapsed = (performance.now() - t0).toFixed(1)
      const totalSats = utxos.reduce((sum, u) => sum + BigInt(u.satoshis), 0n)
      const utxoDetails = utxos.map(u => `{txid:${u.txid?.slice(0,12)}… sats:${u.satoshis}}`)
      console.log(`[BAL_TRACE] getAddressBalance | hostname="${hostname || 'default'}" | ${utxos.length} UTXOs | ${utxoDetails.join(', ')} | total=${Number(totalSats)} sats | took=${elapsed}ms`)

      // Cache the result
      utxoCache.set(address, { utxos, balance: totalSats, timestamp: now })

      return totalSats
    } catch (e) {
      lastError = e
      console.log(`[BAL_TRACE] getAddressBalance | hostname="${hostname || 'default'}" FAILED: ${e.message}`)
    }
  }

  throw new Error(`Failed to get balance: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Get UTXOs for an address (includes transaction IDs for deposit tracking)
 * @param {string} address - Bitcoin Cash address
 * @returns {Promise<Array<{txid: string, vout: number, satoshis: number}>>} UTXOs
 */
export async function getAddressUtxos(address) {
  if (!address) throw new Error('Address is required')

  const now = Date.now()

  // Check cache first
  const cached = utxoCache.get(address)
  if (cached && now - cached.timestamp < UTXO_CACHE_TTL_MS) {
    return cached.utxos
  }

  const network = inferNetworkFromAddress(address)
  const hostnames = [null, ...getFallbackHostnames(network)]
  let lastError = null

  for (const hostname of hostnames) {
    try {
      const provider = getQueryProvider(network, hostname)
      const utxos = await provider.getUtxos(address)
      const mapped = utxos.map((u) => ({
        txid: u.txid,
        vout: u.vout,
        satoshis: Number(u.satoshis),
      }))
      console.log('[DEBUG:utxos] getAddressUtxos raw result:', utxos.map(u => ({
        txid: u.txid,
        txidLength: u.txid?.length,
        txidIs64Hex: /^[0-9a-f]{64}$/i.test(String(u.txid || '')),
        vout: u.vout,
        satoshis: u.satoshis,
      })))

      // Cache the result
      const balance = mapped.reduce((sum, u) => sum + BigInt(u.satoshis), 0n)
      utxoCache.set(address, { utxos: mapped, balance, timestamp: now })

      return mapped
    } catch (e) {
      lastError = e
    }
  }

  throw new Error(`Failed to get UTXOs: ${lastError?.message || 'Unknown error'}`)
}
