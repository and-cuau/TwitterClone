import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedInGlobal, setIsLoggedInGlobal] = useState(false);

  return (
    <AuthContext.Provider
      value={{ isAdmin, setIsAdmin, isLoggedInGlobal, setIsLoggedInGlobal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
