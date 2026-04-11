# Notas y Reglas para Agentes IA (Agent Context)

Este documento contiene las directrices restrictivas y el contexto arquitectónico de la aplicación para cualquier Agente de Inteligencia Artificial que deba trabajar en este proyecto.

> **Regla Crítica Inicial**: Al leer este archivo antes de operar, tú (el agente) te comprometes a seguir las directrices de CSS Mobile First, mantener Vanilla JS, y NO alterar la arquitectura de Firebase Custom Claims sin solicitar permiso explícito al usuario.

---

## 🏗️ 1. Definición Arquitectónica Estricta
- **Framework Principal:** Vanilla JavaScript (ES Modules).
- **Herramienta de Build:** Vite (\`vite.config.js\`).
- **CSS:** CSS Nativo puro con variables (\`:root\`). **Prohibido migrar a Tailwind**, SCSS u otros preprocesadores al menos que el usuario lo exija formalmente.
- **Backend:** Firebase (Auth, Firestore, Storage). Todo es *Serverless*.

---

## 📱 2. Reglas de Modificación Visual (UI/CSS)
- **Mobile First:** Todo el diseño se creó pensado principalmente para resoluciones de 375px (iPhone/Android).
- **Animaciones Clave:**
  - El sistema depende de efectos de "Scroll-Driven Animation" resueltos nativamente (observar \`/src/styles/sections/hero.css\`).
  - **🚨 ALERTA:** La sección \`#hero\` tiene una altura arbitraria de \`250vh\` y depende de su hijo directo (\`.hero__sticky\`) posicionado fijamente con \`position: sticky; top: 0; min-height: 100vh\`.
  - Si modificas el DOM del Hero, **NO QUITES** \`.hero__sticky\` ni sobreescribas \`250vh\`, ya que destruirás el cálculo matemático de apertura del *Sobre Parallax* ubicado en \`src/js/envelope.js\`.

---

## 🔒 3. Autenticación y Autorización (Admin Backoffice)
- **Ruta de Acceso:** El panel en la ruta de SPA \`#/admin\` está protegido por Firebase Auth.
- **Custom Claims obligatorios:** 
  Las validaciones a las bases de datos de \`firebase.rules\` leen el claim inyectado directamente en el JWT de Firebase Auth: \`request.auth.token.role == "superadmin"\` o \`role == "host"\`.
- Si el usuario te pide crear un "nuevo nivel de administración" (ej. "Coordinador de mesas"), deberás:
  1. Modificar las reglas \`firestore.rules\`.
  2. Modificar el router de protección en \`src/js/admin/index.js\`.
  3. Indicarle al usuario cómo correr localmente el script para asignar el custom claim de "coordinador" al nuevo UID.

---

## 📜 4. Estado Constante del Invitado
Al tocar \`/src/js/admin/\` o \`/src/js/sections/rsvp.js\`, recueda la Máquina de Estados oficial del RSVP:
1. \`pendiente\`: Creado por el host, no ha abierto la invitación.
2. \`visitado\`: Abrió el enlace pero no se registró (Útil para las stats).
3. \`confirmado\`: Confirmó boletos y tiene opción a descargar su código QR PDF.
4. \`rechazado\`: Confirmó que no asistirá.

---

## 🛠️ 5. Scripts de Ayuda
Dado que un cliente (browser) no tiene permisos de modificar el JWT de sus pares, existe un script local para que el Agente / Usuario cree hosts sin tener que configurar Cloud Functions:

\`\`\`bash
# Script local en NodeJS para crear usuarios Auth + Auth Claims de Firestore
$env:GOOGLE_APPLICATION_CREDENTIALS=".\service-account.json"
node scripts/create-host.mjs <Email> <Password> "<Nombre>"
\`\`\`

---

## ⚡ 6. Optimización de Tokens y Comunicación
- **Respuestas Concretas:** El agente debe proporcionar respuestas directas y soluciones técnicas precisas.
- **Minimalismo de Tokens:** Evitar explicaciones redundantes o decorativas. Ir al grano para minimizar el consumo de tokens.
- **Acción sobre Explicación:** Priorizar la ejecución de cambios y la entrega de código funcional sobre largas descripciones de lo que se va a hacer.
