import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    userID: "",
    username: "",
    role: "",
  });

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
