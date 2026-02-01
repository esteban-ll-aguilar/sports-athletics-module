import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Save, Shield, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../../services/auth_service';
import HistorialMedicoModal from '../widgets/HistorialmedicoModal';
import historialMedicoService from '../../services/historialMedicoService';
import TwoFactorSettings from '../widgets/TwoFactorSettings';
import ActiveSessionsWidget from '../widgets/ActiveSessionsWidget';
import Settings from '../../../../config/enviroment';
import ThemeToggle from '../../../../shared/components/ThemeToggle';

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false);
    const [profileFile, setProfileFile] = useState(null);
    const [historial, setHistorial] = useState(null);


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
            const [profileResponse, historialResponse] = await Promise.all([
                authService.getProfile(),
                historialMedicoService.getMyHistorial().catch((error) => {
                    console.error("❌ Error fetching historial:", error);
                    return null;
                })
            ]);

            if (profileResponse.data) {
                const user = profileResponse.data;
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
                    user_external_id: user.external_id || '',
                    historial_external_id: user.historial?.external_id || null
                });
            }

            if (historialResponse) {
                console.log("✅ Historial loaded:", historialResponse);
                // Check if wrapped in data (APIResponse pattern) or flat
                const validHistorial = historialResponse.data || historialResponse;
                setHistorial(validHistorial);
            } else {
                console.log("⚠️ No history found or error occurred.");
                // Optional: Toast msg if we expected history but got none
                // toast.error("No se pudo cargar el historial médico");
            }

        } catch (err) {
            toast.error(err.message || 'No se pudo cargar la información del perfil.');
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

        // Frontend Validation
        if (!formData.first_name || !formData.last_name || !formData.phone) {
            toast.error("Por favor completa los campos obligatorios");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Actualizando perfil...');

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

            const response = await authService.updateProfile(data);

            toast.success(response.message || 'Perfil actualizado correctamente', { id: toastId });
            await fetchProfile();
        } catch (err) {
            console.error("Full profile update error:", err);
            const errorMessage = err.message || 'Error al actualizar perfil';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px] bg-gray-50 dark:bg-[#242223]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b30c25]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50 dark:bg-[#242223] min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header / Banner */}
            <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-[#332122] transition-colors duration-300">
                <div className="h-32 bg-linear-to-r from-[#b30c25] to-[#80091b] dark:to-[#332122] relative">
                    {/* Theme Toggle in Top Right of Banner */}
                    <div className="absolute top-4 right-4 z-10">
                        <ThemeToggle />
                    </div>
                </div>
                <div className="relative px-6 pb-6">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Avatar */}
                        <div className="-mt-12 relative">
                            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-[#332122] bg-white dark:bg-[#212121]
                  shadow-md flex items-center justify-center overflow-hidden transition-colors duration-300">
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
                                className="absolute bottom-0 right-0 bg-white dark:bg-[#332122] p-1.5
               rounded-full border border-gray-200 dark:border-[#332122]
               cursor-pointer hover:text-[#b30c25] text-gray-700 dark:text-gray-300 shadow-sm transition-colors duration-300"
                                title="Cambiar foto"
                            >
                                <Camera size={16} />
                            </label>
                        </div>


                        {/* Name & Role */}
                        <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                {formData.first_name} {formData.last_name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start mt-1 space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-[#332122] text-gray-800 dark:text-white transition-colors duration-300">
                                    {formData.role}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center transition-colors duration-300">
                                    <Mail size={14} className="mr-1" /> {formData.email}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats or Status */}
                        <div className="mt-4 md:mt-0 md:ml-auto">
                            <div className="inline-flex items-center px-3 py-1 rounded-lg border border-gray-200 dark:border-[#332122] bg-gray-50 dark:bg-[#212121] text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                <Shield size={16} className="mr-2 text-[#b30c25]" />
                                Cuenta Verificada
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Main Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-6 md:p-8 transition-colors duration-300">
                <div className="flex items-center mb-6">
                    <User className="text-[#b30c25] mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información Personal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label htmlFor="p-first_name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                        <input
                            id="p-first_name"
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
  "                                                                    required
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="p-last_name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Apellido</label>
                        <input
                            id="p-last_name"
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
  "                                                                />
                    </div>

                    {/* Username */}
                    <div>
                        <label htmlFor="p-username" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Usuario</label>
                        <input
                            id="p-username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
  "                                                                />
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="p-phone" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={16} className="text-gray-400" />
                            </div>
                            <input
                                id="p-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
  "                                                                    />
                        </div>
                    </div>

                    {/* Direccion */}
                    <div className="md:col-span-2">
                        <label htmlFor="p-direccion" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dirección</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin size={16} className="text-gray-400" />
                            </div>
                            <input
                                id="p-direccion"
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
  "                                                                    />
                        </div>
                    </div>

                    {/* Fecha Nacimiento */}
                    <div>
                        <label htmlFor="p-fecha_nacimiento" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Nacimiento</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                            <input
                                id="p-fecha_nacimiento"
                                type="date"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
  "                                                                    />
                        </div>
                    </div>

                    {/* Sexo (Enum) */}
                    <div>
                        <label htmlFor="p-sexo" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sexo</label>
                        <select
                            id="p-sexo"
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
  "                                                                >
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="md:col-span-2 my-2 border-t border-gray-200 dark:border-[#332122]"></div>

                    {/* Tipo Identificacion (Enum) */}
                    <div>
                        <label htmlFor="p-tipo_identificacion" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo Identificación</label>
                        <select
                            id="p-tipo_identificacion"
                            name="tipo_identificacion"
                            value={formData.tipo_identificacion}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
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
                        <label htmlFor="p-identificacion" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Identificación</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard size={16} className="text-gray-400" />
                            </div>
                            <input
                                id="p-identificacion"
                                type="text"
                                name="identificacion"
                                value={formData.identificacion}
                                readOnly
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm cursor-not-allowed transition-colors duration-300
  "                                                                    />
                        </div>
                    </div>

                    {/* Tipo Estamento (Enum) */}
                    <div>
                        <label htmlFor="p-tipo_estamento" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Estamento</label>
                        <select
                            id="p-tipo_estamento"
                            name="tipo_estamento"
                            value={formData.tipo_estamento}
                            onChange={handleChange}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white
    border border-gray-300 dark:border-[#444] rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm transition-colors duration-300
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
                            {/* Botón para añadir / editar historial */}
                            <button
                                type="button"
                                onClick={() => setIsHistorialModalOpen(true)}
                                className="inline-flex items-center px-6 py-3 border border-[#b30c25] rounded-lg text-[#b30c25] bg-white dark:bg-[#242223] hover:bg-[#b30c25]/5 dark:hover:bg-[#b30c25]/15 transition"
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

            {formData.role === 'ATLETA' && (
                <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] p-6 md:p-8 transition-colors duration-300">
                    <div className="flex items-center mb-6">
                        <Shield className="text-[#b30c25] mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Historial Médico</h2>
                    </div>

                    {historial ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gray-50 dark:bg-[#242223] p-4 rounded-xl border border-gray-200 dark:border-[#332122] transition-colors duration-300">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Talla</p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{historial.talla} m</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#242223] p-4 rounded-xl border border-gray-200 dark:border-[#332122] transition-colors duration-300">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Peso</p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{historial.peso} kg</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#242223] p-4 rounded-xl border border-gray-200 dark:border-[#332122] transition-colors duration-300">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">IMC</p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{historial.imc}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-[#332122] pb-4">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Alergias</p>
                                    <p className="text-gray-900 dark:text-white">{historial.alergias || "Ninguna"}</p>
                                </div>
                                <div className="border-b border-gray-200 dark:border-[#332122] pb-4">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Enfermedades</p>
                                    <p className="text-gray-900 dark:text-white">{historial.enfermedades || "Ninguna"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Enfermedades Hereditarias</p>
                                    <p className="text-gray-900 dark:text-white">{historial.enfermedades_hereditarias || "Ninguna"}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-[#242223] rounded-xl border border-gray-200 dark:border-[#332122] border-dashed transition-colors duration-300">
                            <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3 opacity-50" />
                            <p className="text-gray-500 dark:text-gray-400">Aún no se ha registrado el historial médico</p>
                        </div>
                    )}
                </div>
            )}

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
