import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { X, User, Activity, Clock, Ruler, Calendar, Save, Edit3, Type } from "lucide-react";

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

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType
};

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

SelectField.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    children: PropTypes.node
};

const RegistroPruebaModal = ({ isOpen, onClose, onSubmit, editingItem, competencias = [], atletas = [], pruebas = [] }) => {
    const [submitting, setSubmitting] = useState(false);
    const normalizeUnit = (u) => {
        if (!u) return "METROS";
        if (u === "m" || u === "METROS") return "METROS";
        if (u === "s" || u === "SEGUNDOS") return "SEGUNDOS";
        return u;
    };

    const [form, setForm] = useState({
        atleta_id: "",
        prueba_id: "",
        valor: "",
        unidad_medida: "METROS",
        estado: true,
        fecha: new Date().toISOString().substring(0, 16)
    });

    // Auto-fill unit based on selected test
    useEffect(() => {
        if (form.prueba_id) {
            const p = pruebas.find(x => x.external_id === form.prueba_id || x.id === form.prueba_id);
            if (p) {
                setForm(prev => ({
                    ...prev,
                    unidad_medida: p.tipo_medicion === "TIEMPO" ? "SEGUNDOS" : "METROS"
                }));
            }
        }
    }, [form.prueba_id, pruebas]);

    useEffect(() => {
        if (editingItem) {
            const atletaId = editingItem.atleta_external_id || editingItem.atleta_id || "";
            const pruebaId = editingItem.prueba_external_id || editingItem.prueba_id || "";

            setForm({
                atleta_id: atletaId,
                prueba_id: pruebaId,
                valor: editingItem.valor || "",
                unidad_medida: normalizeUnit(editingItem.unidad_medida),
                estado: editingItem.estado,
                fecha: editingItem.fecha ? new Date(editingItem.fecha).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16)
            });
        } else {
            setForm({
                atleta_id: "",
                prueba_id: "",
                valor: "",
                unidad_medida: "METROS",
                estado: true,
                fecha: new Date().toISOString().substring(0, 16)
            });
        }
    }, [editingItem, atletas, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        // Convertir external_ids a IDs internos
        const atleta = atletas.find(a => a.external_id === form.atleta_id || a.id === form.atleta_id);
        const prueba = pruebas.find(p => p.external_id === form.prueba_id || p.id === form.prueba_id);

        if (!atleta) {
            Swal.fire("Error", "Atleta no encontrado", "error");
            return;
        }
        if (!prueba) {
            Swal.fire("Error", "Prueba no encontrada", "error");
            return;
        }

        // El backend espera ResultadoPruebaCreate schema:
        // - marca_obtenida (float)
        // - atleta_id (UUID)
        // - prueba_id (UUID)
        // - fecha (datetime)
        // - clasificacion_final (optional string)
        // - estado (bool)
        const payload = {
            atleta_id: atleta.external_id,  // Usar UUID del atleta
            prueba_id: prueba.external_id,  // Usar UUID de la prueba
            marca_obtenida: Number(form.valor),  // Backend espera marca_obtenida
            fecha: new Date(form.fecha).toISOString(),  // Backend espera datetime completo
            estado: true
        };

        console.log("📤 Payload a enviar:", payload);
        console.log("👤 Atleta encontrado:", atleta);
        console.log("🏃 Prueba encontrada:", prueba);
        console.log("📅 Fecha original:", form.fecha);
        console.log("📅 Fecha ISO:", payload.fecha);

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

                // Extraer mensaje de error detallado del backend
                let errorMessage = "No se pudo guardar el registro";

                if (error.response?.data?.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                await Swal.fire({
                    title: "Error al guardar",
                    html: `<div style="text-align: left;">
                        <p><strong>No se pudo crear el registro:</strong></p>
                        <p style="color: #f87171; margin-top: 10px;">${errorMessage}</p>
                        ${errorMessage.includes('baremo') ?
                            '<p style="margin-top: 15px; color: #fbbf24;"><strong>💡 Sugerencia:</strong> Asegúrate de que exista un baremo configurado para esta prueba, sexo y edad del atleta.</p>'
                            : ''}
                    </div>`,
                    icon: "error",
                    confirmButtonColor: '#b30c25',
                    background: '#1a1a1a',
                    color: '#fff',
                    width: '500px'
                });
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left font-['Lexend'] w-full h-full"
        >
            <button
                type="button"
                className="absolute inset-0 w-full h-full cursor-default bg-transparent"
                onClick={onClose}
                aria-label="Cerrar modal"
            />
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center bg-gray-50 dark:bg-[#212121]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-bold">
                            {editingItem ? <Edit3 size={20} /> : <Save size={20} />}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {editingItem ? 'Editar Resultado' : 'Registrar Resultado'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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
                            <option key={a.id} value={a.external_id}>{a.first_name} {a.last_name}</option>
                        ))}
                    </SelectField>

                    {/* PRUEBA */}
                    <SelectField
                        label="Prueba"
                        icon={Activity}
                        name="prueba_id"
                        value={form.prueba_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione Prueba</option>
                        {pruebas.map(p => (
                            <option key={p.id} value={p.external_id}>{p.nombre} ({p.tipo_medicion})</option>
                        ))}
                    </SelectField>

                    {/* MARCA & UNIDAD */}
                    <div className="grid grid-cols-2 gap-4">
                        {form.unidad_medida === "SEGUNDOS" ? (
                            // For TIME: Show Minutes and Seconds
                            <>
                                <InputField
                                    label="Minutos"
                                    icon={Clock}
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="minutos"
                                    value={Math.floor(form.valor / 60) || 0}
                                    onChange={(e) => {
                                        const mins = parseInt(e.target.value) || 0;
                                        const secs = form.valor % 60;
                                        setForm(prev => ({ ...prev, valor: mins * 60 + secs }));
                                    }}
                                    placeholder="0"
                                />
                                <InputField
                                    label="Segundos"
                                    icon={Clock}
                                    type="number"
                                    min="0"
                                    max="59.99"
                                    step="0.01"
                                    name="segundos"
                                    value={(form.valor % 60).toFixed(2)}
                                    onChange={(e) => {
                                        const mins = Math.floor(form.valor / 60);
                                        const secs = parseFloat(e.target.value) || 0;
                                        setForm(prev => ({ ...prev, valor: mins * 60 + secs }));
                                    }}
                                    required
                                    placeholder="0.00"
                                />
                            </>
                        ) : (
                            // For DISTANCE: Show single input
                            <>
                                <InputField
                                    label={`Marca (${form.unidad_medida})`}
                                    icon={Ruler}
                                    type="number"
                                    step="0.01"
                                    name="valor"
                                    value={form.valor}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                                <InputField
                                    label="Unidad"
                                    icon={Type}
                                    type="text"
                                    value={form.unidad_medida}
                                    disabled
                                    className="bg-gray-100 dark:bg-[#2a2829] cursor-not-allowed opacity-70"
                                />
                            </>
                        )}
                    </div>

                    {/* FECHA */}
                    <InputField
                        label="Fecha y Hora"
                        icon={Calendar}
                        type="datetime-local"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleChange}
                        required
                        style={{ colorScheme: "dark" }} // Keeps native picker dark compatible if browser supports
                    />

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

RegistroPruebaModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    editingItem: PropTypes.shape({
        atleta_external_id: PropTypes.string,
        atleta_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        prueba_external_id: PropTypes.string,
        prueba_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        unidad_medida: PropTypes.string,
        estado: PropTypes.bool,
        fecha: PropTypes.string
    }),
    competencias: PropTypes.array,
    atletas: PropTypes.array,
    pruebas: PropTypes.array
};

export default RegistroPruebaModal;
