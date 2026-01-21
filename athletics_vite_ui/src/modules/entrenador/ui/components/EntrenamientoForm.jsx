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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#212121] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] border border-[#332122]">
                <div className="px-6 py-5 border-b border-[#332122] flex items-center justify-between bg-[#1a1a1a] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(179,12,37,0.15)] text-[#b30c25] flex items-center justify-center font-black">
                            {entrenamientoToEdit ? "✎" : "E"}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-100">
                                {entrenamientoToEdit ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
                            </h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase text-gray-400 border-b border-[#332122] pb-2">Información General</h3>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">
                                Tipo de Entrenamiento *
                            </label>
                            <input
                                type="text"
                                name="tipo_entrenamiento"
                                placeholder="Ej. Resistencia, Fuerza..."
                                required
                                value={formData.tipo_entrenamiento}
                                onChange={handleChange}
                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">
                                Descripción *
                            </label>
                            <textarea
                                name="descripcion"
                                placeholder="Detalles del entrenamiento..."
                                required
                                rows={3}
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300">
                                Fecha *
                            </label>
                            <input
                                type="date"
                                name="fecha_entrenamiento"
                                value={formData.fecha_entrenamiento}
                                onChange={handleChange}
                                required
                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                            />
                        </div>
                    </div>

                    {/* Sección Horarios */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#332122] pb-2">
                            <h3 className="text-xs font-bold uppercase text-gray-400">Horarios</h3>
                            <button
                                type="button"
                                onClick={handleAddHorario}
                                className="text-[#b30c25] font-bold text-xs uppercase hover:bg-[#b30c25]/10 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Agregar
                            </button>
                        </div>

                        {formData.horarios.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-xs italic bg-[#1f1c1d] rounded-xl border border-dashed border-[#332122]">
                                No se han asignado horarios. Agrega uno para continuar.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.horarios.map((horario, index) => (
                                    <div key={index} className="flex gap-2 items-end bg-[#1f1c1d] p-3 rounded-xl border border-[#332122] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold mb-2 text-gray-300">Turno</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Mañana"
                                                value={horario.name}
                                                onChange={(e) => handleHorarioChange(index, 'name', e.target.value)}
                                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                required
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-sm font-bold mb-2 text-gray-300">Inicio</label>
                                            <input
                                                type="time"
                                                value={horario.hora_inicio}
                                                onChange={(e) => handleHorarioChange(index, 'hora_inicio', e.target.value)}
                                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                required
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-sm font-bold mb-2 text-gray-300">Fin</label>
                                            <input
                                                type="time"
                                                value={horario.hora_fin}
                                                onChange={(e) => handleHorarioChange(index, 'hora_fin', e.target.value)}
                                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveHorario(index)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors h-[38px] w-[38px] flex items-center justify-center"
                                            title="Quitar"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="
                flex-1 px-4 py-3 rounded-xl font-semibold
                border border-[#332122] text-gray-400
                hover:bg-[#242223] transition
              "                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="
                flex-1 px-4 py-3 rounded-xl font-semibold text-white
                bg-gradient-to-r from-[#b30c25] via-[#362022] to-[#332122]
                hover:brightness-110 transition active:scale-95
              "
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                entrenamientoToEdit ? 'Guardar Cambios' : 'Crear Entrenamiento'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntrenamientoForm;
