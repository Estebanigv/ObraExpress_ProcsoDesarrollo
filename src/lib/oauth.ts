/**
 * OAuth Configuration and Handlers
 * Configuración real para autenticación con proveedores externos
 */

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret?: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  redirectUri: string;
}

export interface OAuthConfig {
  google: OAuthProvider;
  microsoft: OAuthProvider;
  facebook: OAuthProvider;
}

// Configuración de proveedores OAuth
export const oauthConfig: OAuthConfig = {
  google: {
    name: 'Google',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/oauth/authorize',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile',
    redirectUri: `${process.env.BASE_URL || 'http://localhost:3001'}/auth/callback/google`
  },
  microsoft: {
    name: 'Microsoft',
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scope: 'openid email profile',
    redirectUri: `${process.env.BASE_URL || 'http://localhost:3001'}/auth/callback/microsoft`
  },
  facebook: {
    name: 'Facebook',
    clientId: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    scope: 'email',
    redirectUri: `${process.env.BASE_URL || 'http://localhost:3001'}/auth/callback/facebook`
  },
};

/**
 * Genera la URL de autorización para un proveedor OAuth
 */
export function getAuthUrl(provider: keyof OAuthConfig): string {
  const config = oauthConfig[provider];
  
  if (!config.clientId) {
    throw new Error(`${config.name} OAuth no está configurado. Verifica las variables de entorno.`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state: `${provider}_${Date.now()}`, // Estado para verificar la respuesta
    ...(provider === 'microsoft' && { response_mode: 'query' })
  });

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Intercambia el código de autorización por un token de acceso
 */
export async function exchangeCodeForToken(
  provider: keyof OAuthConfig, 
  code: string
): Promise<any> {
  const config = oauthConfig[provider];
  
  const tokenData = {
    client_id: config.clientId,
    client_secret: config.clientSecret || '',
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri
  };

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(tokenData)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error intercambiando código por token (${provider}):`, error);
    throw error;
  }
}

/**
 * Obtiene la información del usuario usando el token de acceso
 */
export async function getUserInfo(
  provider: keyof OAuthConfig, 
  accessToken: string
): Promise<any> {
  const config = oauthConfig[provider];
  
  if (!config.userInfoUrl) {
    return null;
  }

  try {
    const response = await fetch(config.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo info del usuario (${provider}):`, error);
    throw error;
  }
}

/**
 * Normaliza la información del usuario de diferentes proveedores
 */
export function normalizeUserInfo(provider: keyof OAuthConfig, userInfo: any): {
  id: string;
  email: string;
  name: string;
  picture?: string;
} {
  switch (provider) {
    case 'google':
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      };
    
    case 'microsoft':
      return {
        id: userInfo.id,
        email: userInfo.mail || userInfo.userPrincipalName,
        name: userInfo.displayName,
        picture: userInfo.photo
      };
    
    case 'facebook':
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture?.data?.url
      };
    
    
    default:
      throw new Error(`Proveedor ${provider} no soportado`);
  }
}