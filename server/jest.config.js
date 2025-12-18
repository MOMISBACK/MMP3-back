module.exports = {
  // Utilise l'environnement Node.js pour les tests côté serveur
  testEnvironment: 'node',

  // Efface automatiquement les mocks et les instances entre chaque test
  clearMocks: true,

  // Le répertoire où Jest doit générer les rapports de couverture de code
  coverageDirectory: 'coverage',

  // Un chemin vers un module qui exécute du code pour configurer le framework de test
  // avant l'exécution de la suite de tests.
  setupFilesAfterEnv: ['./tests/setup.js'],

  // Le pattern utilisé par Jest pour détecter les fichiers de test
  testMatch: ['**/tests/**/*.test.js'],
};
