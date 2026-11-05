/**
 * Creates the Android signing keystore for Tatzli (PKCS#12, RSA 4096, valid 30 years) OUTSIDE the repo:
 *   ~/baerni-keystore/tatzli-release.p12  +  ~/baerni-keystore/README.txt (passwords – keep safe!)
 * Run once: npx tsx scripts/make-keystore.ts
 */
import forge from 'node-forge'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

const dir = join(homedir(), 'baerni-keystore')
const file = join(dir, 'tatzli-release.p12')
if (existsSync(file)) {
  console.log('keystore already exists:', file)
  process.exit(0)
}
mkdirSync(dir, { recursive: true })
const password = randomBytes(18).toString('base64url')
console.log('generating RSA 4096 key (takes a moment)…')
const keys = forge.pki.rsa.generateKeyPair(4096)
const cert = forge.pki.createCertificate()
cert.publicKey = keys.publicKey
cert.serialNumber = '01' + randomBytes(8).toString('hex')
cert.validity.notBefore = new Date()
cert.validity.notAfter = new Date()
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 30)
const attrs = [
  { name: 'commonName', value: 'Tatzli' },
  { name: 'organizationName', value: 'Tatzli (private family app)' },
  { name: 'localityName', value: 'Ostermundigen' },
  { name: 'countryName', value: 'CH' },
]
cert.setSubject(attrs)
cert.setIssuer(attrs)
cert.sign(keys.privateKey, forge.md.sha256.create())
const p12 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, { algorithm: '3des', friendlyName: 'tatzli', generateLocalKeyId: true })
const der = forge.asn1.toDer(p12).getBytes()
writeFileSync(file, Buffer.from(der, 'binary'))
const fp = forge.md.sha256.create().update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()).digest().toHex()
writeFileSync(
  join(dir, 'README.txt'),
  `Tatzli Android signing keystore – KEEP SAFE, do not commit.\n\nfile: ${file}\ntype: PKCS12\nalias: tatzli\nstore password = key password: ${password}\nSHA-256 cert fingerprint: ${fp}\ncreated: ${new Date().toISOString()}\n`,
)
console.log('keystore written to', file)
console.log('password stored in', join(dir, 'README.txt'))
