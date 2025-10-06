import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar: React.FC = () => {
    const { adminLogout } = useAuth();
    const navLinkClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
    const activeClass = "bg-pink-600 text-white";
    const inactiveClass = "text-gray-400 hover:bg-gray-700 hover:text-white";

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${navLinkClass} ${isActive ? activeClass : inactiveClass}`;

    return (
        <aside className="w-64 bg-gray-800 p-4 flex flex-col flex-shrink-0">
            <h1 className="text-2xl font-bold mb-8 text-center">Admin</h1>
            <nav className="flex-grow space-y-2">
                <NavLink to="/admin/dashboard" className={getNavLinkClass}>
                    <i className="fas fa-tachometer-alt"></i> Dashboard
                </NavLink>
                <NavLink to="/admin/analytics" className={getNavLinkClass}>
                    <i className="fas fa-chart-bar"></i> Analytics
                </NavLink>
                <NavLink to="/admin/artists" className={getNavLinkClass}>
                    <i className="fas fa-users"></i> Artistas
                </NavLink>
                <NavLink to="/admin/venues" className={getNavLinkClass}>
                    <i className="fas fa-store"></i> Locais
                </NavLink>
                <NavLink to="/admin/transactions" className={getNavLinkClass}>
                    <i className="fas fa-exchange-alt"></i> Transações
                </NavLink>
                 <NavLink to="/admin/finances" className={getNavLinkClass}>
                    <i className="fas fa-wallet"></i> Finanças
                </NavLink>
                <NavLink to="/admin/activity" className={getNavLinkClass}>
                    <i className="fas fa-stream"></i> Atividade
                </NavLink>
                <NavLink to="/admin/support" className={getNavLinkClass}>
                    <i className="fas fa-life-ring"></i> Suporte
                </NavLink>
                 <NavLink to="/admin/moderation" className={getNavLinkClass}>
                    <i className="fas fa-shield-alt"></i> Moderação
                </NavLink>
                <NavLink to="/admin/settings" className={getNavLinkClass}>
                    <i className="fas fa-cog"></i> Configurações
                </NavLink>
            </nav>
            <div>
                <button onClick={adminLogout} className={`${navLinkClass} ${inactiveClass} w-full`}>
                    <i className="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
