const tls = require('tls')
const TIMEOUT = 1500

const getRemainingDays = date => {
  const expiry = new Date(date).valueOf()
  const now = new Date().valueOf()
  return ((expiry - now) / 1000 / 60 / 60 / 24).toFixed(2)
}

const getCertExpiry = (host, port, servername) => {
  return new Promise((resolve, reject) => {
    const result = {}
    const socket = tls.connect({ host, port, servername })
    socket.setTimeout(TIMEOUT)
    socket.once('secureConnect', () => {
      const peerCert = socket.getPeerCertificate()
      result.validFrom = peerCert.valid_from
      result.validTo = peerCert.valid_to
      socket.destroy()
    })
    socket.once('close', () => resolve(result))
    socket.once('error', reject)
    socket.once('timeout', () => {
      socket.destroy(new Error(`Timeout after ${TIMEOUT} ms for ${servername}:${port}`))
    })
  })
}

const checkCertExpiration = async (host, port = 443, servername = host) => {
  const { validTo } = await getCertExpiry(host, port, servername)
  const remainingDays = getRemainingDays(validTo)
  return { validTo, remainingDays }
}

const main = async () => {
  const domains = ['google.com', 'facebook.com', 'wtcx.dev', '??????????.com']
  const tasks = domains.map(domain => checkCertExpiration(domain))
  const results = await Promise.allSettled(tasks)

  for (let i = 0; i < domains.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      const { validTo, remainingDays } = result.value
      console.log(`${domains[i]}'s cert is valid until ${validTo}. Remaining Days: ${remainingDays}`)
    } else {
      console.error(`Error checking ${domains[i]}: ${result.reason}`)
    }
  }
}

main()