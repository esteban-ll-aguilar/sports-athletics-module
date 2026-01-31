import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RepresentanteService from '../../services/RepresentanteService';
import { User, Mail, Lock, Phone, MapPin, Hash, Eye, EyeOff, ArrowLeft, UserPlus, CreditCard } from 'lucide-react';
import PropTypes from 'prop-types';

const InputField = ({ label, icon: Icon, type = "text", id, ...props }) => (
    <div className="space-y-1.5 w-full">
        <label htmlFor={id} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
            <input
                id={id}
                type={type}
                {...props}
                className={`
                    w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 rounded-xl
                    bg-gray-50 dark:bg-[#1a1a1a]
                    border border-gray-200 dark:border-[#332122]
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                    outline-none transition-all
                `}
            />
        </div>
    </div>
);

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    type: PropTypes.string,
    id: PropTypes.string.isRequired
};

const RegisterAthletePage = () => {
    const navigate = useNavigate();
    const baseId = useId();

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

    const validarCedulaEcuador = (cedula) => {
        if (!/^[0-9]{10}$/.test(cedula)) return false;
        const provincia = parseInt(cedula.slice(0, 2), 10);
        if (provincia < 1 || provincia > 24) return false;
        const tercerDigito = parseInt(cedula[2], 10);
        if (tercerDigito >= 6) return false;
        const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
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
            const { confirmPassword, ...dataToSend } = formData;
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

            if (err.response?.data?.message) {
                msg = err.response.data.message;
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-6 transition-colors duration-300 font-['Lexend']">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl bg-white dark:bg-[#212121] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-[#332122] shadow-sm transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Registrar Atleta</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresa los datos del atleta bajo tu representación.</p>
                        </div>
                    </div>

                </div>

                <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-xl border border-gray-200 dark:border-[#332122] overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#332122]">
                                <UserPlus className="text-[#b30c25]" size={24} />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Información Personal</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Nombre"
                                    icon={User}
                                    id={`${baseId}-first_name`}
                                    name="first_name"
                                    required
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Ej: Juan"
                                />
                                <InputField
                                    label="Apellido"
                                    icon={User}
                                    id={`${baseId}-last_name`}
                                    name="last_name"
                                    required
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Ej: Pérez"
                                />

                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-tipo_identificacion`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tipo de Identificación</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            id={`${baseId}-tipo_identificacion`}
                                            name="tipo_identificacion"
                                            value={formData.tipo_identificacion}
                                            onChange={handleChange}
                                            className="
                                                w-full pl-10 pr-8 py-3 rounded-xl
                                                bg-gray-50 dark:bg-[#1a1a1a]
                                                border border-gray-200 dark:border-[#332122]
                                                text-gray-900 dark:text-white
                                                focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                                outline-none transition-all appearance-none
                                            "
                                        >
                                            <option value="CEDULA">Cédula</option>
                                            <option value="PASAPORTE">Pasaporte</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <InputField
                                        label="Número de Identificación"
                                        icon={Hash}
                                        id={`${baseId}-identificacion`}
                                        name="identificacion"
                                        required
                                        value={formData.identificacion}
                                        onChange={handleChange}
                                        placeholder="Cédula o Pasaporte"
                                    />
                                    {formData.tipo_identificacion === 'CEDULA' && (
                                        <p className="text-[10px] text-gray-400 pl-1">Debe ser una cédula ecuatoriana válida.</p>
                                    )}
                                </div>

                                <InputField
                                    label="Teléfono"
                                    icon={Phone}
                                    id={`${baseId}-phone`}
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(Opcional)"
                                />
                                <InputField
                                    label="Dirección"
                                    icon={MapPin}
                                    id={`${baseId}-direccion`}
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    placeholder="Dirección de residencia"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#332122]">
                                <Lock className="text-[#b30c25]" size={24} />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Credenciales de Acceso</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Nombre de Usuario"
                                    icon={User}
                                    id={`${baseId}-username`}
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Usuario único para login"
                                />
                                <InputField
                                    label="Correo Electrónico"
                                    icon={Mail}
                                    id={`${baseId}-email`}
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                />

                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-password`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            id={`${baseId}-password`}
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="
                                                w-full pl-10 pr-10 py-3 rounded-xl
                                                bg-gray-50 dark:bg-[#1a1a1a]
                                                border border-gray-200 dark:border-[#332122]
                                                text-gray-900 dark:text-white
                                                placeholder-gray-400 dark:placeholder-gray-500
                                                focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                                outline-none transition-all
                                            "
                                            placeholder="********"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 pl-1">
                                        Mín. 8 caracteres, 1 mayúscula, 1 número y 1 especial.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-confirmPassword`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            id={`${baseId}-confirmPassword`}
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="
                                                w-full pl-10 pr-3 py-3 rounded-xl
                                                bg-gray-50 dark:bg-[#1a1a1a]
                                                border border-gray-200 dark:border-[#332122]
                                                text-gray-900 dark:text-white
                                                placeholder-gray-400 dark:placeholder-gray-500
                                                focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                                outline-none transition-all
                                            "
                                            placeholder="********"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-100 dark:border-[#332122]">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-xl font-bold bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    px-8 py-3 rounded-xl font-bold text-white
                                    bg-linear-to-r from-[#b30c25] to-[#80091b]
                                    hover:brightness-110 shadow-lg shadow-red-900/20
                                    active:scale-95 transition-all
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    flex items-center gap-2
                                "
                            >
                                {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {loading ? "Registrando..." : "Registrar Atleta"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterAthletePage;
