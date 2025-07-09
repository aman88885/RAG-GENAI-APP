import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    
    try {
      // First try to get token from localStorage
      const token = localStorage.getItem('chatdoc_token') || localStorage.getItem('token');
      
      if (!token) {
        // Check for demo session
        const demoSession = localStorage.getItem('chatdoc_session');
        if (demoSession) {
          const sessionData = JSON.parse(demoSession);
          setUser(sessionData.user);
        }
        setIsLoading(false);
        return;
      }

      // Try to fetch user profile from backend
      try {
        const response = await fetch('https://rag-genai-app-backend.onrender.com/api/v1/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          throw new Error('Failed to fetch profile');
        }
      } catch (backendError) {
        console.log('Backend not available, checking local storage...');
        
        // Fallback to localStorage for demo mode
        const demoSession = localStorage.getItem('chatdoc_session');
        const storedUser = localStorage.getItem('user');
        
        if (demoSession) {
          const sessionData = JSON.parse(demoSession);
          setUser(sessionData.user);
        } else if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Token exists but no user data, clear invalid token
          localStorage.removeItem('chatdoc_token');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('chatdoc_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Also store in demo session format for compatibility
    const sessionData = {
      user: userData,
      token: token,
      signedInAt: new Date().toISOString()
    };
    localStorage.setItem('chatdoc_session', JSON.stringify(sessionData));
  };

  const logout = async () => {
    const token = localStorage.getItem('chatdoc_token') || localStorage.getItem('token');
    
    // Try to logout from backend if token exists
    if (token) {
      try {
        await fetch('https://rag-genai-app-backend.onrender.com/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.log('Backend logout failed, proceeding with local logout');
      }
    }

    // Clear all auth data
    setUser(null);
    localStorage.removeItem('chatdoc_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('chatdoc_session');
    localStorage.removeItem('chatdoc_users'); // Clear demo users too
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update demo session
    const demoSession = localStorage.getItem('chatdoc_session');
    if (demoSession) {
      const sessionData = JSON.parse(demoSession);
      sessionData.user = userData;
      localStorage.setItem('chatdoc_session', JSON.stringify(sessionData));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};