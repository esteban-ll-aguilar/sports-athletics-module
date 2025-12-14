import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth_service';
import loginImage from '@assets/images/auth/login.webp';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'ATLETA',
        nombre_completo: '',
        cedula: '',
        fecha_nacimiento: '',
        sexo: '',
        telefono: ''
    });
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate('/dashboard');
        }
        // Cargar roles disponibles
        loadRoles();
    }, [navigate]);

    const loadRoles = async () => {
        try {
            const rolesData = await authService.getRoles();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'username':
                if (!value.trim()) {
                    newErrors.username = 'El nombre de usuario es obligatorio';
                } else if (value.length < 4) {
                    newErrors.username = 'El nombre de usuario debe tener al menos 4 caracteres';
                } else {
                    delete newErrors.username;
                }
                break;

            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'El correo electrónico es obligatorio';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'El correo electrónico no es válido';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'La contraseña es obligatoria';
                } else if (value.length < 8) {
                    newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
                } else if (!/[A-Z]/.test(value)) {
                    newErrors.password = 'Debe contener al menos una letra mayúscula';
                } else if (!/[a-z]/.test(value)) {
                    newErrors.password = 'Debe contener al menos una letra minúscula';
                } else if (!/[0-9]/.test(value)) {
                    newErrors.password = 'Debe contener al menos un número';
                } else if (!/[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\\/;'`~]/.test(value)) {
                    newErrors.password = 'Debe contener al menos un carácter especial';
                } else {
                    delete newErrors.password;
                }
                
                // Revalidar confirmación si existe
                if (formData.passwordConfirm) {
                    if (value !== formData.passwordConfirm) {
                        newErrors.passwordConfirm = 'Las contraseñas no coinciden';
                    } else {
                        delete newErrors.passwordConfirm;
                    }
                }
                break;

            case 'cedula':
                if (value && !/^[0-9\-]+$/.test(value)) {
                    newErrors.cedula = 'La cédula solo debe contener números y guiones';
                } else {
                    delete newErrors.cedula;
                }
                break;

            case 'telefono':
                if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
                    newErrors.telefono = 'El teléfono contiene caracteres inválidos';
                } else {
                    delete newErrors.telefono;
                }
                break;

            case 'passwordConfirm':
                if (!value) {
                    newErrors.passwordConfirm = 'Confirma tu contraseña';
                } else if (value !== formData.password) {
                    newErrors.passwordConfirm = 'Las contraseñas no coinciden';
                } else {
                    delete newErrors.passwordConfirm;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
        setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        // Validar todos los campos
        let isValid = true;
        Object.keys(formData).forEach(key => {
            if (!validateField(key, formData[key])) {
                isValid = false;
            }
        });

        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            const { passwordConfirm, ...registerData } = formData;
            await authService.register(registerData);
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error("Register error:", err);
            
            // Manejar errores específicos del backend
            if (err.message) {
                setGeneralError(err.message);
            } else if (typeof err === 'string') {
                setGeneralError(err);
            } else {
                setGeneralError('Error al crear la cuenta. Por favor intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white">
            {/* Left Side - Image & Text */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 text-white items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={loginImage}
                        alt="Athletics Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 p-12 text-center max-w-lg">
                    <h1 className="text-4xl font-bold mb-4">Únete a la comunidad</h1>
                    <p className="text-lg text-gray-200">
                        Crea tu cuenta y comienza tu viaje hacia el éxito deportivo.
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Crea tu Cuenta</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {success && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">
                                ¡Cuenta creada exitosamente! Redirigiendo al login...
                            </div>
                        )}

                        {generalError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                                {generalError}
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de Usuario *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 sm:text-sm`}
                                    placeholder="Elige un nombre de usuario"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        {/* Selector de Rol */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Usuario *
                            </label>
                            <select
                                name="role"
                                required
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 sm:text-sm"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>
                                        {role.label} - {role.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nombre Completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre Completo (Opcional)
                            </label>
                            <input
                                type="text"
                                name="nombre_completo"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 sm:text-sm"
                                placeholder="Tu nombre completo"
                                value={formData.nombre_completo}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Cédula */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cédula de Identidad (Opcional)
                            </label>
                            <input
                                type="text"
                                name="cedula"
                                className={`block w-full px-3 py-2.5 border ${errors.cedula ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 sm:text-sm`}
                                placeholder="Ej: 12345678-9"
                                value={formData.cedula}
                                onChange={handleChange}
                            />
                            {errors.cedula && (
                                <p className="mt-1 text-sm text-red-600">{errors.cedula}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 sm:text-sm`}
                                    placeholder="Ingresa tu correo electrónico"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    className={`block w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 sm:text-sm`}
                                    placeholder="Crea una contraseña segura"
                                    value={formData.password}
                                    onChange={handleChange}
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
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Password Confirm */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPasswordConfirm ? "text" : "password"}
                                    name="passwordConfirm"
                                    required
                                    className={`block w-full pl-10 pr-10 py-2.5 border ${errors.passwordConfirm ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 sm:text-sm`}
                                    placeholder="Confirma tu contraseña"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                >
                                    {showPasswordConfirm ? (
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
                            {errors.passwordConfirm && (
                                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Creando cuenta...' : success ? '¡Cuenta creada!' : 'Crear Cuenta'}
                        </button>

                        <div className="text-center mt-4">
                            <span className="text-sm text-gray-600">¿Ya tienes cuenta? </span>
                            <Link to="/login" className="text-sm font-medium text-red-600 hover:text-red-500">
                                Inicia sesión aquí
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
