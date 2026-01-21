import { useEffect, useState } from "react";

import registroPruebaService from "../../services/registro_prueba_service";
import pruebaService from "../../services/prueba_service";
import AdminService from "@modules/admin/services/adminService";
import authService from "@modules/auth/services/auth_service";

const RegistroPruebaCompetenciaModal = ({ isOpen, onClose, onSuccess }) => {
    const [pruebas, setPruebas] = useState([]);
    const [atletas, setAtletas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        prueba_external_id: "",
        auth_user_id: "",
        valor: "",
        fecha_registro: ""
    });

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                const [pruebasRes, usersRes] = await Promise.all([
                    pruebaService.getAll(),
                    AdminService.getUsers(1, 100, "ATLETA")
                ]);

                console.log("🟢 PRUEBAS RAW:", pruebasRes);
                console.log("🟢 USERS RAW:", usersRes);

                setPruebas(pruebasRes || []);

                const atletasFiltrados = usersRes?.items?.filter(
                    u => u.role === "ATLETA"
                ) || [];

                console.log("🟢 ATLETAS FILTRADOS:", atletasFiltrados);
                setAtletas(atletasFiltrados);

            } catch (error) {
                console.error("❌ Error cargando datos:", error);
            }
        };

        fetchData();
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const entrenadorId = authService.getUserId();

            const payload = {
                prueba_external_id: form.prueba_external_id,
                auth_user_id: Number(form.auth_user_id),
                id_entrenador: Number(entrenadorId),
                valor: Number(form.valor),
                fecha_registro: form.fecha_registro
            };

            console.log("📤 PAYLOAD:", payload);

            await registroPruebaService.create(payload);

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("❌ Error creando registro:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6">

                <h2 className="text-2xl font-black mb-4">Registrar Prueba</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* PRUEBA */}
                    <select
                        name="prueba_external_id"
                        value={form.prueba_external_id}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-xl px-3 py-2"
                    >
                        <option value="">Seleccione prueba</option>
                        {pruebas.map(p => (
                            <option
                                key={p.external_id}
                                value={p.external_id}
                            >
                                {p.siglas} - {p.tipo_prueba}
                            </option>
                        ))}
                    </select>

                    {/* ATLETA */}
                    <select
                        name="auth_user_id"
                        value={form.auth_user_id}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-xl px-3 py-2"
                    >
                        <option value="">Seleccione atleta</option>
                        {atletas.map(a => (
                            <option
                                key={a.auth_user_id}
                                value={a.auth_user_id}
                            >
                                {a.first_name} {a.last_name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        step="any"
                        name="valor"
                        placeholder="Valor"
                        value={form.valor}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-xl px-3 py-2"
                    />

                    <input
                        type="date"
                        name="fecha_registro"
                        value={form.fecha_registro}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-xl px-3 py-2"
                    />

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2 rounded-xl"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroPruebaCompetenciaModal;



