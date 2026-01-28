import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, KeyRound, ArrowLeft, Send, CheckCircle2, RotateCcw } from 'lucide-react';
import PasswordResetService from '../../services/PasswordResetService';

const PasswordResetPage = () => {
    const navigate = useNavigate();

    // Steps: 1 = Email, 2 = Code, 3 = New Password
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Handlers
    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await PasswordResetService.requestReset(email);
            if (response.success) {
                toast.success(response.message || "Si el correo existe, recibirás un código.");
                setStep(2);
            } else {
                toast.error(response.message || "Error al solicitar código.");
            }
        } catch (error) {
            console.error(error);
            const msg = error.message || error.detail || "Error al solicitar código. Inténtalo de nuevo.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleValidateCode = async (e) => {
        e.preventDefault();
        if (code.length < 6) {
            toast.error("El código es demasiado corto");
            return;
        }
        setLoading(true);
        try {
            const response = await PasswordResetService.validateCode(email, code);
            if (response.success) {
                toast.success(response.message || "Código validado correctamente.");
                setStep(3);
            } else {
                toast.error(response.message || "Código inválido.");
            }
        } catch (error) {
            console.error(error);
            const msg = error.message || error.detail || "Código inválido o expirado";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);
        try {
            const response = await PasswordResetService.completeReset(email, code, password);
            if (response.success) {
                console.log("Reset Success Response:", response);
                toast.success(response.message || "Contraseña actualizada exitosamente.");
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(response.message || "Error al actualizar contraseña");
            }
        } catch (error) {
            console.error("Reset Error:", error);
            const msg = error.message || error.detail || "Error al actualizar contraseña";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Components for internal use
    const StepIndicator = ({ currentStep }) => (
        <div className="flex items-center justify-center mb-8 gap-2">
            {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                    <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300
                        ${s === currentStep
                            ? 'bg-[#b30c25] text-white shadow-[0_0_15px_rgba(179,12,37,0.5)] scale-110'
                            : s < currentStep
                                ? 'bg-[#b30c25]/40 text-gray-300 dark:text-gray-300'
                                : 'bg-gray-200 text-gray-400 dark:bg-[#332122] dark:text-gray-600'}
                    `}>
                        {s < currentStep ? <CheckCircle2 size={16} /> : s}
                    </div>
                    {s < 3 && (
                        <div className={`h-1 w-12 rounded-full transition-colors duration-300 ${s < currentStep ? 'bg-[#b30c25]/40' : 'bg-gray-200 dark:bg-[#332122]'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-linear-to-br dark:from-[#1a1a1a] dark:via-[#212121] dark:to-black px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
            <div className="max-w-md w-full relative">

                {/* Decorative Elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#b30c25] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 dark:opacity-20 animate-pulse transition-opacity duration-500"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#b30c25] rounded-full mix-blend-multiply filter blur-[100px] opacity-5 dark:opacity-10 animate-pulse delay-1000 transition-opacity duration-500"></div>

                <div className="relative bg-white dark:bg-[#242223]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-[#332122] transition-colors duration-500">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="mx-auto h-14 w-14 bg-linear-to-br from-[#b30c25] to-[#590612] rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                            <KeyRound className="text-white w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide transition-colors duration-300">Recuperar Contraseña</h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {step === 1 && "Ingresa tu correo para recibir un código."}
                            {step === 2 && `Ingresa el código enviado a tu correo.`}
                            {step === 3 && "Crea una nueva contraseña segura."}
                        </p>
                    </div>

                    <StepIndicator currentStep={step} />

                    {/* Step 1: Request Code */}
                    {step === 1 && (
                        <form onSubmit={handleRequestCode} className="space-y-5 animate-fadeIn">
                            <div className="space-y-1">
                                <label htmlFor="email" className="block text-xs font-medium text-gray-400 uppercase tracking-wider pl-1">
                                    Correo Electrónico
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#b30c25] transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="
                                            block w-full pl-10 pr-3 py-3
                                            bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white
                                            border border-gray-300 dark:border-[#332122] rounded-xl
                                            placeholder-gray-400 dark:placeholder-gray-600
                                            focus:ring-2 focus:ring-[#b30c25] focus:border-transparent
                                            transition-all duration-200
                                            sm:text-sm
                                        "
                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full flex justify-center py-3.5 px-4 rounded-xl
                                    text-sm font-bold text-white tracking-wide
                                    bg-linear-to-r from-[#b30c25] to-[#8a091d]
                                    hover:from-[#c9122e] hover:to-[#a10b22]
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b30c25] focus:ring-offset-[#242223]
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    transform hover:-translate-y-0.5 active:translate-y-0
                                    transition-all duration-200 shadow-lg shadow-[#b30c25]/20
                                "
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Enviando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Enviar Código
                                        <Send size={16} />
                                    </span>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="text-xs text-gray-500 hover:text-[#b30c25] transition-colors flex items-center justify-center gap-1 mx-auto"
                                >
                                    ¿Ya tienes un código? Ingrésalo aquí
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Validate Code */}
                    {step === 2 && (
                        <form onSubmit={handleValidateCode} className="space-y-5 animate-fadeIn">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider pl-1">
                                    Verificar Correo
                                </label>
                                <div className="relative backdrop-blur-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        disabled
                                        className="
                                            block w-full pl-10 pr-3 py-3
                                            bg-gray-100 dark:bg-[#1a1a1a]/50 text-gray-500 dark:text-gray-400
                                            border border-gray-200 dark:border-[#332122] rounded-xl
                                            sm:text-sm cursor-not-allowed transition-colors
                                        "
                                        value={email}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="code" className="block text-xs font-medium text-gray-400 uppercase tracking-wider pl-1">
                                    Código de Verificación
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#b30c25] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        id="code"
                                        required
                                        maxLength={6}
                                        className="
                                            block w-full pl-10 pr-3 py-3
                                            bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white
                                            border border-gray-300 dark:border-[#332122] rounded-xl
                                            placeholder-gray-400 dark:placeholder-gray-600
                                            focus:ring-2 focus:ring-[#b30c25] focus:border-transparent
                                            tracking-[0.25em] font-mono text-center
                                            transition-all duration-200
                                            sm:text-sm
                                        "
                                        placeholder="ABC123"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); }}
                                        className="text-xs text-[#b30c25] hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <RotateCcw size={12} /> Solicitar nuevo código
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full flex justify-center py-3.5 px-4 rounded-xl
                                    text-sm font-bold text-white tracking-wide
                                    bg-linear-to-r from-[#b30c25] to-[#8a091d]
                                    hover:from-[#c9122e] hover:to-[#a10b22]
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b30c25] focus:ring-offset-[#242223]
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    transform hover:-translate-y-0.5 active:translate-y-0
                                    transition-all duration-200 shadow-lg shadow-[#b30c25]/20
                                "
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Validando...
                                    </span>
                                ) : "Verificar Código"}
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5 animate-fadeIn">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider pl-1">Nueva Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#b30c25] transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="
                                            block w-full pl-10 pr-3 py-3
                                            bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white
                                            border border-gray-300 dark:border-[#332122] rounded-xl
                                            placeholder-gray-400 dark:placeholder-gray-600
                                            focus:ring-2 focus:ring-[#b30c25] focus:border-transparent
                                            transition-all duration-200
                                            sm:text-sm
                                        "
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider pl-1">Confirmar Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#b30c25] transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="
                                            block w-full pl-10 pr-3 py-3
                                            bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white
                                            border border-gray-300 dark:border-[#332122] rounded-xl
                                            placeholder-gray-400 dark:placeholder-gray-600
                                            focus:ring-2 focus:ring-[#b30c25] focus:border-transparent
                                            transition-all duration-200
                                            sm:text-sm
                                        "
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full flex justify-center py-3.5 px-4 rounded-xl
                                    text-sm font-bold text-white tracking-wide
                                    bg-linear-to-r from-[#b30c25] to-[#8a091d]
                                    hover:from-[#c9122e] hover:to-[#a10b22]
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b30c25] focus:ring-offset-white dark:focus:ring-offset-[#242223]
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    transform hover:-translate-y-0.5 active:translate-y-0
                                    transition-all duration-200 shadow-lg shadow-[#b30c25]/20
                                "
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Actualizando...
                                    </span>
                                ) : "Restablecer Contraseña"}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#332122] text-center transition-colors duration-300">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Volver al inicio de sesión
                        </Link>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PasswordResetPage;
