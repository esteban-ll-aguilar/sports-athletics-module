import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import RepresentanteService from '../../services/RepresentanteService';
import { User, Mail, Lock, Phone, MapPin, Hash, Eye, EyeOff, Save, X, UserPlus, CreditCard } from 'lucide-react';

const AthleteForm = ({ athleteId = null, onSuccess, onCancel }) => {
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
        direccion: '',
        sexo: 'M',
        fecha_nacimiento: ''
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (athleteId) {
            loadAthleteData(athleteId);
        }
    }, [athleteId]);

    const loadAthleteData = async (id) => {
        setLoading(true);
        try {
            const response = await RepresentanteService.getAtletaDetail(id);
            if (response.success && response.data) {
                const data = response.data;
                setFormData({
                    // Populate fields. Note: backend schema keys match formData keys usually
                    username: data.username || '',
                    email: data.email || '',
                    password: '', // Don't populate password
                    confirmPassword: '',
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    tipo_identificacion: data.tipo_identificacion || 'CEDULA',
                    identificacion: data.identificacion || '',
                    tipo_estamento: data.tipo_estamento || 'EXTERNOS',
                    phone: data.phone || '',
                    direccion: data.direccion || '',
                    sexo: data.sexo || 'M',
                    fecha_nacimiento: data.fecha_nacimiento || ''
                });
            } else {
                toast.error("No se pudo cargar la información del atleta.");
            }
        } catch (error) {
            console.error("Error loading athlete:", error);
            toast.error("Error al cargar datos del atleta.");
        } finally {
            setLoading(false);
        }
    };

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
        // Validation logic
        // Only validate password if creating OR if password field is not empty (changing password)
        const isPasswordRequired = !athleteId || formData.password.length > 0;

        if (isPasswordRequired) {
            if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden.';
            if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
            if (!/[A-Z]/.test(formData.password)) return 'La contraseña debe tener al menos una mayúscula.';
            if (!/\d/.test(formData.password)) return 'La contraseña debe tener al menos un número.';
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) return 'La contraseña debe tener al menos un carácter especial.';
        }

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
        const toastId = toast.loading(athleteId ? "Actualizando atleta..." : "Registrando atleta...");

        try {
            // Prepare data
            // If editing and password is empty, remove it from payload
            const { confirmPassword, password, ...rest } = formData;
            let dataToSend = { ...rest };

            if (password && password.length > 0) {
                dataToSend.password = password;
            } else if (!athleteId) {
                // Should have been caught by validation, but safety check
                toast.error("La contraseña es requerida para nuevos usuarios", { id: toastId });
                setLoading(false);
                return;
            }

            dataToSend.role = 'ATLETA';

            let response;
            if (athleteId) {
                // Remove username/email if you don't want to update them or if backend handles uniqueness specifics
                // But generally sending them is fine if they haven't changed.
                response = await RepresentanteService.updateChildAthlete(athleteId, dataToSend);
            } else {
                response = await RepresentanteService.registerChildAthlete(dataToSend);
            }

            if (response.success) {
                toast.success(response.message || (athleteId ? "Actualizado exitosamente" : "Registrado exitosamente"), { id: toastId });
                if (onSuccess) onSuccess(response.data);
            } else {
                toast.error(response.message || "Error en la operación", { id: toastId });
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            let msg = "Error al procesar solicitud";

            if (err.response?.data?.message) {
                msg = err.response.data.message;
                // Reuse existing error parsing logic
                if (msg.includes('ya existe') || msg.toLowerCase().includes('duplicate')) {
                    if (msg.toLowerCase().includes('email')) {
                        toast.error('El correo electrónico ya está registrado.', { id: toastId });
                        return;
                    }
                    if (msg.toLowerCase().includes('identificación') || msg.toLowerCase().includes('cedula')) {
                        toast.error('La identificación ya está registrada.', { id: toastId });
                        return;
                    }
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

    const InputField = ({ label, icon: Icon, type = "text", ...props }) => (
        <div className="space-y-1.5 w-full">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
                <input
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

    return (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#332122]">
                <UserPlus className="text-[#b30c25]" size={24} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {athleteId ? "Editar Información del Atleta" : "Información Personal"}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Nombre"
                    icon={User}
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Ej: Juan"
                />
                <InputField
                    label="Apellido"
                    icon={User}
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Ej: Pérez"
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tipo de Identificación</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(Opcional)"
                />
                <InputField
                    label="Dirección"
                    icon={MapPin}
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Dirección de residencia"
                />
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Fecha de Nacimiento</label>
                    <div className="relative">
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            required
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            className="
                                w-full pl-3 pr-3 py-3 rounded-xl
                                bg-gray-50 dark:bg-[#1a1a1a]
                                border border-gray-200 dark:border-[#332122]
                                text-gray-900 dark:text-white
                                focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                outline-none transition-all
                            "
                        />
                    </div>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Sexo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            name="sexo"
                            required
                            value={formData.sexo}
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
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-[#332122] mt-8">
                <Lock className="text-[#b30c25]" size={24} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Credenciales de Acceso</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Nombre de Usuario"
                    icon={User}
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Usuario único para login"
                />
                <InputField
                    label="Correo Electrónico"
                    icon={Mail}
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Contraseña {athleteId && "(Opcional)"}</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required={!athleteId}
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
                            placeholder={athleteId ? "Dejar en blanco para no cambiar" : "********"}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Confirmar Contraseña {athleteId && "(Opcional)"}</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            name="confirmPassword"
                            required={!athleteId || formData.password.length > 0}
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

            <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-100 dark:border-[#332122]">
                <button
                    type="button"
                    onClick={onCancel}
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
                    {loading ? "Procesando..." : (athleteId ? "Guardar Cambios" : "Registrar Atleta")}
                </button>
            </div>
        </form>
    );
};

export default AthleteForm;
