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

    // Render Setup (QR)
    if (setupStep === 1) {
        return (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] overflow-hidden transition-colors duration-300">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => setSetupStep(0)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-[#212121] rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">arrow_back</span>
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configurar Autenticador</h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 flex justify-center">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#332122]">
                                {qrCodeData?.qr_code && (
                                    <img src={qrCodeData.qr_code} alt="QR Code" className="w-48 h-48 mx-auto" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">1. Escanea el código QR</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.) y escanea el código.
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">O ingresa la clave manualmente:</p>
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#212121] p-3 rounded-lg border border-gray-200 dark:border-[#332122] group cursor-pointer hover:border-gray-300 dark:hover:border-[#444]" onClick={() => copyToClipboard(qrCodeData?.secret)}>
                                    <code className="flex-1 font-mono text-sm text-[#b30c25] break-all">{qrCodeData?.secret}</code>
                                    <Copy size={16} className="text-gray-400" />
                                </div>
                            </div>

                            <form onSubmit={handleVerifyEnable} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                                        2. Ingresa el código de 6 dígitos
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#242223] border border-gray-300 dark:border-[#332122] rounded-lg text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-[#b30c25] focus:border-[#b30c25] outline-none transition-colors dark:text-white"
                                        placeholder="000000"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || verificationCode.length !== 6}
                                    className="w-full bg-[#b30c25] text-white py-3 rounded-xl font-semibold hover:bg-[#8f091d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-900/20"
                                >
                                    {loading ? "Verificando..." : "Verificar y Activar"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render Backup Codes
    if (setupStep === 2) {
        return (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] overflow-hidden transition-colors duration-300">
                <div className="p-8 text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡2FA Activado!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Guarda estos códigos de recuperación en un lugar seguro. Los necesitarás si pierdes acceso a tu teléfono.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 dark:bg-[#212121] p-4 rounded-xl border border-gray-200 dark:border-[#332122]">
                        {backupCodes.map((code, index) => (
                            <div key={index} className="font-mono text-sm text-gray-700 dark:text-gray-300 font-medium py-1">
                                {code}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => copyToClipboard(backupCodes.join('\n'))}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-[#242223] hover:bg-gray-200 dark:hover:bg-[#2f2d2e] rounded-xl text-gray-700 dark:text-gray-300 font-medium transition-colors"
                        >
                            <Copy size={18} />
                            Copiar códigos
                        </button>
                        <button
                            onClick={() => setSetupStep(0)}
                            className="w-full bg-[#b30c25] text-white py-3 rounded-xl font-bold hover:bg-[#8f091d] transition-colors shadow-lg shadow-red-900/20"
                        >
                            He guardado mis códigos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main View
    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-200 dark:border-[#332122] overflow-hidden transition-colors duration-300">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#332122] flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-[#b30c25]" />
                        Autenticación en dos pasos (2FA)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Añade una capa extra de seguridad a tu cuenta.
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isEnabled ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {isEnabled ? 'Activado' : 'Desactivado'}
                </div>
            </div>

            <div className="p-6">
                {!isEnabled ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">Protege tu cuenta</p>
                                <p>Al activar 2FA, solicitaremos un código de tu celular cada vez que inicies sesión.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleEnableClick}
                            disabled={loading}
                            className="whitespace-nowrap px-6 py-2.5 bg-[#b30c25] hover:bg-[#8f091d] text-white rounded-xl font-bold transition-all shadow-md shadow-red-900/20"
                        >
                            Activar 2FA
                        </button>
                    </div>
                ) : (
                    <div>
                        {!showDisableConfirm ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p className="font-semibold text-gray-900 dark:text-white mb-1">Tu cuenta está protegida</p>
                                        <p>La autenticación de dos pasos está activa actualmente.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDisableConfirm(true)}
                                    className="whitespace-nowrap px-4 py-2 border border-gray-300 dark:border-[#332122] text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-[#212121] transition-colors"
                                >
                                    Descativar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleDisable} className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="text-red-600 dark:text-red-500" />
                                    <h4 className="font-bold text-gray-900 dark:text-white">Desactivar autenticación de dos pasos</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    Esta acción reducirá la seguridad de tu cuenta. Para confirmar, ingresa tu contraseña y un código 2FA válido.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Tu Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="password"
                                                value={disablePassword}
                                                onChange={(e) => setDisablePassword(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-[#332122] bg-white dark:bg-[#212121] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Código Autenticador</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                value={disableCode}
                                                onChange={(e) => setDisableCode(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-[#332122] bg-white dark:bg-[#212121] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono"
                                                placeholder="000000"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDisableConfirm(false)}
                                        className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 font-medium hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {loading ? "Desactivando..." : "Confirmar Desactivación"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwoFactorSettings;
