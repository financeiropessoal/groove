// pages/admin/AdminAnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsService, AnalyticsData } from '../../services/AnalyticsService';

const StatCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-pink-400 mb-4">{title}</h3>
        {children}
    </div>
);

const COLORS = ['#EC4899', '#F97316', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'];

const AdminAnalyticsPage: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await AnalyticsService.getAnalytics();
            setAnalyticsData(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading || !analyticsData) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Analytics & Relatórios</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <StatCard title="Crescimento de Usuários">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                            <Legend />
                            <Line type="monotone" dataKey="artists" name="Artistas" stroke="#EC4899" strokeWidth={2} />
                            <Line type="monotone" dataKey="venues" name="Locais" stroke="#F97316" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </StatCard>
                <StatCard title="Shows Agendados por Mês">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.bookingsByMonth}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#4B5563"/>
                           <XAxis dataKey="month" stroke="#9CA3AF"/>
                           <YAxis stroke="#9CA3AF"/>
                           <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}/>
                           <Legend />
                           <Bar dataKey="bookings" name="Shows" fill="#8B5CF6" />
                        </BarChart>
                    </ResponsiveContainer>
                </StatCard>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <StatCard title="Top Artistas (Mais Visualizados)">
                    <ul className="space-y-3">
                        {analyticsData.topArtistsByViews.map((artist, index) => (
                            <li key={artist.id} className="flex items-center gap-3 text-sm">
                                <span className="font-bold text-gray-400 w-6 text-center">{index + 1}.</span>
                                <img src={artist.imageUrl} alt={artist.name} className="w-8 h-8 rounded-full object-cover"/>
                                <span className="flex-grow text-white">{artist.name}</span>
                                <span className="text-gray-500">{artist.views} views</span>
                            </li>
                        ))}
                    </ul>
                </StatCard>
                 <StatCard title="Top Artistas (Mais Contratados)">
                    <ul className="space-y-3">
                        {analyticsData.topArtistsByBookings.map((artist, index) => (
                            <li key={artist.id} className="flex items-center gap-3 text-sm">
                                <span className="font-bold text-gray-400 w-6 text-center">{index + 1}.</span>
                                <img src={artist.imageUrl} alt={artist.name} className="w-8 h-8 rounded-full object-cover"/>
                                <span className="flex-grow text-white">{artist.name}</span>
                                <span className="text-gray-500">{artist.bookingCount} shows</span>
                            </li>
                        ))}
                    </ul>
                </StatCard>
                <StatCard title="Gêneros na Plataforma">
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={analyticsData.genreDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="genre"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelStyle={{ fontSize: '12px', fill: '#D1D5DB' }}
                            >
                                {analyticsData.genreDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </StatCard>
             </div>
        </div>
    );
};

export default AdminAnalyticsPage;
