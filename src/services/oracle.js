export const ORACLE_PUBKEY = '02891f242b141f43f0c983ad00a1bebb3578f092d7c7051c5b4415cf80ff609f90'

export async function fetchOraclePrice() {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  const mockPrice = 27356
  const mockMessage = `010000000000006acb${mockPrice.toString(16).padStart(8, '0')}504850`
  const mockSignature = '3044022045a6e8f5c7b9d2e4f1a3b5c7d9e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6022050b2d4f6a8c0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4'
  return {
    price: mockPrice,
    message_hex: mockMessage,
    signature_hex: mockSignature,
    oracle_pubkey_hex: ORACLE_PUBKEY,
    status: 'success',
    source: 'mock',
    timestamp: Date.now(),
    note: 'Mock oracle price for demo',
  }
}
