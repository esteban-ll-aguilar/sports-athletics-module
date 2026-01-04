import { useState } from "react";
import Swal from "sweetalert2";
import { Shield, UserPlus } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {isCreateMode ? <UserPlus /> : <Shield />}
          {isCreateMode ? "Crear Atleta" : "Editar Usuario"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <input
            placeholder="Usuario"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2"
            required
          />

          {/* Correo */}
          <input
            type="email"
            placeholder="Correo"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2"
            required
          />

          {/* Password SOLO CREAR */}
          {isCreateMode && (
            <input
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2"
              required
            />
          )}

          {/* Nombre y Apellido */}
          <div className="flex gap-2">
            <input
              placeholder="Nombre"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="w-1/2 rounded-lg border px-4 py-2"
              required
            />
            <input
              placeholder="Apellido"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="w-1/2 rounded-lg border px-4 py-2"
              required
            />
          </div>

          {/* Identificación y Tipo */}
          <div className="flex gap-2">
            <select
              value={formData.tipo_identificacion}
              onChange={(e) =>
                setFormData({ ...formData, tipo_identificacion: e.target.value })
              }
              className="w-1/2 rounded-lg border px-4 py-2"
              required
            >
              {TIPO_IDENTIFICACION.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Identificación"
              value={formData.identificacion}
              onChange={(e) =>
                setFormData({ ...formData, identificacion: e.target.value })
              }
              className="w-1/2 rounded-lg border px-4 py-2"
              required
            />
          </div>

          {/* Tipo Estamento */}
          <select
            value={formData.tipo_estamento}
            onChange={(e) =>
              setFormData({ ...formData, tipo_estamento: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2"
            required
          >
            {TIPO_ESTAMENTO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Teléfono y Dirección */}
          <div className="flex gap-2">
            <input
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-1/2 rounded-lg border px-4 py-2"
            />
            <input
              placeholder="Dirección"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="w-1/2 rounded-lg border px-4 py-2"
            />
          </div>

          {/* Rol SOLO EDITAR */}
          {!isCreateMode && (
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full rounded-lg border px-4 py-2"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          )}

          {/* Estado SOLO EDITAR */}
          {!isCreateMode && (
            <button
              type="button"
              onClick={() =>
                setFormData((p) => ({ ...p, is_active: !p.is_active }))
              }
              className="flex justify-between items-center border rounded-lg px-4 py-3 w-full"
            >
              <span>
                {formData.is_active ? "Usuario activo" : "Usuario inactivo"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  formData.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {formData.is_active ? "Activo" : "Inactivo"}
              </span>
            </button>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : isCreateMode
                ? "Crear Atleta"
                : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

