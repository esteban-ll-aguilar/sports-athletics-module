import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-[#151515] border-t border-gray-200 dark:border-[#222] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-black italic tracking-tighter mb-4">
                            <span className="text-gray-900 dark:text-white">ATHLETICS</span>
                            <span className="text-[#b30c25]">MODULE</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                            La plataforma líder para la gestión y desarrollo del atletismo.
                            Impulsando el rendimiento deportivo con tecnología de vanguardia.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-[#242223] text-gray-500 hover:bg-[#b30c25] hover:text-white transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Plataforma</h3>
                        <ul className="space-y-2">
                            {['Inicio', 'Características', 'Precios', 'Contactos', 'Ayuda'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#b30c25] transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {['Términos de servicio', 'Política de privacidad', 'Cookies'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#b30c25] transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-[#222] pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Athletics Module. Todos los derechos reservados.
                    </p>
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-0">
                        Hecho con <Heart size={14} className="mx-1 text-red-500 fill-current" /> por el equipo de desarrollo
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
