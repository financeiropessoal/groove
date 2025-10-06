import React from 'react';
import { Artist } from '../../data';
import QualityScoreBadge from './QualityScoreBadge';

interface ArtistApprovalPanelProps {
    artist: Artist;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
    onBlock: () => void;
}

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <h3 className="font-bold text-lg text-pink-400 mb-3 border-b border-gray-700 pb-2 flex items-center gap-3">
            <i className={`fas ${icon} w-5 text-center`}></i>
            {title}
        </h3>
        {children}
    </div>
);


const ArtistApprovalPanel: React.FC<ArtistApprovalPanelProps> = ({ artist, onClose, onApprove, onReject, onBlock }) => {
    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 flex justify-end" onClick={onClose} role="dialog" aria-modal="true">
            <div 
                className="w-full max-w-2xl h-full bg-gray-800 shadow-2xl flex flex-col slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{artist.name}</h2>
                        <p className="text-sm text-gray-400">{artist.genre.primary}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </header>
                
                {/* Body */}
                <main className="flex-grow overflow-y-auto p-6 space-y-6">
                    <Section title="Análise de Qualidade" icon="fa-check-double">
                        <div className="flex items-center gap-4">
                             <QualityScoreBadge score={artist.quality_score} size="large" />
                            {artist.quality_issues && artist.quality_issues.length > 0 ? (
                                <div>
                                    <h4 className="font-semibold text-gray-300">Pontos a melhorar:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-400">
                                        {artist.quality_issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-green-400 font-semibold">Perfil parece ótimo!</p>
                            )}
                        </div>
                    </Section>
                    
                    <Section title="Bio" icon="fa-user-circle">
                        <p className="text-gray-300 whitespace-pre-line text-sm">{artist.bio || <span className="text-gray-500 italic">Bio não preenchida.</span>}</p>
                    </Section>

                     {artist.youtubeVideoId && (
                        <Section title="Vídeo de Performance" icon="fa-video">
                            <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${artist.youtubeVideoId}`} 
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </Section>
                    )}

                    {artist.gallery && artist.gallery.length > 0 && (
                        <Section title="Galeria de Fotos" icon="fa-images">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {artist.gallery.map((img, i) => (
                                    <img key={i} src={img} alt={`Foto ${i+1}`} className="w-full aspect-square object-cover rounded-md" />
                                ))}
                            </div>
                        </Section>
                    )}
                </main>
                
                {/* Footer */}
                <footer className="flex-shrink-0 p-4 border-t border-gray-700 flex flex-col sm:flex-row justify-end gap-3 bg-gray-900">
                    <button onClick={onReject} className="px-4 py-2 bg-yellow-600 text-white rounded font-semibold hover:bg-yellow-500 transition-colors">
                        Recusar com Feedback
                    </button>
                    <button onClick={onBlock} className="px-4 py-2 bg-red-800 text-white rounded font-semibold hover:bg-red-700 transition-colors">
                        Bloquear Direto
                    </button>
                    <button onClick={onApprove} className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-500 transition-colors">
                        Aprovar Artista
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ArtistApprovalPanel;
