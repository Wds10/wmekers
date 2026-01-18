import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        country: 'Argentina', // Default to common
        role: 'buyer' as 'buyer' | 'creator'
    });

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("No user returned");

            // 2. Create Profile 
            const { error: profileError } = await supabase.from('profiles').insert({
                id: authData.user.id,
                email: formData.email,
                full_name: formData.fullName,
                country: formData.country,
                role: formData.role,
                balance: 0
            });

            if (profileError) {
                console.error("Profile creation error:", profileError);
            }

            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12">
            <div className="bg-surface border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-center">{t.auth.signup}</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center space-x-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">{t.auth.name}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-500" size={20} />
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">{t.auth.email}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-500" size={20} />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Country</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 text-gray-500" size={20} />
                            <select
                                required
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary text-white appearance-none"
                            >
                                <option value="Argentina">Argentina</option>
                                <option value="United States">United States</option>
                                <option value="Brazil">Brazil</option>
                                <option value="Spain">Spain</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-500">Determines payment methods available.</p>
                    </div>


                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">{t.auth.password}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-500" size={20} />
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary text-white placeholder-gray-600"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? '...' : t.auth.signup}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    {t.auth.has_account}{' '}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                        {t.auth.signin}
                    </Link>
                </p>
            </div>
        </div>
    );
}
