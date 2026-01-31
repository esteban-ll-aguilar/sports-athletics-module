import React, { useState, useEffect } from 'react';
import authService from '../../services/auth_service';
import { toast } from 'react-hot-toast';
import { MailOpen, RefreshCw, X } from 'lucide-react';

const VerificationModal = ({ email, isOpen, onClose, onSuccess }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCode('');
            setError('');
            setResendMessage('');
        }
    }, [isOpen]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    if (!isOpen) return null;

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.verifyEmail(email, code);
            if (response.success) {
                toast.success(response.message || 'Email verificado exitosamente');
                onSuccess(response.message);
            } else {
                const msg = response.message || 'Verificación fallida';
                toast.error(msg);
                setError(msg);
            }
        } catch (err) {
            let msg = 'Código inválido o expirado';
            if (err.detail && typeof err.detail === 'string' && err.detail.includes('rate limit')) {
                msg = 'Demasiados intentos. Espera un minuto antes de volver a intentarlo.';
            } else if (err.message && typeof err.message === 'string') {
                msg = err.message;
            } else if (err.detail && typeof err.detail === 'string') {
                msg = err.detail;
            } else if (err.errors && Array.isArray(err.errors)) {
                msg = err.errors.map(e => e.msg).join(' | ');
            }
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setResendLoading(true);
        setResendMessage('');
        setError('');

        try {
            const response = await authService.resendVerification(email);
            if (response.success) {
                const msg = response.message || 'Nuevo código enviado';
                toast.success(msg);
                setResendMessage(msg);
                setCountdown(60);
            }
        } catch (err) {
            let msg = 'Error al reenviar el código';
            if (err.message) msg = err.message;
            if (err.detail) msg = err.detail;
            toast.error(msg);
            setError(msg);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#212121] rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-[#332122] transition-transform duration-300 animate-in fade-in zoom-in-95">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/20">
                        <MailOpen className="w-8 h-8 text-[#b30c25]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifica tu correo</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hemos enviado un código de 6 dígitos a <br />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} // Only alphanumeric
                            className="
                                w-full text-center text-3xl font-mono tracking-[0.5em] font-bold
                                py-4 rounded-xl
                                bg-gray-50 dark:bg-[#1a1a1a]
                                border border-gray-300 dark:border-[#332122]
                                text-gray-900 dark:text-white
                                placeholder-gray-300 dark:placeholder-gray-600
                                focus:outline-none focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                transition-all
                            "
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-3 text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg border border-red-100 dark:border-red-900/20">
                                {error}
                            </p>
                        )}
                        {resendMessage && (
                            <p className="text-green-600 dark:text-green-400 text-sm mt-3 text-center bg-green-50 dark:bg-green-900/10 py-2 rounded-lg border border-green-100 dark:border-green-900/20">
                                {resendMessage}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="
                            w-full py-3.5 rounded-xl font-bold text-white
                            bg-linear-to-r from-[#b30c25] to-[#80091b]
                            hover:brightness-110 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all shadow-lg shadow-red-900/20
                        "
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Verificando...
                            </div>
                        ) : 'Verificar Cuenta'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ¿No recibiste el código?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading || countdown > 0}
                            className={`
                                font-semibold transition-colors
                                ${countdown > 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-[#b30c25] hover:text-[#8f091d] underline hover:no-underline'
                                }
                            `}
                        >
                            {resendLoading ? 'Enviando...' : countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
