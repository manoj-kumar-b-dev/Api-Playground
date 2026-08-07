/*import { useContext, createContext } from "react";
import axios from "axios";
import React from "react";

interface AuthContextType {
  user: any;
  login: (formData: object) => Promise<void>;
  register: (formData: object) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<any>(null);

  const login = async (formData: object): Promise<void> => {
    try {
      const url = "http://localhost:5000/api/auth/login";
      const response = await axios.post(url, formData);
      const result = response.data;
      setUser(result);
      console.log("Login successful:", result);
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  const register = async (formData: object): Promise<void> => {
    try {
      const url = "http://localhost:5000/api/auth/register";
      const response = await axios.post(url, formData);
      const result = response.data;
      setUser(result);
      console.log("Register successful:", result);
    } catch (error: any) {
      console.error("Register failed:", error.response?.data || error.message);
    }
  };

  const value = {
    login,
    register,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
 */