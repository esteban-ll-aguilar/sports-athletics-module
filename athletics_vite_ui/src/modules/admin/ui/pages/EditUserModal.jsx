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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#212121] rounded-2xl shadow-2xl border border-[#332122]">

  {/* HEADER */}
        <div className="px-6 py-5 border-b border-[#332122] flex items-center justify-between bg-[#1a1a1a] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(179,12,37,0.15)] text-[#b30c25] flex items-center justify-center">
              <Shield size={18} />
            </div>
            <h2 className="text-lg font-black text-gray-100">
              Editar Usuario
            </h2>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          
          
          
          {/* Usuario */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-300">
              Usuario
            </label>
            <input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
 className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  " required             />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-300">
              Correo
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
 className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  " required             />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-300">
              Rol
            </label>
            <div className="relative">
              <Shield
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
 className="
    block w-full pl-10 pr-3 py-2.5
    bg-white text-black
    border border-gray-300 rounded-lg
    placeholder-gray-500
    focus:ring-[#b30c25] focus:border-[#b30c25]
    sm:text-sm
  " required            >
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
              <p className="block text-xs font-black uppercase tracking-widest text-gray-400">
                Estado del usuario
              </p>
              <p className="text-xs text-gray-500">
                {formData.is_active ? "Activo" : "Inactivo"}
              </p>
            </div>
            <span
              className={`text-sm font-bold font-black uppercase tracking-widest${
                formData.is_active
                  ? "bg-green-100 text-green-400"
                  : "bg-red-100 text-red-400"
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
className="
              flex-1 px-4 py-3 rounded-xl font-semibold
              border border-[#332122] text-gray-400
              hover:bg-[#242223] transition
            "               disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
 className="
              flex-1 px-4 py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-[#b30c25] to-[#5a0f1d]
              hover:brightness-110 transition active:scale-95
            "              disabled={loading}
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
