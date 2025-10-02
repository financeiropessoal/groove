import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookingService, EnrichedBooking } from '../services/BookingService';
import { GoogleGenAI } from '@google/genai';

const toneOptions = ["Animado", "Intimista", "Urgente", "Engraçado", "Informativo"];

const GeneratePostPage: React.FC = () => {
    const { artist, logout } = useAuth();
    const navigate = useNavigate();

    const [upcomingShows, setUpcomingShows] = useState<EnrichedBooking[]>([]);
    const [selectedShowId, setSelectedShowId] = useState<string>('');
    const [selectedTone, setSelectedTone] = useState<string>(toneOptions[0]);
    const [generatedPost, setGeneratedPost] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<string>('');

    useEffect(() => {
        const fetchShows = async () => {
            if (artist) {
                setIsLoading(true);
                const allBookings = await BookingService.getEnrichedBookingsForArtist(artist.id);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const futureShows = allBookings.filter(b => new Date(`${b.date}T00:00:00`) >= today);
                setUpcomingShows(futureShows);
                if (futureShows.length > 0) {
                    setSelectedShowId(String(futureShows[0].id));
                }
                setIsLoading(false);
            }
        };
        fetchShows();
    }, [artist]);

    const handleGeneratePost = async () => {
        if (!artist || !selectedShowId || !selectedTone) return;

        const selectedShow = upcomingShows.find(s => s.id === Number(selectedShowId));
        if (!selectedShow) return;

        setIsGenerating(true);
        setError('');
        setGeneratedPost('');
        setCopySuccess('');

        try {
            // FIX: Use process.env.API_KEY as per Gemini API guidelines.
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                setError("A chave da API de IA não está configurada. Esta funcionalidade está desabilitada.");
                setIsGenerating(false);
                return;
            }
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
                Você é um especialista em marketing de redes sociais para músicos.
                Crie um post para Instagram, curto e impactante, para divulgar um show.
                
                **Detalhes do Show:**
                - Nome do Artista: ${artist.name}
                - Local: ${selectedShow.venueName}
                - Data: ${new Date(`${selectedShow.date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                - Gênero Musical: ${artist.genre.primary}

                **Instruções:**
                - O tom do post deve ser: **${selectedTone}**.
                - Inclua o nome do artista, local e data de forma clara.
                - Use emojis relevantes para deixar o post mais visual e atrativo.
                - Inclua uma chamada para ação clara (ex: "Marque seus amigos!", "Não perca!", "Garanta seu lugar!").
                - Adicione de 3 a 5 hashtags relevantes no final, como #musicaaovivo, #${artist.genre.primary.replace(/\s+/g, '')}, #[NomeDaCidade], #[NomeDoLocal].
                - O texto deve ser escrito em português do Brasil.
                - Retorne APENAS o texto do post, sem nenhuma introdução ou formatação extra.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setGeneratedPost(response.text.trim());

        } catch (err) {
            console.error("Erro ao gerar post com IA:", err);
            setError("Ocorreu um erro ao gerar o post. Verifique sua chave de API e tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPost).then(() => {
            setCopySuccess('Texto copiado para a área de transferência!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Falha ao copiar o texto.');
        });
    };

    if (isLoading) {
        return <div className="text-center py-10">Carregando seus próximos shows...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                            <i className="fas fa-arrow-left"></i>
                        </Link>
                        <h1 className="text-xl font-bold tracking-wider">Gerador de Post (IA)</h1>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-gray-800/50 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-white mb-2">Divulgue seu Show Facilmente</h2>
                    <p className="text-gray-400 mb-6">Use a inteligência artificial para criar o texto perfeito para suas redes sociais.</p>
                    
                    {upcomingShows.length === 0 ? (
                         <div className="text-center py-10 bg-gray-800 rounded-lg">
                            <p className="text-lg text-yellow-400">Você não tem nenhum show futuro agendado.</p>
                            <p className="text-gray-300 mt-2">Adicione shows à sua <Link to="/edit-calendar" className="text-red-400 hover:underline">agenda</Link> para poder divulgá-los.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="show-select" className="block text-lg font-semibold text-gray-200 mb-2">1. Escolha o Show para Divulgar</label>
                                <select 
                                    id="show-select"
                                    value={selectedShowId}
                                    onChange={(e) => setSelectedShowId(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    {upcomingShows.map(show => (
                                        <option key={show.id} value={show.id}>
                                            {new Date(`${show.date}T00:00:00`).toLocaleDateString('pt-BR')} - {show.venueName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-lg font-semibold text-gray-200 mb-2">2. Escolha o Tom da Mensagem</label>
                                <div className="flex flex-wrap gap-3">
                                    {toneOptions.map(tone => (
                                        <button 
                                            key={tone} 
                                            onClick={() => setSelectedTone(tone)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedTone === tone ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="text-center pt-4">
                                <button 
                                    onClick={handleGeneratePost}
                                    disabled={isGenerating || !selectedShowId}
                                    className="w-full md:w-auto bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
                                >
                                    {isGenerating ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Gerando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-magic"></i>
                                            <span>Gerar Texto com IA</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && <p className="text-center text-red-400 mt-4">{error}</p>}

                            {(generatedPost || isGenerating) && (
                                <div className="mt-8 pt-6 border-t border-gray-700">
                                    <h3 className="text-xl font-bold text-white mb-4">Resultado:</h3>
                                    <div className="bg-gray-900 p-4 rounded-lg relative">
                                        <textarea
                                            readOnly
                                            value={generatedPost}
                                            className="w-full h-48 bg-transparent text-gray-200 border-none focus:ring-0 whitespace-pre-wrap"
                                            placeholder={isGenerating ? 'Aguarde, a criatividade está fluindo...' : ''}
                                        />
                                        {generatedPost && (
                                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                <button onClick={copyToClipboard} className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center" title="Copiar Texto">
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                                <button onClick={handleGeneratePost} className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center" title="Gerar Outra Versão">
                                                    <i className="fas fa-sync-alt"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {copySuccess && <p className="text-green-400 text-sm text-center mt-2">{copySuccess}</p>}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GeneratePostPage;
