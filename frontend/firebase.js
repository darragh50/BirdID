// Import Firebase functionality for initialization and authentication
import {initializeApp} from 'firebase/app';
import {getAuth,initializeAuth, getReactNativePersistence } from 'firebase/auth';
// Import AsyncStorage for persisting user sessions locally in react apps
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration object
// Located in my firebase console
const firebaseConfig = {
    apiKey: "AIzaSyD9kH39lpSZ0F72bXib8nm1BEF5i8dTy_M",
    authDomain: "bird-identifier-9f5e5.firebaseapp.com",
    projectId: "bird-identifier-9f5e5",
    storageBucket: "bird-identifier-9f5e5.firebasestorage.app",
    messagingSenderId: "205866500780",
    appId: "1:205866500780:web:cf8fb3a5996e6bd6625509"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
// This keeps users logged in even after closing the app
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Export the auth instance for use in other parts of the app
// Without exporting the auth object would only be available inside the file where it's defined
export { auth };