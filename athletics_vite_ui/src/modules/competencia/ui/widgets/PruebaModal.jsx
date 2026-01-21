import { useEffect, useState } from "react";
import tipoDisciplinaService from "../../services/tipo_disciplina_service";
import Swal from "sweetalert2";

const PruebaModal = ({ isOpen, onClose, onSubmit, editingData }) => {
    const [form, setForm] = useState({
        nombre: "",
        fecha_prueba: "",
        siglas: "",
        tipo_prueba: "COMPETENCIA",
        tipo_medicion: "TIEMPO",
        unidad_medida: "",
        estado: true,
        tipo_disciplina_id: "",
        fecha_registro: "",
    });

    const [disciplinas, setDisciplinas] = useState([]);


    useEffect(() => {
        if (isOpen) {
            cargarCatalogos();
            if (editingData) {
                setForm({
                    ...editingData,
                    nombre: editingData.nombre || "",
                    fecha_prueba: editingData.fecha_prueba || "",
                    tipo_disciplina_id: editingData.tipo_disciplina_id?.toString() || "",
                });
            } else {
                setForm({
                    nombre: "",
                    fecha_prueba: "",
                    siglas: "",
                    tipo_prueba: "COMPETENCIA",
                    tipo_medicion: "TIEMPO",
                    unidad_medida: "",
                    estado: true,
                    tipo_disciplina_id: "",
                    fecha_registro: "",
                });
            }
        }
    }, [editingData, isOpen]);

    const cargarCatalogos = async () => {
        try {
            const [resD, resB] = await Promise.all([
                tipoDisciplinaService.getAll(),
            ]);
            setDisciplinas(Array.isArray(resD) ? resD : []);
        } catch (err) { console.error(err); }
    };

    if (!isOpen) return null;

    // Manejar creación o edición
    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: editingData ? '¿Desea actualizar esta prueba?' : '¿Desea crear esta prueba?',
            text: editingData
                ? 'Se actualizará la prueba seleccionada.'
                : 'Se creará una nueva prueba.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#6b7280',
            background: '#212121',
            color: '#fff'
        });

        if (result.isConfirmed) {
            onSubmit(form);

            await Swal.fire({
                icon: 'success',
                title: editingData ? 'Prueba actualizada' : 'Prueba creada',
                text: `La prueba ha sido ${editingData ? 'actualizada' : 'creada'} correctamente.`,
                confirmButtonColor: '#b30c25',
                background: '#212121',
                color: '#fff'
            });

            onClose();
        }
    };

    // Manejar cambio de estado con alerta
    const toggleEstado = async () => {
        const action = form.estado ? 'desactivar' : 'activar';

        const result = await Swal.fire({
            title: `¿Desea ${action} esta prueba?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#6b7280',
            background: '#212121',
            color: '#fff'
        });

        if (result.isConfirmed) {
            setForm({ ...form, estado: !form.estado });

            Swal.fire({
                icon: 'success',
                title: `Prueba ${form.estado ? 'desactivada' : 'activada'}`,
                text: `La prueba ha sido ${form.estado ? 'desactivada' : 'activada'} correctamente.`,
                confirmButtonColor: '#b30c25',
                background: '#212121',
                color: '#fff'
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className=" w-full max-w-xl rounded-2xl bg-[#242223] border border-[#332122] shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-200 ">
                <div className="px-6 py-5 border-b border-[#332122] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black tracking-wide text-gray-100">
                            {editingData ? 'Editar Prueba' : 'Nueva Prueba'}
                        </h2>

                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">

                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Switch de Estado (Activar/Desactivar) */}
                    <div className="
    flex items-center justify-between
    p-4 rounded-xl
    bg-[#212121]
    border border-[#332122]
">                        <div>
                            <span className="block text-xs font-black uppercase text-gray-400">Estado del Registro</span>
                            <span className={`text-sm font-bold ${form.estado ? 'text-green-600' : 'text-red-600'}`}>
                                {form.estado ? 'PRUEBA ACTIVA' : 'PRUEBA DESACTIVADA'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={toggleEstado}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.estado ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                  required
                                placeholder="Ej. 100m Planos"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Siglas</label>
                            <input
                                type="text"
                                value={form.siglas}
                                onChange={(e) => setForm({ ...form, siglas: e.target.value.toUpperCase() })}
                                className="
    block w-full pl-3 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                                  required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Tipo de Prueba</label>
                        <select
                            value={form.tipo_prueba}
                            onChange={(e) => setForm({ ...form, tipo_prueba: e.target.value })}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                              required
                        >
                            <option value="COMPETENCIA">COMPETENCIA</option>
                            <option value="NORMAL">NORMAL</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Tipo de Medición</label>
                        <select
                            value={form.tipo_medicion}
                            onChange={(e) => {
                                const newTipo = e.target.value;
                                setForm({
                                    ...form,
                                    tipo_medicion: newTipo,
                                    unidad_medida: newTipo === "TIEMPO" ? "s" : "m"
                                });
                            }}
                            className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "                              required
                        >
                            <option value="TIEMPO">TIEMPO</option>
                            <option value="DISTANCIA">DISTANCIA</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Unidad de Medida</label>
                        <input
                            type="text"
                            value={form.unidad_medida}
                            disabled
                            className="
    block w-full pl-3 pr-3 py-2.5
    bg-gray-100 text-gray-600
    border border-gray-300 rounded-lg
    sm:text-sm cursor-not-allowed
  "
                            placeholder="Auto-completado"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Disciplina</label>
                            <select
                                value={form.tipo_disciplina_id}
                                onChange={(e) => setForm({ ...form, tipo_disciplina_id: e.target.value })}
                                className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  "   required
                            >
                                <option value="">Seleccione...</option>
                                {disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nombre}</option>))}
                            </select>
                        </div>

                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                                Fecha de Registro
                            </label>
                            <input
                                type="date"
                                value={form.fecha_registro}
                                onChange={(e) => setForm({ ...form, fecha_registro: e.target.value })}
                                className="
                                    block w-full pl-3 pr-3 py-2.5
                                    bg-white text-black
                                    border border-gray-300 rounded-lg
                                    placeholder-gray-500
                                    focus:ring-[#b30c25] focus:border-[#b30c25]
                                    sm:text-sm
                                "
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                                Fecha de Prueba
                            </label>
                            <input
                                type="date"
                                value={form.fecha_prueba}
                                onChange={(e) => setForm({ ...form, fecha_prueba: e.target.value })}
                                className="
                                    block w-full pl-3 pr-3 py-2.5
                                    bg-white text-black
                                    border border-gray-300 rounded-lg
                                    placeholder-gray-500
                                    focus:ring-[#b30c25] focus:border-[#b30c25]
                                    sm:text-sm
                                "
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose}
                            className="
              flex-1 px-4 py-3 rounded-xl font-semibold
              border border-[#332122] text-gray-400
              hover:bg-[#242223] transition
            "            >Cancelar</button>
                        <button type="submit" className="
              flex-1 px-4 py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-[#b30c25] to-[#5a0f1d]
              hover:brightness-110 transition active:scale-95
            "            >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PruebaModal;
