"use client";

import { supabase } from './supabase';
import { User } from '@/contexts/AuthContext';

// Interfaz para sesión de Supabase
interface SupabaseSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  remember_me: boolean;
  created_at: string;
  last_activity: string;
}

// Interfaz para usuario de Supabase
interface SupabaseUser {
  id: string;
  email: string;
  password_hash: string;
  nombre: string;
  telefono: string | null;
  fecha_registro: string;
  compras_realizadas: number;
  total_comprado: number;
  tiene_descuento: boolean;
  porcentaje_descuento: number;
  provider: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseAuth {
  // Configuración de duración de sesiones
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private static readonly REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 días

  // Generar token de sesión único
  private static generateSessionToken(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  // Hash simple de contraseña (en producción usarías bcrypt)
  private static hashPassword(password: string): string {
    // Por simplicidad, usamos un hash básico
    // En producción real deberías usar bcrypt
    return btoa(password + 'polimax_salt_2025');
  }

  // Verificar contraseña
  private static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // Convertir usuario de Supabase a formato local
  private static convertUser(supabaseUser: SupabaseUser): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      nombre: supabaseUser.nombre,
      telefono: supabaseUser.telefono || undefined,
      fechaRegistro: new Date(supabaseUser.fecha_registro),
      comprasRealizadas: supabaseUser.compras_realizadas,
      totalComprado: supabaseUser.total_comprado,
      tieneDescuento: supabaseUser.tiene_descuento,
      porcentajeDescuento: supabaseUser.porcentaje_descuento,
      provider: supabaseUser.provider as any
    };
  }

  // Login de usuario
  static async login(email: string, password: string, rememberMe: boolean = false): Promise<User | null> {
    try {
      console.log('🔐 Intentando login en Supabase:', { email });

      // Buscar usuario por email
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !users) {
        console.log('❌ Usuario no encontrado en Supabase:', userError);
        return null;
      }

      console.log('👤 Usuario encontrado en Supabase:', users);

      // Verificar contraseña
      const isValidPassword = this.verifyPassword(password, users.password_hash);
      console.log('🔑 Verificando contraseña:', { 
        providedHash: this.hashPassword(password), 
        storedHash: users.password_hash,
        isValid: isValidPassword 
      });
      
      if (!isValidPassword) {
        console.log('❌ Contraseña incorrecta');
        return null;
      }

      console.log('✅ Usuario autenticado en Supabase:', users.email);

      // Crear sesión
      const sessionToken = this.generateSessionToken();
      const now = new Date();
      const duration = rememberMe ? this.REMEMBER_ME_DURATION : this.SESSION_DURATION;
      const expiresAt = new Date(now.getTime() + duration);

      console.log('📝 Creando sesión en Supabase:', {
        user_id: users.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        remember_me: rememberMe
      });

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: users.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          remember_me: rememberMe,
          last_activity: now.toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('❌ Error creando sesión en Supabase:', sessionError);
        return null;
      }

      console.log('✅ Sesión creada exitosamente en Supabase:', sessionData);

      // Guardar token en localStorage para futuras verificaciones
      localStorage.setItem('obraexpress_session_token', sessionToken);
      localStorage.setItem('obraexpress_user_id', users.id);
      
      // IMPORTANTE: También guardar el usuario para que AuthGuard lo reconozca inmediatamente
      const convertedUser = this.convertUser(users);
      localStorage.setItem('obraexpress_user', JSON.stringify(convertedUser));

      console.log('💾 Datos guardados en localStorage:', {
        sessionToken,
        userId: users.id,
        user: convertedUser
      });
      
      return convertedUser;

    } catch (error) {
      console.error('❌ Error en login:', error);
      return null;
    }
  }

  // Verificar sesión existente
  static async verifySession(): Promise<User | null> {
    try {
      const sessionToken = localStorage.getItem('polimax_session_token');
      const userId = localStorage.getItem('polimax_user_id');

      if (!sessionToken || !userId) {
        return null;
      }

      // Verificar que la sesión existe y no ha expirado
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session) {
        // Limpiar tokens inválidos
        this.clearLocalSession();
        return null;
      }

      // Obtener datos del usuario
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        this.clearLocalSession();
        return null;
      }

      // Actualizar última actividad
      await this.updateLastActivity(sessionToken);

      // Asegurar que el usuario esté guardado en localStorage
      const convertedUser = this.convertUser(user);
      localStorage.setItem('polimax_user', JSON.stringify(convertedUser));

      return convertedUser;

    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      this.clearLocalSession();
      return null;
    }
  }

  // Actualizar última actividad de la sesión
  static async updateLastActivity(sessionToken: string): Promise<void> {
    try {
      await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken);
    } catch (error) {
      console.error('❌ Error actualizando actividad:', error);
    }
  }

  // Renovar sesión
  static async renewSession(): Promise<void> {
    try {
      const sessionToken = localStorage.getItem('polimax_session_token');
      if (!sessionToken) return;

      const { data: session } = await supabase
        .from('sessions')
        .select('remember_me')
        .eq('session_token', sessionToken)
        .single();

      if (session) {
        const now = new Date();
        const duration = session.remember_me ? this.REMEMBER_ME_DURATION : this.SESSION_DURATION;
        const newExpiry = new Date(now.getTime() + duration);

        await supabase
          .from('sessions')
          .update({ 
            expires_at: newExpiry.toISOString(),
            last_activity: now.toISOString()
          })
          .eq('session_token', sessionToken);
      }
    } catch (error) {
      console.error('❌ Error renovando sesión:', error);
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const sessionToken = localStorage.getItem('polimax_session_token');
      
      if (sessionToken) {
        // Eliminar sesión de la base de datos
        await supabase
          .from('sessions')
          .delete()
          .eq('session_token', sessionToken);
      }

      // Limpiar localStorage
      this.clearLocalSession();

    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Limpiar localStorage incluso si hay error en BD
      this.clearLocalSession();
    }
  }

  // Registro de nuevo usuario
  static async register(userData: {
    email: string;
    password: string;
    nombre: string;
    telefono?: string;
    provider?: string;
  }): Promise<User | null> {
    try {
      console.log('📝 Registrando nuevo usuario:', userData.email);

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        console.log('❌ Usuario ya existe');
        return null;
      }

      // Crear nuevo usuario
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: this.hashPassword(userData.password),
          nombre: userData.nombre,
          telefono: userData.telefono || null,
          provider: userData.provider || 'email',
          tiene_descuento: true,
          porcentaje_descuento: 5 // 5% de descuento por registro
        })
        .select()
        .single();

      if (userError || !newUser) {
        console.error('❌ Error creando usuario:', userError);
        return null;
      }

      console.log('✅ Usuario registrado exitosamente');
      return this.convertUser(newUser);

    } catch (error) {
      console.error('❌ Error en registro:', error);
      return null;
    }
  }

  // Actualizar datos de usuario
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          nombre: updates.nombre,
          telefono: updates.telefono || null,
          compras_realizadas: updates.comprasRealizadas,
          total_comprado: updates.totalComprado,
          tiene_descuento: updates.tieneDescuento,
          porcentaje_descuento: updates.porcentajeDescuento,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error || !updatedUser) {
        console.error('❌ Error actualizando usuario:', error);
        return null;
      }

      return this.convertUser(updatedUser);
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      return null;
    }
  }

  // Limpiar sesión local
  private static clearLocalSession(): void {
    localStorage.removeItem('obraexpress_session_token');
    localStorage.removeItem('obraexpress_user_id');
    localStorage.removeItem('obraexpress_user');
  }

  // Login con Google OAuth
  static async loginWithGoogle(): Promise<{ url: string; error?: string }> {
    try {
      console.log('🔐 Iniciando login con Google OAuth...');
      
      // Configuración optimizada para velocidad
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Configuración para dar al usuario más control
          queryParams: {
            prompt: 'consent', // Permite al usuario confirmar permisos
            access_type: 'online', // Solo acceso durante la sesión
          }
        }
      });

      if (error) {
        console.error('❌ Error en login con Google:', error);
        return { url: '', error: error.message };
      }

      if (data.url) {
        console.log('✅ URL de redirección generada');
        return { url: data.url };
      }

      return { url: '', error: 'No se pudo generar la URL de autenticación' };
    } catch (error) {
      console.error('❌ Error en loginWithGoogle:', error);
      return { url: '', error: 'Error interno del servidor' };
    }
  }

  // Manejar callback de OAuth
  static async handleOAuthCallback(): Promise<User | null> {
    try {
      console.log('🔄 Procesando callback de OAuth...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error obteniendo sesión OAuth:', error);
        return null;
      }

      if (!session?.user) {
        console.log('❌ No hay usuario en la sesión OAuth');
        return null;
      }

      const oauthUser = session.user;
      console.log('👤 Usuario OAuth obtenido:', oauthUser);
      console.log('📊 Metadata del usuario:', oauthUser.user_metadata);
      console.log('📊 Identidades del usuario:', oauthUser.identities);

      // Verificar si el usuario ya existe en nuestra tabla 'users'
      let { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', oauthUser.email!)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error buscando usuario:', userError);
        return null;
      }

      // Si el usuario no existe, crearlo
      if (!existingUser) {
        console.log('📝 Usuario no existe, creando nuevo usuario...');
        
        // Intentar obtener el nombre de diferentes fuentes
        let userName = '';
        console.log('🔍 Extrayendo nombre de usuario...');
        console.log('📊 user_metadata disponible:', JSON.stringify(oauthUser.user_metadata, null, 2));
        console.log('📊 identities disponible:', JSON.stringify(oauthUser.identities, null, 2));
        
        // 1. Desde user_metadata
        if (oauthUser.user_metadata?.full_name) {
          userName = oauthUser.user_metadata.full_name;
          console.log('✅ Nombre encontrado en user_metadata.full_name:', userName);
        } else if (oauthUser.user_metadata?.name) {
          userName = oauthUser.user_metadata.name;
          console.log('✅ Nombre encontrado en user_metadata.name:', userName);
        } else if (oauthUser.user_metadata?.first_name) {
          userName = `${oauthUser.user_metadata.first_name} ${oauthUser.user_metadata.last_name || ''}`.trim();
          console.log('✅ Nombre construido desde first_name + last_name:', userName);
        } else {
          console.log('❌ No se encontró nombre en user_metadata');
        }
        
        // 2. Desde identities (datos de Google)
        if (!userName && oauthUser.identities && oauthUser.identities.length > 0) {
          const googleIdentity = oauthUser.identities.find(id => id.provider === 'google');
          console.log('🔍 Google identity encontrada:', googleIdentity);
          
          if (googleIdentity?.identity_data?.full_name) {
            userName = googleIdentity.identity_data.full_name;
            console.log('✅ Nombre encontrado en identity_data.full_name:', userName);
          } else if (googleIdentity?.identity_data?.name) {
            userName = googleIdentity.identity_data.name;
            console.log('✅ Nombre encontrado en identity_data.name:', userName);
          } else {
            console.log('❌ No se encontró nombre en identity_data');
          }
        }
        
        // 3. Fallback al email
        if (!userName) {
          userName = oauthUser.email!.split('@')[0];
          console.log('⚠️ Usando email como fallback:', userName);
        }
        
        console.log('👤 Nombre final extraído:', userName);
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: oauthUser.email!,
            password_hash: 'oauth_user', // Los usuarios OAuth no tienen contraseña local
            nombre: userName,
            telefono: oauthUser.user_metadata?.phone || null,
            provider: 'google',
            tiene_descuento: true,
            porcentaje_descuento: 5 // 5% de descuento por registro
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creando usuario OAuth:', createError);
          return null;
        }

        existingUser = newUser;
        console.log('✅ Usuario OAuth creado exitosamente');
      } else {
        console.log('✅ Usuario OAuth existente encontrado');
      }

      // Crear sesión en nuestra tabla
      const sessionToken = this.generateSessionToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.REMEMBER_ME_DURATION); // OAuth sessions are long-lived

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: existingUser.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          remember_me: true, // OAuth sessions are remembered by default
          last_activity: now.toISOString()
        });

      if (sessionError) {
        console.error('❌ Error creando sesión OAuth:', sessionError);
        return null;
      }

      // Guardar tokens en localStorage
      localStorage.setItem('polimax_session_token', sessionToken);
      localStorage.setItem('polimax_user_id', existingUser.id);
      
      const convertedUser = this.convertUser(existingUser);
      localStorage.setItem('polimax_user', JSON.stringify(convertedUser));

      console.log('✅ Login OAuth completado exitosamente');
      return convertedUser;

    } catch (error) {
      console.error('❌ Error en handleOAuthCallback:', error);
      return null;
    }
  }

  // Limpiar sesiones expiradas (función de mantenimiento)
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase
        .from('sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('❌ Error limpiando sesiones:', error);
    }
  }
}