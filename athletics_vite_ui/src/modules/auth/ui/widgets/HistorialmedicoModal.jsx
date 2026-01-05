import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import historialMedicoService from "../../services/historialMedicoService";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-xl p-6 shadow-xl">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                    {!historial && (
                        <button
                            className={`px-4 py-2 -mb-px font-medium border-b-2 ${activeTab === "crear" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}
                            onClick={() => setActiveTab("crear")}
                        >
                            Crear
                        </button>
                    )}
                    {historial && (
                        <>
                            <button
                                className={`px-4 py-2 -mb-px font-medium border-b-2 ${activeTab === "editar" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}
                                onClick={() => setActiveTab("editar")}
                            >
                                Editar
                            </button>
                            <button
                                className={`px-4 py-2 -mb-px font-medium border-b-2 ${activeTab === "ver" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}
                                onClick={() => setActiveTab("ver")}
                            >
                                Ver Historial
                            </button>
                        </>
                    )}
                </div>

                {(activeTab === "crear" || activeTab === "editar") && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block mb-1 font-medium">Talla (m) <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" name="talla" value={formData.talla} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required readOnly={isReadOnly} />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-1 font-medium">Peso (kg) <span className="text-red-500">*</span></label>
                                <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required readOnly={isReadOnly} />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-1 font-medium">IMC</label>
                                <input type="text" value={calcularIMC(formData.peso, formData.talla)} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Alergias</label>
                            <textarea name="alergias" value={formData.alergias} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" readOnly={isReadOnly} />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Enfermedades</label>
                            <textarea name="enfermedades" value={formData.enfermedades} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" readOnly={isReadOnly} />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Enfermedades hereditarias</label>
                            <textarea name="enfermedades_hereditarias" value={formData.enfermedades_hereditarias} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" readOnly={isReadOnly} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cerrar</button>
                            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                                {loading ? "Guardando..." : activeTab === "editar" ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === "ver" && historial && (
                    <div className="space-y-2">
                        <p>Talla: {historial.talla}</p>
                        <p>Peso: {historial.peso}</p>
                        <p>IMC: {historial.imc}</p>
                        <p>Alergias: {historial.alergias}</p>
                        <p>Enfermedades: {historial.enfermedades}</p>
                        <p>Enfermedades hereditarias: {historial.enfermedades_hereditarias}</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 border rounded">Cerrar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialMedicoModal;
