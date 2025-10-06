import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Testimonial } from '../data';
import { PublicRating } from '../types';
import { PublicRatingService } from '../services/PublicRatingService';
import EmptyState from '../components/EmptyState';
import StarRatingDisplay from '../components/StarRatingDisplay';

const FeedbackPage: React.FC = () => {
    const { artist } = useAuth();
    const [activeTab, setActiveTab] = useState<'venues' | 'public'>('venues');
    const [publicRatings, setPublicRatings] = useState<PublicRating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const testimonials = artist?.testimonials || [];

    useEffect(() => {
        if (artist) {
            setIsLoading(true);
            PublicRatingService.getRatingsForArtist(artist.id).then(data => {
                setPublicRatings(data);
                setIsLoading(false);
            });
        }
    }, [artist]);

    const TabButton: React.FC<{tab: 'venues' | 'public', label: string}> = ({tab, label}) => (
        <button onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === tab ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Feedback Recebido</h1>
                    <p className="text-gray-400">Veja o que contratantes e o público estão dizendo sobre você.</p>
                </div>
            </div>

            <div className="border-b border-gray-700 mb-6">
                <nav className="flex justify-center gap-8">
                    <TabButton tab="venues" label="De Contratantes" />
                    <TabButton tab="public" label="Do Público" />
                </nav>
            </div>
            
            <div className="max-w-3xl mx-auto">
                {activeTab === 'venues' && (
                     testimonials.length > 0 ? (
                        <div className="space-y-4">
                            {testimonials.map((testimonial, index) => (
                                 <blockquote key={index} className="relative p-6 bg-gray-800 rounded-lg">
                                    <div className="absolute top-2 left-2 text-6xl text-gray-700 opacity-50 z-0">
                                        <i className="fas fa-quote-left"></i>
                                    </div>
                                    <p className="text-gray-200 italic z-10 relative text-lg">"{testimonial.quote}"</p>
                                    <footer className="mt-4 text-right text-gray-400">— <span className="font-semibold text-white">{testimonial.author}</span>, {testimonial.source}</footer>
                                </blockquote>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="fa-comments"
                            title="Nenhum depoimento ainda"
                            message="Após realizar shows pela plataforma, os contratantes poderão deixar avaliações que aparecerão aqui e em seu perfil público."
                        />
                    )
                )}

                {activeTab === 'public' && (
                    isLoading ? <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-3xl text-pink-500"></i></div> :
                    publicRatings.length > 0 ? (
                        <div className="space-y-4">
                            {publicRatings.map(rating => (
                                <div key={rating.id} className="bg-gray-800 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <StarRatingDisplay rating={rating.rating} />
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-300">{rating.venueName}</p>
                                            <p className="text-xs text-gray-500">{new Date(rating.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    {rating.comment && <p className="text-gray-300 italic mt-3 text-sm">"{rating.comment}"</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                         <EmptyState
                            icon="fa-qrcode"
                            title="Nenhuma avaliação do público"
                            message="Os contratantes podem gerar um QR Code durante seu show para que o público possa te avaliar. Essas avaliações aparecerão aqui!"
                        />
                    )
                )}
            </div>

        </div>
    );
};

export default FeedbackPage;
