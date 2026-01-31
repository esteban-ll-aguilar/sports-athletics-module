import { useState } from "react";
import { Shield, User, Mail, Activity, Lock } from "lucide-react";
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

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative w-full">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
      <input
        {...props}
        className={`w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#332122]
        text-gray-900 dark:text-gray-100 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4
        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all placeholder-gray-400`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#332122] flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Editar Usuario
            </h2>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">

          {/* Usuario */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario</label>
            <InputField
              icon={User}
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          {/* Correo */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Correo Electrónico</label>
            <InputField
              icon={Mail}
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Rol */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rol del Sistema</label>
            <div className="relative">
              <Shield
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="
                    w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#332122]
                    text-gray-900 dark:text-gray-100 rounded-xl py-2.5 pl-10 pr-10 appearance-none cursor-pointer
                    focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all
                "
                required
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
                expand_more
              </span>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</label>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors
                    ${formData.is_active
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'}
                `}
            >
              <div className="flex items-center gap-3">
                <Activity size={18} className={formData.is_active ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${formData.is_active ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {formData.is_active ? "Usuario Activo" : "Usuario Inactivo"}
                  </p>
                </div>
              </div>

              <div className={`w-10 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${formData.is_active ? 'translate-x-4' : ''}`}></div>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-[#332122] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="
                        flex-1 px-4 py-2.5 rounded-xl text-white font-medium
                        bg-linear-to-r from-[#b30c25] to-[#80091b]
                        hover:shadow-lg hover:shadow-red-900/20 active:scale-95
                        disabled:opacity-70 disabled:cursor-not-allowed
                        transition-all duration-300
                    "
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
