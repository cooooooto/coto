import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { executeQuery } from './neon-config';
import bcrypt from 'bcryptjs';

// Tipos para el usuario
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'member' | 'viewer';
}

// Configuración de NextAuth para usar con Neon
export const authOptions: NextAuthOptions = {
  providers: [
    // Proveedor de credenciales (email/password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Buscar usuario en Neon
          const users = await executeQuery(
            'SELECT * FROM profiles WHERE email = $1',
            [credentials.email]
          );

          if (users.length === 0) {
            return null;
          }

          const user = users[0];

          // Verificar contraseña (asumiendo que tienes un campo password_hash)
          // Nota: Necesitarás agregar este campo a tu esquema
          if (user.password_hash) {
            const isValid = await bcrypt.compare(credentials.password, user.password_hash);
            if (!isValid) {
              return null;
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url,
            role: user.role
          };
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      }
    }),

    // Proveedor de Google (opcional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Persistir información del usuario en el token
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }

      // Manejar login con Google
      if (account?.provider === 'google' && user) {
        try {
          // Crear o actualizar usuario en Neon
          await executeQuery(`
            INSERT INTO profiles (id, email, full_name, avatar_url, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO UPDATE SET
              full_name = EXCLUDED.full_name,
              avatar_url = EXCLUDED.avatar_url,
              updated_at = NOW()
          `, [user.id, user.email, user.name, user.image, 'member']);
          
          token.role = 'member';
        } catch (error) {
          console.error('Error creating/updating user:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Enviar propiedades al cliente
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect después del login
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development'
};

// Función helper para crear un nuevo usuario
export async function createUser(
  email: string, 
  password: string, 
  fullName?: string
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();

  const users = await executeQuery(`
    INSERT INTO profiles (id, email, full_name, password_hash, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, full_name, avatar_url, role
  `, [userId, email, fullName, hashedPassword, 'member']);

  return users[0];
}

// Función helper para verificar si un usuario existe
export async function userExists(email: string): Promise<boolean> {
  const users = await executeQuery(
    'SELECT id FROM profiles WHERE email = $1',
    [email]
  );
  return users.length > 0;
}

// Función helper para obtener usuario por ID
export async function getUserById(id: string): Promise<User | null> {
  const users = await executeQuery(
    'SELECT id, email, full_name, avatar_url, role FROM profiles WHERE id = $1',
    [id]
  );
  return users.length > 0 ? users[0] : null;
}

// Función helper para actualizar perfil de usuario
export async function updateUserProfile(
  id: string, 
  updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>
): Promise<User> {
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  if (updates.full_name !== undefined) {
    setClause.push(`full_name = $${paramIndex++}`);
    values.push(updates.full_name);
  }

  if (updates.avatar_url !== undefined) {
    setClause.push(`avatar_url = $${paramIndex++}`);
    values.push(updates.avatar_url);
  }

  setClause.push(`updated_at = $${paramIndex++}`);
  values.push(new Date());

  values.push(id); // Para el WHERE

  const users = await executeQuery(`
    UPDATE profiles 
    SET ${setClause.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, email, full_name, avatar_url, role
  `, values);

  return users[0];
}
