import { checkExpectedDeposits, getActiveWatchCount } from './deposit-watcher.service.js'
import { startElectrumSubscriber, isSubscriberConnected } from './electrum-subscriber.js'

let depositWatcherInterval = null
let isChecking = false
const CHECK_INTERVAL_MS = 5000 // Check every 5 seconds (fallback)

/**
 * Start the deposit watcher cron job + Electrum WebSocket subscriber
 */
export async function startDepositWatcherCron() {
  if (depositWatcherInterval) {
    console.log('[DepositWatcherCron] Already running')
    return
  }

  // Start Electrum WebSocket subscriber for push-based deposit detection
  const wsConnected = await startElectrumSubscriber()
  if (wsConnected) {
    console.log('[DepositWatcherCron] ✅ Electrum WebSocket subscriber active — deposits detected instantly')
  } else {
    console.log('[DepositWatcherCron] ⚠️ Electrum WebSocket unavailable — relying on 5s polling')
  }

  console.log(`[DepositWatcherCron] ✅ Started — polling every ${CHECK_INTERVAL_MS / 1000}s as fallback`)

  // Run immediately
  runCheck()

  // Then every interval (fallback — WebSocket provides push-based detection)
  depositWatcherInterval = setInterval(runCheck, CHECK_INTERVAL_MS)
}

/**
 * Stop the deposit watcher cron job
 */
export function stopDepositWatcherCron() {
  if (depositWatcherInterval) {
    clearInterval(depositWatcherInterval)
    depositWatcherInterval = null
    console.log('[DepositWatcherCron] Stopped')
  }
}

/**
 * Run a single check cycle
 */
async function runCheck() {
  if (isChecking) return
  isChecking = true
  try {
    const activeCount = getActiveWatchCount()
    if (activeCount > 0) {
      // Only log if WebSocket isn't handling it
      if (!isSubscriberConnected()) {
        console.log(`[DepositWatcherCron] Checking ${activeCount} expected deposit(s) via fallback polling...`)
      }
      await checkExpectedDeposits()
    }
  } catch (error) {
    console.error('[DepositWatcherCron] Error during check:', error.message)
  } finally {
    isChecking = false
  }
}
