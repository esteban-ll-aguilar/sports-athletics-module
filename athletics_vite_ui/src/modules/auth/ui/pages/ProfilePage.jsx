import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Save, Shield, Camera } from 'lucide-react';
import authService from '../../services/auth_service';
import HistorialMedicoModal from '../widgets/HistorialmedicoModal';

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false);

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
            const updatePayload = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                tipo_identificacion: formData.tipo_identificacion,
                tipo_estamento: formData.tipo_estamento,
                fecha_nacimiento: formData.fecha_nacimiento,
                phone: formData.phone,
                direccion: formData.direccion,
                sexo: formData.sexo,
                profile_image: formData.profile_image
            };

            await authService.updateProfile(updatePayload);
            setMessage('Perfil actualizado exitosamente.');
            await fetchProfile();
        } catch (err) {
            console.error(err);
            const errorMsg = err.detail || err.message || 'Error al actualizar el perfil.';
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header / Banner */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="h-32 bg-linear-to-r from-indigo-600 to-purple-600"></div>
                <div className="relative px-6 pb-6">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Avatar */}
                        <div className="-mt-12 relative">
                            <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                                {formData.profile_image ? (
                                    <img src={formData.profile_image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {formData.first_name ? formData.first_name[0] : 'U'}
                                    </span>
                                )}
                            </div>
                            <button disabled className="absolute bottom-0 right-0 bg-gray-100 p-1.5 rounded-full border border-white text-gray-500 hover:text-indigo-600 transition-colors cursor-not-allowed" title="Cambiar foto (Próximamente)">
                                <Camera size={16} />
                            </button>
                        </div>

                        {/* Name & Role */}
                        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {formData.first_name} {formData.last_name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start mt-1 space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {formData.role}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center">
                                    <Mail size={14} className="mr-1" /> {formData.email}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats or Status */}
                        <div className="mt-4 md:mt-0 md:ml-auto">
                            <div className="inline-flex items-center px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
                                <Shield size={16} className="mr-2 text-green-500" />
                                Cuenta Verificada
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flash Messages */}
            {message && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                    <div className="flex">
                        <div className="shrink-0">
                            <Save className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{message}</p>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex">
                        <div className="shrink-0">
                            <Shield className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-6">
                    <User className="text-indigo-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Información Personal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            required
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Direccion */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Fecha Nacimiento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Sexo (Enum) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                        <select
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                        >
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="md:col-span-2 my-2 border-t border-gray-100"></div>

                    {/* Tipo Identificacion (Enum) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Identificación</label>
                        <select
                            name="tipo_identificacion"
                            value={formData.tipo_identificacion}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                        >
                            <option value="CEDULA">Cédula</option>
                            <option value="PASAPORTE">Pasaporte</option>
                            <option value="RUC">RUC</option>
                        </select>
                    </div>

                    {/* Identificacion (Readonly conceptually, but form might allow if not readonly in backend, user said update data according to put endpoint) */}
                    {/* Usually ident is not changeable, but UserUpdateRequest allows `identificacion`? NO, it does NOT. */}
                    {/* So I will display it as disabled. */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Identificación</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="identificacion"
                                value={formData.identificacion}
                                readOnly
                                className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Tipo Estamento (Enum) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estamento</label>
                        <select
                            name="tipo_estamento"
                            value={formData.tipo_estamento}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                        >
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
                className="inline-flex items-center px-6 py-3 border border-indigo-600 rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 transition"
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
        className={`inline-flex items-center px-6 py-3 rounded-lg text-white ${
            submitting
                ? 'bg-indigo-400'
                : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
    >
        <Save className="mr-2 h-5 w-5" />
        Guardar Cambios
    </button>
</div>


        </form>
        {isHistorialModalOpen && (
            <HistorialMedicoModal
                isOpen={isHistorialModalOpen}
                onClose={() => setIsHistorialModalOpen(false)}
                atletaId={formData.identificacion}
            />
        )}

    </div>
    
);

};

export default ProfilePage;
