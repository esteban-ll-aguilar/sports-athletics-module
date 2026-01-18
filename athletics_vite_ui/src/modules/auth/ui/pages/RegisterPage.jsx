import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth_service';
import loginImage from '@assets/images/auth/login2.webp';

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
        direccion: '',
        fecha_nacimiento: '',
        sexo: 'M',
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Funciones de validación específicas por campo
    const validateFirstName = (value) => {
        if (!value) return 'El nombre es requerido';
        if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'El nombre solo debe contener letras y espacios';
        return '';
    };

    const validateLastName = (value) => {
        if (!value) return 'El apellido es requerido';
        if (value.length < 2) return 'El apellido debe tener al menos 2 caracteres';
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) return 'El apellido solo debe contener letras y espacios';
        return '';
    };

    const validateIdentificacion = (value, tipo) => {
        if (!value) return 'La identificación debe ser numérica';
        if (!/^\d+$/.test(value)) return 'La identificación solo debe contener números';
        if (tipo === 'CEDULA' && value.length !== 10) return 'La cédula debe tener exactamente 10 caracteres numéricos';
        if (tipo === 'PASAPORTE' && value.length < 5) return 'El pasaporte debe tener al menos 5 caracteres';
        if (tipo === 'RUC' && value.length !== 13) return 'El RUC debe tener exactamente 13 caracteres numéricos';
        return '';
    };

    const validatePhone = (value) => {
        if (!value) return '';
        
        // Verificar si hay caracteres inválidos antes de limpiar
        if (!/^[0-9+\-() ]*$/.test(value)) {
            return 'El teléfono solo debe contener números';
        }
        
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length > 0) {
            if (!cleanPhone.startsWith('09')) return 'El número celular debe empezar con 09';
            if (cleanPhone.length !== 10) return 'El número celular debe tener exactamente 10 dígitos';
        }
        return '';
    };

    const validateFechaNacimiento = (value) => {
        if (!value) return 'La fecha de nacimiento es requerida';
        return '';
    };

    const validateDireccion = (value) => {
        if (!value) return '';
        if (value.length < 8) return 'La dirección debe tener al menos 8 caracteres';
        if (value.length > 40) return 'La dirección no puede exceder 40 caracteres';
        return '';
    };

    const validateUsername = (value) => {
        if (!value) return 'El nombre de usuario es requerido';
        if (value.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres';
        return '';
    };

    const validateEmail = (value) => {
        if (!value) return 'El correo es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'El correo debe ser válido';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'La contraseña es requerida';
        if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (!/(?=.*[A-Z])/.test(password)) return 'Debe contener al menos una mayúscula';
        if (!/(?=.*[a-z])/.test(password)) return 'Debe contener al menos una minúscula';
        if (!/(?=.*[0-9])/.test(password)) return 'Debe contener al menos un número';
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;\'`~])/.test(password)) return 'Debe contener al menos un carácter especial';
        return '';
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) return 'Debe confirmar la contraseña';
        if (password !== confirmPassword) return 'Las contraseñas no coinciden';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newErrors = { ...fieldErrors };
        let processedValue = value;

        // Validación especial para identificación: solo números
        if (name === 'identificacion') {
            processedValue = value.replace(/[^0-9]/g, '');
            newErrors[name] = validateIdentificacion(processedValue, formData.tipo_identificacion);
        }
        // Validación especial para teléfono
        else if (name === 'phone') {
            // Validar ANTES de filtrar para detectar caracteres inválidos
            newErrors[name] = validatePhone(value);
            // Luego filtrar para guardar solo números y caracteres válidos
            processedValue = value.replace(/[^0-9+\-() ]/g, '');
        }
        // Validación de nombre
        else if (name === 'first_name') {
            newErrors[name] = validateFirstName(value);
        }
        // Validación de apellido
        else if (name === 'last_name') {
            newErrors[name] = validateLastName(value);
        }
        // Validación de dirección
        else if (name === 'direccion') {
            newErrors[name] = validateDireccion(value);
        }
        // Validación de usuario
        else if (name === 'username') {
            newErrors[name] = validateUsername(value);
        }
        // Validación de email
        else if (name === 'email') {
            newErrors[name] = validateEmail(value);
        }
        // Validación de contraseña
        else if (name === 'password') {
            newErrors[name] = validatePassword(value);
            if (formData.confirmPassword) {
                newErrors['confirmPassword'] = validateConfirmPassword(value, formData.confirmPassword);
            }
        }
        // Validación de confirmación de contraseña
        else if (name === 'confirmPassword') {
            newErrors[name] = validateConfirmPassword(formData.password, value);
        }
        // Validación de tipo de identificación
        else if (name === 'tipo_identificacion') {
            newErrors['identificacion'] = validateIdentificacion(formData.identificacion, value);
        }
        // Validación de fecha de nacimiento
        else if (name === 'fecha_nacimiento') {
            newErrors[name] = validateFechaNacimiento(value);
        }

        setFormData({
            ...formData,
            [name]: processedValue || value
        });
        setFieldErrors(newErrors);
    };

    const validateFormOnSubmit = () => {
        const newErrors = {};
        newErrors['first_name'] = validateFirstName(formData.first_name);
        newErrors['last_name'] = validateLastName(formData.last_name);
        newErrors['username'] = validateUsername(formData.username);
        newErrors['email'] = validateEmail(formData.email);
        newErrors['identificacion'] = validateIdentificacion(formData.identificacion, formData.tipo_identificacion);
        newErrors['password'] = validatePassword(formData.password);
        newErrors['confirmPassword'] = validateConfirmPassword(formData.password, formData.confirmPassword);
        newErrors['fecha_nacimiento'] = validateFechaNacimiento(formData.fecha_nacimiento);
        if (formData.phone) newErrors['phone'] = validatePhone(formData.phone);
        if (formData.direccion) newErrors['direccion'] = validateDireccion(formData.direccion);

        // Remover campos vacíos de errores
        Object.keys(newErrors).forEach(key => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validar todos los campos
        if (!validateFormOnSubmit()) {
            setError('Por favor, corrige los errores en los campos.');
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

            // 🔹 Aquí puedes ver toda la data que se enviará
            console.log("Data enviada al backend:", dataToSend);

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

    // Componente auxiliar para mostrar errores debajo de campos
    const ErrorMessage = ({ message }) => {
        return message ? (
            <p className="text-red-500 text-xs font-medium mt-1">{message}</p>
        ) : null;
    };

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-[#242223] via-[#212121] to-black">
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
                <div className="w-full max-w-lg bg-[#242223] rounded-2xl shadow-2xl p-8 border border-[#332122]">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white">Crear Cuenta</h2>
                        <p className="text-gray-400 mt-2">Ingresa tus datos para registrarte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Sección 1: Datos Personales */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-b pb-2">Datos Personales</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                                    <input
                                        name="first_name"
                                        required
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.first_name ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="Nombre"
                                    />
                                    <ErrorMessage message={fieldErrors.first_name} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Apellido</label>
                                    <input
                                        name="last_name"
                                        required
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.last_name ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="Apellido"
                                    />
                                    <ErrorMessage message={fieldErrors.last_name} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Tipo ID</label>
                                    <select
                                        name="tipo_identificacion"
                                        value={formData.tipo_identificacion}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white text-black border border-gray-300 rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm"
                                    >
                                        <option value="CEDULA">Cédula</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Identificación
                                        <span className="text-xs text-gray-500 ml-1">(solo números)</span>
                                    </label>
                                    <input
                                        name="identificacion"
                                        required
                                        value={formData.identificacion}
                                        onChange={handleChange}
                                        pattern="\d*"
                                        inputMode="numeric"
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.identificacion ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="0123456789"
                                    />
                                    <ErrorMessage message={fieldErrors.identificacion} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        inputMode="tel"
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="0999999999"
                                    />
                                    <ErrorMessage message={fieldErrors.phone} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
                                    <input
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.direccion ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="Tu dirección"
                                    />
                                    <ErrorMessage message={fieldErrors.direccion} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Fecha de nacimiento
                                </label>
                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    required
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.fecha_nacimiento ? 'border-red-400' : 'border-gray-300'}`}
                                />
                                <ErrorMessage message={fieldErrors.fecha_nacimiento} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Sexo
                                </label>
                                <select
                                    name="sexo"
                                    value={formData.sexo}
                                    onChange={handleChange}
                                    className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                        </div>

                        {/* Sección 2: Datos de Cuenta */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-b pb-2">Datos de Cuenta</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Estamento</label>
                                    <select
                                        name="tipo_estamento"
                                        value={formData.tipo_estamento}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white text-black border border-gray-300 rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm"
                                    >
                                        <option value="EXTERNOS">Externos</option>
                                        <option value="ESTUDIANTES">Estudiante</option>
                                        <option value="DOCENTES">Docente</option>
                                        <option value="ADMINISTRATIVOS">Administrativo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Soy un..</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white text-black border border-gray-300 rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm"
                                    >
                                        <option value="ATLETA">Atleta</option>
                                        <option value="REPRESENTANTE">Representante</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre de Usuario</label>
                                <input
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.username ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="Nombre de usuario"
                                />
                                <ErrorMessage message={fieldErrors.username} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.email ? 'border-red-400' : 'border-gray-300'}`}
                                    placeholder="correo@ejemplo.com"
                                />
                                <ErrorMessage message={fieldErrors.email} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'}`}
                                            placeholder="********"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                                    <ErrorMessage message={fieldErrors.password} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2.5 bg-white text-black border rounded-lg placeholder-gray-500 focus:ring-[#b30c25] focus:border-[#b30c25] sm:text-sm ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
                                            placeholder="********"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
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
                                    <ErrorMessage message={fieldErrors.confirmPassword} />
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 mt-1">Mínimo 8 caracteres, mayúscula, minúscula, número y especial.</p>
                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="
                        w-full py-3 px-4 rounded-lg
                        text-sm font-semibold text-white
                        bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
                        hover:brightness-110
                        focus:ring-2 focus:ring-[#b30c25]
                        disabled:opacity-50
                        transition-all duration-300 shadow-lg
                        mt-6
                        "
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>

                        <div className="text-center mt-4">
                            <span className="text-sm text-gray-400">¿Ya tienes cuenta? </span>
                            <Link to="/login" className="text-sm font-medium text-[#b30c25] hover:text-red-400">
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
