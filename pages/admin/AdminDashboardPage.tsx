import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminService } from '../../services/AdminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; link?: string; linkText?: string; showLink?: boolean }> = ({ title, value, icon, link, linkText, showLink = true }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-between">
        <div>
            <div className="flex items-center">
                <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <i className={`fas ${icon} text-red-400 text-xl`}></i>
                </div>
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
        {link && linkText && showLink && (
            <div className="mt-4 text-right">
                <Link to={link} state={{ defaultFilter: 'pending' }} className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
                    {linkText} <i className="fas fa-arrow-right ml-1"></i>
                </Link>
            </div>
        )}
    </div>
);


// Mock data for chart
const chartData = [
  { name: 'Jan', revenue: 4000, bookings: 24 },
  { name: 'Fev', revenue: 3000, bookings: 13 },
  { name: 'Mar', revenue: 5000, bookings: 38 },
  { name: 'Abr', revenue: 4780, bookings: 39 },
  { name: 'Mai', revenue: 5890, bookings: 48 },
  { name: 'Jun', revenue: 6390, bookings: 38 },
];

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            const data = await AdminService.getDashboardStats();
            setStats(data);
            setIsLoading(false);
        };
        fetchStats();
    }, []);

    if (isLoading || !stats) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard do Administrador</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Artistas Totais" value={stats.totalArtists} icon="fa-users" />
                <StatCard 
                    title="Aprovações Pendentes" 
                    value={stats.pendingArtists} 
                    icon="fa-user-clock" 
                    link="/admin/artists"
                    linkText="Ver Artistas"
                    showLink={stats.pendingArtists > 0}
                />
                <StatCard title="Contratantes Totais" value={stats.totalVenues} icon="fa-store" />
                <StatCard title="Shows Totais" value={stats.totalBookings} icon="fa-calendar-check" />
                <StatCard title="Faturamento Bruto" value={`R$ ${stats.grossRevenue.toFixed(2).replace('.',',')}`} icon="fa-dollar-sign" />
                <StatCard title="Comissão da Plataforma" value={`R$ ${stats.platformCommission.toFixed(2).replace('.',',')}`} icon="fa-hand-holding-usd" />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-4">Faturamento vs. Shows por Mês (Simulação)</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="name" stroke="#a0aec0" />
                            <YAxis stroke="#a0aec0" unit=" R$"/>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} 
                                formatter={(value, name) => name === 'Receita' ? `R$ ${value}` : value}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Receita" fill="#e53e3e" />
                            <Bar dataKey="bookings" name="Shows" fill="#dd6b20" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;