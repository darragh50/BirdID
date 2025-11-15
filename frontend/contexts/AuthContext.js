import React, {createContext, useState, useEffect, useContext} from "react";
// Import Firebase authentication methods
import { onAuthStateChanged } from "firebase/auth";
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
};