import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Upload, User, Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { user, profile, signOut } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors">
                            <Box className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            W3D Market
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/market" className="text-gray-300 hover:text-white transition-colors">
                            {t.nav.market}
                        </Link>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm uppercase font-mono"
                        >
                            <Globe size={16} />
                            <span>{language}</span>
                        </button>

                        {user ? (
                            <>
                                {profile?.role === 'creator' && (
                                    <Link to="/upload" className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full transition-colors">
                                        <Upload size={18} />
                                        <span>{t.nav.upload}</span>
                                    </Link>
                                )}

                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                                        <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                                            <User size={18} />
                                        </div>
                                        <span className="max-w-[100px] truncate">{profile?.full_name || user.email}</span>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                                        <div className="py-1">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                                                {t.nav.profile}
                                            </Link>
                                            {profile?.role === 'admin' && (
                                                <Link to="/admin" className="block px-4 py-2 text-sm text-yellow-400 hover:bg-white/5 font-bold">
                                                    {t.nav.admin}
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                                            >
                                                {t.nav.signout}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-300 hover:text-white font-medium">
                                    {t.nav.login}
                                </Link>
                                <Link to="/register" className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors">
                                    {t.nav.signup}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm uppercase font-mono"
                        >
                            <Globe size={18} />
                            <span>{language}</span>
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-surface border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link to="/market" className="block px-3 py-2 text-gray-300 hover:bg-white/5 rounded-md">
                            {t.nav.market}
                        </Link>
                        {user ? (
                            <>
                                <Link to="/profile" className="block px-3 py-2 text-gray-300 hover:bg-white/5 rounded-md">
                                    {t.nav.profile}
                                </Link>
                                {profile?.role === 'creator' && (
                                    <Link to="/upload" className="block px-3 py-2 text-primary hover:bg-white/5 rounded-md">
                                        {t.nav.upload}
                                    </Link>
                                )}
                                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-md">
                                    {t.nav.signout}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 text-gray-300 hover:bg-white/5 rounded-md">
                                    {t.nav.login}
                                </Link>
                                <Link to="/register" className="block px-3 py-2 text-white bg-primary/20 hover:bg-primary/30 rounded-md">
                                    {t.nav.signup}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
