import crypto from "crypto";

/**
 * Generates a secure, random token.
 * @returns A random hex string.
 */
export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}
