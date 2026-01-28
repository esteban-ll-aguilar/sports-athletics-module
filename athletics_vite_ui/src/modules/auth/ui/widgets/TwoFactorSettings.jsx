import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Lock, Copy, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import authService from '../../services/auth_service';
import { toast } from 'react-hot-toast';

const TwoFactorSettings = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [setupStep, setSetupStep] = useState(0); // 0: Idle, 1: QR, 2: Backup Codes

    // Setup Data
    const [qrCodeData, setQrCodeData] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState('');

    // Disable Data
    const [showDisableConfirm, setShowDisableConfirm] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disableCode, setDisableCode] = useState('');

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const profile = await authService.getProfile();
            if (profile.data && profile.data.two_factor_enabled !== undefined) {
                setIsEnabled(profile.data.two_factor_enabled);
            }
        } catch (error) {
            console.error("Error fetching 2FA status", error);
        }
    };

    const handleEnableClick = async () => {
        setLoading(true);
        try {
            const response = await authService.enable2FA();
            // Backend twofa.py /enable returns Enable2FAResponse directly, NOT wrapped in APIResponse yet
            // So response has {secret, qr_code, backup_codes, message}
            if (response.secret) {
                setQrCodeData(response);
                setBackupCodes(response.backup_codes);
                setSetupStep(1);
            } else {
                toast.error(response.message || "Error iniciando configuración 2FA");
            }
        } catch (error) {
            const msg = error.message || error.detail || "Error iniciando configuración 2FA";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEnable = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authService.verify2FA(verificationCode);
            // Backend returns MessageResponse, NOT APIResponse yet
            if (response.message) {
                setIsEnabled(true);
                setSetupStep(2); // Show backup codes
                toast.success("¡2FA Habilitado correctamente!");
            } else {
                toast.error("Error en la verificación");
            }
        } catch (error) {
            const msg = error.message || error.detail || "Código incorrecto";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authService.disable2FA(disablePassword, disableCode);
            if (response.message) {
                setIsEnabled(false);
                setShowDisableConfirm(false);
                setDisablePassword('');
                setDisableCode('');
                toast.success("2FA Deshabilitado");
            } else {
                toast.error("Error al deshabilitar 2FA");
            }
        } catch (error) {
            const msg = error.message || error.detail || "Error al deshabilitar 2FA";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    return (
        <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#332122] rounded-2xl p-6 md:p-8 mt-8 text-gray-700 dark:text-gray-200 shadow-xl transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center
            ${isEnabled
                            ? 'bg-green-100 dark:bg-[rgba(34,197,94,0.15)] text-green-600 dark:text-green-500'
                            : 'bg-red-100 dark:bg-[rgba(179,12,37,0.15)] text-red-600 dark:text-[#b30c25]'
                        }`}
                    >
                        <Shield size={24} />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
                            Autenticación de Dos Factores
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            Protección adicional para tu cuenta
                        </p>
                    </div>
                </div>

                <span className={`px-4 py-1 rounded-full text-sm font-medium
        ${isEnabled
                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                        : 'bg-red-900/30 text-red-400 border border-red-700'
                    }`}
                >
                    {isEnabled ? 'ACTIVADO' : 'DESACTIVADO'}
                </span>
            </div>


            {!isEnabled && setupStep === 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-[#242223] p-5 rounded-xl border border-gray-100 dark:border-[#332122] transition-colors">
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg transition-colors">
                        Añade una capa adicional de seguridad solicitando un código temporal al iniciar sesión.
                    </p>

                    <button
                        onClick={handleEnableClick}
                        disabled={loading}
                        className="
            px-6 py-2 rounded-lg text-white font-medium
            bg-linear-to-r from-[#b30c25] via-[#5a0f1d] to-[#332122]
            hover:brightness-110 transition
        "
                    >
                        {loading ? 'Cargando...' : 'Activar 2FA'}
                    </button>
                </div>

            )}

            {/* SETUP STEP 1: SCAN QR */}
            {setupStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="border-t border-gray-100 pt-6"></div>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <h3 className="text-lg font-medium">1. Escanea el código QR</h3>
                            <p className="text-sm text-gray-500">
                                Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.) y escanea el siguiente código.
                            </p>
                            <div className="bg-white p-4 border rounded-xl inline-block shadow-sm">
                                {/* Backend sends qr_code as data url string "data:image/png;base64,..." */}
                                {qrCodeData?.qr_code && (
                                    <img src={qrCodeData.qr_code} alt="QR Code" className="w-48 h-48 mx-auto" />
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                <p>¿No puedes escanearlo? Ingresa este código manualmente:</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono select-all">
                                        {qrCodeData?.secret}
                                    </code>
                                    <button onClick={() => copyToClipboard(qrCodeData?.secret)} className="text-indigo-600 hover:text-indigo-700">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-lg font-medium">2. Verifica el código</h3>
                            <p className="text-sm text-gray-500">
                                Ingresa el código de 6 dígitos que genera tu aplicación.
                            </p>
                            <form onSubmit={handleVerifyEnable} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="000000"
                                    className="
        w-full py-3 text-center text-xl font-mono tracking-widest
        bg-gray-100 dark:bg-[#121212] border border-gray-300 dark:border-[#332122] rounded-lg
        text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-200
        focus:ring-2 focus:ring-[#b30c25] focus:outline-none transition-colors
    "
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className=" w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-[#b30c25] via-[#362022] to-[#332122]  hover:brightness-110
                            focus:ring-2 focus:ring-[#b30c25] disabled:opacity-50 disabled:cursor-not-allowed  transition-all duration-300 shadow-lg "

                                >
                                    {loading ? 'Verificando...' : 'Verificar y Activar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSetupStep(0)}
                                    className="w-full py-2 text-gray-400 hover:text-gray-500 text-sm"
                                >
                                    Cancelar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* SETUP STEP 2: BACKUP CODES */}
            {setupStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="border-t border-gray-100 pt-6"></div>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-800">¡2FA Activado Exitosamente!</h3>
                        <p className="text-green-700">Tu cuenta ahora está más segura.</p>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Lock size={18} className="text-gray-500" />
                            Códigos de Recuperación
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                            Guarda estos códigos en un lugar seguro. Podrás usarlos para acceder a tu cuenta si pierdes acceso a tu celular.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-2 font-mono text-sm max-w-md">
                            {backupCodes.map((code, index) => (
                                <div key={index} className="text-gray-700 select-all">{code}</div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                                <Copy size={16} /> Copiar todos
                            </button>
                            <button
                                onClick={() => setSetupStep(0)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                            >
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DISABLE 2FA */}
            {isEnabled && !showDisableConfirm && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                        onClick={() => setShowDisableConfirm(true)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                    >
                        Deshabilitar autenticación de dos factores
                    </button>
                </div>
            )}

            {/* DISABLE CONFIRMATION */}
            {showDisableConfirm && isEnabled && (
                <div className="mt-6 pt-6 border-t border-red-100 bg-red-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-red-800 mb-2">Deshabilitar 2FA</h3>
                    <p className="text-sm text-red-700 mb-4">
                        Para continuar, confirma tu contraseña y un código 2FA actual.
                    </p>
                    <form onSubmit={handleDisable} className="space-y-4 max-w-sm">
                        <div>
                            <label className="block text-sm font-medium text-red-800 mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-red-800 mb-1">Código 2FA</label>
                            <input
                                type="text"
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value)}
                                maxLength={6}
                                className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 font-mono"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                            >
                                {loading ? 'Deshabilitando...' : 'Confirmar y Desactivar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDisableConfirm(false);
                                    setDisablePassword('');
                                    setDisableCode('');
                                }}
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
};

export default TwoFactorSettings;
