import { useEffect, useState } from "react";
import registroPruebaService from "../../services/registro_prueba_service";
import pruebaService from "../../services/prueba_service";
import AtletaService from "../../../atleta/services/AtletaService";
import RegistroPruebaModal from "../widgets/RegistroPruebaModal";
import authService from "../../../auth/services/auth_service";

const RegistroPruebasPage = () => {
    const [registros, setRegistros] = useState([]);
    const [pruebas, setPruebas] = useState([]);
    const [atletas, setAtletas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rRes, pRes, aRes] = await Promise.all([
                registroPruebaService.getAll(),
                pruebaService.getAll(),
                AtletaService.getAll()
            ]);

            setRegistros(Array.isArray(rRes) ? rRes : []);
            setPruebas(Array.isArray(pRes) ? pRes : []);
            setAtletas(Array.isArray(aRes) ? aRes : []);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getPrueba = (id) => pruebas.find(p => p.id === id);
    const getAtleta = (authId) => atletas.find(a => a.auth_user_id === authId);

    const handleCreate = async (formData) => {
        const entrenadorId = authService.getProfile()?.id;

        const payload = {
            id_entrenador: entrenadorId,
            prueba_id: parseInt(formData.prueba_id),
            auth_user_id: parseInt(formData.auth_user_id),
            valor: parseFloat(formData.valor),
            fecha_registro: formData.fecha_registro
        };

        await registroPruebaService.create(payload);
        setIsModalOpen(false);
        fetchData();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-['Lexend']">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-black">Registro de Pruebas</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700"
                    >
                        + Registrar Prueba
                    </button>
                </div>

                {/* TABLA */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Prueba</th>
                                <th className="px-4 py-3">Atleta</th>
                                <th className="px-4 py-3">Valor</th>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Entrenador</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : registros.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-400">
                                        No hay registros
                                    </td>
                                </tr>
                            ) : (
                                registros.map(r => {
                                    const prueba = getPrueba(r.prueba_id);
                                    const atleta = getAtleta(r.auth_user_id);

                                    return (
                                        <tr key={r.external_id} className="border-t">
                                            <td className="px-4 py-3 font-semibold">
                                                {prueba?.siglas || "N/A"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {atleta
                                                    ? `${atleta.nombres} ${atleta.apellidos}`
                                                    : "N/A"}
                                            </td>
                                            <td className="px-4 py-3">{r.valor}</td>
                                            <td className="px-4 py-3">
                                                {new Date(r.fecha_registro).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.id_entrenador}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            <RegistroPruebaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                pruebas={pruebas}
                atletas={atletas}
            />
        </div>
    );
};

export default RegistroPruebasPage;
