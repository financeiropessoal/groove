import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar: React.FC = () => {
    const { adminLogout } = useAuth();
    
    const navLinkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
    const activeClasses = "bg-red-600/20 text-red-400";
    const inactiveClasses = "text-gray-400 hover:bg-gray-700 hover:text-white";

    return (
        <aside className="w-64 bg-gray-800 p-4 flex flex-col flex-shrink-0">
            <div className="text-center mb-8">
                <Link to="/admin/dashboard" className="flex items-center justify-center space-x-2">
                    <i className="fas fa-shield-alt text-red-500 text-2xl"></i>
                    <h1 className="text-xl font-bold tracking-wider">Groove Admin</h1>
                </Link>
            </div>
            
            <nav className="flex-grow space-y-2">
                 <NavLink to="/admin/dashboard" className={({isActive}) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}><i className="fas fa-chart-pie w-5 text-center"></i><span>Dashboard</span></NavLink>
                 <NavLink to="/admin/artists" className={({isActive}) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}><i className="fas fa-microphone-alt w-5 text-center"></i><span>Artistas</span></NavLink>
                 <NavLink to="/admin/venues" className={({isActive}) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}><i className="fas fa-store w-5 text-center"></i><span>Contratantes</span></NavLink>
                 <NavLink to="/admin/transactions" className={({isActive}) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}><i className="fas fa-hand-holding-usd w-5 text-center"></i><span>Repasses</span></NavLink>
                 <NavLink to="/admin/finances" className={({isActive}) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}><i className="fas fa-wallet w-5 text-center"></i><span>Financeiro</span></NavLink>
                 <NavLink to="/admin/support" className={({isActive}) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}><i className="fas fa-life-ring w-5 text-center"></i><span>Suporte</span></NavLink>
                 <NavLink to="/admin/settings" className={({isActive}) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}><i className="fas fa-cog w-5 text-center"></i><span>Configurações</span></NavLink>
            </nav>

            <div className="mt-auto">
                <button onClick={adminLogout} className={`${navLinkClasses} ${inactiveClasses} w-full`}>
                    <i className="fas fa-sign-out-alt w-5 text-center"></i>
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;