import { useState } from "react";
import Swal from "sweetalert2";
import { Shield, UserPlus, Mail, Lock, User, Phone, MapPin, CreditCard, Building } from "lucide-react";
import authService from "../../../auth/services/auth_service";

const ROLES = [
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "ATLETA", label: "Atleta" },
  { value: "ENTRENADOR", label: "Entrenador" },
  { value: "REPRESENTANTE", label: "Representante" },
];

const TIPO_IDENTIFICACION = [
  { value: "CEDULA", label: "Cédula" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "OTRO", label: "Otro" },
];

const TIPO_ESTAMENTO = [
  { value: "EXTERNOS", label: "Externos" },
  { value: "INTERNOS", label: "Internos" },
];

const EditUserModal = ({ user, onClose, onUpdated }) => {
  const isCreateMode = !user;

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    tipo_identificacion: user?.tipo_identificacion || "CEDULA",
    identificacion: user?.identificacion || "",
    tipo_estamento: user?.tipo_estamento || "EXTERNOS",
    phone: user?.phone || "",
    direccion: user?.direccion || "",
    role: user?.role || "ATLETA",
    is_active: user?.is_active ?? true,
    profile_image: user?.profile_image || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isCreateMode) {
        // 🆕 CREAR ATLETA
        await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "ATLETA",
          first_name: formData.first_name,
          last_name: formData.last_name,
          tipo_identificacion: formData.tipo_identificacion,
          identificacion: formData.identificacion,
          tipo_estamento: formData.tipo_estamento,
          phone: formData.phone,
          direccion: formData.direccion,
        });

        Swal.fire({
          icon: "success",
          title: "Atleta creado",
          text: "El atleta ha sido registrado correctamente",
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#b30c25'
        });
      } else {
        // ✏️ EDITAR USUARIO
        await authService.updateUser(user.id, {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          tipo_identificacion: formData.tipo_identificacion,
          identificacion: formData.identificacion,
          tipo_estamento: formData.tipo_estamento,
          phone: formData.phone,
          direccion: formData.direccion,
          is_active: formData.is_active,
          profile_image: formData.profile_image || null,
        });

        if (user.role !== formData.role) {
          await authService.updateRole(user.id, { role: formData.role });
        }

        Swal.fire({
          icon: "success",
          title: "Usuario actualizado",
          text: "Los cambios se guardaron correctamente",
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#b30c25'
        });
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.detail?.[0]?.msg ||
          "Ocurrió un error al guardar el usuario",
      });
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

  const SelectField = ({ icon: Icon, children, ...props }) => (
    <div className="relative w-full text-gray-900 dark:text-gray-100">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
      <select
        {...props}
        className={`w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#332122] 
        rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-8 appearance-none
        focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-all cursor-pointer`}
      >
        {children}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 material-symbols-outlined">expand_more</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl border border-gray-200 dark:border-[#332122] transition-colors">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#332122] pb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {isCreateMode ? <UserPlus className="text-[#b30c25]" /> : <Shield className="text-[#b30c25]" />}
            {isCreateMode ? "Crear Atleta" : "Editar Usuario"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Usuario */}
          <InputField
            icon={User}
            placeholder="Nombre de Usuario"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          {/* Correo */}
          <InputField
            icon={Mail}
            type="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          {/* Password SOLO CREAR */}
          {isCreateMode && (
            <InputField
              icon={Lock}
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}

          {/* Nombre y Apellido */}
          <div className="flex gap-3">
            <InputField
              placeholder="Nombre"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <InputField
              placeholder="Apellido"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          {/* Identificación y Tipo */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <SelectField
                value={formData.tipo_identificacion}
                onChange={(e) => setFormData({ ...formData, tipo_identificacion: e.target.value })}
                required
              >
                {TIPO_IDENTIFICACION.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </SelectField>
            </div>
            <div className="w-1/2">
              <InputField
                icon={CreditCard}
                placeholder="Identificación"
                value={formData.identificacion}
                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Tipo Estamento */}
          <SelectField
            icon={Building}
            value={formData.tipo_estamento}
            onChange={(e) => setFormData({ ...formData, tipo_estamento: e.target.value })}
            required
          >
            {TIPO_ESTAMENTO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </SelectField>

          {/* Teléfono y Dirección */}
          <div className="space-y-4">
            <InputField
              icon={Phone}
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <InputField
              icon={MapPin}
              placeholder="Dirección"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>

          {/* Rol SOLO EDITAR */}
          {!isCreateMode && (
            <SelectField
              icon={Shield}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </SelectField>
          )}

          {/* Estado SOLO EDITAR */}
          {!isCreateMode && (
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}
              className={`flex justify-between items-center border rounded-xl px-4 py-3 w-full transition-colors
                ${formData.is_active ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'}
                dark:border-opacity-30
              `}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.is_active ? "Usuario Activo" : "Usuario Inactivo"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                  ${formData.is_active ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300"}
                `}
              >
                {formData.is_active ? "Activo" : "Inactivo"}
              </span>
            </button>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#332122]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#2a2829] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#b30c25] hover:bg-[#8f091d] text-white rounded-xl font-medium shadow-lg hover:shadow-red-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : isCreateMode ? "Crear Atleta" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
