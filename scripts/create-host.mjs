/**
 * Create a Host user in Firebase Auth and Firestore + Assign custom claims
 * Usage: node scripts/create-host.mjs <EMAIL> <PASSWORD> "<NOMBRE>"
 * 
 * Example:
 * node scripts/create-host.mjs padrinos@diana.com XVdiana2026 "Padrinos de Vestido"
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const [,, email, password, nombre] = process.argv;

if (!email || !password || !nombre) {
  console.error('Uso: node scripts/create-host.mjs <Email> <Password> "<Nombre>"');
  process.exit(1);
}

// ── Init Firebase Admin ──────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: (function() {
      try {
        const admin = require('firebase-admin');
        return admin.credential.applicationDefault();
      } catch (e) {
        const { GoogleAuth } = require('google-auth-library');
        const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
        return { getAccessToken: () => auth.getAccessToken() };
      }
    })(),
    projectId: 'dianaxv-ddc70',
  });
}

const adminAuth = getAuth();
const db = getFirestore();

async function createHost() {
  try {
    console.log(`\n⚙️ 1. Registrando a ${nombre} en Firebase Auth...`);
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: nombre,
    });
    
    console.log(`\n⚙️ 2. Creando registro en Firestore...`);
    const hostRef = db.collection('hosts').doc();
    await hostRef.set({
      nombre: nombre,
      email: email,
      activo: true,
      creadoEn: FieldValue.serverTimestamp()
    });

    console.log(`\n⚙️ 3. Asignando permisos (Custom Claims) al UID: ${userRecord.uid}...`);
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: 'host',
      hostId: hostRef.id
    });

    console.log(`\n✅ ¡HOST CREADO CON ÉXITO!`);
    console.log(`-------------------------------------------------`);
    console.log(`Nombre: ${nombre}`);
    console.log(`Email:  ${email}`);
    console.log(`Pass:   ${password}`);
    console.log(`HostId: ${hostRef.id} (Firestore)`);
    console.log(`-------------------------------------------------\n`);

  } catch (error) {
    console.error('\n❌ Error al crear host:', error.message);
  }
}

createHost();
