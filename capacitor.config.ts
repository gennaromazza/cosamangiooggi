const config = {
  appId: 'com.checucinooggi.mealplanner',
  appName: 'Che cucino oggi?',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // L'accesso lo gestisce il JavaScript di Firebase: il plugin serve solo per la finestra Google di Android
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
      useCredentialManager: false
    }
  }
};

export default config;
