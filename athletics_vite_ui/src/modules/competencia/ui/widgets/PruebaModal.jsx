import { useEffect, useState } from "react";
import tipoDisciplinaService from "../../services/tipo_disciplina_service";
import Swal from "sweetalert2";
import { X, Type, Calendar, Info, Activity, Ruler, Hash, Target } from "lucide-react";

const PruebaModal = ({ isOpen, onClose, onSubmit, editingData }) => {
    const [submitting, setSubmitting] = useState(false);
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
                const normalizeUnit = (u) => {
                    if (!u) return "";
                    if (u === "m" || u === "METROS") return "METROS";
                    if (u === "s" || u === "SEGUNDOS") return "SEGUNDOS";
                    return u;
                };
                setForm({
                    ...editingData,
                    nombre: editingData.nombre || "",
                    fecha_prueba: editingData.fecha_prueba || "",
                    tipo_disciplina_id: editingData.tipo_disciplina_id?.toString() || "",
                    unidad_medida: normalizeUnit(editingData.unidad_medida)
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
            const [resD] = await Promise.all([
                tipoDisciplinaService.getAll(),
            ]);
            setDisciplinas(Array.isArray(resD) ? resD : []);
        } catch (err) { console.error(err); }
    };

    if (!isOpen) return null;

    // Manejar creación o edición
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

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
            background: '#1a1a1a',
            color: '#fff',
            customClass: {
                popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
            }
        });

        if (result.isConfirmed) {
            setSubmitting(true);
            try {
                const success = await onSubmit(form);

                if (success) {
                    await Swal.fire({
                        icon: 'success',
                        title: editingData ? 'Prueba actualizada' : 'Prueba creada',
                        text: `La prueba ha sido ${editingData ? 'actualizada' : 'creada'} correctamente.`,
                        confirmButtonColor: '#b30c25',
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    onClose();
                }
            } catch (error) {
                console.error("Error en modal:", error);
            } finally {
                setSubmitting(false);
            }
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
            background: '#1a1a1a',
            color: '#fff'
        });

        if (result.isConfirmed) {
            setForm({ ...form, estado: !form.estado });

            Swal.fire({
                icon: 'success',
                title: `Prueba ${form.estado ? 'desactivada' : 'activada'}`,
                text: `La prueba ha sido ${form.estado ? 'desactivada' : 'activada'} correctamente.`,
                confirmButtonColor: '#b30c25',
                background: '#1a1a1a',
                color: '#fff'
            });
        }
    };

    const InputField = ({ label, icon: Icon, ...props }) => (
        <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
                <input
                    {...props}
                    className={`
                        w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-lg
                        bg-white dark:bg-[#212121] 
                        border border-gray-300 dark:border-[#332122]
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-400
                        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                        outline-none transition-all sm:text-sm
                    `}
                />
            </div>
        </div>
    );

    const SelectField = ({ label, icon: Icon, children, ...props }) => (
        <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
                <select
                    {...props}
                    className={`
                        w-full ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2.5 rounded-lg
                         bg-white dark:bg-[#212121] 
                        border border-gray-300 dark:border-[#332122]
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-400
                        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                        outline-none transition-all sm:text-sm appearance-none
                    `}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0 transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#332122] shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center rounded-t-2xl bg-gray-50 dark:bg-[#212121]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-bold">
                            {editingData ? <Activity size={20} /> : <Target size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingData ? 'Editar Prueba' : 'Nueva Prueba'}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Detalles de la prueba técnica</p>
                        </div>

                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* Switch de Estado (Activar/Desactivar) */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#212121] border border-gray-200 dark:border-[#332122]">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Estado</span>
                            <span className={`text-sm font-bold ${form.estado ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {form.estado ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={toggleEstado}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.estado ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.estado ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Nombre"
                            icon={Type}
                            type="text"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            required
                            placeholder="Ej. 100m Planos"
                        />
                        <InputField
                            label="Siglas"
                            icon={Hash}
                            type="text"
                            value={form.siglas}
                            onChange={(e) => setForm({ ...form, siglas: e.target.value.toUpperCase() })}
                            required
                            placeholder="Ej. 100M"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="Tipo de Prueba"
                            icon={Target}
                            value={form.tipo_prueba}
                            onChange={(e) => setForm({ ...form, tipo_prueba: e.target.value })}
                            required
                        >
                            <option value="COMPETENCIA">COMPETENCIA</option>
                            <option value="NORMAL">NORMAL</option>
                        </SelectField>

                        <SelectField
                            label="Tipo de Medición"
                            icon={Ruler}
                            value={form.tipo_medicion}
                            onChange={(e) => {
                                const newTipo = e.target.value;
                                setForm({
                                    ...form,
                                    tipo_medicion: newTipo,
                                    unidad_medida: newTipo === "TIEMPO" ? "SEGUNDOS" : "METROS"
                                });
                            }}
                            required
                        >
                            <option value="TIEMPO">TIEMPO</option>
                            <option value="DISTANCIA">DISTANCIA</option>
                        </SelectField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Unidad de Medida"
                            icon={Info}
                            type="text"
                            value={form.unidad_medida}
                            disabled
                            className="bg-gray-100 dark:bg-[#2a2829] cursor-not-allowed opacity-70"
                            placeholder="Auto-completado"
                        />
                        <SelectField
                            label="Disciplina"
                            icon={Activity}
                            value={form.tipo_disciplina_id}
                            onChange={(e) => setForm({ ...form, tipo_disciplina_id: e.target.value })}
                            required
                        >
                            <option value="">Seleccione...</option>
                            {disciplinas.map(d => (<option key={d.id} value={d.id}>{d.nombre}</option>))}
                        </SelectField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Fecha de Registro"
                            icon={Calendar}
                            type="date"
                            value={form.fecha_registro}
                            onChange={(e) => setForm({ ...form, fecha_registro: e.target.value })}
                            required
                        />
                        <InputField
                            label="Fecha de Prueba"
                            icon={Calendar}
                            type="date"
                            value={form.fecha_prueba}
                            onChange={(e) => setForm({ ...form, fecha_prueba: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-[#332122]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="
                                flex-1 px-4 py-3 rounded-xl font-semibold
                                border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300
                                hover:bg-gray-50 dark:hover:bg-[#212121] transition
                                disabled:opacity-50
                            "
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="
                                flex-1 px-4 py-3 rounded-xl font-bold text-white
                                bg-linear-to-r from-[#b30c25] to-[#80091b]
                                hover:shadow-lg hover:shadow-red-900/20 active:scale-95
                                disabled:opacity-70 disabled:cursor-not-allowed
                                transition-all duration-300
                            "
                        >
                            {submitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PruebaModal;
