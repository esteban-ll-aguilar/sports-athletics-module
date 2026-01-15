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
        // We infer status from profile or just assumes false initially and let user try to enable
        // Ideally, getProfile should return two_factor_enabled.
        // Let's check if getProfile returns it.
        try {
            const profile = await authService.getProfile();
            // Assuming profile data includes two_factor_enabled boolean
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
            setQrCodeData(response); // Contains secret, qr_code (base64 or url), backup_codes
            setBackupCodes(response.backup_codes);
            setSetupStep(1);
        } catch (error) {
            toast.error(error.detail || "Error iniciando configuración 2FA");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEnable = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.verify2FA(verificationCode);
            setIsEnabled(true);
            setSetupStep(2); // Show backup codes
            toast.success("¡2FA Habilitado correctamente!");
        } catch (error) {
            toast.error(error.detail || "Código incorrecto");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // disable2FA requires password and code according to backend logic we saw in twofa.py?
            // Actually verification in twofa.py disable endpoint requires: password and code.
            // Wait, let's re-read auth_repository.js disable2FA implementation.
            // It calls post /auth/2fa/disable with EMPTY body {}.
            // BUT backend twofa.py `disable_2fa` expects `Disable2FARequest` with `password` and `code`.
            // REPO IS WRONG.
            // I need to update repo first.
            await authService.disable2FA(disablePassword, disableCode);
            setIsEnabled(false);
            setShowDisableConfirm(false);
            setDisablePassword('');
            setDisableCode('');
            toast.success("2FA Deshabilitado");
        } catch (error) {
            toast.error(error.detail || "Error al deshabilitar 2FA");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Autenticación de Dos Factores (2FA)</h2>
                        <p className="text-sm text-gray-500">Aumenta la seguridad de tu cuenta.</p>
                    </div>
                </div>
                <div>
                    {isEnabled ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                            <CheckCircle size={16} /> Activado
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium">
                            <AlertTriangle size={16} /> Desactivado
                        </div>
                    )}
                </div>
            </div>

            {!isEnabled && setupStep === 0 && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-indigo-800 text-sm">
                        Protege tu cuenta solicitando un código adicional al iniciar sesión.
                    </p>
                    <button
                        onClick={handleEnableClick}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        {loading ? 'Cargando...' : 'Habilitar 2FA'}
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
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest font-mono"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    {loading ? 'Verificando...' : 'Verificar y Activar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSetupStep(0)}
                                    className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
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
                <div className="mt-6 pt-6 border-t border-gray-100 bg-red-50 p-6 rounded-xl border border-red-100">
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
