import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AthleteForm from '../components/AthleteForm';
import { useId } from "react";


const RegisterAthletePage = ({ isModal = false, onClose, athleteId = null, onSuccess: onSuccessProp }) => {
    const navigate = useNavigate();
    const baseId = useId();

    const handleSuccess = (data) => {
        if (onSuccessProp) {
            onSuccessProp(data);
        } else {
            navigate('/dashboard/representante/mis-atletas');
        }
    };

    const handleCancel = () => {
        if (onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={isModal ? "" : "min-h-screen bg-gray-50 dark:bg-[#121212] p-6 transition-colors duration-300 font-['Lexend']"}>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        {!isModal && (
                            <button
                                onClick={handleCancel}
                                className="p-2 rounded-xl bg-white dark:bg-[#212121] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-[#332122] shadow-sm transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {athleteId ? "Editar Atleta" : "Registrar Atleta"}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {athleteId ? "Actualiza la información del atleta." : "Ingresa los datos del atleta bajo tu representación."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-xl border border-gray-200 dark:border-[#332122] overflow-hidden">
                    <AthleteForm
                        athleteId={athleteId}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </div>
    );
};

export default RegisterAthletePage;

