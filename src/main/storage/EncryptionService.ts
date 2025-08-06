import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from 'crypto'

// For demonstration, using a fixed key. In a real app, this should be managed securely.
const key = scryptSync('your-secret-password', 'salt', 32)
const iv = Buffer.alloc(16, 0) // Initialization vector.

class EncryptionService {
  private algorithm = 'aes-256-cbc'

  encrypt(text: string): string {
    const cipher = createCipheriv(this.algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  decrypt(encryptedText: string): string {
    const decipher = createDecipheriv(this.algorithm, key, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
}

export const encryptionService = new EncryptionService()
