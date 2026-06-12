const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
  let credential = admin.credential.applicationDefault();

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    // Resolve relative to the backend root directory
    const resolvedPath = path.resolve(__dirname, '..', serviceAccountPath);
    if (fs.existsSync(resolvedPath)) {
      credential = admin.credential.cert(require(resolvedPath));
    } else {
      console.warn(`[Firebase Admin] Service account file not found at: ${resolvedPath}`);
    }
  }

  admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || 'rentedge-8b42c'
  });
}

module.exports = admin;
