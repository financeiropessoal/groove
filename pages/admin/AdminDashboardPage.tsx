import React, { useState, useEffect, useMemo } from 'react';
import { AdminService } from '../../services/AdminService';
import { ArtistService } from '../../services/ArtistService';
import { SupportService } from '../../services/SupportService';
import { Artist } from '../../data';
import { SupportTicket } from '../../types';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; change?: string; }> = ({ title, value, icon, color, change }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <i className={`fas ${icon} text-lg`}></i>
            </div>
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {change && <p className="text-xs text-green-400 mt-1">{change}</p>}
    </div>
);

// Mock data for charts - in a real app, this would come from the service
const revenueData = [
  { name: 'Jan', Receita: 4000 },
  { name: 'Fev', Receita: 3000 },
  { name: 'Mar', Receita: 5000 },
  { name: 'Abr', Receita: 4500 },
  { name: 'Mai', Receita: 6000 },
  { name: 'Jun', Receita: 5500 },
];
const newUsersData = [
  { name: 'Jan', Artistas: 4, Locais: 2 },
  { name: 'Fev', Artistas: 3, Locais: 1 },
  { name: 'Mar', Artistas: 5, Locais: 3 },
  { name: 'Abr', Artistas: 6, Locais: 2 },
  { name: 'Mai', Artistas: 8, Locais: 4 },
  { name: 'Jun', Artistas: 7, Locais: 3 },
];

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>({});
    const [pendingArtists, setPendingArtists] = useState<Artist[]>([]);
    const [openTickets, setOpenTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [statsData, artistsData, ticketsData] = await Promise.all([
                AdminService.getDashboardStats(),
                ArtistService.getAllArtistsForAdmin(),
                SupportService.getAllTickets(),
            ]);
            setStats(statsData);
            setPendingArtists(artistsData.filter(a => a.status === 'pending').slice(0, 5));
            setOpenTickets(ticketsData.filter(t => t.status === 'open').slice(0, 5));
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Painel de Controle</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Receita Bruta (Shows)" value={`R$ ${stats.grossRevenue?.toFixed(2)}`} icon="fa-dollar-sign" color="bg-green-500/30" />
                <StatCard title="Comissão da Plataforma" value={`R$ ${stats.platformCommission?.toFixed(2)}`} icon="fa-wallet" color="bg-blue-500/30" />
                <StatCard title="Total de Artistas" value={stats.totalArtists} icon="fa-users" color="bg-purple-500/30" />
                <StatCard title="Total de Locais" value={stats.totalVenues} icon="fa-store" color="bg-orange-500/30" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Receita (Últimos 6 meses)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                            <Legend />
                            <Bar dataKey="Receita" fill="#EC4899" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Novos Usuários (Últimos 6 meses)</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={newUsersData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#4B5563"/>
                           <XAxis dataKey="name" stroke="#9CA3AF"/>
                           <YAxis stroke="#9CA3AF"/>
                           <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}/>
                           <Legend />
                           <Line type="monotone" dataKey="Artistas" stroke="#EC4899" />
                           <Line type="monotone" dataKey="Locais" stroke="#F97316" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Itens para Ação</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-900/50 rounded-lg">
                            <Link to="/admin/artists" className="flex justify-between items-center mb-2 hover:text-pink-400">
                                <h3 className="font-semibold text-white">Artistas Pendentes</h3>
                                <span className="text-sm font-bold">{stats.pendingArtists}</span>
                            </Link>
                            <div className="space-y-2 text-sm">
                                {pendingArtists.length > 0 ? pendingArtists.map(artist => (
                                    <div key={artist.id} className="text-gray-300">{artist.name}</div>
                                )) : <p className="text-gray-500">Nenhum artista pendente.</p>}
                            </div>
                        </div>
                         <div className="p-4 bg-gray-900/50 rounded-lg">
                             <Link to="/admin/support" className="flex justify-between items-center mb-2 hover:text-pink-400">
                                <h3 className="font-semibold text-white">Tickets de Suporte Abertos</h3>
                                <span className="text-sm font-bold">{openTickets.length}</span>
                            </Link>
                             <div className="space-y-2 text-sm">
                                {openTickets.length > 0 ? openTickets.map(ticket => (
                                    <div key={ticket.id} className="text-gray-300 truncate">Ticket #{ticket.id}: {ticket.description}</div>
                                )) : <p className="text-gray-500">Nenhum ticket aberto.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Atividade Recente</h2>
                    <p className="text-gray-400">Feed de atividades será implementado aqui.</p>
                    {/* Placeholder for recent activity feed */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
