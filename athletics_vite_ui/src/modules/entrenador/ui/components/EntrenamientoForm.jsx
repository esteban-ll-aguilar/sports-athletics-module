import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import EntrenamientoService from '../../services/EntrenamientoService';

const EntrenamientoForm = ({ show, onClose, entrenamientoToEdit, onSave }) => {
    const [formData, setFormData] = useState({
        tipo_entrenamiento: '',
        descripcion: '',
        fecha_entrenamiento: new Date().toISOString().split('T')[0]
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
                        : new Date().toISOString().split('T')[0]
                });
            } else {
                setFormData({
                    tipo_entrenamiento: '',
                    descripcion: '',
                    fecha_entrenamiento: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [entrenamientoToEdit, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                // Asegurar formato fecha YYYY-MM-DD
                fecha_entrenamiento: formData.fecha_entrenamiento
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
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900">
                        {entrenamientoToEdit ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            rows={4}
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

                    <div className="flex gap-3 pt-6">
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
                                entrenamientoToEdit ? 'Actualizar' : 'Crear'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntrenamientoForm;
