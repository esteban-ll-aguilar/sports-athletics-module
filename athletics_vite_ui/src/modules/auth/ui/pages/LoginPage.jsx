import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth_service';
import loginImage from '@assets/images/auth/login2.webp';
import VerificationModal from '../widgets/VerificationModal';
import TwoFactorLoginModal from '../widgets/TwoFactorLoginModal';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estados para el modal de verificación
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Estados para 2FA
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [tempToken, setTempToken] = useState('');

    const navigate = useNavigate();

    React.useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login(email, password);
            // Response is an APIResponse object { success, message, data, errors }

            // Check if 2FA is required (Backend returns success=true but data has temp_token instead of access_token)
            // We can check for temp_token existence
            if (response.data && response.data.temp_token) {
                // 2FA Requerido
                setTempToken(response.data.temp_token);
                setShowTwoFactorModal(true);
                toast.success(response.data.message || '2FA Requerido');
            } else if (response.success) {
                // Login normal exitoso (tokens already saved by authService)
                toast.success('Inicio de sesión exitoso');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Login error:", err);

            // Extract error message from APIResponse structure if possible
            let message = 'Error al iniciar sesión';
            if (err.message) message = err.message;
            if (err.detail) message = err.detail;

            // Detectar si el error es por usuario inactivo
            if (message === "Usuario inactivo, por favor verifica tu email") {
                setShowVerificationModal(true);
                toast.error(message);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSuccess = (msg) => {
        setShowVerificationModal(false);
        toast.success(msg || 'Email verificado exitosamente');
    };

    const handleTwoFactorSuccess = () => {
        setShowTwoFactorModal(false);
        toast.success('Verificación de 2 pasos completa');
    };

    return (
        //fondo degradado//
        <div className="flex h-screen w-full bg-linear-to-br from-[#242223] via-[#212121] to-black">
            <VerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                email={email}
                onSuccess={handleVerificationSuccess}
            />

            <TwoFactorLoginModal
                isOpen={showTwoFactorModal}
                tempToken={tempToken}
                email={email}
                onSuccess={handleTwoFactorSuccess}
                onError={(msg) => toast.error(msg)}
            />

            {/* Left Side - Image & Text */}
            <div className="hidden lg:flex w-1/2 relative text-white items-center justify-center overflow-hidden bg-[#242223]">
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent">
                    {/* Placeholder for the image from the design. Using a generic athletic image for now. */}
                    <img
                        src={loginImage}
                        alt="Athletics Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 p-12 text-center max-w-lg">
                    <h1 className="text-4xl font-extrabold mb-4 tracking-wide">
                        Alcanza tu máximo potencial
                    </h1>
                    <p className="text-lg text-gray-300">
                        Gestiona tus entrenamientos, sigue tu progreso y conéctate con tu equipo.
                    </p>

                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-linear-to-br from-[#212121] to-[#242223]">
                <div className="w-full max-w-md bg-[#242223] rounded-2xl shadow-2xl p-8 border border-[#332122]">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-14 h-14 bg-linear-to-br from-[#b30c25] to-[#362022] rounded-full flex items-center justify-center mb-4 text-white shadow-lg">
                            {/* Simple Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            Inicia Sesión en tu Cuenta
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "
                                    placeholder="Ingresa tu correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link to="/forgot-password" className="text-sm font-medium text-[#b30c25] hover:text-red-400 transition"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className=" w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-[#b30c25] via-[#362022] to-[#332122]  hover:brightness-110
                            focus:ring-2 focus:ring-[#b30c25] disabled:opacity-50 disabled:cursor-not-allowed  transition-all duration-300 shadow-lg "
                        >

                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>

                        <div className="text-center mt-4">
                            <span className="text-sm text-gray-400">¿No tienes cuenta? </span>
                            <Link to="/register" className="text-sm font-medium text-[#b30c25] hover:text-red-400">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
