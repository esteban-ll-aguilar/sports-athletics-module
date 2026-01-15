import React, { useState } from 'react';
import { Shield, Lock, Key, ArrowRight } from 'lucide-react';
import authService from '../../services/auth_service';
import { useNavigate } from 'react-router-dom';

const TwoFactorLoginModal = ({ isOpen, tempToken, email, onSuccess, onError }) => {
    const [code, setCode] = useState('');
    const [isBackupMode, setIsBackupMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            if (isBackupMode) {
                // Backup code format XXXX-XXXX usually, but backend handles validation
                response = await authService.loginBackup(email, code, tempToken);
            } else {
                response = await authService.login2FA(email, code, tempToken);
            }

            if (response.access_token) {
                onSuccess(response);
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("2FA Login Error:", err);
            const msg = err.detail || 'Código inválido. Inténtalo de nuevo.';
            setError(msg);
            onError && onError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                        {isBackupMode ? <Key size={32} /> : <Shield size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isBackupMode ? 'Código de Respaldo' : 'Autenticación de Dos Factores'}
                    </h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {isBackupMode
                            ? 'Ingresa uno de tus códigos de recuperación.'
                            : 'Ingresa el código de 6 dígitos de tu aplicación autenticadora.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isBackupMode ? 'Código de Recuperación' : 'Código de Verificación'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl tracking-widest font-mono uppercase transition-all"
                                placeholder={isBackupMode ? "XXXX-XXXX" : "000000"}
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={isBackupMode ? 20 : 6}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 4}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="animate-pulse">Verificando...</span>
                        ) : (
                            <>
                                Verificar <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="pt-4 border-t border-gray-100 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsBackupMode(!isBackupMode);
                                setCode('');
                                setError('');
                            }}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            {isBackupMode
                                ? 'Usar código de autenticador (TOTP)'
                                : '¿No tienes acceso a tu celular? Usa un código de respaldo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TwoFactorLoginModal;
