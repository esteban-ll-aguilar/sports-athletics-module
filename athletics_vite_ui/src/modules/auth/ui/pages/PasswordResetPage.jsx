import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PasswordResetService from '../../services/PasswordResetService';

const PasswordResetPage = () => {
    const navigate = useNavigate();

    // Steps: 1 = Email, 2 = Code, 3 = New Password
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(''); // We can use an array/string for 6 inputs if we want fancy UI, doing simple first
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Handlers
    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await PasswordResetService.requestReset(email);
            toast.success("Si el correo existe, recibirás un código.");
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error("Error al solicitar código. Inténtalo de nuevo.");
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
            await PasswordResetService.validateCode(email, code);
            toast.success("Código validado correctamente.");
            setStep(3);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Código inválido o expirado";
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
            await PasswordResetService.completeReset(email, code, password);
            toast.success("Contraseña actualizada exitosamente.");
            // Slight delay to read the toast
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Error al actualizar contraseña";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#242223] via-[#212121] to-black px-4 sm:px-6 lg:px-8 font-['Outfit']">
            <div className="max-w-md w-full space-y-8 bg-[#242223] p-10 rounded-3xl shadow-2xl border border-[#332122]">

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-[#b30c25] to-[#362022] rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <span className="material-symbols-outlined text-3xl text-white">lock_reset</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Recuperar Contraseña</h2>
                    <p className="mt-3 text-gray-500 hover:text-gray-500 transition">
                        {step === 1 && "Ingresa tu correo para recibir un código de verificación."}
                        {step === 2 && `Ingresa el código enviado a ${email}`}
                        {step === 3 && "Crea una nueva contraseña segura."}
                    </p>
                </div>

                {/* Steps Logic */}
                <div className="mt-8 space-y-6">

                    {/* STEP 1: REQUEST CODE */}
                    {step === 1 && (
                        <form onSubmit={handleRequestCode} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                                    Correo Electrónico
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400 text-lg">mail</span>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
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
  w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white
  bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
  hover:brightness-110
  focus:outline-none focus:ring-2 focus:ring-[#b30c25]
  disabled:opacity-70
  transition-all duration-300 shadow-lg
"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Enviando...
                                    </span>
                                ) : "Enviar Código"}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="text-sm font-medium text-[#b30c25] hover:text-red-300 transition"                                >
                                    ¿Ya tienes un código? Ingrésalo aquí
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 2: VERIFY CODE */}
                    {step === 2 && (
                        <form onSubmit={handleValidateCode} className="space-y-6">
                            <div>
                                <label htmlFor="email_verify" className="block text-sm font-medium text-gray-400 mb-1">
                                    Confirmar Correo Electrónico
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="email"
                                        id="email_verify"
                                        required
                                        className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-1">
                                    Código de Verificación
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="code"
                                        required
                                        maxLength={6}
                                        className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                        placeholder="ABC123"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-center text-gray-300">
                                    ¿No recibiste el código?{" "}
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); }}
                                        className="font-medium text-red-600 hover:text-red-400"
                                    >
                                        Solicitar uno nuevo
                                    </button>
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="
  w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white
  bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
  hover:brightness-110
  focus:outline-none focus:ring-2 focus:ring-[#b30c25]
  disabled:opacity-70
  transition-all duration-300 shadow-lg
">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Validando...
                                    </span>
                                ) : "Verificar Código"}
                            </button>
                        </form>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="password"
                                        required
                                        className="focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3 px-4"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="password"
                                        required
                                        className="focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-xl py-3 px-4"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className=" w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]  hover:brightness-110
                            focus:ring-2 focus:ring-[#b30c25] disabled:opacity-50 disabled:cursor-not-allowed  transition-all duration-300 shadow-lg "
                            >

                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Actualizando...
                                    </span>
                                ) : "Restablecer Contraseña"}
                            </button>
                        </form>
                    )}

                    <div className="flex items-center justify-center mt-4">
                        <Link to="/login" className="flex items-center text-sm font-medium text-gray-300 hover:text-gray-400 transition-colors">
                            <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
                            Volver al inicio de sesión
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PasswordResetPage;
