import React, { createContext, useContext, useState } from 'react';

type Role = 'contractor' | 'labour' | null;

interface User {
  id: string;
  name: string;
  phone: string;
  location: string;
  skill?: string;
  experience?: string;
  workType?: string;
  availability?: string;
  businessType?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  role: Role;
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  updateProfile: (newData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>({
    id: 'lab_001',
    name: 'Vinay Badnoriya',
    phone: '+91 9876543210',
    location: 'Noida, Sector 62',
    skill: 'Painter / पेंटर',
    experience: '5',
    workType: 'Daily',
    availability: 'Available',
    isVerified: true,
  });

  const login = (userRole: Role) => setRole(userRole);
  const logout = () => {
    setRole(null);
    setUser(null);
  };

  const updateProfile = async (newData: Partial<User>) => {
    // Simulate API patch
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser(prev => prev ? { ...prev, ...newData } : null);
        resolve();
      }, 500);
    });
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
