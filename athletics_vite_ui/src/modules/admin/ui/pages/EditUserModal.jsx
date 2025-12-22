import { useState } from "react";
import { Shield } from "lucide-react";
import authService from "../../../auth/services/auth_service";

const ROLES = [
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "ATLETA", label: "Atleta" },
  { value: "ENTRENADOR", label: "Entrenador" },
  { value: "REPRESENTANTE", label: "Representante" },
];

const EditUserModal = ({ user, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "ATLETA",
    is_active: Boolean(user?.is_active),
    profile_image: user?.profile_image || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Actualiza los datos del usuario excepto el rol
      await authService.updateUser(user.id, {
        username: formData.username,
        email: formData.email,
        is_active: formData.is_active,
        profile_image: formData.profile_image || null,
      });

      // 2️⃣ Actualiza el rol solo si cambió
      if (user.role !== formData.role) {
        await authService.updateRole(user.id, { role: formData.role });
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      alert("Hubo un error al actualizar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Editar Usuario</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <div className="relative">
              <Shield
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estado */}
          <button
            type="button"
            onClick={() =>
              setFormData((p) => ({ ...p, is_active: !p.is_active }))
            }
            className="flex w-full items-center justify-between rounded-xl border px-6 py-5 hover:bg-gray-50 active:scale-[0.98] transition"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">
                Estado del usuario
              </p>
              <p className="text-xs text-gray-500">
                {formData.is_active ? "Activo" : "Inactivo"}
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-1 text-xs font-semibold ${
                formData.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {formData.is_active ? "Activo" : "Inactivo"}
            </span>
          </button>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
