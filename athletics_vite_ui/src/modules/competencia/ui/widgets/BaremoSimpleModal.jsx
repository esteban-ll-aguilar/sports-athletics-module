import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import pruebaService from "../../services/prueba_service";

const BaremoSimpleModal = ({ isOpen, onClose, onSubmit, editingBaremo }) => {
    const [pruebas, setPruebas] = useState([]);

    // Estado del formulario - solo campos básicos
    const [form, setForm] = useState({
        prueba_id: "",
        sexo: "M",
        edad_min: "",
        edad_max: "",
        marca_min_valida: "",
        marca_max_valida: "",
        estado: true
    });

    // Cargar Pruebas al abrir
    useEffect(() => {
        if (isOpen) {
            const loadPruebas = async () => {
                try {
                    const data = await pruebaService.getAll();
                    setPruebas(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error("Error cargando pruebas", error);
                }
            };
            loadPruebas();

            if (editingBaremo) {
                const pruebaExternalId = editingBaremo.prueba_external_id || editingBaremo.prueba_id || "";
                setForm({
                    prueba_id: editingBaremo.prueba_external_id || editingBaremo.prueba_id || "",
                    nombre: editingBaremo.nombre ?? "",
                    sexo: editingBaremo.sexo || "M",
                    edad_min: editingBaremo.edad_min ?? "",
                    edad_max: editingBaremo.edad_max ?? "",
                    marca_min_valida: editingBaremo.marca_min_valida ?? "",
                    marca_max_valida: editingBaremo.marca_max_valida ?? "",
                    estado: editingBaremo.estado !== undefined ? editingBaremo.estado : true
                });
            } else {
                // Reset
                setForm({
                    prueba_id: "",
                    nombre: "",
                    sexo: "M",
                    edad_min: "",
                    edad_max: "",
                    marca_min_valida: "",
                    marca_max_valida: "",
                    estado: true
                });
            }
        }
    }, [isOpen, editingBaremo]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (!form.nombre.trim()) return Swal.fire("Error", "Ingrese un nombre para el baremo", "error");

        const payload = {
            ...form,
            edad_min: Number(form.edad_min),
            edad_max: Number(form.edad_max),
            marca_min_valida: Number(form.marca_min_valida),
            marca_max_valida: Number(form.marca_max_valida),
            prueba_id: form.prueba_id || null,
            items: []
        };

        const result = await Swal.fire({
            title: editingBaremo ? '¿Actualizar Baremo?' : '¿Crear Baremo?',
            text: "Se guardará la configuración básica del baremo.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
            background: '#212121',
            color: '#fff'
        });

        if (result.isConfirmed) {
            onSubmit(payload);
        }
    };

    return (
        <dialog
            open={isOpen}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 overflow-y-auto w-full h-full border-none outline-none"
            aria-labelledby="modal-title"
        >
            <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-2xl shadow-2xl border border-[#333] my-8">

                {/* HEADER */}
                <div className="px-8 py-6 border-b border-[#333] flex justify-between items-center bg-[#252525] rounded-t-2xl">
                    <div>
                        <h2 id="modal-title" className="text-2xl font-bold text-white mb-1">
                            {editingBaremo ? 'Editar Baremo' : 'Nuevo Baremo'}
                        </h2>
                        <p className="text-gray-400 text-sm">Configura la información básica del baremo</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Cerrar modal">
                        <span className="material-symbols-outlined text-3xl" aria-hidden="true">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* CAMPOS DEL FORMULARIO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="baremo-nombre" className="block text-sm font-medium text-gray-300 mb-2">Nombre del Baremo</label>
                            <input
                                id="baremo-nombre"
                                type="text"
                                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                                placeholder="Ej. Baremo Simple - General"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Sexo</label>
                            <fieldset className="flex bg-[#121212] rounded-xl p-1 border border-[#444]" aria-label="Seleccionar sexo">
                                {['M', 'F'].map(sex => (
                                    <button
                                        type="button"
                                        key={sex}
                                        onClick={() => setForm({ ...form, sexo: sex })}
                                        aria-pressed={form.sexo === sex}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${form.sexo === sex
                                            ? 'bg-[#b30c25] text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {sex === 'M' ? 'Masculino' : 'Femenino'}
                                    </button>
                                ))}
                            </fieldset>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                            <fieldset className="flex bg-[#121212] rounded-xl p-1 border border-[#444]" aria-label="Seleccionar estado">
                                {[
                                    { value: true, label: 'Activo' },
                                    { value: false, label: 'Inactivo' }
                                ].map(option => (
                                    <button
                                        type="button"
                                        key={String(option.value)}
                                        onClick={() => setForm({ ...form, estado: option.value })}
                                        aria-pressed={form.estado === option.value}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${form.estado === option.value
                                            ? 'bg-[#b30c25] text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </fieldset>
                        </div>

                        <div>
                            <label htmlFor="baremo-edad-min" className="block text-sm font-medium text-gray-300 mb-2">Edad Mínima (años)</label>
                            <input
                                id="baremo-edad-min"
                                type="number"
                                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                value={form.edad_min}
                                onChange={e => setForm({ ...form, edad_min: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="baremo-edad-max" className="block text-sm font-medium text-gray-300 mb-2">Edad Máxima (años)</label>
                            <input
                                id="baremo-edad-max"
                                type="number"
                                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                value={form.edad_max}
                                onChange={e => setForm({ ...form, edad_max: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="baremo-marca-min" className="block text-sm font-medium text-gray-300 mb-2">Marca Mínima Global</label>
                            <input
                                id="baremo-marca-min"
                                type="number"
                                step="0.01"
                                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                value={form.marca_min_valida}
                                onChange={e => setForm({ ...form, marca_min_valida: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="baremo-marca-max" className="block text-sm font-medium text-gray-300 mb-2">Marca Máxima Global</label>
                            <input
                                id="baremo-marca-max"
                                type="number"
                                step="0.01"
                                className="w-full bg-[#121212] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#b30c25] outline-none"
                                value={form.marca_max_valida}
                                onChange={e => setForm({ ...form, marca_max_valida: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-4 pt-4 border-t border-[#333]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl font-bold text-gray-400 border border-[#444] hover:bg-[#252525] transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-[#b30c25] to-[#7a0819] hover:brightness-110 shadow-lg shadow-red-900/20 transition"
                        >
                            {editingBaremo ? 'Guardar Cambios' : 'Crear Baremo'}
                        </button>
                    </div>

                </form>
            </div>
        </dialog>

    );
};

BaremoSimpleModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    editingBaremo: PropTypes.shape({
        id: PropTypes.number,
        prueba_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        prueba_external_id: PropTypes.string,
        sexo: PropTypes.string,
        edad_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        edad_max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        estado: PropTypes.bool
    })
};

export default BaremoSimpleModal;
