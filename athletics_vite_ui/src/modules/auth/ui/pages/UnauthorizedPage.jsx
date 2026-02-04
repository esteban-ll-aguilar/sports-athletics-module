import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../../../../shared/components/ThemeToggle';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-linear-to-br dark:from-[#1a1a1a] dark:via-[#212121] dark:to-black flex items-center justify-center p-4 transition-colors duration-500 font-sans">
      {/* Absolute Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-[#242223] rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-[#332122] text-center relative overflow-hidden transition-colors duration-300">
        {/* Decorative background blur */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#b30c25] rounded-full mix-blend-multiply filter blur-[80px] opacity-10 dark:opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#b30c25] rounded-full mix-blend-multiply filter blur-[80px] opacity-10 dark:opacity-20 animate-pulse delay-700"></div>

        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-[#b30c25]/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-[#b30c25]" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Acceso Denegado
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            No tienes los permisos necesarios para acceder a esta página. Si crees que es un error, contacta al administrador.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#b30c25] hover:bg-[#8f091d] text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-[#b30c25]/30 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
