import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import historialMedicoService from "../../services/historialMedicoService";

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
            console.log("📌 Modal abierto, cargando historial...");
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
            console.log("🔹 Llamando a getMyHistorial...");

            const response = await historialMedicoService.getMyHistorial();
            console.log("🔹 Response getMyHistorial:", response);

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Guardar o actualizar historial
    const handleSubmit = async (e) => {
        e.preventDefault();
        const imc = calcularIMC(formData.peso, formData.talla);

        console.log("🔹 Datos a enviar:", { ...formData, imc, activeTab });

        if (!formData.talla || !formData.peso) {
            Swal.fire({
                icon: "warning",
                title: "Campos requeridos",
                text: "Talla y peso son obligatorios",
                confirmButtonColor: "#eab308"
            });
            return;
        }

        try {
            setLoading(true);
            const payload = { ...formData, imc };
            console.log("🔹 Payload final:", payload);

            if (activeTab === "editar" && historial) {
                await historialMedicoService.updateHistorial(historial.external_id, payload);
                console.log("🔹 Historial actualizado correctamente");
                Swal.fire("Actualizado", "Historial médico actualizado correctamente", "success");
            } else if (activeTab === "crear") {
                await historialMedicoService.createHistorialMedico(payload);
                console.log("🔹 Historial creado correctamente");
                Swal.fire("Creado", "Historial médico creado correctamente", "success");
                await loadHistorial(); // recargar historial recién creado
            }

            onClose();
        } catch (error) {
            console.error("❌ Error al guardar historial:", error);
            Swal.fire("Error", error?.response?.data?.detail || "Ocurrió un error", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isReadOnly = activeTab === "ver";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-3xl border border-[#332122] shadow-2xl text-gray-100 overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-6 bg-gradient-to-r from-[#b30c25] to-[#5c0a16]">
                    <h2 className="text-xl font-semibold">
                        Historial Médico
                    </h2>
                    <p className="text-sm text-red-100/80">
                        Información clínica del atleta
                    </p>
                </div>

                {/* TABS */}
                <div className="flex px-8 pt-6 gap-6 border-b border-[#332122]">
                    {!historial && (
                        <TabButton active={activeTab === "crear"} onClick={() => setActiveTab("crear")}>
                            Crear
                        </TabButton>
                    )}
                    {historial && (
                        <>
                            <TabButton active={activeTab === "editar"} onClick={() => setActiveTab("editar")}>
                                Editar
                            </TabButton>
                            <TabButton active={activeTab === "ver"} onClick={() => setActiveTab("ver")}>
                                Ver historial
                            </TabButton>
                        </>
                    )}
                </div>

                {/* BODY */}
                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#332122]">

                    {(activeTab === "crear" || activeTab === "editar") && (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* MÉTRICAS */}
                            <section>
                                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                                    Métricas corporales
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label="Talla (m)" name="talla" value={formData.talla} onChange={handleChange} />
                                    <Input label="Peso (kg)" name="peso" value={formData.peso} onChange={handleChange} />
                                    <Input label="IMC" value={calcularIMC(formData.peso, formData.talla)} readOnly />
                                </div>
                            </section>

                            {/* CONDICIONES */}
                            <section>
                                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
                                    Condiciones médicas
                                </h3>

                                <div className="space-y-4">
                                    <Select label="Alergias" name="alergias" value={formData.alergias} onChange={handleChange} options={OPCIONES_ALERGIAS} />
                                    <Select label="Enfermedades" name="enfermedades" value={formData.enfermedades} onChange={handleChange} options={OPCIONES_ENFERMEDADES} />
                                    <Select label="Enfermedades hereditarias" name="enfermedades_hereditarias" value={formData.enfermedades_hereditarias} onChange={handleChange} options={OPCIONES_HEREDITARIAS} />
                                </div>
                            </section>

                            {/* FOOTER */}
                            <div className="flex justify-between items-center pt-6 border-t border-[#332122]">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-xl bg-[#b30c25] hover:bg-[#8f091d] transition font-medium"
                                >
                                    {loading ? "Guardando..." : activeTab === "editar" ? "Actualizar" : "Guardar"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* VISTA SOLO LECTURA */}
                    {activeTab === "ver" && historial && (
                        <div className="space-y-6">
                            {[
                                ["Talla", historial.talla],
                                ["Peso", historial.peso],
                                ["IMC", historial.imc],
                                ["Alergias", historial.alergias],
                                ["Enfermedades", historial.enfermedades],
                                ["Enfermedades hereditarias", historial.enfermedades_hereditarias]
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between border-b border-[#332122] pb-2">
                                    <span className="text-gray-400">{label}</span>
                                    <span>{value || "—"}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
// Componentes auxiliares
const TabButton = ({ active, children, ...props }) => (
    <button
        {...props}
        className={`pb-3 text-sm font-medium border-b-2 transition ${active
            ? "border-[#b30c25] text-[#b30c25]"
            : "border-transparent text-gray-400 hover:text-white"
            }`}
    >
        {children}
    </button>
);

const Input = ({ label, readOnly = false, ...props }) => (
    <div>
        <label className="block mb-1 text-sm text-gray-400">{label}</label>
        <input
            readOnly={readOnly}
            {...props}
            className="w-full bg-[#242223] border border-[#332122] rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/50"
        />
    </div>
);

const Textarea = ({ label, ...props }) => (
    <div>
        <label className="block mb-1 text-sm text-gray-400">{label}</label>
        <textarea
            {...props}
            rows={3}
            className="w-full bg-[#242223] border border-[#332122] rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/50"
        />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div>
        <label className="block mb-1 text-sm text-gray-400">{label}</label>
        <select
            {...props}
            className="w-full bg-[#242223] border border-[#332122] rounded-xl px-4 py-2.5 text-gray-100 focus:outline-none focus:border-[#b30c25] focus:ring-1 focus:ring-[#b30c25]/50"
        >
            <option value="" disabled>Seleccione una opción</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);
export default HistorialMedicoModal;