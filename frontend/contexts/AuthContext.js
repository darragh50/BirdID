import React, {createContext, useState, useEffect, useContext} from "react";
// Import Firebase authentication methods
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// Import the auth instance from Firebase config
import { auth } from "../firebase";

// Create the AuthContext (a container for shared auth state)
const AuthContext = createContext({});

// Custom hook to access the AuthContext in any component
export const useAuth = () => useContext(AuthContext);

// AuthProvider component. Wraps app to provide auth state to all children
export const AuthProvider = ({ children }) => {
    // State to hold the currently authenticated user
    const [user, setUser] = useState(null);
    // State to track if auth state is still being determined (like during startup)
    const [loading, setLoading] = useState(true);
    // State to store any authentication errors
    const [error, setError] = useState(null);
  
    // useEffect runs once on component mount to set up firebase auth listener
    useEffect(() => {
      // Listener that runs whenever the auth state changes (login, logout)
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          setUser(user);
          console.log('User logged in:', user.email);
        } else {
          // No user is signed in
          setUser(null);
          console.log('No user logged in');
        }
        // Stop the loading state once auth is initialized
        setLoading(false);
      });
  
    // Cleanup function. Unsubscribe from auth listener when component unmounts
    return unsubscribe;
    }, []);

    // Functions.....
    // Sign up function. Creates a new user with email and password
    const signUp = async (email, password) => {
        setError(null);
        try {
          // Attempt to create a user with firebase authentication
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          // Log the email of the newly created user for debugging
          console.log('User created:', userCredential.user.email);
          // Return the newly created user object (contains userID, email etc)
          return userCredential.user;
        } catch (error) {
          // Log any errors that occur during signup
          console.error('Signup error:', error.message);
          // Set the error state to display in the UI if needed
          setError(error.message);
          throw error;
        }
    };

    // Sign in function. Logs an existing user in with email and password
    const signIn = async (email, password) => {
        setError(null);
        try {
          // Attempt to authenticate the user with firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          // Debugging
          console.log('User signed in:', userCredential.user.email);
          // Return the authenticated user object
          return userCredential.user;
        }catch (error) {
          console.error('Login error:', error.message);
          setError(error.message);
          throw error;
       }
    };

    // Sign out function
    const logout = async () => {
      setError(null);
      try {
        // Attempt to sign the user out
        await signOut(auth);
        console.log('User signed out');
        // Catch any errors that occur during sign out
      } catch (error) {
        console.error('Logout error:', error.message);
        setError(error.message);
        throw error;
     }
   };
};