"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { safeLocalStorage } from '@/lib/client-utils';
import { AuthStorage } from '@/lib/auth-storage';
import { initializeAdminUser } from '@/lib/admin-setup';
import { SupabaseAuth } from '@/lib/supabase-auth';

export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  empresa?: string;
  rut?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  fechaRegistro: Date;
  comprasRealizadas: number;
  totalComprado: number;
  tieneDescuento: boolean;
  porcentajeDescuento: number;
  provider?: 'email' | 'google' | 'microsoft' | 'facebook';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; url?: string }>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User | null) => void;
  autoRegister: (email: string, nombre: string, telefono?: string) => User;
  isSessionValid: () => boolean;
}

export interface RegisterData {
  email: string;
  password?: string;
  nombre: string;
  telefono?: string;
  empresa?: string;
  rut?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  provider?: 'email' | 'google' | 'microsoft' | 'facebook';
  tieneDescuento?: boolean;
  porcentajeDescuento?: number;
  fechaRegistro?: Date;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Mantener en false para evitar problemas de loading

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    try {
      initializeAdminUser();
      const currentUser = AuthStorage.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error cargando usuario:', error);
      setUser(null);
    }
  }, []);

  // Nota: El guardado de sesión se maneja en AuthStorage automáticamente

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    console.log('🔐 Intentando login con:', { email });
    
    try {
      // Verificar credenciales de admin predeterminadas
      if (email === 'admin@obraexpress.cl' && password === 'obraexpress2025$$') {
        console.log('✅ Login exitoso con credenciales admin');
        const adminUser: User = {
          id: 'admin_001',
          email: 'admin@obraexpress.cl',
          nombre: 'Administrador ObraExpress',
          fechaRegistro: new Date(),
          comprasRealizadas: 0,
          totalComprado: 0,
          tieneDescuento: true,
          porcentajeDescuento: 10,
          provider: 'email'
        };
        
        setUser(adminUser);
        AuthStorage.saveSession(adminUser, rememberMe);
        setIsLoading(false);
        return true;
      }
      
      // Buscar en usuarios registrados
      console.log('🔐 Buscando usuario en localStorage...');
      const foundUser = AuthStorage.findUser(email, password);
      
      if (foundUser) {
        console.log('✅ Login exitoso:', foundUser.email);
        setUser(foundUser);
        AuthStorage.saveSession(foundUser, rememberMe);
        setIsLoading(false);
        return true;
      }
      
      console.log('❌ Login fallido - Usuario no encontrado o contraseña incorrecta');
      console.log('💡 Intenta con: Email: admin@obraexpress.cl, Password: obraexpress2025$$');
      setIsLoading(false);
      return false;
    } catch (error) {
      logger.error('Error during login:', error);
      console.log('❌ Error en login:', error);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; url?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Iniciando login con Google OAuth...');
      
      // Usar Supabase OAuth para login con Google (siempre, ya que está configurado)
      const result = await SupabaseAuth.loginWithGoogle();
      
      if (result.error) {
        console.log('❌ Error en login con Google:', result.error);
        setIsLoading(false);
        return { success: false, error: result.error };
      }
      
      if (result.url) {
        console.log('🔄 Redirigiendo a Google OAuth...');
        // Redirigir al usuario a la página de autenticación de Google
        window.location.href = result.url;
        
        // El estado de loading se mantendrá hasta que regrese del callback
        return { success: true, url: result.url };
      }
      
      setIsLoading(false);
      return { success: false, error: 'No se pudo iniciar el proceso de autenticación' };
      
    } catch (error) {
      console.error('❌ Error en loginWithGoogle:', error);
      setIsLoading(false);
      return { success: false, error: 'Error interno del sistema' };
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    console.log('📝 Intentando registro con:', { email: userData.email, nombre: userData.nombre });
    
    try {
      // Verificar si el usuario ya existe (solo por email)
      const existingUser = AuthStorage.findUser(userData.email);
      
      if (existingUser) {
        console.log('❌ Usuario ya existe:', userData.email);
        setIsLoading(false);
        return false; // Usuario ya existe
      }
      
      // Validar campos requeridos
      if (!userData.email || !userData.password || !userData.nombre) {
        console.log('❌ Faltan campos requeridos');
        setIsLoading(false);
        return false;
      }
      
      // Crear nuevo usuario
      const newUser: User & { password?: string } = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        password: userData.password,
        nombre: userData.nombre,
        telefono: userData.telefono,
        fechaRegistro: userData.fechaRegistro || new Date(),
        comprasRealizadas: 0,
        totalComprado: 0,
        tieneDescuento: userData.tieneDescuento ?? true, // Descuento por registro
        porcentajeDescuento: userData.porcentajeDescuento ?? 5, // 5% de descuento por registrarse
        provider: userData.provider || 'email'
      };
      
      console.log('✅ Creando nuevo usuario:', newUser.email);
      
      // Guardar usuario y crear sesión
      AuthStorage.saveUser(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      AuthStorage.saveSession(userWithoutPassword, true); // Auto "recordarme" para nuevos usuarios
      
      console.log('✅ Registro exitoso y sesión creada');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      logger.error('Error registering user:', error);
      setIsLoading(false);
      return false;
    }
  };

  const autoRegister = (email: string, nombre: string, telefono?: string): User => {
    // Registro automático para usuarios que hacen checkout sin registrarse
    const autoUser: User = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      nombre,
      telefono,
      fechaRegistro: new Date(),
      comprasRealizadas: 1,
      totalComprado: 0, // Se actualizará después del checkout
      tieneDescuento: true, // Descuento por primera compra
      porcentajeDescuento: 3 // 3% de descuento por primera compra
    };
    
    // Guardar en lista de usuarios
    const storedUsers = JSON.parse(safeLocalStorage.getItem('obraexpress_users') || '[]');
    storedUsers.push({ ...autoUser, password: 'auto_generated' });
    safeLocalStorage.setItem('obraexpress_users', JSON.stringify(storedUsers));
    
    setUser(autoUser);
    return autoUser;
  };

  const logout = async () => {
    try {
      // Logout de Supabase
      await SupabaseAuth.logout();
    } catch (error) {
      console.error('Error en logout Supabase:', error);
    }
    
    // Limpiar localStorage como fallback
    AuthStorage.clearSession();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Actualizar sesión y almacenamiento
      AuthStorage.saveSession(updatedUser, AuthStorage.hasRememberMe());
      
      // Actualizar en la lista de usuarios
      const users = AuthStorage.getAllUsers();
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        // Guardamos todos los usuarios actualizados
        users.forEach(u => AuthStorage.saveUser(u));
      }
    }
  };

  const isSessionValid = (): boolean => {
    return AuthStorage.isSessionValid();
  };

  const setUserState = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      // Guardar en AuthStorage para persistencia
      AuthStorage.saveSession(newUser, true);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    setUser: setUserState,
    autoRegister,
    isSessionValid
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}