import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth_service';
import loginImage from '@assets/images/auth/login.webp';

const RegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        tipo_identificacion: 'CEDULA',
        identificacion: '',
        tipo_estamento: 'EXTERNOS',
        role: 'ATLETA',
        phone: '',
        direccion: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validatePassword = (password) => {
        if (!/(?=.*[A-Z])/.test(password)) return 'La contraseña debe contener al menos una mayúscula.';
        if (!/(?=.*[a-z])/.test(password)) return 'La contraseña debe contener al menos una minúscula.';
        if (!/(?=.*[0-9])/.test(password)) return 'La contraseña debe contener al menos un número.';
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;\'`~])/.test(password)) return 'La contraseña debe contener al menos un carácter especial.';
        if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        return null;
    };

    const validateForm = () => {
        if (formData.username.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres.';
        if (formData.first_name.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
        if (formData.last_name.length < 2) return 'El apellido debe tener al menos 2 caracteres.';
        if (formData.identificacion.length < 8) return 'La identificación debe tener al menos 8 caracteres.';

        // Optional fields validation if provided
        if (formData.phone && formData.phone.length < 10 || formData.phone.length > 14) return 'El teléfono debe tener al menos 10 caracteres.';
        if (formData.direccion && formData.direccion.length < 8 || formData.direccion.length > 40) return 'La dirección debe tener al menos 8 caracteres.';

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        const pwdError = validatePassword(formData.password);
        if (pwdError) {
            setError(pwdError);
            return;
        }

        const formError = validateForm();
        if (formError) {
            setError(formError);
            return;
        }

        setLoading(true);

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, phone, direccion, ...rest } = formData;

            // Only include optional fields if they have content to avoid min_length validation errors
            const dataToSend = { ...rest };
            if (phone && phone.trim() !== '') dataToSend.phone = phone;
            if (direccion && direccion.trim() !== '') dataToSend.direccion = direccion;

            await authService.register(dataToSend);
            navigate('/login');
        } catch (err) {
            console.error("Registration error:", err);
            let errorMessage = 'Error al registrar usuario. Inténtalo de nuevo.';

            if (err.detail) {
                if (typeof err.detail === 'string') {
                    errorMessage = err.detail;
                } else if (Array.isArray(err.detail)) {
                    // Pydantic validation errors
                    errorMessage = err.detail.map(e => e.msg).join(', ');
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Side - Image */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 text-white items-center justify-center overflow-hidden fixed h-full">
                <div className="absolute inset-0 z-0">
                    <img
                        src={loginImage}
                        alt="Athletics Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                <div className="relative z-10 p-12 text-center max-w-lg">
                    <h1 className="text-4xl font-bold mb-4">Únete a nosotros</h1>
                    <p className="text-lg text-gray-200">
                        Comienza tu viaje deportivo hoy mismo.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 overflow-y-auto ml-auto">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
                        <p className="text-gray-500 mt-2">Ingresa tus datos para registrarte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Sección 1: Datos Personales */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos Personales</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input name="first_name" required value={formData.first_name} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Nombre" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                    <input name="last_name" required value={formData.last_name} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Apellido" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo ID</label>
                                    <select name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                                        <option value="CEDULA">Cédula</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Identificación</label>
                                    <input name="identificacion" required value={formData.identificacion} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Número ID" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="0999999999" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <input name="direccion" value={formData.direccion} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Tu dirección" />
                                </div>
                            </div>
                        </div>

                        {/* Sección 2: Datos de Cuenta */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos de Cuenta</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estamento</label>
                                    <select name="tipo_estamento" value={formData.tipo_estamento} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                                        <option value="EXTERNOS">Externos</option>
                                        <option value="ESTUDIANTES">Estudiante</option>
                                        <option value="DOCENTES">Docente</option>
                                        <option value="ADMINISTRATIVOS">Administrativo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Soy un..</label>
                                    <select name="role" value={formData.role} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                                        <option value="ATLETA">Atleta</option>
                                        <option value="REPRESENTANTE">Representante</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                                <input name="username" required value={formData.username} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Nombre de usuario" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="correo@ejemplo.com" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 pr-10"
                                            placeholder="********"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 pr-10"
                                            placeholder="********"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, mayúscula, minúscula, número y especial.</p>
                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors mt-6"
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>

                        <div className="text-center mt-4">
                            <span className="text-sm text-gray-600">¿Ya tienes cuenta? </span>
                            <Link to="/login" className="text-sm font-medium text-red-600 hover:text-red-500">
                                Inicia Sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
