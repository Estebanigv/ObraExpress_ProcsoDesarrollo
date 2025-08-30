"use client";

import { AuthStorage } from './auth-storage';
import { User } from '@/contexts/AuthContext';

// Configuración del usuario administrador
const ADMIN_USER = {
  id: 'admin_polimax_2025',
  email: 'polimax.store',
  password: 'polimax2025$$',
  nombre: 'ObraExpress.store',
  telefono: '+56 9 0000 0000',
  fechaRegistro: new Date('2025-01-01'),
  comprasRealizadas: 0,
  totalComprado: 0,
  tieneDescuento: true,
  porcentajeDescuento: 100, // Descuento completo para admin
  provider: 'email' as const
};

export function initializeAdminUser(): void {
  console.log('🔧 Inicializando usuario administrador...');
  console.log('📋 Credenciales admin:', { email: ADMIN_USER.email, password: ADMIN_USER.password });
  
  // Verificar si ya existe el usuario admin
  const existingAdmin = AuthStorage.findUser(ADMIN_USER.email);
  
  if (!existingAdmin) {
    // Crear usuario administrador si no existe
    AuthStorage.saveUser(ADMIN_USER);
    console.log('✅ Usuario administrador creado:', ADMIN_USER.email);
  } else {
    // Actualizar datos del admin si cambió algo
    const updatedAdmin = {
      ...existingAdmin,
      ...ADMIN_USER,
      password: ADMIN_USER.password // Asegurar que la contraseña esté actualizada
    };
    AuthStorage.saveUser(updatedAdmin);
    console.log('✅ Usuario administrador actualizado:', ADMIN_USER.email);
  }
  
  // Verificar que se guardó correctamente
  const verifyAdmin = AuthStorage.findUser(ADMIN_USER.email, ADMIN_USER.password);
  console.log('🔍 Verificación admin después de guardar:', verifyAdmin ? '✅ OK' : '❌ FALLO');
}

export function getAdminCredentials() {
  return {
    email: ADMIN_USER.email,
    password: ADMIN_USER.password,
    nombre: ADMIN_USER.nombre
  };
}

// Verificar si el usuario actual es admin
export function isCurrentUserAdmin(): boolean {
  const currentUser = AuthStorage.getCurrentUser();
  return currentUser?.id === ADMIN_USER.id;
}

// Verificar si las credenciales son de admin
export function isAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_USER.email && password === ADMIN_USER.password;
}