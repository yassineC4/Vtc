#!/usr/bin/env node

/**
 * Script de vérification avant déploiement
 * Vérifie que toutes les variables d'environnement nécessaires sont présentes
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
];

console.log('🔍 Vérification des variables d\'environnement...\n');

const missing = [];
const present = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    present.push(varName);
    console.log(`✅ ${varName}`);
  } else {
    missing.push(varName);
    console.log(`❌ ${varName} - MANQUANTE`);
  }
});

console.log('\n📊 Résumé :');
console.log(`✅ Présentes : ${present.length}/${requiredEnvVars.length}`);
console.log(`❌ Manquantes : ${missing.length}/${requiredEnvVars.length}`);

if (missing.length > 0) {
  console.log('\n⚠️  Variables manquantes :');
  missing.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n💡 Assurez-vous de définir ces variables dans votre plateforme de déploiement.');
  process.exit(1);
} else {
  console.log('\n✅ Toutes les variables d\'environnement sont présentes !');
  console.log('🚀 Vous êtes prêt à déployer.');
  process.exit(0);
}

