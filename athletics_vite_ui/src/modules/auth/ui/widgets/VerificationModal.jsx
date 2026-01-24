import React, { useState, useEffect } from 'react';
import authService from '../../services/auth_service';
import { toast } from 'react-hot-toast';

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
                // TC-E03: Success
                const msg = response.message || 'Nuevo código enviado';
                toast.success(msg);
                setResendMessage(msg);
                setCountdown(60);
            }
        } catch (err) {
            let msg = 'Error al reenviar el código';
            if (err.message) msg = err.message; // "Ya existe un código activo...", etc.
            if (err.detail) msg = err.detail;

            // TC-E05: Rate Limit message usually comes here
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
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                <div className="mb-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Verifica tu Correo</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Hemos enviado un código de verificación a <br />
                        <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Ingresa el código de 6 dígitos"
                            className="text-center block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-lg tracking-widest placeholder-gray-400"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {resendMessage && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center">
                            {resendMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 4}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Verificando...' : 'Verificar Cuenta'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">
                        ¿No recibiste el código?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading || countdown > 0}
                        className="text-sm font-medium text-red-600 hover:text-red-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {resendLoading ? 'Reenviando...' : countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar Código'}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default VerificationModal;
