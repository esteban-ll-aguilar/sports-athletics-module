import React, { useEffect, useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import RepresentanteService from '../../services/RepresentanteService';
import { toast } from 'react-hot-toast';
import { Users, Activity, Plus, User, Hash, Edit, X, Phone, Calendar, Briefcase ,Save  } from 'lucide-react';

const MisAtletasPage = () => {
    const navigate = useNavigate();
    const baseId = useId();
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAthletes();
    }, []);

    const fetchAthletes = async () => {
        try {
            setLoading(true);
            const response = await RepresentanteService.getMyAthletes();
            if (response.success) {
                setAthletes(response.data || []);
            } else {
                toast.error(response.message || "No se pudieron cargar los atletas");
            }
        } catch (error) {
            console.error("Error fetching athletes:", error);
            const errorMsg = error.response?.data?.message || "Error al cargar los atletas";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAtletaId, setSelectedAtletaId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        identificacion: '',
        fecha_nacimiento: '',
        sexo: 'M',
        phone: '',
        anios_experiencia: 0
    });

    const handleEditClick = async (atletaId) => {
        try {
            setSelectedAtletaId(atletaId);
            setLoading(true);
            const response = await RepresentanteService.getAtletaDetail(atletaId);
            if (response.success && response.data) {
                const detail = response.data;
                setEditFormData({
                    first_name: detail.user?.first_name || '',
                    last_name: detail.user?.last_name || '',
                    identificacion: detail.user?.identificacion || '',
                    fecha_nacimiento: detail.user?.fecha_nacimiento || '',
                    sexo: detail.user?.sexo || 'M',
                    phone: detail.user?.phone || '',
                    anios_experiencia: detail.anios_experiencia || 0,
                });
                setShowEditModal(true);
            } else {
                toast.error(response.message || "Error al cargar información.");
            }
        } catch (error) {
            toast.error("Error cargando información para editar.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Actualizando información...");
        try {
            const payload = {
                first_name: editFormData.first_name,
                last_name: editFormData.last_name,
                identificacion: editFormData.identificacion,
                fecha_nacimiento: editFormData.fecha_nacimiento,
                sexo: editFormData.sexo,
                phone: editFormData.phone,
                atleta_data: {
                    anios_experiencia: parseInt(editFormData.anios_experiencia)
                }
            };

            const response = await RepresentanteService.updateChildAthlete(selectedAtletaId, payload);
            if (response.success) {
                toast.success(response.message || "Información actualizada correctamente.", { id: toastId });
                setShowEditModal(false);
                fetchAthletes();
            } else {
                toast.error(response.message || "Error al actualizar.", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Error al actualizar la información.";
            toast.error(errorMsg, { id: toastId });
        }
    };

    const handleChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    if (loading && !showEditModal) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Cargando atletas...</span>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Mis Atletas</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Gestiona los atletas que tienes registrados bajo tu representación.</p>
                    </div>
                    <div className="flex gap-4 items-center w-full md:w-auto">
                        <button
                            onClick={() => navigate('/dashboard/representante/register-athlete')}
                            className="flex items-center justify-center gap-2 bg-linear-to-r from-[#b30c25] to-[#80091b] text-white px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-red-900/20 active:scale-95 font-bold w-full md:w-auto"
                        >
                            <Plus size={20} />
                            Registrar Atleta
                        </button>
                    </div>
                </div>

                {/* Content */}
                {athletes.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] flex flex-col items-center">
                        <div className="bg-gray-50 dark:bg-[#2a2829] w-24 h-24 rounded-full flex items-center justify-center mb-6">
                            <Users size={48} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No tienes atletas registrados</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8 max-w-sm">Registra a tus hijos o representados para gestionar sus entrenamientos y competencias.</p>
                        <button
                            onClick={() => navigate('/dashboard/representante/register-athlete')}
                            className="text-[#b30c25] font-bold hover:text-red-700 hover:underline flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Registrar mi primer atleta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {athletes.map((atleta) => (
                            <div key={atleta.id} className="bg-white dark:bg-[#212121] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-red-50 to-gray-100 dark:from-[#b30c25]/10 dark:to-[#1a1a1a] flex items-center justify-center text-[#b30c25] font-black text-xl shadow-inner">
                                            {atleta.user?.first_name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate" title={`${atleta.user?.first_name} ${atleta.user?.last_name}`}>
                                                {atleta.user?.first_name} {atleta.user?.last_name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                <User size={12} />
                                                {atleta.user?.username}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[#332122] grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <span className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                                <Hash size={12} />
                                                Identificación
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 block truncate" title={atleta.user?.identificacion}>
                                                {atleta.user?.identificacion}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                                <Activity size={12} />
                                                Experiencia
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                                                {atleta.anios_experiencia} años
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1a1a1a] px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-[#332122]">
                                    <button
                                        onClick={() => handleEditClick(atleta.id)}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <Edit size={16} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => navigate(`/dashboard/representante/atleta/${atleta.id}`)}
                                        className="text-sm text-[#b30c25] hover:text-[#80091b] dark:hover:text-red-400 font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <Activity size={16} />
                                        Rendimiento
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#212121] rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-[#332122] max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-[#332122] sticky top-0 bg-white dark:bg-[#212121] z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Información</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actualiza los datos del atleta.</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#332122] rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-first_name`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Nombre</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            id={`${baseId}-first_name`}
                                            type="text"
                                            name="first_name"
                                            value={editFormData.first_name}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-last_name`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Apellido</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            id={`${baseId}-last_name`}
                                            type="text"
                                            name="last_name"
                                            value={editFormData.last_name}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-identificacion`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Identificación</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            id={`${baseId}-identificacion`}
                                            type="text"
                                            name="identificacion"
                                            value={editFormData.identificacion}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-phone`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            id={`${baseId}-phone`}
                                            type="text"
                                            name="phone"
                                            value={editFormData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-fecha_nacimiento`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Fecha de Nacimiento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            id={`${baseId}-fecha_nacimiento`}
                                            type="date"
                                            name="fecha_nacimiento"
                                            value={editFormData.fecha_nacimiento}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-sexo`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Sexo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            id={`${baseId}-sexo`}
                                            name="sexo"
                                            value={editFormData.sexo}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all appearance-none"
                                        >
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor={`${baseId}-experiencia`} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Años de Experiencia</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            id={`${baseId}-experiencia`}
                                            type="number"
                                            name="anios_experiencia"
                                            value={editFormData.anios_experiencia}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-[#332122] mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#2a2829] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-linear-to-r from-[#b30c25] to-[#80091b] text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisAtletasPage;
