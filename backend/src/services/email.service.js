import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { WalletPreferences } from '../models/wallet-preferences.model.js'

const VERIFICATION_CODE_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

function getHost() { return process.env.SMTP_HOST }
function getPort() { return parseInt(process.env.SMTP_PORT || '587', 10) }
function getUser() { return process.env.SMTP_USER }
function getPass() { return process.env.SMTP_PASS }
function getFrom() { return process.env.EMAIL_FROM || 'HodlOwl <noreply@hodlowl.app>' }
function getAppUrl() { return process.env.APP_URL || 'http://localhost:9001' }

function log(tag, msg, data) {
  const prefix = `[NotifDebug:backend:email-svc]`
  if (data !== undefined) {
    console.log(`${prefix} ${tag} — ${msg}`, data)
  } else {
    console.log(`${prefix} ${tag} — ${msg}`)
  }
}

function warn(tag, msg, err) {
  console.warn(`[NotifDebug:backend:email-svc] ${tag} — ${msg}`, err || '')
}

function createTransporter() {
  return nodemailer.createTransport({
    host: getHost(),
    port: getPort(),
    secure: getPort() === 465,
    auth: {
      user: getUser(),
      pass: getPass(),
    },
  })
}

function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString()
}

function buildVerificationEmailHtml(code) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #00d588; padding: 20px; text-align: center;">
        <h1 style="color: #000; margin: 0;">HodlOwl</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Enter the code below in the app to verify your email address:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #fff; border: 2px solid #00d588; border-radius: 8px; padding: 20px 40px; display: inline-block; letter-spacing: 8px; font-size: 36px; font-weight: bold; color: #333;">
            ${code}
          </div>
        </div>
        <p style="color: #999; font-size: 13px; line-height: 1.5;">
          This code expires in 10 minutes. If you did not request this, you can ignore this email.
        </p>
      </div>
    </div>
  `
}

export async function sendEmailNotification(walletAddress, data) {
  const startTime = Date.now()
  log('SEND', `>>> ENTER sendEmailNotification | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | vaultName=${data?.vaultName || 'null'}`)

  try {
    const host = getHost()
    const port = getPort()
    const user = getUser()
    const pass = getPass()
    log('SEND', `Step 1 — Checking SMTP config | host=${host} | port=${port} | user=${user ? user.slice(0, 6) + '...' : 'null'} | pass_set=${!!pass}`)

    if (!host || !port || !user || !pass) {
      warn('SEND', 'Missing SMTP config')
      return { sent: false, reason: 'missing_config' }
    }

    log('SEND', `Step 2 — Looking up wallet preferences for ${walletAddress.slice(0, 16)}...`)
    const prefs = await WalletPreferences.findByWalletAddress(walletAddress)
    if (!prefs) {
      log('SEND', 'No preferences document found for wallet')
      return { sent: false, reason: 'disabled' }
    }

    log('SEND', `Preferences found | email=${prefs.email ? prefs.email.slice(0, 6) + '...' : 'null'} | emailNotifications=${prefs.preferences?.emailNotifications}`)

    if (!prefs.email) {
      log('SEND', 'No email address registered — skipping')
      return { sent: false, reason: 'no_email' }
    }

    if (!prefs.preferences.emailNotifications) {
      log('SEND', 'Email notifications preference set to false — skipping')
      return { sent: false, reason: 'disabled' }
    }

    if (!prefs.emailVerified) {
      log('SEND', 'Email not verified — skipping')
      return { sent: false, reason: 'not_verified' }
    }

    const subject = `HodlOwl — Vault Auto-Withdrawn: ${data.vaultName || 'Unnamed Vault'}`
    const appUrl = getAppUrl()
    const vaultLink = `${appUrl}/#/my-vaults`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00d588; padding: 20px; text-align: center;">
          <h1 style="color: #000; margin: 0;">HodlOwl</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Vault Auto-Withdrawn</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Your vault <strong>${data.vaultName || 'Unnamed Vault'}</strong> has been automatically withdrawn.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Contract: <code style="background: #eee; padding: 2px 6px; border-radius: 3px;">${data.contractAddress || 'N/A'}</code>
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${vaultLink}" style="background-color: #00d588; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              View My Vaults
            </a>
          </div>
          <p style="color: #999; font-size: 12px; line-height: 1.5;">
            You received this email because you enabled email notifications for your HodlOwl wallet.
            <br>
            <a href="${appUrl}/#/my-vaults" style="color: #00d588;">Manage notification preferences</a>
          </p>
        </div>
      </div>
    `

    log('SEND', `Step 3 — Creating SMTP transporter`)
    const transporter = createTransporter()

    log('SEND', `Step 4 — Sending email to ${prefs.email.slice(0, 6)}...`)
    const info = await transporter.sendMail({
      from: getFrom(),
      to: prefs.email,
      subject,
      html,
    })

    log('SEND', `Email sent | messageId=${info.messageId} | accepted=${info.accepted?.length || 0} | rejected=${info.rejected?.length || 0} | response=${info.response?.slice(0, 100) || 'N/A'}`)

    const elapsed = Date.now() - startTime
    log('SEND', `<<< EXIT sendEmailNotification SUCCESS | messageId=${info.messageId} | elapsed=${elapsed}ms`)
    return { sent: true, messageId: info.messageId }
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('SEND', `<<< EXIT sendEmailNotification EXCEPTION | elapsed=${elapsed}ms | error=${error.message}`, error)
    return { sent: false, reason: 'exception', error: error.message }
  }
}

export async function registerEmail(walletAddress, email) {
  const startTime = Date.now()
  log('REG', `>>> ENTER registerEmail | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | email=${email ? email.slice(0, 6) + '...' : 'null'}`)

  try {
    const normalizedAddress = walletAddress.toLowerCase()
    const code = generateVerificationCode()
    const expiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS)

    log('REG', `Upserting WalletPreferences | address=${normalizedAddress.slice(0, 16)}... | setting email=${email} | code=${code} | expires=${expiry.toISOString()}`)

    const preferences = await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      {
        $set: {
          email,
          emailVerified: false,
          emailVerificationCode: code,
          emailVerificationExpiry: expiry,
          'preferences.emailNotifications': true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    log('REG', `DB update result | exists=${!!preferences} | storedEmail=${preferences?.email ? preferences.email.slice(0, 6) + '...' : 'null'}`)

    log('REG', `Step 2 — Sending verification email to ${email.slice(0, 6)}...`)
    const transporter = createTransporter()
    const info = await transporter.sendMail({
      from: getFrom(),
      to: email,
      subject: 'HodlOwl — Verify Your Email Address',
      html: buildVerificationEmailHtml(code),
    })
    log('REG', `Verification email sent | messageId=${info.messageId} | accepted=${info.accepted?.length || 0} | rejected=${info.rejected?.length || 0}`)

    const elapsed = Date.now() - startTime
    log('REG', `<<< EXIT registerEmail SUCCESS | elapsed=${elapsed}ms`)
    return { preferences, verificationSent: true }
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('REG', `<<< EXIT registerEmail FAILED | elapsed=${elapsed}ms | error=${error.message}`, error)
    throw error
  }
}

export async function verifyEmailCode(walletAddress, code) {
  const startTime = Date.now()
  log('VERIFY', `>>> ENTER verifyEmailCode | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | code=${code}`)

  try {
    const normalizedAddress = walletAddress.toLowerCase()
    const prefs = await WalletPreferences.findByWalletAddress(normalizedAddress)

    if (!prefs) {
      log('VERIFY', 'No preferences found — 404')
      return { success: false, reason: 'not_found' }
    }

    if (!prefs.email) {
      log('VERIFY', 'No email registered — cannot verify')
      return { success: false, reason: 'no_email' }
    }

    if (prefs.emailVerified) {
      log('VERIFY', 'Email already verified')
      return { success: true, alreadyVerified: true }
    }

    if (!prefs.emailVerificationCode) {
      log('VERIFY', 'No verification code found — may have expired')
      return { success: false, reason: 'no_code' }
    }

    if (new Date() > new Date(prefs.emailVerificationExpiry)) {
      log('VERIFY', 'Verification code expired')
      return { success: false, reason: 'expired' }
    }

    if (prefs.emailVerificationCode !== code) {
      log('VERIFY', 'Incorrect verification code')
      return { success: false, reason: 'incorrect' }
    }

    log('VERIFY', 'Code matches — marking email as verified')
    const updated = await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      {
        $set: { emailVerified: true },
        $unset: { emailVerificationCode: '', emailVerificationExpiry: '' },
      },
      { new: true },
    )

    const elapsed = Date.now() - startTime
    log('VERIFY', `<<< EXIT verifyEmailCode SUCCESS | elapsed=${elapsed}ms`)
    return { success: true, preferences: updated }
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('VERIFY', `<<< EXIT verifyEmailCode EXCEPTION | elapsed=${elapsed}ms | error=${error.message}`, error)
    throw error
  }
}

export async function resendVerificationCode(walletAddress) {
  const startTime = Date.now()
  log('RESEND', `>>> ENTER resendVerificationCode | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    const normalizedAddress = walletAddress.toLowerCase()
    const prefs = await WalletPreferences.findByWalletAddress(normalizedAddress)

    if (!prefs || !prefs.email) {
      log('RESEND', 'No email registered — cannot resend')
      return { success: false, reason: 'no_email' }
    }

    if (prefs.emailVerified) {
      log('RESEND', 'Email already verified — nothing to resend')
      return { success: true, alreadyVerified: true }
    }

    const code = generateVerificationCode()
    const expiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS)

    log('RESEND', `Generating new code | code=${code} | expires=${expiry.toISOString()}`)
    await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { $set: { emailVerificationCode: code, emailVerificationExpiry: expiry } },
    )

    log('RESEND', `Sending verification email to ${prefs.email.slice(0, 6)}...`)
    const transporter = createTransporter()
    const info = await transporter.sendMail({
      from: getFrom(),
      to: prefs.email,
      subject: 'HodlOwl — Verify Your Email Address',
      html: buildVerificationEmailHtml(code),
    })
    log('RESEND', `Verification email resent | messageId=${info.messageId}`)

    const elapsed = Date.now() - startTime
    log('RESEND', `<<< EXIT resendVerificationCode SUCCESS | elapsed=${elapsed}ms`)
    return { success: true }
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('RESEND', `<<< EXIT resendVerificationCode EXCEPTION | elapsed=${elapsed}ms | error=${error.message}`, error)
    throw error
  }
}

export async function unregisterEmail(walletAddress) {
  const startTime = Date.now()
  log('UNREG', `>>> ENTER unregisterEmail | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    const normalizedAddress = walletAddress.toLowerCase()
    log('UNREG', `Setting email to null for ${normalizedAddress.slice(0, 16)}...`)

    const preferences = await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      {
        $set: { email: null, 'preferences.emailNotifications': false },
        $unset: { emailVerified: '', emailVerificationCode: '', emailVerificationExpiry: '' },
      },
      { new: true },
    )

    log('UNREG', `DB update result | found=${!!preferences} | emailNow=${preferences?.email}`)

    const elapsed = Date.now() - startTime
    log('UNREG', `<<< EXIT unregisterEmail SUCCESS | elapsed=${elapsed}ms`)
    return preferences
  } catch (error) {
    const elapsed = Date.now() - startTime
    warn('UNREG', `<<< EXIT unregisterEmail FAILED | elapsed=${elapsed}ms | error=${error.message}`, error)
    throw error
  }
}
