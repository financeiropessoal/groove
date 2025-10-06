import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SearchAnalyticsData } from '../types';
import { AnalyticsService } from '../services/AnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';

const StatCard: React.FC<{ icon: string; title: string; value: string | number; description: string; }> = ({ icon, title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-4xl font-bold text-white">{value}</p>
                 <p className="text-xs text-gray-500">{description}</p>
            </div>
             <div className="text-2xl text-pink-400">
                <i className={`fas ${icon}`}></i>
            </div>
        </div>
    </div>
);

const InsightCard: React.FC<{ insights: string[] }> = ({ insights }) => (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-lg mb-8 border border-purple-400 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <i className="fas fa-magic"></i>
            Insights da IA para Você
        </h2>
        <ul className="space-y-3">
            {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-purple-100">
                    <i className="fas fa-lightbulb mt-1 text-yellow-300"></i>
                    <span>{insight}</span>
                </li>
            ))}
        </ul>
    </div>
);

const AnalyticsPage: React.FC = () => {
    const { artist } = useAuth();
    const [data, setData] = useState<SearchAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if(artist) {
            AnalyticsService.getSearchAnalytics(artist.id).then(analyticsData => {
                setData(analyticsData);
                setIsLoading(false);
            })
        }
    }, [artist]);

    if (isLoading || !artist || !data) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    const conversionRate = data.searchAppearances > 0 ? (data.profileClicks / data.searchAppearances) * 100 : 0;
    const conversionDiff = conversionRate - data.platformBenchmark.averageConversionRate;

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <h1 className="text-3xl font-bold">Análise de Busca (PRO)</h1>
            </div>
            <p className="text-gray-400 mb-8">Entenda o que os contratantes estão buscando e otimize seu perfil para ser encontrado.</p>
            
            <InsightCard insights={data.aiInsights} />

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon="fa-eye" title="Aparições" value={data.searchAppearances} description="Vezes que seu perfil apareceu nos resultados." />
                <StatCard icon="fa-mouse-pointer" title="Cliques" value={data.profileClicks} description="Vezes que clicaram no seu perfil." />
                <StatCard icon="fa-chart-pie" title="Taxa de Cliques" value={`${conversionRate.toFixed(1)}%`} description="Cliques / Aparições." />
                <StatCard
                    icon={conversionDiff >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}
                    title="Benchmark"
                    value={`${conversionDiff.toFixed(1)}%`}
                    description={`Em relação à média de ${data.platformBenchmark.averageConversionRate.toFixed(1)}% para seu gênero.`}
                />
            </div>

            {/* Profile Views Chart */}
             <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold mb-4">Visualizações de Perfil (Últimos 30 dias)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.profileViewTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                        <Legend />
                        <Line type="monotone" dataKey="views" name="Visualizações" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Your Profile Performance */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Seu Desempenho</h2>
                    <p className="text-sm text-gray-400 mb-4">Termos que mais geraram aparições para seu perfil.</p>
                    <ul className="space-y-2">
                        {data.yourTopKeywords.length > 0 ? data.yourTopKeywords.map(item => (
                            <li key={item.term} className="flex justify-between items-center text-sm bg-gray-900/50 p-2 rounded">
                                <span>{item.term}</span>
                                <span className="font-bold text-gray-300">{item.appearances} aparições</span>
                            </li>
                        )) : <p className="text-sm text-gray-500">Seu perfil ainda não apareceu em buscas relevantes.</p>}
                    </ul>
                </div>

                {/* Genre Trends */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Gêneros em Alta</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.genreTrends} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="genre" stroke="#D1D5DB" width={70} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }} contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                            <Bar dataKey="searches" name="Buscas" barSize={15}>
                                {data.genreTrends.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#EC4899' : '#F97316'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Most Active Venues */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Contratantes Mais Ativos</h2>
                     <ul className="space-y-3">
                        {data.mostActiveVenues.map(venue => (
                            <li key={venue.id} className="flex items-center gap-3">
                                <img src={venue.imageUrl} alt={venue.name} className="w-10 h-10 rounded-full object-cover"/>
                                <div>
                                    <p className="font-semibold text-sm">{venue.name}</p>
                                    <p className="text-xs text-gray-400">Nível de atividade alto</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;