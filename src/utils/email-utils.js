const TYPOS = {
  'gmail.com': ['gamil.com', 'gmial.com', 'gmai.com', 'gmail.co', 'gmail.cm', 'gmal.com', 'gmale.com', 'gmaill.com', 'gnail.com', 'gmil.com'],
  'yahoo.com': ['yaho.com', 'yahooo.com', 'yahho.com', 'yahoo.co', 'yahooo.co', 'yhoo.com'],
  'hotmail.com': ['hotmal.com', 'hotmaill.com', 'hotmai.com', 'hotmil.com', 'hotmail.co', 'hotmal.com'],
  'outlook.com': ['outlok.com', 'outllok.com', 'outlook.co', 'outlok.co'],
  'icloud.com': ['icloud.co', 'icoud.com', 'iclud.com', 'icloud.cm'],
  'protonmail.com': ['protonail.com', 'protonmal.com', 'protonmil.com'],
  'proton.me': ['proton.me', 'protonm.me'],
  'aol.com': ['aol.co', 'aol.cm'],
  'live.com': ['live.co', 'live.cm'],
  'msn.com': ['msn.co'],
}

export function suggestDomainFix(email) {
  if (!email || !email.includes('@')) return null
  const parts = email.split('@')
  if (parts.length !== 2) return null
  const [, domain] = parts
  const domainLower = domain.toLowerCase()

  for (const [correct, typos] of Object.entries(TYPOS)) {
    if (typos.includes(domainLower)) {
      return { correct, typed: domain, suggestion: parts[0] + '@' + correct }
    }
  }

  return null
}
