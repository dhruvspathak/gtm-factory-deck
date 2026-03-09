import { logger } from "../utils/logger.js";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface ClientRateLimit {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter
 */
export class RateLimiter {
  private clients: Map<string, ClientRateLimit> = new Map();
  private config: RateLimitConfig;

  constructor(
    maxRequests: number = 100,
    windowMs: number = 60 * 1000
  ) {
    this.config = { maxRequests, windowMs };
    this.startCleanupInterval();
  }

  /**
   * Check if client is within rate limit
   */
  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const clientLimit = this.clients.get(clientId);

    if (!clientLimit || now > clientLimit.resetTime) {
      // Create new window
      this.clients.set(clientId, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (clientLimit.count < this.config.maxRequests) {
      clientLimit.count++;
      return true;
    }

    logger.warn("Rate limit exceeded", {
      clientId,
      limit: this.config.maxRequests,
    });
    return false;
  }

  /**
   * Get remaining requests for client
   */
  getRemaining(clientId: string): number {
    const now = Date.now();
    const clientLimit = this.clients.get(clientId);

    if (!clientLimit || now > clientLimit.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - clientLimit.count);
  }

  /**
   * Reset specific client
   */
  reset(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Reset all clients
   */
  resetAll(): void {
    this.clients.clear();
  }

  /**
   * Cleanup expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [clientId, limit] of this.clients.entries()) {
        if (now > limit.resetTime) {
          this.clients.delete(clientId);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.debug("Rate limit cleanup", { cleaned });
      }
    }, this.config.windowMs);
  }
}

export default RateLimiter;
