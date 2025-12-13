/**
 * Rate limiting simple pour API routes
 * 
 * ⚠️ NOTE: Cette implémentation utilise un Map en mémoire.
 * Pour la production avec plusieurs instances, utilisez Upstash Redis.
 * 
 * Pour Upstash Redis:
 * npm install @upstash/ratelimit @upstash/redis
 * 
 * Puis remplacez cette implémentation par:
 * 
 * import { Ratelimit } from "@upstash/ratelimit"
 * import { Redis } from "@upstash/redis"
 * 
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, "1 m"),
 * })
 * 
 * export async function checkRateLimit(identifier: string) {
 *   const { success } = await ratelimit.limit(identifier)
 *   return { success }
 * }
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store en mémoire (fonctionne pour une seule instance)
// En production avec plusieurs instances Vercel, utilisez Redis
const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyer les entrées expirées (seulement côté serveur)
if (typeof global !== 'undefined' && typeof setInterval !== 'undefined') {
  // Éviter plusieurs setInterval si le module est rechargé
  if (!(global as any).__rateLimitCleanupStarted) {
    (global as any).__rateLimitCleanupStarted = true
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
          rateLimitStore.delete(key)
        }
      }
    }, 60000) // Nettoyage toutes les minutes
  }
}

/**
 * Vérifie si une requête est autorisée selon le rate limit
 * 
 * @param identifier - Identifiant unique (IP, user ID, etc.)
 * @param limit - Nombre maximum de requêtes
 * @param windowMs - Fenêtre de temps en millisecondes
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minute par défaut
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetTime < now) {
    // Nouvelle fenêtre ou fenêtre expirée
    const resetAt = now + windowMs
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: resetAt,
    })
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    }
  }

  // Fenêtre active
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetTime,
    }
  }

  // Incrémenter le compteur
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetTime,
  }
}

import { NextRequest } from 'next/server'

/**
 * Get client IP from NextRequest
 */
export function getClientIP(request: NextRequest): string {
  // Vercel fournit l'IP dans différents headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfIP) {
    return cfIP
  }
  
  // Fallback (en développement)
  return request.ip || '127.0.0.1'
}

