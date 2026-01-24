import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RepresentanteService from '../../services/RepresentanteService';

const RegisterAthletePage = () => {
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
        tipo_estamento: 'EXTERNOS', // Default to EXTERNOS or let them choose?
        // Role is handled by backend (forced to ATLETA)
        phone: '',
        direccion: ''
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Valida cédula ecuatoriana (igual que backend)
    const validarCedulaEcuador = (cedula) => {
        if (!/^[0-9]{10}$/.test(cedula)) return false;
        const provincia = parseInt(cedula.slice(0, 2), 10);
        if (provincia < 1 || provincia > 24) return false;
        const tercerDigito = parseInt(cedula[2], 10);
        if (tercerDigito >= 6) return false;
        const coef = [2,1,2,1,2,1,2,1,2];
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            let val = parseInt(cedula[i], 10) * coef[i];
            if (val >= 10) val -= 9;
            suma += val;
        }
        const digitoVerificador = parseInt(cedula[9], 10);
        const residuo = suma % 10;
        const resultado = residuo === 0 ? 0 : 10 - residuo;
        return resultado === digitoVerificador;
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden.';
        if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        if (!/[A-Z]/.test(formData.password)) return 'La contraseña debe tener al menos una mayúscula.';
        if (!/\d/.test(formData.password)) return 'La contraseña debe tener al menos un número.';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) return 'La contraseña debe tener al menos un carácter especial.';
        if (formData.username.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres.';
        if (formData.tipo_identificacion === 'CEDULA' && !validarCedulaEcuador(formData.identificacion)) return 'Cédula ecuatoriana inválida.';
        if (formData.identificacion.length < 8) return 'La identificación debe tener al menos 8 caracteres.';
        if (formData.email.length < 5 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) return 'Correo electrónico inválido.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errorMsg = validateForm();
        if (errorMsg) {
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Registrando atleta...");
        try {
            // Remove confirmPassword
            const { confirmPassword, ...dataToSend } = formData;

            // Force role just in case frontend logic leaks, but backend handles it
            dataToSend.role = 'ATLETA';

            const response = await RepresentanteService.registerChildAthlete(dataToSend);

            if (response.success) {
                toast.success(response.message || "Atleta registrado exitosamente", { id: toastId });
                navigate('/dashboard/representante/mis-atletas');
            } else {
                toast.error(response.message || "Error al registrar atleta", { id: toastId });
            }
        } catch (err) {
            console.error("Error creating athlete:", err);
            let msg = "Error al registrar atleta";

            // Handle standardized APIResponse error if available
            if (err.response?.data?.message) {
                msg = err.response.data.message;
                // Si es error de duplicado, resaltar campos
                if (msg.includes('ya existe') || msg.toLowerCase().includes('duplicate')) {
                    if (msg.toLowerCase().includes('email')) {
                        toast.error('El correo electrónico ya está registrado.', { id: toastId });
                        return;
                    }
                    if (msg.toLowerCase().includes('identificación') || msg.toLowerCase().includes('cedula')) {
                        toast.error('La identificación ya está registrada.', { id: toastId });
                        return;
                    }
                    toast.error(msg, { id: toastId });
                    return;
                }
            } else if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    msg = detail.map(e => `${e.loc[1] || 'Campo'}: ${e.msg}`).join('\n');
                } else {
                    msg = String(detail);
                }
            }
            toast.error(msg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md mt-6">
            <div className="mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Registrar Nuevo Atleta (Hijo)</h1>
                <p className="text-gray-500">Ingresa los datos del atleta que deseas registrar bajo tu representación.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input name="first_name" required value={formData.first_name} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Nombre del atleta" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input name="last_name" required value={formData.last_name} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Apellido del atleta" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Identificación</label>
                        <select name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                            <option value="CEDULA">Cédula</option>
                            <option value="PASAPORTE">Pasaporte</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Identificación</label>
                        <input name="identificacion" required value={formData.identificacion} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Cédula o Pasaporte" />
                        {formData.tipo_identificacion === 'CEDULA' && (
                            <p className="text-xs text-gray-500 mt-1">Debe ser una cédula ecuatoriana válida de 10 dígitos.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Opcional" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input name="direccion" value={formData.direccion} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Dirección de residencia" />
                    </div>
                </div>

                {/* Account Data */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de la Cuenta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                            <input name="username" required value={formData.username} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="Usuario único" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" placeholder="correo@ejemplo.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 pr-10"
                                    placeholder="********"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                placeholder="********"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mr-4 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md shadow-red-200 disabled:opacity-70 flex items-center"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                Registrando...
                            </span>
                        ) : "Registrar Atleta"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterAthletePage;
