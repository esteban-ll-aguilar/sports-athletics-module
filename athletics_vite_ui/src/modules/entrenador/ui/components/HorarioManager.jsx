import React, { useState, useEffect, useId } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import HorarioService from '../../services/HorarioService';
import { X, Clock, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

const HorarioManager = ({ show, onClose, entrenamiento }) => {
    const baseId = useId();
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
            const data = await HorarioService.getByEntrenamiento(entrenamiento.id);
            if (Array.isArray(data)) {
                setHorarios(data);
            } else {
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
                hora_inicio: newHorario.hora_inicio + ":00",
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
        <dialog
            open={show}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm w-full h-full border-none outline-none overflow-y-auto"
        >
            <button
                type="button"
                className="absolute inset-0 w-full h-full cursor-default bg-transparent"
                onClick={onClose}
                aria-label="Cerrar modal"
            />
            <div className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-[#332122]">
                <div className="p-6 border-b border-gray-200 dark:border-[#332122] bg-gray-50 dark:bg-[#111] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock size={24} className="text-[#b30c25]" />
                            Gestión de Horarios
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{entrenamiento?.tipo_entrenamiento}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                            <span>{entrenamiento?.fecha_entrenamiento}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-[#1a1a1a]">
                    {/* Formulario de agregar */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-[#332122]">
                            <Plus size={18} className="text-gray-400" />
                            <h3 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-300">Nuevo Horario</h3>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label htmlFor={`${baseId}-name`} className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Nombre / Turno</label>
                                <input
                                    id={`${baseId}-name`}
                                    type="text"
                                    placeholder="Ej. Matutino, Grupo A..."
                                    value={newHorario.name}
                                    onChange={(e) => setNewHorario({ ...newHorario, name: e.target.value })}
                                    className="
                                        w-full pl-3 pr-3 py-2.5 rounded-xl
                                        bg-gray-50 dark:bg-[#111]
                                        border border-gray-200 dark:border-[#332122]
                                        text-gray-900 dark:text-white
                                        text-sm focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none
                                    "
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`${baseId}-start`} className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Inicio</label>
                                    <input
                                        id={`${baseId}-start`}
                                        type="time"
                                        value={newHorario.hora_inicio}
                                        onChange={(e) => setNewHorario({ ...newHorario, hora_inicio: e.target.value })}
                                        className="
                                        w-full pl-3 pr-3 py-2.5 rounded-xl
                                        bg-gray-50 dark:bg-[#111]
                                        border border-gray-200 dark:border-[#332122]
                                        text-gray-900 dark:text-white
                                        text-sm focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none
                                        dark:scheme-dark
                                    "
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`${baseId}-end`} className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Fin</label>
                                    <input
                                        id={`${baseId}-end`}
                                        type="time"
                                        value={newHorario.hora_fin}
                                        onChange={(e) => setNewHorario({ ...newHorario, hora_fin: e.target.value })}
                                        className="
                                        w-full pl-3 pr-3 py-2.5 rounded-xl
                                        bg-gray-50 dark:bg-[#111]
                                        border border-gray-200 dark:border-[#332122]
                                        text-gray-900 dark:text-white
                                        text-sm focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none
                                        dark:scheme-dark
                                    "
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#b30c25] text-white rounded-xl font-bold hover:bg-[#960a1f] shadow-lg shadow-red-900/20 text-xs uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Plus size={16} />
                                Agregar Horario
                            </button>
                        </form>
                    </div>

                    {/* Lista de horarios */}
                    <div className="md:border-l border-gray-200 dark:border-[#332122] md:pl-8 space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-[#332122]">
                            <Calendar size={18} className="text-gray-400" />
                            <h3 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-300">Horarios Asignados</h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-[#b30c25] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : !horarios || horarios.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-[#111] rounded-xl border border-dashed border-gray-200 dark:border-[#332122]">
                                <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
                                <p className="text-xs">No hay horarios registrados</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {horarios.map(h => (
                                    <div key={h.id} className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#332122] hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-red-50 group-hover:text-[#b30c25] dark:group-hover:bg-[#b30c25]/10 dark:group-hover:text-[#b30c25] flex items-center justify-center transition-colors">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h.name}</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{h.hora_inicio} - {h.hora_fin}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(h.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Eliminar Horario"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-[#332122] text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors uppercase tracking-wide"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </dialog>
    );
};

HorarioManager.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    entrenamiento: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        tipo_entrenamiento: PropTypes.string,
        fecha_entrenamiento: PropTypes.string
    })
};

export default HorarioManager;
