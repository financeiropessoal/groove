import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const isDashboard = location.pathname === '/admin/dashboard' || location.pathname === '/admin/dashboard/';

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <AdminSidebar />
            <main className="flex-grow p-8 overflow-y-auto">
                {!isDashboard && (
                    <div className="mb-6">
                        <Link to="/admin/dashboard" className="text-gray-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2 group" aria-label="Voltar ao painel">
                            <i className="fas fa-arrow-left text-sm transform group-hover:-translate-x-1 transition-transform"></i>
                            <span className="font-semibold">Voltar ao Painel</span>
                        </Link>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;