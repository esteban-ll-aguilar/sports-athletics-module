import { useEffect, useState } from "react";
import registroPruebaCompetenciaService 
    from "../../services/registro_prueba_service";
import pruebaService from "../../services/prueba_service";
import RegistroPruebaCompetenciaModal 
    from "../../widgets/RegistroPruebaModal";

const RegistroPruebaCompetenciaPage = () => {
    const [registros, setRegistros] = useState([]);
    const [pruebas, setPruebas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resRegistros, resPruebas] = await Promise.all([
                registroPruebaCompetenciaService.getAll(),
                pruebaService.getAll()
            ]);

            setRegistros(Array.isArray(resRegistros) ? resRegistros : []);
            setPruebas(Array.isArray(resPruebas) ? resPruebas : []);
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Crear registro desde el modal
    const handleCreate = async (data) => {
        try {
            const payload = {
                id_entrenador: parseInt(data.id_entrenador, 10),
                prueba_id: parseInt(data.prueba_id, 10),
                valor: parseFloat(data.valor),
                fecha_registro: data.fecha_registro
            };

            await registroPruebaCompetenciaService.create(payload);
            fetchData();
        } catch (err) {
            console.error("Error al registrar prueba:", err);
            throw err;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-['Lexend']">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-black text-gray-900">
                        Registro de Pruebas de Competencia
                    </h1>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
                    >
                        + Registrar Prueba
                    </button>
                </div>

                {/* TABLA */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left font-black">Prueba</th>
                                <th className="px-4 py-3 text-left font-black">Valor</th>
                                <th className="px-4 py-3 text-left font-black">Fecha</th>
                                <th className="px-4 py-3 text-left font-black">Entrenador</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : registros.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-400">
                                        No hay registros
                                    </td>
                                </tr>
                            ) : (
                                registros.map((r) => (
                                    <tr key={r.external_id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold">
                                            {r.prueba?.siglas || r.prueba_id}
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.valor}
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.fecha_registro}
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.id_entrenador}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            <RegistroPruebaCompetenciaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                pruebas={pruebas}
            />
        </div>
    );
};

export default RegistroPruebaCompetenciaPage;
