import React from 'react';
import { Link } from 'react-router-dom';
import { useMusicianAuth } from '../contexts/MusicianAuthContext';
import ProfileCompletenessAlert from '../components/ProfileCompletenessAlert';

interface DashboardCardProps {
    to: string;
    icon: string;
    title: string;
    description: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ to, icon, title, description }) => {
    return (
        <Link to={to} className="group bg-gray-800 p-6 rounded-lg hover:bg-gray-700/80 transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
            <div className="text-3xl mb-4 text-pink-400">
                <i className={`fas ${icon}`}></i>
            </div>
            <h3 className="font-bold text-lg text-white">{title}</h3>
            <p className="text-sm mt-1 flex-grow text-gray-400">{description}</p>
        </Link>
    );
};

const MusicianDashboardPage: React.FC = () => {
    const { musician } = useMusicianAuth();

    if (!musician) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold">Painel do Músico</h1>
                <p className="text-gray-400 text-lg">Bem-vindo(a) de volta, <span className="text-pink-400 font-semibold">{musician.name}</span>!</p>
            </div>
            
            <ProfileCompletenessAlert completeness={musician.profile_completeness} userType="musician" />

            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">Gerenciamento do Perfil Público</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <DashboardCard to="/edit-musician-profile" icon="fa-user-edit" title="Meu Perfil" description="Edite sua bio, foto, vídeo e informações de contato." />
                    <DashboardCard to="/edit-musician-gallery" icon="fa-images" title="Galeria de Fotos" description="Adicione e remova fotos do seu portfólio." />
                    <DashboardCard to="/edit-musician-repertoire" icon="fa-music" title="Repertório" description="Liste as músicas que você toca para ser encontrado." />
                </div>
            </div>
             <div className="bg-gray-800 p-6 rounded-lg text-center">
                <h2 className="text-xl font-bold text-white">Em Breve</h2>
                <p className="text-gray-400 mt-2">Estamos trabalhando em novas ferramentas para você, incluindo um mural de vagas para bandas e projetos!</p>
            </div>
        </div>
    );
};

export default MusicianDashboardPage;