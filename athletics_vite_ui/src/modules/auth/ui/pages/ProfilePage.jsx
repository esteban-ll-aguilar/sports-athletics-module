import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Save, Shield, Camera } from 'lucide-react';
import authService from '../../services/auth_service';
import HistorialMedicoModal from '../widgets/HistorialmedicoModal';
import TwoFactorSettings from '../widgets/TwoFactorSettings';
import ActiveSessionsWidget from '../widgets/ActiveSessionsWidget';
import Settings from '../../../../config/enviroment';

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false);
    const [profileFile, setProfileFile] = useState(null);


    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        direccion: '',
        fecha_nacimiento: '',
        tipo_identificacion: '',
        identificacion: '',
        tipo_estamento: '',
        sexo: '',
        role: '',
        profile_image: '',
        user_external_id: '',          // 🔹 External ID del usuario
        historial_external_id: null    // 🔹 External ID del historial (si existe)
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await authService.getProfile();
            if (response.data) {
                const user = response.data;
                setFormData({
                    username: user.username || '',
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    direccion: user.direccion || '',
                    fecha_nacimiento: user.fecha_nacimiento || '',
                    tipo_identificacion: user.tipo_identificacion || '',
                    identificacion: user.identificacion || '',
                    tipo_estamento: user.tipo_estamento || '',
                    sexo: user.sexo || '',
                    role: user.role || '',
                    profile_image: user.profile_image || '',
                    user_external_id: user.external_id || '', // 🔹
                    historial_external_id: user.historial?.external_id || null // 🔹
                });
            }
        } catch (err) {
            setError('No se pudo cargar la información del perfil.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const data = new FormData();

            data.append('username', formData.username);
            data.append('first_name', formData.first_name);
            data.append('last_name', formData.last_name);
            data.append('phone', formData.phone);
            data.append('direccion', formData.direccion);

            if (formData.sexo) {
                data.append('sexo', formData.sexo);
            }
            if (formData.tipo_estamento) {
                data.append('tipo_estamento', formData.tipo_estamento);
            }
            if (formData.fecha_nacimiento) {
                data.append('fecha_nacimiento', formData.fecha_nacimiento);
            }

            if (formData.tipo_identificacion) {
                data.append('tipo_identificacion', formData.tipo_identificacion);
            }

            if (formData.identificacion) {
                data.append('identificacion', formData.identificacion);
            }

            if (profileFile) {
                data.append('profile_image', profileFile);
            }

            // DEBUG
            for (let pair of data.entries()) {
                console.log('📦', pair[0], pair[1]);
            }

            await authService.updateProfile(data);

            setMessage('Perfil actualizado correctamente');
            await fetchProfile();
        } catch (err) {
            console.error("Full profile update error:", err);
            console.error("Validation details:", err.response?.data);
            setError('Error al actualizar perfil');
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px] bg-[#242223]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b30c25]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 bg-[#242223] min-h-screen text-white">
            {/* Header / Banner */}
            <div className="bg-[#212121] rounded-2xl shadow-sm overflow-hidden border border-[#332122]">
                <div className="h-32 bg-linear-to-r from-[#b30c25] to-[#332122]"></div>
                <div className="relative px-6 pb-6">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Avatar */}
                        <div className="-mt-12 relative">
                            <div className="h-24 w-24 rounded-full border-4 border-[#332122] bg-[#212121]
                  shadow-md flex items-center justify-center overflow-hidden">
                                {profileFile ? (
                                    // Preview local
                                    <img
                                        src={URL.createObjectURL(profileFile)}
                                        alt="Perfil Local"
                                        className="w-full h-full object-cover"
                                    />
                                ) : formData.profile_image ? (
                                    // Imagen desde backend
                                    <img
                                        src={`${Settings.API_URL}/${formData.profile_image}`}
                                        alt="Perfil"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + formData.first_name + "+" + formData.last_name + "&background=random"; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Sin imagen
                                    </div>
                                )}
                            </div>

                            {/* INPUT FILE */}
                            <input
                                type="file"
                                accept="image/*"
                                id="profileUpload"
                                className="hidden"
                                onChange={(e) => setProfileFile(e.target.files[0])}
                            />

                            {/* BOTÓN REAL */}
                            <label
                                htmlFor="profileUpload"
                                className="absolute bottom-0 right-0 bg-[#332122] p-1.5
               rounded-full border border-[#332122]
               cursor-pointer hover:text-[#b30c25]"
                                title="Cambiar foto"
                            >
                                <Camera size={16} />
                            </label>
                        </div>


                        {/* Name & Role */}
                        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold text-white">
                                {formData.first_name} {formData.last_name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start mt-1 space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#332122] text-white">
                                    {formData.role}
                                </span>
                                <span className="text-sm text-gray-400 flex items-center">
                                    <Mail size={14} className="mr-1" /> {formData.email}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats or Status */}
                        <div className="mt-4 md:mt-0 md:ml-auto">
                            <div className="inline-flex items-center px-3 py-1 rounded-lg border border-[#332122] bg-[#212121] text-sm text-gray-400">
                                <Shield size={16} className="mr-2 text-[#b30c25]" />
                                Cuenta Verificada
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flash Messages */}
            {
                message && (
                    <div className="bg-[#332122] border-l-4 border-[#b30c25] p-4 rounded-md">
                        <div className="flex">
                            <div className="shrink-0">
                                <Save className="h-5 w-5 text-[#b30c25]" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-white">{message}</p>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                error && (
                    <div className="bg-[#332122] border-l-4 border-[#b30c25] p-4 rounded-md">
                        <div className="flex">
                            <div className="shrink-0">
                                <Shield className="h-5 w-5 text-[#b30c25]" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-white">{error}</p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="bg-[#212121] rounded-2xl shadow-sm border border-[#332122] p-6 md:p-8">
                <div className="flex items-center mb-6">
                    <User className="text-[#b30c25] mr-2" />
                    <h2 className="text-xl font-semibold text-white">Información Personal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                    required
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Apellido</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                    />
                        </div>
                    </div>

                    {/* Direccion */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                    />
                        </div>
                    </div>

                    {/* Fecha Nacimiento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Nacimiento</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                    />
                        </div>
                    </div>

                    {/* Sexo (Enum) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Sexo</label>
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
  "                                                                >
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="md:col-span-2 my-2 border-t border-[#332122]"></div>

                    {/* Tipo Identificacion (Enum) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tipo Identificación</label>
                        <select
                            name="tipo_identificacion"
                            value={formData.tipo_identificacion}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                >
                            <option value="CEDULA">Cédula</option>
                            <option value="PASAPORTE">Pasaporte</option>
                            <option value="RUC">RUC</option>
                        </select>
                    </div>

                    {/* Identificacion (Readonly conceptually, but form might allow if not readonly in backend, user said update data according to put endpoint) */}
                    {/* Usually ident is not changeable, but UserUpdateRequest allows `identificacion`? NO, it does NOT. */}
                    {/* So I will display it as disabled. */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Identificación</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="identificacion"
                                value={formData.identificacion}
                                readOnly
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                    />
                        </div>
                    </div>

                    {/* Tipo Estamento (Enum) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Estamento</label>
                        <select
                            name="tipo_estamento"
                            value={formData.tipo_estamento}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                                >
                            <option value="EXTERNOS">Externos</option>
                            <option value="ESTUDIANTES">Estudiante</option>
                            <option value="DOCENTES">Docente</option>
                            <option value="ADMINISTRATIVOS">Administrativo</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-4">

                    {formData.role === 'ATLETA' && (
                        <>
                            {/* Botón para añadir / editar historial */}
                            <button
                                type="button"
                                onClick={() => setIsHistorialModalOpen(true)}
                                className="inline-flex items-center px-6 py-3 border border-[#b30c25] rounded-lg text-[#b30c25] bg-[#242223] hover:bg-[rgba(179,12,37,0.15)] transition"
                            >
                                <Shield className="mr-2 h-5 w-5" />
                                Añadir historial médico
                            </button>

                        </>
                    )}

                    {/* Guardar cambios del perfil */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`inline-flex items-center px-6 py-3 rounded-lg text-white bg-linear-to-r from-[#b30c25] via-[#362022] to-[#332122] hover:brightness-110 focus:ring-2 focus:ring-[#b30c25] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg ${submitting ? 'opacity-50' : ''}`}
                    >
                        <Save className="mr-2 h-5 w-5" />
                        Guardar Cambios
                    </button>
                </div>


            </form>

            <TwoFactorSettings />

            {/* <ActiveSessionsWidget /> */}

            {
                isHistorialModalOpen && (
                    <HistorialMedicoModal
                        isOpen={isHistorialModalOpen}
                        onClose={() => setIsHistorialModalOpen(false)}
                        atletaId={formData.identificacion}
                    />
                )
            }

        </div >

    );

};

export default ProfilePage;
