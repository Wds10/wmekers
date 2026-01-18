import { createContext, useContext, useState, type ReactNode } from 'react';

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
        };
        home: {
            hero_badge: string;
            hero_title_1: string;
            hero_title_2: string;
            hero_desc: string;
            btn_explore: string;
            btn_creator: string;
            feat_quality_title: string;
            feat_quality_desc: string;
            feat_secure_title: string;
            feat_secure_desc: string;
            feat_instant_title: string;
            feat_instant_desc: string;
        };
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
        },
        home: {
            hero_badge: 'El Mercado #1 de Activos 3D',
            hero_title_1: 'Descubre y Vende',
            hero_title_2: 'Modelos 3D Premium',
            hero_desc: 'Únete a la comunidad de creadores. Compra y vende archivos STL, OBJ y FBX de alta calidad.',
            btn_explore: 'Explorar Mercado',
            btn_creator: 'Ser Creador',
            feat_quality_title: 'Activos de Alta Calidad',
            feat_quality_desc: 'Colección curada de modelos 3D listos para producción e impresión.',
            feat_secure_title: 'Transacciones Seguras',
            feat_secure_desc: 'Pagos seguros vía PayPal y Mercado Pago (Argentina).',
            feat_instant_title: 'Descargas Instantáneas',
            feat_instant_desc: 'Acceso inmediato a tus archivos con enlaces seguros y permanentes.'
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
        },
        home: {
            hero_badge: 'The #1 Marketplace for 3D Assets',
            hero_title_1: 'Discover & Sell',
            hero_title_2: 'Premium 3D Models',
            hero_desc: 'Join the community of creators. Buy and sell high-quality STL, OBJ, and FBX files for printing, gaming, and visualization.',
            btn_explore: 'Explore Marketplace',
            btn_creator: 'Become a Creator',
            feat_quality_title: 'High Quality Assets',
            feat_quality_desc: 'Curated collection of 3D models ready for production, printing, or rendering.',
            feat_secure_title: 'Secure Transactions',
            feat_secure_desc: 'Safe payments via PayPal and Mercado Pago depending on your location.',
            feat_instant_title: 'Instant Downloads',
            feat_instant_desc: 'Get immediate access to your purchased files with secure, permanent download links.'
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
