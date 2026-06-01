/**
 * Paytaca-Optimized Withdrawal Service
 * Addresses Paytaca-specific issues with covenant contracts
 */
import { hexToBin } from '@bitauth/libauth'

export async function paytacaOptimizedWithdrawal(
  contract,
  ownerAddress,
  oracleMessageHex,
  oracleSigHex,
) {
  console.log('[DEBUG] paytacaOptimizedWithdrawal called', {
    contractAddress: contract?.address,
    ownerAddress,
    networkPrefix: ownerAddress?.includes(':') ? ownerAddress.split(':')[0] : 'no-prefix',
    oracleMessageHex: oracleMessageHex?.slice(0, 40) + '...',
    oracleSigHex: oracleSigHex?.slice(0, 40) + '...',
  })
  try {
    const minerFee = 1000n
    const utxos = await contract.getUtxos()
    console.log('[DEBUG] Contract UTXOs:', utxos.length, utxos.map(u => ({ txid: u.txid, vout: u.vout, satoshis: u.satoshis })))

    if (!utxos || utxos.length === 0) {
      console.error('[DEBUG] No UTXOs found - vault has no balance')
      return {
        success: false,
        error: 'Vault has no balance to withdraw - it may have been auto-withdrawn already',
      }
    }

    const totalSatoshis = utxos.reduce((sum, u) => sum + BigInt(u.satoshis), 0n)
    console.log(`[DEBUG] Total balance: ${totalSatoshis} sats from ${utxos.length} UTXO(s)`)

    if (totalSatoshis <= minerFee) {
      console.error('[DEBUG] Total balance too low to cover miner fee')
      return {
        success: false,
        error: `Total balance (${totalSatoshis} sats) is too low to cover miner fee (${minerFee} sats)`,
      }
    }

    const amount = totalSatoshis - minerFee
    const oracleSigBin = hexToBin(oracleSigHex)

    console.log('[DEBUG] Broadcasting transaction via CashScript .send()...', {
      network: contract.provider?.network || 'unknown',
      hostname: contract.provider?.hostname || contract.provider?.opts?.hostname || 'default',
      functionCall: 'spend(oracleMessage, oracleSig).from(utxos).to(ownerAddress).withHardcodedFee(fee).send()',
      amount: amount.toString(),
      ownerAddress,
      utxoCount: utxos.length,
    })

    const txResult = await contract.functions
      .spend(hexToBin(oracleMessageHex), oracleSigBin)
      .from(utxos)
      .to([{ to: ownerAddress, amount: amount }])
      .withHardcodedFee(minerFee)
      .send()

    console.log('[DEBUG] CashScript .send() raw result:', {
      type: typeof txResult,
      isArray: Array.isArray(txResult),
      keys: txResult && typeof txResult === 'object' ? Object.keys(txResult) : null,
      txid: txResult?.txid || (typeof txResult === 'string' ? txResult.slice(0, 64) : 'N/A'),
      txidLength: (txResult?.txid || (typeof txResult === 'string' ? txResult : '')).length,
      hex: txResult?.hex ? (typeof txResult.hex === 'string' ? txResult.hex.slice(0, 40) + '...' : 'non-string') : null,
    })

    const txHash = txResult.txid || txResult
    console.log('[DEBUG] Extracted txHash:', { txHash: typeof txHash === 'string' ? txHash.slice(0, 64) : txHash, txHashLength: txHash?.length, is64Hex: /^[0-9a-f]{64}$/i.test(String(txHash)) })

    return {
      success: true,
      txHex: txResult,
      txHash,
      amountSatoshis: Number(amount),
    }
  } catch (error) {
    console.error('[DEBUG] CashScript .send() threw an error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
    })
    return {
      success: false,
      error: error.message || 'Transaction failed',
    }
  }
}
