/* Zikr Deen — Account / stats settings.
   projectId / ownerEmail : GitHub build me khud lag jaate hain (secrets GOOGLE_SERVICES_JSON aur OWNER_EMAIL se) — yahan type na karein.
   Agar GOOGLE_SERVICES_JSON secret nahi hai to ye placeholders waise hi rehte hain aur app pehle jaisa chalta hai
   (Google login, stats aur daily limit sab band). */
window.ZD_ACCOUNT={
  projectId:'__FIREBASE_PROJECT_ID__',
  ownerEmail:'__OWNER_EMAIL__',
  /* Ask Zikr Deen: ek din me kitne sawal. Owner ke liye koi limit nahi. */
  limits:{guest:5,user:25},
  /* cloud backup: itne ghante me ek baar apne aap (login ke baad) */
  autoBackupHours:12
};
