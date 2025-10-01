import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen">
            <AdminSidebar />
            <main className="flex-grow p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
