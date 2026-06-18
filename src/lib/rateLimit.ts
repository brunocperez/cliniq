const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(ip: string, limite: number = 5, janelaSeg: number = 60): boolean {
  const agora = Date.now()
  const entry = requests.get(ip)

  if (!entry || agora > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: agora + janelaSeg * 1000 })
    return true // permitido
  }

  if (entry.count >= limite) {
    return false // bloqueado
  }

  entry.count++
  return true // permitido
}