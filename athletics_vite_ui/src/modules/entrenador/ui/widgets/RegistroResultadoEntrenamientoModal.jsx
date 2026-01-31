import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { X, User, Activity, Clock, Ruler, Calendar, Save, Edit3, Type, FileText, Star } from "lucide-react";

const RegistroResultadoEntrenamientoModal = ({ isOpen, onClose, onSubmit, editingItem, entrenamiento, entrenamientos = [], atletas = [] }) => {
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        entrenamiento_id: "",
        atleta_id: "",
        distancia: "",
        tiempo: "",
        unidad_medida: "METROS",
        evaluacion: "",
        observaciones: "",
        fecha: new Date().toISOString().substring(0, 10),
        unidad_tiempo: "SEGUNDOS" // Helper for UI
    });

    useEffect(() => {
        if (editingItem) {
            setForm({
                entrenamiento_id: editingItem.entrenamiento_id || "",
                atleta_id: editingItem.atleta_id || "",
                distancia: editingItem.distancia || "",
                tiempo: editingItem.tiempo || "",
                unidad_medida: editingItem.unidad_medida || "METROS",
                evaluacion: editingItem.evaluacion || "",
                observaciones: editingItem.observaciones || "",
                fecha: editingItem.fecha || new Date().toISOString().substring(0, 10),
                unidad_tiempo: "SEGUNDOS"
            });
        } else {
            setForm({
                entrenamiento_id: entrenamiento ? entrenamiento.external_id : "",
                atleta_id: "",
                distancia: "",
                tiempo: "",
                unidad_medida: "METROS",
                evaluacion: "",
                observaciones: "",
                fecha: new Date().toISOString().substring(0, 10),
                unidad_tiempo: "SEGUNDOS"
            });
        }
    }, [editingItem, isOpen, entrenamiento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const selectedEntrenamientoId = entrenamiento ? entrenamiento.external_id : form.entrenamiento_id;

        if (!selectedEntrenamientoId) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Debe seleccionar un entrenamiento' });
            return;
        }

        const payload = {
            entrenamiento_id: selectedEntrenamientoId,
            atleta_id: form.atleta_id, // This needs to be UUID for backend
            distancia: form.distancia ? Number(form.distancia) : null,
            tiempo: form.tiempo ? Number(form.tiempo) : null,
            unidad_medida: form.unidad_medida,
            evaluacion: form.evaluacion ? Number(form.evaluacion) : null,
            observaciones: form.observaciones,
            fecha: form.fecha
        };

        const result = await Swal.fire({
            title: editingItem ? '¿Actualizar Resultado?' : '¿Registrar Resultado?',
            text: "Verifique que los datos sean correctos.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#b30c25',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff',
            customClass: {
                popup: 'dark:bg-[#1a1a1a] dark:text-white dark:border dark:border-[#332122]'
            }
        });

        if (result.isConfirmed) {
            setSubmitting(true);
            try {
                const success = await onSubmit(payload);
                if (success) {
                    await Swal.fire({
                        title: "Éxito",
                        text: "Registro guardado correctamente",
                        icon: "success",
                        confirmButtonColor: '#b30c25',
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    onClose();
                }
            } catch (error) {
                console.error("Error modal:", error);
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left font-['Lexend']">
            <div className="absolute inset-0 transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center bg-gray-50 dark:bg-[#212121]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-bold">
                            {editingItem ? <Edit3 size={20} /> : <Save size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingItem ? 'Editar Resultado' : 'Registrar Resultado'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {entrenamiento ? entrenamiento.tipo_entrenamiento : 'Seleccione Entrenamiento'}
                            </p>
                        </div>

                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {/* ENTRENAMIENTO SELECT - ONLY IF NOT PRE-DEFINED */}
                    {!entrenamiento && (
                        <SelectField
                            label="Entrenamiento"
                            icon={Activity}
                            name="entrenamiento_id"
                            value={form.entrenamiento_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione Entrenamiento</option>
                            {entrenamientos.map(e => (
                                <option key={e.id} value={e.external_id}>
                                    {e.tipo_entrenamiento} - {new Date(e.fecha_entrenamiento).toLocaleDateString()}
                                </option>
                            ))}
                        </SelectField>
                    )}
                    {/* ATLETA */}
                    <SelectField
                        label="Atleta"
                        icon={User}
                        name="atleta_id"
                        value={form.atleta_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione Atleta</option>
                        {atletas.map(a => (
                            <option key={a.id} value={a.external_id}>
                                {a.user ? `${a.user.first_name} ${a.user.last_name}` : `Atleta ${a.id}`}
                            </option>
                        ))}
                    </SelectField>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Fecha"
                            icon={Calendar}
                            type="date"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleChange}
                            required
                        />
                        <SelectField
                            label="Medida Principal"
                            icon={Type}
                            name="unidad_medida"
                            value={form.unidad_medida}
                            onChange={handleChange}
                        >
                            <option value="METROS">METROS</option>
                            <option value="SEGUNDOS">SEGUNDOS</option>
                            <option value="KILOMETROS">KM</option>
                            <option value="MINUTOS">MINUTOS</option>
                        </SelectField>
                    </div>

                    {/* RESULTS */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Distancia"
                            icon={Ruler}
                            type="number"
                            step="0.01"
                            name="distancia"
                            value={form.distancia}
                            onChange={handleChange}
                            placeholder="Opcional"
                        />
                        <InputField
                            label="Tiempo"
                            icon={Clock}
                            type="number"
                            step="0.01"
                            name="tiempo"
                            value={form.tiempo}
                            onChange={handleChange}
                            placeholder="Opcional"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Evaluación (1-10)</label>
                        <div className="flex gap-2 items-center">
                            <Star size={16} className="text-yellow-500" />
                            <input
                                type="range"
                                min="1"
                                max="10"
                                name="evaluacion"
                                value={form.evaluacion || 5}
                                onChange={handleChange}
                                className="w-full accent-[#b30c25]"
                            />
                            <span className="font-bold w-6 text-center">{form.evaluacion || '-'}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Observaciones</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                            <textarea
                                name="observaciones"
                                value={form.observaciones}
                                onChange={handleChange}
                                className="
                                    w-full pl-9 pr-3 py-2.5 rounded-lg
                                    bg-white dark:bg-[#212121] 
                                    border border-gray-300 dark:border-[#332122]
                                    text-gray-900 dark:text-gray-100
                                    placeholder-gray-400
                                    focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                                    outline-none transition-all sm:text-sm
                                "
                                rows="3"
                                placeholder="Comentarios sobre el desempeño..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-[#332122]">
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
                                disabled:opacity-70 disabled:cursor-wait
                                transition-all duration-300
                            "
                        >
                            {submitting ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Guardar Resultado')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroResultadoEntrenamientoModal;
