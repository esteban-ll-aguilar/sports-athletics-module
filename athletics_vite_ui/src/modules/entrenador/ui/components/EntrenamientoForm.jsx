import { useState, useEffect, useId } from 'react';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';
import { X, Dumbbell, AlignLeft, Calendar, PlusCircle, Clock, Trash2 } from 'lucide-react';

const EntrenamientoForm = ({ show, onClose, entrenamientoToEdit, onSave }) => {
    const baseId = useId();
    const [formData, setFormData] = useState({
        tipo_entrenamiento: '',
        descripcion: '',
        fecha_entrenamiento: new Date().toISOString().split('T')[0],
        horarios: []
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show) {
            if (entrenamientoToEdit) {
                setFormData({
                    tipo_entrenamiento: entrenamientoToEdit.tipo_entrenamiento || '',
                    descripcion: entrenamientoToEdit.descripcion || '',
                    fecha_entrenamiento: entrenamientoToEdit.fecha_entrenamiento
                        ? entrenamientoToEdit.fecha_entrenamiento
                        : new Date().toISOString().split('T')[0],
                    horarios: entrenamientoToEdit.horarios || []
                });
            } else {
                setFormData({
                    tipo_entrenamiento: '',
                    descripcion: '',
                    fecha_entrenamiento: new Date().toISOString().split('T')[0],
                    horarios: []
                });
            }
        }
    }, [entrenamientoToEdit, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddHorario = () => {
        setFormData(prev => ({
            ...prev,
            horarios: [...prev.horarios, { name: '', hora_inicio: '', hora_fin: '' }]
        }));
    };

    const handleHorarioChange = (index, field, value) => {
        const newHorarios = [...formData.horarios];
        newHorarios[index][field] = value;
        setFormData(prev => ({ ...prev, horarios: newHorarios }));
    };

    const handleRemoveHorario = (index) => {
        const newHorarios = [...formData.horarios];
        newHorarios.splice(index, 1);
        setFormData(prev => ({ ...prev, horarios: newHorarios }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar campos requeridos
        if (!formData.tipo_entrenamiento || formData.tipo_entrenamiento.trim() === '') {
            toast.error("El tipo de entrenamiento es requerido");
            return;
        }

        if (!formData.descripcion || formData.descripcion.trim() === '') {
            toast.error("La descripción es requerida");
            return;
        }

        // Basic validation for schedules
        for (const h of formData.horarios) {
            if (!h.name || !h.hora_inicio || !h.hora_fin) {
                toast.error("Completa todos los campos de los horarios");
                return;
            }
            if (h.hora_inicio >= h.hora_fin) {
                toast.error(`Horario "${h.name}": Inicio debe ser menor a Fin`);
                return;
            }
        }

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                fecha_entrenamiento: formData.fecha_entrenamiento,
                horarios: formData.horarios.map(h => ({
                    ...h,
                    hora_inicio: h.hora_inicio.length === 5 ? h.hora_inicio + ":00" : h.hora_inicio,
                    hora_fin: h.hora_fin.length === 5 ? h.hora_fin + ":00" : h.hora_fin
                }))
            };

            console.log('📤 Payload a enviar:', JSON.stringify(payload, null, 2));

            if (entrenamientoToEdit) {
                await EntrenamientoService.update(entrenamientoToEdit.id, payload);
                toast.success('Entrenamiento actualizado correctamente');
            } else {
                await EntrenamientoService.create(payload);
                toast.success('Entrenamiento creado correctamente');
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('❌ Error completo:', error);
            console.error('❌ Response data:', error.response?.data);
            console.error('❌ Errores de validación:', JSON.stringify(error.response?.data?.errors, null, 2));
            console.error('❌ Response status:', error.response?.status);
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Error al guardar el entrenamiento';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#212121] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] border border-gray-200 dark:border-[#332122]">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex items-center justify-between bg-gray-50 dark:bg-[#1a1a1a] rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-[#b30c25]/15 text-[#b30c25] flex items-center justify-center font-black">
                            {entrenamientoToEdit ? "✎" : <PlusCircle size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                                {entrenamientoToEdit ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
                            </h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                    {/* General Info */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#332122] pb-2 flex items-center gap-2 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#332122] rounded-full shadow-sm sm:mb-px">
                                <Dumbbell size={14} /> Información General
                            </div>
                        </h3>
                        <div>
                            <label htmlFor={`${baseId}-tipo`} className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                Tipo de Entrenamiento <span className="text-[#b30c25]">*</span>
                            </label>
                            <div className="relative">
                                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id={`${baseId}-tipo`}
                                    type="text"
                                    name="tipo_entrenamiento"
                                    placeholder="Ej. Resistencia, Fuerza..."
                                    required
                                    value={formData.tipo_entrenamiento}
                                    onChange={handleChange}
                                    className="
                                        w-full pl-10 pr-4 py-3 rounded-xl
                                        bg-gray-50 dark:bg-[#1a1a1a]
                                        border border-gray-200 dark:border-[#332122]
                                        text-gray-900 dark:text-white
                                        placeholder-gray-400 dark:placeholder-gray-500
                                        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                        outline-none transition-all
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor={`${baseId}-desc`} className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                Descripción <span className="text-[#b30c25]">*</span>
                            </label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-4 text-gray-400" size={18} />
                                <textarea
                                    id={`${baseId}-desc`}
                                    name="descripcion"
                                    placeholder="Detalles del entrenamiento..."
                                    required
                                    rows={3}
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="
                                        w-full pl-10 pr-4 py-3 rounded-xl
                                        bg-gray-50 dark:bg-[#1a1a1a]
                                        border border-gray-200 dark:border-[#332122]
                                        text-gray-900 dark:text-white
                                        placeholder-gray-400 dark:placeholder-gray-500
                                        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                        outline-none transition-all resize-none
                                    "
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor={`${baseId}-fecha`} className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                Fecha <span className="text-[#b30c25]">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id={`${baseId}-fecha`}
                                    type="date"
                                    name="fecha_entrenamiento"
                                    value={formData.fecha_entrenamiento}
                                    onChange={handleChange}
                                    required
                                    className="
                                        w-full pl-10 pr-4 py-3 rounded-xl
                                        bg-gray-50 dark:bg-[#1a1a1a]
                                        border border-gray-200 dark:border-[#332122]
                                        text-gray-900 dark:text-white
                                        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                        outline-none transition-all
                                        dark:scheme-dark
                                    "
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedules Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#332122] pb-2">
                            <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Clock size={14} /> Horarios
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddHorario}
                                className="text-[#b30c25] font-bold text-xs uppercase hover:bg-red-50 dark:hover:bg-[#b30c25]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <PlusCircle size={14} />
                                Agregar
                            </button>
                        </div>

                        {formData.horarios.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs italic bg-gray-50 dark:bg-[#1f1c1d] rounded-xl border border-dashed border-gray-200 dark:border-[#332122]">
                                No se han asignado horarios. Agrega uno para continuar.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.horarios.map((horario, index) => {
                                    const horarioRowId = `${baseId}-h-${index}`;
                                    return (
                                        <div key={`horario-${index}-${horario.name}`} className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 dark:bg-[#1f1c1d] p-4 rounded-xl border border-gray-200 dark:border-[#332122] animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
                                            <div className="flex-1 w-full">
                                                <label htmlFor={`${horarioRowId}-name`} className="block text-xs font-bold mb-1.5 text-gray-500 dark:text-gray-400 uppercase">Turno</label>
                                                <input
                                                    id={`${horarioRowId}-name`}
                                                    type="text"
                                                    placeholder="Ej. Mañana"
                                                    value={horario.name}
                                                    onChange={(e) => handleHorarioChange(index, 'name', e.target.value)}
                                                    className="
                                                        w-full px-3 py-2 rounded-lg
                                                        bg-white dark:bg-[#111]
                                                        border border-gray-200 dark:border-[#332122]
                                                        text-gray-900 dark:text-white
                                                        text-sm focus:ring-1 focus:ring-[#b30c25] outline-none
                                                    "
                                                    required
                                                />
                                            </div>
                                            <div className="w-full sm:w-32">
                                                <label htmlFor={`${horarioRowId}-start`} className="block text-xs font-bold mb-1.5 text-gray-500 dark:text-gray-400 uppercase">Inicio</label>
                                                <input
                                                    id={`${horarioRowId}-start`}
                                                    type="time"
                                                    value={horario.hora_inicio}
                                                    onChange={(e) => handleHorarioChange(index, 'hora_inicio', e.target.value)}
                                                    className="
                                                         w-full px-3 py-2 rounded-lg
                                                        bg-white dark:bg-[#111]
                                                        border border-gray-200 dark:border-[#332122]
                                                        text-gray-900 dark:text-white
                                                        text-sm focus:ring-1 focus:ring-[#b30c25] outline-none
                                                        dark:scheme-dark
                                                    "
                                                    required
                                                />
                                            </div>
                                            <div className="w-full sm:w-32">
                                                <label htmlFor={`${horarioRowId}-end`} className="block text-xs font-bold mb-1.5 text-gray-500 dark:text-gray-400 uppercase">Fin</label>
                                                <input
                                                    id={`${horarioRowId}-end`}
                                                    type="time"
                                                    value={horario.hora_fin}
                                                    onChange={(e) => handleHorarioChange(index, 'hora_fin', e.target.value)}
                                                    className="
                                                         w-full px-3 py-2 rounded-lg
                                                        bg-white dark:bg-[#111]
                                                        border border-gray-200 dark:border-[#332122]
                                                        text-gray-900 dark:text-white
                                                        text-sm focus:ring-1 focus:ring-[#b30c25] outline-none
                                                        dark:scheme-dark
                                                    "
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveHorario(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors h-[38px] w-[38px] flex items-center justify-center sm:mb-px"
                                                title="Quitar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-[#332122] bg-white dark:bg-[#212121] rounded-b-3xl">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="
                                flex-1 px-6 py-3.5 rounded-xl font-bold
                                border border-gray-200 dark:border-gray-700 
                                text-gray-700 dark:text-gray-300
                                hover:bg-gray-50 dark:hover:bg-gray-800 transition
                            "
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="
                                flex-1 px-6 py-3.5 rounded-xl font-bold text-white
                                bg-linear-to-r from-[#b30c25] to-[#80091b]
                                hover:brightness-110 shadow-lg shadow-red-900/20 
                                transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2
                            "
                        >
                            {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {entrenamientoToEdit ? 'Guardar Cambios' : 'Crear Entrenamiento'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntrenamientoForm;
