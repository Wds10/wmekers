import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`, // Make sure this route exists or redirect to home currently
            });
            if (error) throw error;
            setSuccessMsg("Check your email for the password reset link.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12">
            <div className="bg-surface border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">

                {/* Header */}
                <h2 className="text-3xl font-bold mb-6 text-center">
                    {isResetMode ? 'Recuperar Contraseña' : t.auth.welcome}
                </h2>

                {/* Feedback Messages */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg mb-6 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                        <ShieldCheck size={20} /> {/* Assuming ShieldCheck imported or generic check */}
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Reset Password Form */}
                {isResetMode ? (
                    <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <p className="text-gray-400 text-sm text-center mb-4">
                            Ingresa tu correo electrónico para recibir un enlace de recuperación.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">{t.auth.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsResetMode(false); setError(null); setSuccessMsg(null); }}
                            className="w-full text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 mt-4"
                        >
                            <ArrowLeft size={16} /> Volver a Iniciar Sesión
                        </button>
                    </form>
                ) : (
                    /* Login Form */
                    <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-left duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">{t.auth.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-300">{t.auth.password}</label>
                                <button type="button" onClick={() => setIsResetMode(true)} className="text-xs text-primary hover:text-white transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 text-gray-500" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-12 focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '...' : t.auth.signin}
                        </button>
                    </form>
                )}

                {!isResetMode && (
                    <p className="mt-6 text-center text-gray-400">
                        {t.auth.no_account}{' '}
                        <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                            {t.auth.signup}
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
