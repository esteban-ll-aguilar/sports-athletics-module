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
            const response = isBackupMode
                ? await authService.loginBackup(email, code, tempToken)
                : await authService.login2FA(email, code, tempToken);

            if (response.success) {
                onSuccess(response);
                navigate('/dashboard');
            }
        } catch (err) {
            let msg = 'Código inválido. Inténtalo de nuevo.';
            if (err.detail && typeof err.detail === 'string' && err.detail.includes('rate limit')) {
                msg = 'Demasiados intentos. Espera un minuto antes de volver a intentarlo.';
            } else if (err.message && typeof err.message === 'string') {
                msg = err.message;
            } else if (err.detail && typeof err.detail === 'string') {
                msg = err.detail;
            } else if (err.errors && Array.isArray(err.errors)) {
                msg = err.errors.map(e => e.msg).join(' | ');
            }
            setError(msg);
            onError && onError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#212121] border border-gray-100 dark:border-[#332122] shadow-2xl p-8 transition-colors duration-300">

                {/* Icon */}
                <div className="flex justify-center -mt-16 mb-4">
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-[#242223] border border-gray-100 dark:border-[#332122] flex items-center justify-center shadow-lg transition-colors duration-300">
                        <div className="w-14 h-14 rounded-full bg-[#b30c25]/10 dark:bg-[rgba(179,12,37,0.15)] flex items-center justify-center text-[#b30c25]">
                            {isBackupMode ? <Key size={30} /> : <Shield size={30} />}
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                    {isBackupMode ? 'Código de Respaldo' : 'Verificación en Dos Pasos'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    {isBackupMode
                        ? 'Ingresa uno de tus códigos de recuperación.'
                        : 'Introduce el código de 6 dígitos de tu app autenticadora.'}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2 transition-colors">
                            {isBackupMode ? 'Código de Recuperación' : 'Código de Verificación'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={isBackupMode ? 20 : 6}
                                placeholder={isBackupMode ? 'XXXX-XXXX' : '000000'}
                                required
                                className="
                                    w-full pl-10 pr-3 py-3 rounded-lg
                                    bg-gray-50 dark:bg-[#242223] text-gray-900 dark:text-white
                                    border border-gray-300 dark:border-[#332122]
                                    text-center text-xl tracking-widest font-mono
                                    placeholder-gray-400 dark:placeholder-gray-500
                                    focus:outline-none focus:ring-2 focus:ring-[#b30c25]
                                    transition-colors duration-200
                                "
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-[#b30c25]/10 dark:bg-[rgba(179,12,37,0.15)] border border-[#b30c25] text-[#b30c25] text-sm rounded-lg p-3 text-center transition-colors">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || code.length < 4}
                        className="
                            w-full py-3 rounded-lg text-white font-medium
                            bg-linear-to-r from-[#b30c25] via-[#5a0f1d] to-[#332122]
                            hover:brightness-110
                            focus:ring-2 focus:ring-[#b30c25]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all flex items-center justify-center gap-2
                        "
                    >
                        {loading ? 'Verificando…' : <>Verificar <ArrowRight size={18} /></>}
                    </button>

                    {/* Switch mode */}
                    <div className="pt-4 border-t border-gray-100 dark:border-[#332122] text-center transition-colors">
                        <button
                            type="button"
                            onClick={() => {
                                setIsBackupMode(!isBackupMode);
                                setCode('');
                                setError('');
                            }}
                            className="text-sm font-medium text-[#b30c25] hover:underline"
                        >
                            {isBackupMode
                                ? 'Usar código del autenticador'
                                : '¿Sin acceso al celular? Usa un código de respaldo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TwoFactorLoginModal;
