import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';

const EntrenamientoForm = ({ show, onClose, entrenamientoToEdit, onSave }) => {
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
            console.error(error);
            toast.error('Error al guardar el entrenamiento');
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black text-gray-900">
                        {entrenamientoToEdit ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase text-gray-400 border-b border-gray-100 pb-2">Información General</h3>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                                Tipo de Entrenamiento
                            </label>
                            <input
                                type="text"
                                name="tipo_entrenamiento"
                                placeholder="Ej. Resistencia, Fuerza..."
                                required
                                value={formData.tipo_entrenamiento}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                placeholder="Detalles del entrenamiento..."
                                required
                                rows={3}
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                                Fecha
                            </label>
                            <input
                                type="date"
                                name="fecha_entrenamiento"
                                value={formData.fecha_entrenamiento}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 bg-white"
                            />
                        </div>
                    </div>

                    {/* Sección Horarios */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <h3 className="text-sm font-bold uppercase text-gray-400">Horarios</h3>
                            <button
                                type="button"
                                onClick={handleAddHorario}
                                className="text-red-600 font-bold text-xs uppercase hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Agregar
                            </button>
                        </div>

                        {formData.horarios.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-xs italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                No se han asignado horarios. Agrega uno para continuar.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.horarios.map((horario, index) => (
                                    <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Turno</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Mañana"
                                                value={horario.name}
                                                onChange={(e) => handleHorarioChange(index, 'name', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-red-500"
                                                required
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Inicio</label>
                                            <input
                                                type="time"
                                                value={horario.hora_inicio}
                                                onChange={(e) => handleHorarioChange(index, 'hora_inicio', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-red-500"
                                                required
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Fin</label>
                                            <input
                                                type="time"
                                                value={horario.hora_fin}
                                                onChange={(e) => handleHorarioChange(index, 'hora_fin', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-red-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveHorario(index)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors h-[38px] w-[38px] flex items-center justify-center"
                                            title="Quitar"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6 md:mt-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 p-4 border border-gray-100 rounded-xl font-bold text-gray-400 text-xs uppercase hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 p-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-50 text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                entrenamientoToEdit ? 'Actualizar Todo' : 'Crear Entrenamiento'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntrenamientoForm;
