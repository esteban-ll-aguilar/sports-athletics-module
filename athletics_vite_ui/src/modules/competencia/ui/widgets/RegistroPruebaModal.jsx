
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { X, User, Activity, Clock, Ruler, Calendar, Save, Edit3, Type, Search } from "lucide-react";
import AtletaService from "../../../atleta/services/AtletaService"; // Updated import path

const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
            <input
                {...props}
                className={`
                w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-lg
                bg-white dark:bg-[#212121] 
                border border-gray-300 dark:border-[#332122]
                text-gray-900 dark:text-gray-100
                placeholder-gray-400
                focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                outline-none transition-all sm:text-sm
            `}
            />
        </div>
    </div>
);

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType
};

const SelectField = ({ label, icon: Icon, children, ...props }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
            <select
                {...props}
                className={`
                w-full ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2.5 rounded-lg
                 bg-white dark:bg-[#212121] 
                border border-gray-300 dark:border-[#332122]
                text-gray-900 dark:text-gray-100
                placeholder-gray-400
                focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25]
                outline-none transition-all sm:text-sm appearance-none
            `}
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

SelectField.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    children: PropTypes.node
};

const RegistroPruebaModal = ({ isOpen, onClose, onSubmit, editingItem, competencias = [], preselectedAtleta, pruebas = [] }) => {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        prueba_id: "",
        valor: "",
        unidad_medida: "TIEMPO", // Default
        fecha: new Date().toISOString().slice(0, 16),
    });

    // Estado para búsqueda de atleta
    const [atletas, setAtletas] = useState([]);
    const [filteredAtletas, setFilteredAtletas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAtleta, setSelectedAtleta] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // Cargar Atletas
    useEffect(() => {
        if (isOpen) {
            const loadAtletas = async () => {
                try {
                    const data = await AtletaService.getAll();
                    const list = Array.isArray(data) ? data : (data.items || []);
                    setAtletas(list);
                    setFilteredAtletas(list);
                } catch (err) { console.error("Error loading athletes", err); }
            };
            loadAtletas();
        }
    }, [isOpen]);

    // Filtrar atletas
    useEffect(() => {
        if (!searchTerm) {
            setFilteredAtletas(atletas);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = atletas.filter(a => {
                const user = a.user || {};
                return (
                    (user.first_name || "").toLowerCase().includes(term) ||
                    (user.last_name || "").toLowerCase().includes(term) ||
                    (user.identificacion || "").includes(term)
                );
            });
            setFilteredAtletas(filtered);
        }
    }, [searchTerm, atletas]);

    // Inicializar formulario y seleccionado
    useEffect(() => {
        if (editingItem) {
            setForm({
                prueba_id: editingItem.prueba_external_id || editingItem.prueba_id,
                valor: editingItem.valor,
                unidad_medida: editingItem.unidad_medida || "TIEMPO",
                fecha: editingItem.fecha ? new Date(editingItem.fecha).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
            });
            // Si hay editingItem, intentar setear selectedAtleta si tenemos la info
            // Ojo: editingItem podría no tener datos completos del atleta, solo ID.
            // Si atletas ya cargó, buscamos.
            if (atletas.length > 0) {
                const found = atletas.find(a => a.external_id === editingItem.atleta_external_id || a.id === editingItem.atleta_id);
                if (found) setSelectedAtleta(found);
            }
        } else {
            setForm({
                prueba_id: "",
                valor: "",
                unidad_medida: "TIEMPO",
                fecha: new Date().toISOString().slice(0, 16)
            });
            // Si es nuevo y hay preseleccionado (ej: desde perfil), usarlo por defecto
            if (preselectedAtleta) {
                setSelectedAtleta(preselectedAtleta);
            } else {
                setSelectedAtleta(null);
            }
        }
    }, [editingItem, isOpen, preselectedAtleta, atletas.length]); // Dependencias: reload if athletes load

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updates = { ...prev, [name]: value };

            // Auto update unit when prueba changes
            if (name === "prueba_id") {
                const prueba = pruebas.find(p => p.external_id === value);
                if (prueba) {
                    updates.unidad_medida = prueba.unidad_medida === "SEGUNDOS" ? "SEGUNDOS" : (prueba.unidad_medida || "METROS");
                }
            }
            return updates;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        // Validar Atleta Seleccionado
        if (!selectedAtleta) {
            Swal.fire("Error", "Debe seleccionar un atleta", "error");
            return;
        }

        const prueba = pruebas.find(p => p.external_id === form.prueba_id || p.id === form.prueba_id);

        if (!prueba) {
            Swal.fire("Error", "Prueba no encontrada", "error");
            return;
        }

        const payload = {
            atleta_id: selectedAtleta.external_id || selectedAtleta.id,
            prueba_id: prueba.external_id,
            marca_obtenida: Number(form.valor),
            fecha: new Date(form.fecha).toISOString(),
            estado: true
        };

        try {
            setSubmitting(true);
            await onSubmit(payload, editingItem);
            setSubmitting(false);
            onClose();
        } catch (error) {
            console.error(error);
            setSubmitting(false);
            Swal.fire("Error", "No se pudo guardar", "error");
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left font-['Lexend'] w-full h-full">
            <button type="button" className="absolute inset-0 w-full h-full cursor-default bg-transparent" onClick={onClose} aria-label="Cerrar modal" />
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#332122] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-[#332122] flex justify-between items-center bg-gray-50 dark:bg-[#212121]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-[#b30c25] flex items-center justify-center font-bold">
                            {editingItem ? <Edit3 size={20} /> : <Save size={20} />}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {editingItem ? 'Editar Resultado' : 'Registrar Resultado'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {/* ATLETA SELECTOR (SEARCHABLE) */}
                    <div className="space-y-1" ref={searchRef}>
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Atleta</label>
                        {selectedAtleta ? (
                            <div className="bg-gray-100 dark:bg-[#252525] p-3 rounded-xl border border-gray-200 dark:border-[#333] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-200 dark:bg-[#333] p-2 rounded-full">
                                        <User size={20} className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white text-sm">
                                            {selectedAtleta.user?.first_name} {selectedAtleta.user?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">{selectedAtleta.user?.identificacion || "Sin Identificación"}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedAtleta(null); setSearchTerm(""); }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-[#333] rounded-full text-gray-500 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-[#212121] border border-gray-300 dark:border-[#332122] text-gray-900 dark:text-gray-100 outline-none focus:border-[#b30c25]"
                                    placeholder="Buscar por nombre o cédula..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                                {showDropdown && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#332122] rounded-xl max-h-48 overflow-y-auto shadow-xl">
                                        {filteredAtletas.length > 0 ? (
                                            filteredAtletas.map(a => (
                                                <li
                                                    key={a.id}
                                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer border-b last:border-0 border-gray-100 dark:border-[#332122]"
                                                    onClick={() => {
                                                        setSelectedAtleta(a);
                                                        setShowDropdown(false);
                                                        setSearchTerm("");
                                                    }}
                                                >
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{a.user?.first_name} {a.user?.last_name}</p>
                                                    <p className="text-xs text-gray-500">{a.user?.identificacion}</p>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-4 py-3 text-sm text-gray-500 text-center">No se encontraron atletas</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PRUEBA SELECTOR */}
                    <SelectField
                        label="Prueba"
                        icon={Activity}
                        name="prueba_id"
                        value={form.prueba_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione Prueba</option>
                        {pruebas.map(p => (
                            <option key={p.id} value={p.external_id}>{p.nombre} ({p.tipo_medicion})</option>
                        ))}
                    </SelectField>

                    {/* MARCA & UNIDAD */}
                    <div className="grid grid-cols-2 gap-4">
                        {form.unidad_medida === "SEGUNDOS" ? (
                            <>
                                <InputField
                                    label="Minutos"
                                    icon={Clock}
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="minutos"
                                    value={Math.floor(form.valor / 60) || 0}
                                    onChange={(e) => {
                                        const mins = parseInt(e.target.value) || 0;
                                        const secs = form.valor % 60;
                                        setForm(prev => ({ ...prev, valor: mins * 60 + secs }));
                                    }}
                                    placeholder="0"
                                />
                                <InputField
                                    label="Segundos"
                                    icon={Clock}
                                    type="number"
                                    min="0"
                                    max="59.99"
                                    step="0.01"
                                    name="segundos"
                                    value={(form.valor % 60).toFixed(2)}
                                    onChange={(e) => {
                                        const mins = Math.floor(form.valor / 60);
                                        const secs = parseFloat(e.target.value) || 0;
                                        setForm(prev => ({ ...prev, valor: mins * 60 + secs }));
                                    }}
                                    required
                                    placeholder="0.00"
                                />
                            </>
                        ) : (
                            <>
                                <InputField
                                    label={`Marca(${form.unidad_medida})`}
                                    icon={Ruler}
                                    type="number"
                                    step="0.01"
                                    name="valor"
                                    value={form.valor}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                                <InputField
                                    label="Unidad"
                                    icon={Type}
                                    type="text"
                                    value={form.unidad_medida}
                                    disabled
                                    className="bg-gray-100 dark:bg-[#2a2829] cursor-not-allowed opacity-70"
                                />
                            </>
                        )}
                    </div>

                    {/* FECHA */}
                    <InputField
                        label="Fecha y Hora"
                        icon={Calendar}
                        type="datetime-local"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleChange}
                        required
                        style={{ colorScheme: "dark" }}
                    />

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-[#332122]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#212121] transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-linear-to-r from-[#b30c25] to-[#80091b] hover:shadow-lg hover:shadow-red-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-wait transition-all duration-300"
                        >
                            {submitting ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Guardar Resultado')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

RegistroPruebaModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    editingItem: PropTypes.shape({
        atleta_external_id: PropTypes.string,
        atleta_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        prueba_external_id: PropTypes.string,
        prueba_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        unidad_medida: PropTypes.string,
        estado: PropTypes.bool,
        fecha: PropTypes.string
    }),
    competencias: PropTypes.array,
    atletas: PropTypes.array,
    pruebas: PropTypes.array
};

export default RegistroPruebaModal;
