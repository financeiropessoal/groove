import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { DirectOfferService, EnrichedDirectOffer } from '../services/DirectOfferService';
import { ChatService, Message } from '../services/ChatService';
import { useToast } from '../contexts/ToastContext';
import { DirectGigOffer } from '../data';

const NegotiationPage: React.FC = () => {
    const { offerId } = useParams<{ offerId: string }>();
    const [offer, setOffer] = useState<EnrichedDirectOffer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTerms, setEditedTerms] = useState<Partial<DirectGigOffer>>({});
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { artist, authUser: artistAuthUser } = useAuth();
    const { currentVenue, authUser: venueAuthUser } = useVenueAuth();

    const currentUser = useMemo(() => {
        if (artist && artistAuthUser) return { type: 'artist' as const, id: artist.id };
        if (currentVenue && venueAuthUser) return { type: 'venue' as const, id: currentVenue.id };
        return null;
    }, [artist, artistAuthUser, currentVenue, venueAuthUser]);

    useEffect(() => {
        const fetchOffer = async () => {
            if (!offerId) return;
            // This is a simplified fetch; a real app might need a dedicated `getOfferById`
            const allOffers = currentUser?.type === 'artist' 
                ? await DirectOfferService.getAllOffersForArtist(currentUser.id)
                : await DirectOfferService.getAllOffersForVenue(currentUser!.id);
            
            const foundOffer = allOffers.find(o => o.id === Number(offerId));
            if (foundOffer) {
                setOffer(foundOffer);
                setEditedTerms({
                    date: foundOffer.date,
                    startTime: foundOffer.startTime,
                    endTime: foundOffer.endTime,
                    payment: foundOffer.payment,
                });
            }
            setIsLoading(false);
        };
        fetchOffer();
    }, [offerId, currentUser]);
    
    const handleProposeChanges = async () => {
        if (!offer) return;
        await DirectOfferService.updateOfferTerms(offer.id, editedTerms);
        showToast('Contraproposta enviada!', 'success');
        setIsEditing(false);
        // Refetch or update state
        setOffer(prev => prev ? ({...prev, ...editedTerms, status: 'countered'}) : null);
    };

    const handleAccept = async () => {
        if (!offer) return;
        const success = await DirectOfferService.acceptOffer(offer);
        if (success) {
            showToast('Proposta aceita! O show foi adicionado à sua agenda.', 'success');
            // TODO: Redirect to payment page for venue, or Gig Hub for artist
            navigate(currentUser?.type === 'artist' ? '/direct-offers' : '/sent-offers');
        } else {
            showToast('Erro ao aceitar a proposta.', 'error');
        }
    };
    
    const handleDecline = async () => {
        if (!offer || !window.confirm('Tem certeza que deseja recusar esta proposta?')) return;
        const success = await DirectOfferService.updateOfferStatus(offer.id, 'declined');
        if (success) {
            showToast('Proposta recusada.', 'info');
             navigate(currentUser?.type === 'artist' ? '/direct-offers' : '/sent-offers');
        } else {
             showToast('Erro ao recusar a proposta.', 'error');
        }
    };
    
    if (isLoading || !offer) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    const otherParty = currentUser?.type === 'artist' ? offer.venue : offer.artist;
    const canEdit = offer.status === 'pending' || offer.status === 'countered';

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <Link to={currentUser?.type === 'artist' ? '/direct-offers' : '/sent-offers'} className="text-gray-400 hover:text-white transition-colors">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <h1 className="text-3xl font-bold">Central de Negociação</h1>
            </div>
            <p className="text-gray-400 mb-6">Negociação com <span className="font-semibold text-white">{otherParty?.name}</span></p>

            <div className="bg-gray-800 p-6 rounded-lg space-y-6">
                <div>
                    <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
                        Termos da Proposta
                        {canEdit && !isEditing && <button onClick={() => setIsEditing(true)} className="text-sm bg-blue-600 px-3 py-1 rounded">Fazer Contraproposta</button>}
                    </h2>
                    {isEditing ? (
                        <div className="space-y-4 bg-gray-900/50 p-4 rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400">Data</label>
                                    <input type="date" value={editedTerms.date} onChange={e => setEditedTerms({...editedTerms, date: e.target.value})} className="w-full bg-gray-800 p-2 rounded mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Cachê (R$)</label>
                                    <input type="number" value={editedTerms.payment} onChange={e => setEditedTerms({...editedTerms, payment: Number(e.target.value)})} className="w-full bg-gray-800 p-2 rounded mt-1" />
                                </div>
                                 <div>
                                    <label className="text-xs text-gray-400">Início</label>
                                    <input type="time" value={editedTerms.startTime} onChange={e => setEditedTerms({...editedTerms, startTime: e.target.value})} className="w-full bg-gray-800 p-2 rounded mt-1" />
                                </div>
                                 <div>
                                    <label className="text-xs text-gray-400">Fim</label>
                                    <input type="time" value={editedTerms.endTime} onChange={e => setEditedTerms({...editedTerms, endTime: e.target.value})} className="w-full bg-gray-800 p-2 rounded mt-1" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsEditing(false)} className="bg-gray-600 px-4 py-2 rounded text-sm">Cancelar</button>
                                <button onClick={handleProposeChanges} className="bg-pink-600 px-4 py-2 rounded text-sm">Enviar Contraproposta</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><p className="text-sm text-gray-400">Data</p><p className="font-semibold">{new Date(offer.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p></div>
                            <div><p className="text-sm text-gray-400">Horário</p><p className="font-semibold">{offer.startTime} - {offer.endTime}</p></div>
                            <div><p className="text-sm text-gray-400">Cachê</p><p className="font-semibold text-green-400">R$ {offer.payment.toFixed(2)}</p></div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-700 pt-6">
                    <h2 className="text-xl font-bold mb-4">Chat da Proposta</h2>
                    <div className="bg-gray-900/50 p-4 rounded-md h-48 overflow-y-auto">
                        <p className="text-sm text-gray-500 text-center">-- O chat será implementado aqui --</p>
                        {/* Chat messages would be rendered here */}
                    </div>
                </div>

                {canEdit && (
                    <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button onClick={handleDecline} className="bg-red-800 px-6 py-3 rounded-lg font-semibold">Recusar Proposta</button>
                        <button onClick={handleAccept} className="bg-green-600 px-6 py-3 rounded-lg font-semibold">Aceitar Termos Atuais</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NegotiationPage;