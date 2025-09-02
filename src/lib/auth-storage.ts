"use client";

// Sistema de almacenamiento de autenticación mejorado para sitios estáticos
import { safeLocalStorage } from './client-utils';
import { User } from '@/contexts/AuthContext';

const STORAGE_KEYS = {
  USER: 'obraexpress_user',
  USERS: 'obraexpress_users', 
  SESSION: 'obraexpress_session',
  REMEMBER_ME: 'obraexpress_remember_me'
};

export interface Session {
  userId: string;
  email: string;
  loginTime: number;
  rememberMe: boolean;
  expiresAt: number;
}

export class AuthStorage {
  // Configuración de expiración
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private static readonly REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 días

  // Guardar sesión con "Recordarme"
  static saveSession(user: User, rememberMe: boolean = false): void {
    const now = Date.now();
    const duration = rememberMe ? this.REMEMBER_ME_DURATION : this.SESSION_DURATION;
    
    const session: Session = {
      userId: user.id,
      email: user.email,
      loginTime: now,
      rememberMe,
      expiresAt: now + duration
    };

    safeLocalStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    safeLocalStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    if (rememberMe) {
      safeLocalStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    }
  }

  // Verificar si la sesión es válida
  static isSessionValid(): boolean {
    const sessionData = safeLocalStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionData) return false;

    try {
      const session: Session = JSON.parse(sessionData);
      const now = Date.now();
      
      if (now > session.expiresAt) {
        // Sesión expirada, limpiar
        this.clearSession();
        return false;
      }
      
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  // Obtener usuario actual si la sesión es válida
  static getCurrentUser(): User | null {
    if (!this.isSessionValid()) return null;

    const userData = safeLocalStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return null;

    try {
      const user = JSON.parse(userData);
      return {
        ...user,
        fechaRegistro: new Date(user.fechaRegistro)
      };
    } catch {
      return null;
    }
  }

  // Renovar sesión (para mantener activa durante uso)
  static renewSession(): void {
    const sessionData = safeLocalStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionData) return;

    try {
      const session: Session = JSON.parse(sessionData);
      const now = Date.now();
      const duration = session.rememberMe ? this.REMEMBER_ME_DURATION : this.SESSION_DURATION;
      
      session.expiresAt = now + duration;
      safeLocalStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      // Error renovando, mantener sesión actual
    }
  }

  // Limpiar sesión
  static clearSession(): void {
    safeLocalStorage.removeItem(STORAGE_KEYS.SESSION);
    safeLocalStorage.removeItem(STORAGE_KEYS.USER);
    safeLocalStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }

  // Verificar si el usuario eligió "Recordarme"
  static hasRememberMe(): boolean {
    return safeLocalStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  }

  // Gestión de usuarios registrados
  static saveUser(user: User & { password?: string }): void {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.email === user.email);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    safeLocalStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getAllUsers(): (User & { password?: string })[] {
    const usersData = safeLocalStorage.getItem(STORAGE_KEYS.USERS);
    if (!usersData) return [];

    try {
      return JSON.parse(usersData);
    } catch {
      return [];
    }
  }

  static findUser(email: string, password?: string): User | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && (!password || u.password === password));
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        fechaRegistro: new Date(userWithoutPassword.fechaRegistro)
      };
    }
    
    return null;
  }

  // Limpieza de datos (para testing o reset)
  static clearAllData(): void {
    safeLocalStorage.removeItem(STORAGE_KEYS.SESSION);
    safeLocalStorage.removeItem(STORAGE_KEYS.USER);
    safeLocalStorage.removeItem(STORAGE_KEYS.USERS);
    safeLocalStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  }

  // Estadísticas de sesión
  static getSessionInfo(): { 
    isLoggedIn: boolean; 
    timeRemaining: number; 
    rememberMe: boolean; 
    user: User | null; 
  } {
    const user = this.getCurrentUser();
    const sessionData = safeLocalStorage.getItem(STORAGE_KEYS.SESSION);
    
    if (!user || !sessionData) {
      return {
        isLoggedIn: false,
        timeRemaining: 0,
        rememberMe: false,
        user: null
      };
    }

    try {
      const session: Session = JSON.parse(sessionData);
      const timeRemaining = Math.max(0, session.expiresAt - Date.now());
      
      return {
        isLoggedIn: true,
        timeRemaining,
        rememberMe: session.rememberMe,
        user
      };
    } catch {
      return {
        isLoggedIn: false,
        timeRemaining: 0,
        rememberMe: false,
        user: null
      };
    }
  }
}