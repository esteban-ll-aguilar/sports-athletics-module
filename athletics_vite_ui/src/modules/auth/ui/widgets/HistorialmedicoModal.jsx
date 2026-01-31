import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import historialMedicoService from "../../services/historialMedicoService";
import { Activity, Heart, Ruler, Weight, Save, X, Edit3, PlusCircle } from "lucide-react";

export const OPCIONES_ALERGIAS = [
    { value: "Ninguna", label: "Ninguna" },
    { value: "Penicilina", label: "Penicilina" },
    { value: "Sulfamidas", label: "Sulfamidas" },
    { value: "Polvo/Ácaros", label: "Polvo / Ácaros" },
    { value: "Polen", label: "Polen" },
    { value: "Alimentos (Frutos secos)", label: "Alimentos (Frutos secos)" },
    { value: "Alimentos (Lactosa)", label: "Alimentos (Lactosa)" },
    { value: "Alimentos (Gluten)", label: "Alimentos (Gluten)" },
    { value: "Picaduras de insectos", label: "Picaduras de insectos" },
    { value: "Otra", label: "Otra" }
];

export const OPCIONES_ENFERMEDADES = [
    { value: "Ninguna", label: "Ninguna" },
    { value: "Asma Bronquial", label: "Asma Bronquial" },
    { value: "Anemia", label: "Anemia" },
    { value: "Gastritis", label: "Gastritis" },
    { value: "Diabetes Tipo 1", label: "Diabetes Tipo 1" },
    { value: "Diabetes Tipo 2", label: "Diabetes Tipo 2" },
    { value: "Hipertensión", label: "Hipertensión" },
    { value: "Migraña", label: "Migraña" },
    { value: "Otra", label: "Otra" }
];

export const OPCIONES_HEREDITARIAS = [
    { value: "Ninguna", label: "Ninguna" },
    { value: "Diabetes", label: "Diabetes" },
    { value: "Hipertensión Arterial", label: "Hipertensión Arterial" },
    { value: "Cardiopatías", label: "Cardiopatías" },
    { value: "Asma", label: "Asma" },
    { value: "Cáncer", label: "Cáncer" },
    { value: "Artritis", label: "Artritis" },
    { value: "Otra", label: "Otra" }
];

const HistorialMedicoModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [historial, setHistorial] = useState(null);
    const [activeTab, setActiveTab] = useState("crear");

    const [formData, setFormData] = useState({
        talla: "",
        peso: "",
        alergias: "",
        enfermedades: "",
        enfermedades_hereditarias: ""
    });

    // Cargar historial cuando el modal se abra
    useEffect(() => {
        if (isOpen) {
            loadHistorial();
        }
    }, [isOpen]);

    // Calcular IMC
    const calcularIMC = (peso, talla) => {
        if (!peso || !talla) return 0;
        return (peso / (talla * talla)).toFixed(2);
    };

    // Cargar historial del usuario logueado
    const loadHistorial = async () => {
        try {
            setLoading(true);
            const response = await historialMedicoService.getMyHistorial();

            if (response) {
                setFormData({
                    talla: response.talla || "",
                    peso: response.peso || "",
                    alergias: response.alergias || "",
                    enfermedades: response.enfermedades || "",
                    enfermedades_hereditarias: response.enfermedades_hereditarias || ""
                });
                setHistorial(response);
                setActiveTab("editar");
            } else {
                setHistorial(null);
                setActiveTab("crear");
            }
        } catch (error) {
            console.error("❌ Error al cargar historial:", error);
            setHistorial(null);
            setActiveTab("crear");
        } finally {
            setLoading(false);
        }
    };

    // Manejo de inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Agregar Historial
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await historialMedicoService.createHistorial(formData);
            Swal.fire({
                icon: 'success',
                title: 'Historial Creado',
                text: 'La ficha médica se ha registrado exitosamente.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#b30c25'
            });
            loadHistorial();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el historial.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#332122'
            });
        } finally {
            setLoading(false);
        }
    };

    // Actualizar Historial
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!historial?.id) return;
        setLoading(true);
        try {
            await historialMedicoService.updateHistorial(historial.id, formData);
            Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: 'Tu historial médico ha sido actualizado.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#b30c25'
            });
            loadHistorial();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la información.',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#332122'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm transition-opacity cursor-default"
                onClick={onClose}
                aria-label="Cerrar modal"
            />

            <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-[#332122] flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center bg-gray-50 dark:bg-[#212121]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ficha Médica</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Información clínica del atleta</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs, only if history exists (or logic to switch modes) */}
                <div className="flex border-b border-gray-100 dark:border-[#332122]">
                    <button
                        onClick={() => setActiveTab("crear")}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative
                            ${activeTab === "crear" ? "text-[#b30c25]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}
                        `}
                    >
                        <PlusCircle size={16} />
                        {historial ? "Nueva Medición" : "Crear Ficha"}
                        {activeTab === "crear" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b30c25]" />}
                    </button>
                    {historial && (
                        <button
                            onClick={() => setActiveTab("editar")}
                            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative
                                ${activeTab === "editar" ? "text-[#b30c25]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}
                            `}
                        >
                            <Edit3 size={16} />
                            Editar Ficha Actual
                            {activeTab === "editar" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b30c25]" />}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={activeTab === "crear" ? handleSubmit : handleUpdate} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Peso */}
                            <div className="space-y-1">
                                <label htmlFor="hm-peso" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Peso (kg)</label>
                                <div className="relative">
                                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="hm-peso"
                                        type="number"
                                        step="0.01"
                                        name="peso"
                                        value={formData.peso}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#332122] bg-white dark:bg-[#212121] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all placeholder-gray-400"
                                        placeholder="ej. 70.5"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Talla */}
                            <div className="space-y-1">
                                <label htmlFor="hm-talla" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Altura (m)</label>
                                <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="hm-talla"
                                        type="number"
                                        step="0.01"
                                        name="talla"
                                        value={formData.talla}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#332122] bg-white dark:bg-[#212121] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all placeholder-gray-400"
                                        placeholder="ej. 1.75"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* IMC Display */}
                        {formData.peso && formData.talla && (
                            <div className="bg-gray-50 dark:bg-[#212121] rounded-xl p-4 flex items-center justify-between border border-gray-200 dark:border-[#332122]">
                                <div className="flex items-center gap-3">
                                    <Heart className="text-[#b30c25]" />
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">IMC Estimado</span>
                                </div>
                                <span className="text-xl font-bold text-[#b30c25]">{calcularIMC(formData.peso, formData.talla)}</span>
                            </div>
                        )}

                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#332122] pb-2">Antecedentes Clínicos</h3>

                            {/* Alergias */}
                            <div className="space-y-1">
                                <label htmlFor="hm-alergias" className="text-sm font-medium text-gray-700 dark:text-gray-300">Alergias</label>
                                <select
                                    id="hm-alergias"
                                    name="alergias"
                                    value={formData.alergias}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#332122] bg-white dark:bg-[#212121] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    {OPCIONES_ALERGIAS.map((op) => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Enfermedades */}
                            <div className="space-y-1">
                                <label htmlFor="hm-enfermedades" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enfermedades Preexistentes</label>
                                <select
                                    id="hm-enfermedades"
                                    name="enfermedades"
                                    value={formData.enfermedades}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#332122] bg-white dark:bg-[#212121] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    {OPCIONES_ENFERMEDADES.map((op) => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Hereditarias */}
                            <div className="space-y-1">
                                <label htmlFor="hm-hereditarias" className="text-sm font-medium text-gray-700 dark:text-gray-300">Antecedentes Hereditarios</label>
                                <select
                                    id="hm-hereditarias"
                                    name="enfermedades_hereditarias"
                                    value={formData.enfermedades_hereditarias}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#332122] bg-white dark:bg-[#212121] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    {OPCIONES_HEREDITARIAS.map((op) => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 dark:border-[#332122] flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-[#b30c25] hover:bg-[#8f091d] text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {activeTab === "crear" ? "Guardar Ficha" : "Actualizar Datos"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HistorialMedicoModal;