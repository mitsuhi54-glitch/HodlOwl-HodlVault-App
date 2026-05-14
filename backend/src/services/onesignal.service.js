import { WalletPreferences } from '../models/wallet-preferences.model.js'

const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications'
function getAppId() { return process.env.ONESIGNAL_APP_ID }
function getApiKey() { return process.env.ONESIGNAL_REST_API_KEY }

function log(tag, msg, data) {
  const prefix = `[NotifDebug:backend:onesignal-svc]`
  if (data !== undefined) {
    console.log(`${prefix} ${tag} — ${msg}`, data)
  } else {
    console.log(`${prefix} ${tag} — ${msg}`)
  }
}

function warn(tag, msg, err) {
  console.warn(`[NotifDebug:backend:onesignal-svc] ${tag} — ${msg}`, err || '')
}

export async function sendAutoWithdrawalNotification(walletAddress, data) {
  const startTime = Date.now()
  log('SEND', `>>> ENTER sendAutoWithdrawalNotification | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | vaultName=${data?.vaultName || 'null'} | contractAddress=${data?.contractAddress || 'null'}`)

  try {
    const appId = getAppId()
    const apiKey = getApiKey()
    log('SEND', 'Step 1 — Checking OneSignal config from env')
    log('SEND', `ONESIGNAL_APP_ID set=${!!appId} | ONESIGNAL_REST_API_KEY set=${!!apiKey} | key_prefix=${apiKey ? apiKey.slice(0, 15) + '...' : 'EMPTY'}`)

    if (!appId || !apiKey) {
      warn('SEND', `Missing config | APP_ID=${!!appId} | API_KEY=${!!apiKey}`)
      return { sent: false, reason: 'missing_config' }
    }

    log('SEND', `Step 2 — Looking up wallet preferences for ${walletAddress.slice(0, 16)}...`)
    const prefs = await WalletPreferences.findByWalletAddress(walletAddress)
    if (!prefs) {
      log('SEND', `No preferences document found for wallet`)
      return { sent: false, reason: 'disabled' }
    }
    log('SEND', `Preferences found | notifications=${prefs.preferences?.notifications} | oneSignalPlayerId=${prefs.oneSignalPlayerId ? prefs.oneSignalPlayerId.slice(0, 16) + '...' : 'null'}`)

    if (!prefs.preferences.notifications) {
      log('SEND', 'User has notifications preference set to false — skipping')
      return { sent: false, reason: 'disabled' }
    }

    const playerId = prefs.oneSignalPlayerId
    if (!playerId) {
      log('SEND', 'No OneSignal player ID registered for this wallet — skipping')
      return { sent: false, reason: 'no_player_id' }
    }

    const appUrl = process.env.APP_URL || 'http://localhost:9001'

    const notificationPayload = {
      app_id: appId,
      include_player_ids: [playerId],
      headings: { en: 'Vault Auto-Withdrawn' },
      contents: {
        en: `Your "${data.vaultName || 'Unnamed Vault'}" vault was automatically withdrawn.`,
      },
      data: {
        type: 'AUTO_WITHDRAWAL',
        contractAddress: data.contractAddress,
      },
      web_url: `${appUrl}/#/my-vaults`,
    }

    log('SEND', `Step 4 — POSTING to OneSignal API | URL=${ONESIGNAL_API_URL} | playerId=${playerId.slice(0, 16)}...`)
    log('SEND', `Payload (sensitive fields masked): app_id=${appId.slice(0, 8)}... | include_player_ids=[${playerId.slice(0, 8)}...] | web_url=/${'#/my-vaults'} | data.type=AUTO_WITHDRAWAL`)

    const response = await fetch(ONESIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify(notificationPayload),
    })

    log('SEND', `OneSignal API responded | status=${response.status} | statusText=${response.statusText}`)

    const result = await response.json()
    log('SEND', `OneSignal API response body | id=${result.id || 'null'} | errors=${result.errors ? JSON.stringify(result.errors) : 'none'} | recipientCount=${result.recipient_count ?? 'N/A'}`)

    if (result.errors) {
      warn('SEND', `API returned errors: ${JSON.stringify(result.errors)}`)
      return { sent: false, reason: 'api_error', errors: result.errors }
    }

    const elapsed = Date.now() - startTime
    log('SEND', `<<< EXIT sendAutoWithdrawalNotification SUCCESS | notificationId=${result.id} | elapsed=${elapsed}ms`)
    return { sent: true, result }
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('SEND', `<<< EXIT sendAutoWithdrawalNotification EXCEPTION | elapsed=${elapsed}ms | error=${error.message}`, error)
    return { sent: false, reason: 'exception', error: error.message }
  }
}

export async function registerPlayerId(walletAddress, playerId) {
  const startTime = Date.now()
  log('REG', `>>> ENTER registerPlayerId | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | playerId=${playerId ? playerId.slice(0, 16) + '...' : 'null'}`)

  try {
    const normalizedAddress = walletAddress.toLowerCase()
    log('REG', `Upserting WalletPreferences | address=${normalizedAddress.slice(0, 16)}... | setting oneSignalPlayerId=${playerId.slice(0, 16)}...`)

    const preferences = await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { $set: { oneSignalPlayerId: playerId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    log('REG', `DB update result | exists=${!!preferences} | storedPlayerId=${preferences?.oneSignalPlayerId ? preferences.oneSignalPlayerId.slice(0, 16) + '...' : 'null'}`)

    const elapsed = Date.now() - startTime
    log('REG', `<<< EXIT registerPlayerId SUCCESS | elapsed=${elapsed}ms`)
    return preferences
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('REG', `<<< EXIT registerPlayerId FAILED | elapsed=${elapsed}ms | error=${error.message}`, error)
    throw error
  }
}

export async function unregisterPlayerId(walletAddress) {
  const startTime = Date.now()
  log('UNREG', `>>> ENTER unregisterPlayerId | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    const normalizedAddress = walletAddress.toLowerCase()
    log('UNREG', `Setting oneSignalPlayerId to null for ${normalizedAddress.slice(0, 16)}...`)

    const preferences = await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { $set: { oneSignalPlayerId: null } },
      { new: true },
    )

    log('UNREG', `DB update result | found=${!!preferences} | playerIdNow=${preferences?.oneSignalPlayerId}`)

    const elapsed = Date.now() - startTime
    log('UNREG', `<<< EXIT unregisterPlayerId SUCCESS | elapsed=${elapsed}ms`)
    return preferences
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('UNREG', `<<< EXIT unregisterPlayerId FAILED | elapsed=${elapsed}ms | error=${error.message}`, error)
    throw error
  }
}
