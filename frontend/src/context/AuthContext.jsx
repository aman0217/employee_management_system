import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username, password) => {
    const response = await api.post("/users/login", {
      username,
      password,
    });

    const data = response.data;

    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: data.userId,
        username: data.username,
        role: data.role,
      })
    );

    setToken(data.token);

    setUser({
      userId: data.userId,
      username: data.username,
      role: data.role,
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};