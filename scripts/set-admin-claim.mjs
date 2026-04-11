/**
 * Set custom claims for XV admin users
 * Run: node scripts/set-admin-claim.mjs <UID> <role> [hostId]
 * Examples:
 *   node scripts/set-admin-claim.mjs kT9N6aFW5BQB3Uevxs6RzwYdTOC2 superadmin
 *   node scripts/set-admin-claim.mjs <UID> host <hostDocId>
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// ── Args ──────────────────────────────────────────────────────
const [,, uid, role = 'superadmin', hostId] = process.argv;

if (!uid || !role) {
  console.error('Usage: node scripts/set-admin-claim.mjs <UID> <role> [hostId]');
  process.exit(1);
}

const claims = { role };
if (hostId) claims.hostId = hostId;

// ── Init with Application Default Credentials ─────────────────
// Works when: firebase CLI is logged in AND gcloud ADC is configured
// OR when GOOGLE_APPLICATION_CREDENTIALS env var points to a service account key
if (!getApps().length) {
  initializeApp({
    credential: (function() {
      try {
        const admin = require('firebase-admin');
        return admin.credential.applicationDefault();
      } catch (e) {
        // Fallback: try with project ID only (uses ADC from gcloud)
        const { GoogleAuth } = require('google-auth-library');
        const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
        return { getAccessToken: () => auth.getAccessToken() };
      }
    })(),
    projectId: 'dianaxv-ddc70',
  });
}

// ── Set Custom Claims ─────────────────────────────────────────
const adminAuth = getAuth();

try {
  // Get current user info
  const userRecord = await adminAuth.getUser(uid);
  console.log(`\n👤 Usuario: ${userRecord.email}`);
  console.log(`   UID: ${uid}`);
  console.log(`   Claims actuales: ${JSON.stringify(userRecord.customClaims || {})}`);

  // Set claims
  await adminAuth.setCustomUserClaims(uid, claims);

  console.log(`\n✅ Custom claims asignados:`);
  console.log(`   ${JSON.stringify(claims)}`);
  console.log(`\n🔁 El usuario debe hacer logout/login para que los claims surtan efecto.\n`);
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
