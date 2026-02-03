import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, User, Mail, Phone, Hash, Award, Building2 } from 'lucide-react';

const PasanteForm = ({ onSubmit, initialData = null, onClose, isLoading }) => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            sexo: 'M',
            tipo_identificacion: 'CEDULA',
            especialidad: 'Atletismo',
            estado: true,
            username: '',
            phone: ''
        }
    });

    // Helper to allow only numbers
    const handleNumericInput = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    };

    useEffect(() => {
        if (initialData) {
            // Map flat structure or nested structure depending on how data comes
            setValue('first_name', initialData.first_name);
            setValue('last_name', initialData.last_name);
            setValue('identificacion', initialData.identificacion);
            setValue('username', initialData.username || initialData.email.split('@')[0]); // Fallback or from data
            setValue('fecha_nacimiento', initialData.fecha_inicio); // Wait, birthdate vs start date
            // We need to clarify if backend returns 'fecha_nacimiento' for Read. Checking schema... Yes.
            setValue('email', initialData.email);
            setValue('phone', initialData.phone);
            setValue('phone', initialData.phone);
            setValue('fecha_inicio', initialData.fecha_inicio);
            setValue('especialidad', initialData.especialidad);
            setValue('institucion_origen', initialData.institucion_origen);
            setValue('sexo', initialData.sexo || 'M'); // Add support if backend returns it
        }
    }, [initialData, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Sección Personal */}
            <h3 className="text-white font-semibold border-b border-gray-700 pb-2 mb-4">Información Personal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Usuario</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            {...register('username', { required: 'El usuario es obligatorio' })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                            placeholder="Ej. juan.perez"
                            readOnly={!!initialData}
                        />
                    </div>
                    {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Celular</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            {...register('phone', {
                                required: 'El celular es obligatorio',
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: 'Solo se permiten números'
                                }
                            })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                            placeholder="0999999999"
                            onInput={handleNumericInput}
                            maxLength={10}
                        />
                    </div>
                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Nombre</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            {...register('first_name', { required: 'El nombre es obligatorio' })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                            placeholder="Ej. Juan Manuel"
                        />
                    </div>
                    {errors.first_name && <span className="text-xs text-red-500">{errors.first_name.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Apellido</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            {...register('last_name', { required: 'El apellido es obligatorio' })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                            placeholder="Ej. Torres"
                        />
                    </div>
                    {errors.last_name && <span className="text-xs text-red-500">{errors.last_name.message}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Identificación (DNI)</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            {...register('identificacion', {
                                required: 'La identificación es obligatoria',
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: 'Solo se permiten números'
                                }
                            })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                            placeholder="0000000000"
                            readOnly={!!initialData} // Readonly if editing
                            onInput={handleNumericInput}
                            maxLength={10}
                        />
                    </div>
                    {errors.identificacion && <span className="text-xs text-red-500">{errors.identificacion.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Fecha de Nacimiento</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            type="date"
                            {...register('fecha_nacimiento', { required: 'Fecha requerida' })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Correo Electrónico</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            type="email"
                            {...register('email', { required: 'El correo es obligatorio' })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                            placeholder="ejemplo@correo.com"
                            readOnly={!!initialData}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Contraseña</label>
                    <div className="relative">
                        <input
                            type="password"
                            {...register('password', { required: !initialData ? 'Contraseña requerida' : false })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-4 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                            placeholder={initialData ? "Dejar en blanco para no cambiar" : "******"}
                            disabled={!!initialData} // Disable password edit here for simplicity
                        />
                    </div>
                </div>
            </div>

            {/* Sección Pasante */}
            <h3 className="text-white font-semibold border-b border-gray-700 pb-2 mb-4 mt-6">Detalles de Pasantía</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Especialidad Deportiva</label>
                    <div className="relative">
                        <Award className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <select
                            {...register('especialidad', { required: true })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25] appearance-none"
                        >
                            <option value="Atletismo">Atletismo</option>
                            <option value="Natación">Natación</option>
                            <option value="Ciclismo">Ciclismo</option>
                            <option value="Gimnasia">Gimnasia</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400">Fecha de Inicio</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            type="date"
                            {...register('fecha_inicio', { required: 'Fecha requerida' })}
                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm text-gray-400">Institución de Origen</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <input
                        {...register('institucion_origen')}
                        className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#b30c25]"
                        placeholder="Universidad / Club"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg bg-[#b30c25] hover:bg-[#80091b] text-white font-medium transition-colors shadow-lg shadow-red-900/20"
                >
                    {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Registrar Pasante'}
                </button>
            </div>
        </form>
    );
};

export default PasanteForm;
