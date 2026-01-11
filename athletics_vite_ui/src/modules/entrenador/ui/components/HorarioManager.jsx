import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import HorarioService from '../../services/HorarioService';

const HorarioManager = ({ show, onClose, entrenamiento }) => {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newHorario, setNewHorario] = useState({ name: '', hora_inicio: '', hora_fin: '' });

    useEffect(() => {
        if (entrenamiento && show) {
            loadHorarios();
        }
    }, [entrenamiento, show]);

    const loadHorarios = async () => {
        setLoading(true);
        try {
            console.log("Cargando horarios para entrenamiento ID:", entrenamiento.id);
            const data = await HorarioService.getByEntrenamiento(entrenamiento.id);
            console.log("Horarios recibidos:", data);

            if (Array.isArray(data)) {
                setHorarios(data);
            } else {
                console.warn("Formato de horarios inválido", data);
                setHorarios([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar horarios");
            setHorarios([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newHorario.name || !newHorario.hora_inicio || !newHorario.hora_fin) return;
        if (newHorario.hora_inicio >= newHorario.hora_fin) {
            toast.error("La hora de inicio debe ser menor a la hora fin");
            return;
        }

        try {
            await HorarioService.create(entrenamiento.id, {
                name: newHorario.name,
                hora_inicio: newHorario.hora_inicio + ":00", // Asegurar formato HH:MM:SS
                hora_fin: newHorario.hora_fin + ":00"
            });
            toast.success("Horario agregado");
            setNewHorario({ name: '', hora_inicio: '', hora_fin: '' });
            loadHorarios();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear horario");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este horario?")) return;
        try {
            await HorarioService.delete(id);
            toast.success("Horario eliminado");
            loadHorarios();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar horario");
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Gestión de Horarios</h2>
                        <p className="text-sm text-gray-500">
                            {entrenamiento?.tipo_entrenamiento} - {entrenamiento?.fecha_entrenamiento}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Formulario de agregar */}
                    <div>
                        <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Agregar Nuevo Horario</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Nombre / Turno</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Matutino, Grupo A..."
                                    value={newHorario.name}
                                    onChange={(e) => setNewHorario({ ...newHorario, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 font-semibold"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Inicio</label>
                                    <input
                                        type="time"
                                        value={newHorario.hora_inicio}
                                        onChange={(e) => setNewHorario({ ...newHorario, hora_inicio: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 font-semibold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Fin</label>
                                    <input
                                        type="time"
                                        value={newHorario.hora_fin}
                                        onChange={(e) => setNewHorario({ ...newHorario, hora_fin: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 font-semibold"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full p-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-50 text-xs uppercase flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">add_alarm</span>
                                Agregar Horario
                            </button>
                        </form>
                    </div>

                    {/* Lista de horarios */}
                    <div className="border-l border-gray-100 pl-6">
                        <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Horarios Asignados</h3>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                            </div>
                        ) : !horarios || horarios.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                <p className="text-xs">No hay horarios registrados</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {horarios.map(h => (
                                    <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-500 uppercase">{h.name}</p>
                                                <p className="font-bold text-gray-900">{h.hora_inicio} - {h.hora_fin}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(h.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar Horario"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HorarioManager;
