import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const RegistroPruebaModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingData,
  pruebas,
  atletas
}) => {
  const [form, setForm] = useState({
    prueba_id: "",
    auth_user_id: "",
    valor: "",
    fecha_registro: "",
    id_entrenador: ""
  });

  // Inicializar el formulario cuando editingData cambie o se abra el modal
  useEffect(() => {
    if (editingData) {
      setForm({
        prueba_id: editingData.prueba_id?.toString() || "",
        auth_user_id: editingData.auth_user_id || "", // UUID, no parseInt
        valor: editingData.valor || "",
        fecha_registro: editingData.fecha_registro || "",
        id_entrenador: editingData.id_entrenador?.toString() || ""
      });
    } else {
      setForm({
        prueba_id: "",
        auth_user_id: "",
        valor: "",
        fecha_registro: "",
        id_entrenador: ""
      });
    }
  }, [editingData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: editingData ? "Actualizar registro" : "Crear registro",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ec1313"
    });

    if (result.isConfirmed) {
      const dataToSend = {
        prueba_id: parseInt(form.prueba_id, 10), // ID numérico de la prueba
        auth_user_id: form.auth_user_id,         // UUID de atleta
        id_entrenador: parseInt(form.id_entrenador, 10),
        valor: parseFloat(form.valor),
        fecha_registro: form.fecha_registro
      };

      console.log("📝 Form actual:", form);
      console.log("📝 Datos a enviar:", dataToSend);

      await onSubmit(dataToSend);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow p-6">
        <h2 className="text-xl font-black mb-4">
          {editingData ? "Editar Registro" : "Nuevo Registro"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* SELECT ATLETA */}
          <select
            className="w-full border p-3 rounded-xl"
            value={form.auth_user_id}
            onChange={e => setForm({ ...form, auth_user_id: e.target.value })}
            required
          >
            <option value="">Seleccione Atleta</option>
            {atletas.map(a => (
              <option key={a.id} value={a.id}>
                {a.first_name} {a.last_name}
              </option>
            ))}
          </select>

          {/* SELECT PRUEBA */}
          <select
            className="w-full border p-3 rounded-xl"
            value={form.prueba_id}
            onChange={e => setForm({ ...form, prueba_id: e.target.value })}
            required
          >
            <option value="">Seleccione Prueba</option>
            {pruebas.map(p => (
              <option key={p.external_id ?? p.siglas} value={p.id}>
                {p.siglas ?? "Sin siglas"}
              </option>
            ))}
          </select>

          {/* INPUT VALOR */}
          <input
            type="number"
            step="0.01"
            placeholder="Valor"
            className="w-full border p-3 rounded-xl"
            value={form.valor}
            onChange={e => setForm({ ...form, valor: e.target.value })}
            required
          />

          {/* INPUT FECHA */}
          <input
            type="date"
            className="w-full border p-3 rounded-xl"
            value={form.fecha_registro}
            onChange={e => setForm({ ...form, fecha_registro: e.target.value })}
            required
          />

          {/* INPUT ID ENTRENADOR */}
          <input
            type="number"
            placeholder="ID Entrenador"
            className="w-full border p-3 rounded-xl"
            value={form.id_entrenador}
            onChange={e => setForm({ ...form, id_entrenador: e.target.value })}
            required
          />

          {/* BOTONES */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-xl p-3 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#ec1313] text-white rounded-xl p-3 font-bold"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroPruebaModal;

