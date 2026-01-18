import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

type Translations = {
    [key in Language]: {
        nav: {
            market: string;
            upload: string;
            login: string;
            signup: string;
            profile: string;
            admin: string;
            signout: string;
        };
        auth: {
            welcome: string;
            email: string;
            password: string;
            confirm_password: string;
            signin: string;
            signup: string;
            no_account: string;
            has_account: string;
            name: string;
        };
        product: {
            free: string;
            license: string;
            pay: string;
            processing: string;
            verifying: string;
            download: string;
            secure: string;
            owned: string;
            created_by: string;
        }
    }
};

const translations: Translations = {
    es: {
        nav: {
            market: 'Mercado',
            upload: 'Subir',
            login: 'Ingresar',
            signup: 'Registrarse',
            profile: 'Perfil',
            admin: 'Panel Admin',
            signout: 'Cerrar Sesión'
        },
        auth: {
            welcome: 'Bienvenido',
            email: 'Correo Electrónico',
            password: 'Contraseña',
            confirm_password: 'Confirmar Contraseña',
            signin: 'Iniciar Sesión',
            signup: 'Registrarse',
            no_account: '¿No tienes cuenta?',
            has_account: '¿Ya tienes cuenta?',
            name: 'Nombre Completo'
        },
        product: {
            free: 'Gratis',
            license: 'Licencia',
            pay: 'Pagar',
            processing: 'Procesando...',
            verifying: 'Verificando...',
            download: 'Descargar',
            secure: 'Compra Segura',
            owned: 'Ya tienes este modelo',
            created_by: 'Creado por'
        }
    },
    en: {
        nav: {
            market: 'Marketplace',
            upload: 'Upload',
            login: 'Log In',
            signup: 'Sign Up',
            profile: 'Profile',
            admin: 'Admin Panel',
            signout: 'Sign Out'
        },
        auth: {
            welcome: 'Welcome Back',
            email: 'Email Address',
            password: 'Password',
            confirm_password: 'Confirm Password',
            signin: 'Sign In',
            signup: 'Sign Up',
            no_account: "Don't have an account?",
            has_account: 'Already have an account?',
            name: 'Full Name'
        },
        product: {
            free: 'Free',
            license: 'License',
            pay: 'Pay',
            processing: 'Processing...',
            verifying: 'Verifying...',
            download: 'Download',
            secure: 'Secure Transaction',
            owned: 'You own this model',
            created_by: 'Created by'
        }
    }
};

interface LanguageContextType {
    language: Language;
    t: Translations['en'];
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('es'); // Default to Spanish as requested

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'es' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, t: translations[language], toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
