import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/30">
            <Navbar />
            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
                {children}
            </main>
            <footer className="border-t border-white/10 py-12 bg-black">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500">© {new Date().getFullYear()} W3D Market. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
