import mongoose from 'mongoose'

const walletPreferencesSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    oneSignalPlayerId: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerificationExpiry: {
      type: Date,
      default: null,
    },
    profileName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 30,
    },
    avatarSeed: {
      type: String,
      default: null,
      trim: true,
    },
    preferences: {
      autoWithdrawal: {
        type: Boolean,
        default: false,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: false,
      },
      defaultOracle: {
        type: String,
        default: 'oracles.cash',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
    },
  },
  {
    timestamps: true,
  },
)

// Static method to find preferences by wallet address
walletPreferencesSchema.statics.findByWalletAddress = function (walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() })
}

// Static method to get or create preferences
walletPreferencesSchema.statics.getOrCreate = async function (walletAddress) {
  const normalizedAddress = walletAddress.toLowerCase()

  let preferences = await this.findOne({ walletAddress: normalizedAddress })

  if (!preferences) {
    preferences = new this({
      walletAddress: normalizedAddress,
      preferences: {
        autoWithdrawal: false,
        notifications: true,
        emailNotifications: false,
        defaultOracle: 'oracles.cash',
        theme: 'auto',
      },
    })
    await preferences.save()
  }

  return preferences
}

// Static method to update preferences
walletPreferencesSchema.statics.updatePreferences = async function (walletAddress, newPreferences) {
  const normalizedAddress = walletAddress.toLowerCase()

  // Allowed preference fields
  const allowedFields = ['autoWithdrawal', 'notifications', 'emailNotifications', 'defaultOracle', 'theme']
  const updateData = {}

  allowedFields.forEach((field) => {
    if (newPreferences[field] !== undefined) {
      updateData[`preferences.${field}`] = newPreferences[field]
    }
  })

  // Top-level fields
  if (newPreferences.profileName !== undefined) {
    updateData.profileName = newPreferences.profileName || null
  }
  if (newPreferences.avatarSeed !== undefined) {
    updateData.avatarSeed = newPreferences.avatarSeed || null
  }

  const preferences = await this.findOneAndUpdate(
    { walletAddress: normalizedAddress },
    { $set: updateData },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )

  return preferences
}

// Static method to delete preferences
walletPreferencesSchema.statics.deleteByWalletAddress = function (walletAddress) {
  return this.findOneAndDelete({ walletAddress: walletAddress.toLowerCase() })
}

const WalletPreferences = mongoose.model('WalletPreferences', walletPreferencesSchema)

export { WalletPreferences }
