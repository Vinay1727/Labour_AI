import React, { createContext, useContext, useState } from 'react';

type Role = 'contractor' | 'labour' | null;

interface User {
  id: string;
  name: string;
  phone: string;
  role?: string;
  location: {
    area: string;
    city: string;
  };
  skills?: string[];
  isSkilled?: boolean;
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
  login: (phone: string, role: Role, name?: string) => Promise<boolean>;
  checkUser: (phone: string) => Promise<{ exists: boolean; otpSent: boolean }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<{ isNewUser: boolean; token?: string; user?: any }>;
  logout: () => void;
  updateProfile: (newData: Partial<User>) => Promise<void>;
  updateRole: (role: Role) => Promise<void>;
  loading: boolean;
}

import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadStorageData();
  }, []);

  const normalizeUser = (userData: any): User => {
    if (!userData) return userData;

    let normalizedLocation = { area: 'Noida', city: 'Noida' }; // Default

    if (userData.location) {
      if (typeof userData.location === 'string') {
        const parts = userData.location.split(',');
        normalizedLocation = {
          area: parts[0]?.trim() || 'Noida',
          city: parts[1]?.trim() || 'Noida'
        };
      } else if (userData.location.address) {
        const parts = userData.location.address.split(',');
        normalizedLocation = {
          area: parts[0]?.trim() || 'Noida',
          city: parts[1]?.trim() || 'Noida'
        };
      } else if (userData.location.area) {
        normalizedLocation = {
          area: userData.location.area,
          city: userData.location.city || 'Noida'
        };
      }
    }

    return {
      ...userData,
      location: normalizedLocation
    };
  };

  const loadStorageData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const storedUser = await SecureStore.getItemAsync('userData');
      const storedRole = await SecureStore.getItemAsync('userRole');

      if (token && storedUser && storedRole) {
        setUser(normalizeUser(JSON.parse(storedUser)));
        setRole(storedRole as Role);
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async (phone: string) => {
    try {
      const res = await api.post('auth/request-otp', { phone });
      return res.data.data;
    } catch (error) {
      console.error('Check User Error:', error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otp: string, name?: string) => {
    const res = await api.post('auth/verify-otp', { phone, otp, name });
    const data = res.data.data;

    if (data.token && data.user) {
      const normalizedUser = normalizeUser(data.user);
      await SecureStore.setItemAsync('userToken', data.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(normalizedUser));
      if (normalizedUser.role) {
        await SecureStore.setItemAsync('userRole', normalizedUser.role);
        setRole(normalizedUser.role as Role);
      }
      setUser(normalizedUser);
    }
    return data;
  };

  const login = async (phone: string, roleType: Role, name?: string) => {
    try {
      const res = await api.post('auth/verify-otp', {
        phone,
        otp: '1234',
        name,
        role: roleType
      });

      const data = res.data.data;
      if (data.token) {
        const normalizedUser = normalizeUser(data.user);
        await SecureStore.setItemAsync('userToken', data.token);
        await SecureStore.setItemAsync('userData', JSON.stringify(normalizedUser));
        if (normalizedUser.role) {
          await SecureStore.setItemAsync('userRole', normalizedUser.role);
          setRole(normalizedUser.role as Role);
        }
        setUser(normalizedUser);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error.response?.data?.message || 'Authentication failed';
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    await SecureStore.deleteItemAsync('userRole');
    setRole(null);
    setUser(null);
  };

  const updateProfile = async (newData: Partial<User>) => {
    try {
      const res = await api.put('users/profile', newData);
      if (res.data.success) {
        const normalizedUser = normalizeUser(res.data.data);
        await SecureStore.setItemAsync('userData', JSON.stringify(normalizedUser));
        if (normalizedUser.role) {
          await SecureStore.setItemAsync('userRole', normalizedUser.role);
          setRole(normalizedUser.role as Role);
        }
        setUser(normalizedUser);
      }
    } catch (e) {
      console.error('Update Profile Failed', e);
      throw e;
    }
  };

  const updateRole = async (newRole: Role) => {
    try {
      const res = await api.put('users/profile', { role: newRole });
      if (res.data.success) {
        const normalizedUser = normalizeUser(res.data.data);
        await SecureStore.setItemAsync('userData', JSON.stringify(normalizedUser));
        if (normalizedUser.role) {
          await SecureStore.setItemAsync('userRole', normalizedUser.role);
          setRole(normalizedUser.role as Role);
        }
        setUser(normalizedUser);
      }
    } catch (e) {
      console.error("Update role failed", e);
    }
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout, checkUser, verifyOtp, updateProfile, updateRole, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
