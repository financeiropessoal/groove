import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Venue, Plan, SpecialPrice } from '../data';
import { VenueService } from '../services/VenueService';
import { SpecialPriceService } from '../services/SpecialPriceService';
import EmptyState from '../components/EmptyState';
import Tooltip from '../components/Tooltip';

const EditSpecialPricesPage: React.FC = () => {
    const { artist } = useAuth();
    const { showToast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!artist) return;
            setIsLoading(true);
            const [venuesData, specialPricesData] = await Promise.all([
                VenueService.getAllVenues(),
                SpecialPriceService.getSpecialPricesForArtist(artist.id),
            ]);
            setVenues(venuesData);
            setSpecialPrices(specialPricesData);
            setIsLoading(false);
        };
        fetchData();
    }, [artist]);

    const handlePriceChange = (venueId: string, planId: number, newPrice: string) => {
        const priceValue = parseFloat(newPrice) || 0;
        const existingIndex = specialPrices.findIndex(sp => sp.venue_id === venueId && sp.plan_id === planId);

        if (existingIndex > -1) {
            // Update existing special price
            const updated = [...specialPrices];
            updated[existingIndex].special_price = priceValue;
            setSpecialPrices(updated);
        } else {
            // Add new special price if a venue is selected
            if (selectedVenue) {
                const newSpecialPrice: SpecialPrice = {
                    id: Date.now(), // Temp ID
                    artist_id: artist!.id,
                    venue_id: venueId,
                    plan_id: planId,
                    special_price: priceValue,
                    venues: selectedVenue, // Attach venue data
                };
                setSpecialPrices([...specialPrices, newSpecialPrice]);
            }
        }
    };
    
    const handleSave = async (venueId: string) => {
        const pricesForVenue = specialPrices.filter(sp => sp.venue_id === venueId);
        const success = await SpecialPriceService.setSpecialPricesForVenue(artist!.id, venueId, pricesForVenue);
        if (success) {
            showToast('Preços especiais salvos!', 'success');
        } else {
            showToast('Erro ao salvar preços.', 'error');
        }
    };
    
    const handleRemoveVenuePrices = async (venueId: string) => {
        if (!window.confirm("Remover todos os preços especiais para este cliente?")) return;
        
        const success = await SpecialPriceService.deleteSpecialPricesForVenue(artist!.id, venueId);
        if(success) {
            setSpecialPrices(prev => prev.filter(sp => sp.venue_id !== venueId));
            showToast('Preços especiais removidos.', 'success');
        } else {
            showToast('Erro ao remover preços.', 'error');
        }
    };

    const filteredVenues = searchTerm ? venues.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
    
    const venuesWithSpecialPrices = useMemo(() => {
        const venueIds = [...new Set(specialPrices.map(sp => sp.venue_id))];
        return venues.filter(v => venueIds.includes(v.id));
    }, [specialPrices, venues]);

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Clientes Especiais (PRO)</h1>
                    <p className="text-gray-400">Defina preços customizados para seus clientes e parceiros.</p>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <i className="fas fa-plus-circle text-pink-400"></i>
                    Adicionar Novo Cliente Especial
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Busque pelo nome do local ou contratante..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4"
                    />
                    {searchTerm && filteredVenues.length > 0 && (
                        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto">
                            {filteredVenues.map(venue => (
                                <li
                                    key={venue.id}
                                    onClick={() => {
                                        if(!venuesWithSpecialPrices.some(v => v.id === venue.id)) {
                                            setSelectedVenue(venue);
                                        } else {
                                            showToast('Este cliente já está na sua lista.', 'info');
                                        }
                                        setSearchTerm('');
                                    }}
                                    className="p-3 hover:bg-pink-600 cursor-pointer"
                                >
                                    {venue.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            
            {selectedVenue && (
                 <div className="bg-green-800/20 border border-green-500/50 p-6 rounded-lg mb-8 animate-fade-in">
                    <h3 className="text-lg font-bold text-white mb-4">Definir Preços para: {selectedVenue.name}</h3>
                     <div className="space-y-4">
                        {artist?.plans?.map(plan => {
                            const specialPrice = specialPrices.find(sp => sp.venue_id === selectedVenue.id && sp.plan_id === plan.id)?.special_price || '';
                            return (
                                <div key={plan.id} className="grid grid-cols-3 items-center gap-4">
                                    <div>
                                        <p className="font-semibold">{plan.name}</p>
                                        <p className="text-sm text-gray-400">Padrão: R$ {plan.price.toFixed(2)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="Preço Especial (ex: 600)"
                                            value={specialPrice}
                                            onChange={e => handlePriceChange(selectedVenue.id, plan.id, e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setSelectedVenue(null)} className="bg-gray-600 px-4 py-2 rounded font-semibold text-sm">Cancelar</button>
                        <button onClick={() => {handleSave(selectedVenue.id); setSelectedVenue(null);}} className="bg-green-600 px-4 py-2 rounded font-semibold text-sm">Salvar Cliente</button>
                    </div>
                 </div>
            )}
            
            <div className="space-y-6">
                {venuesWithSpecialPrices.length > 0 ? venuesWithSpecialPrices.map(venue => (
                    <div key={venue.id} className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">{venue.name}</h3>
                            <div>
                                <Tooltip text="Remover todos os preços especiais para este cliente">
                                    <button onClick={() => handleRemoveVenuePrices(venue.id)} className="text-gray-500 hover:text-red-500 mr-4"><i className="fas fa-trash"></i></button>
                                </Tooltip>
                                <button onClick={() => handleSave(venue.id)} className="bg-pink-600 px-4 py-2 rounded font-semibold text-sm">Salvar</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {artist?.plans?.map(plan => {
                                const specialPrice = specialPrices.find(sp => sp.venue_id === venue.id && sp.plan_id === plan.id)?.special_price || '';
                                return (
                                    <div key={plan.id} className="grid grid-cols-3 items-center gap-4">
                                        <div>
                                            <p className="font-semibold">{plan.name}</p>
                                            <p className="text-sm text-gray-400">Padrão: R$ {plan.price.toFixed(2)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Preço Especial"
                                                value={specialPrice}
                                                onChange={e => handlePriceChange(venue.id, plan.id, e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )) : (
                    !selectedVenue && <EmptyState icon="fa-tags" title="Nenhum cliente especial adicionado" message="Use a busca acima para encontrar um contratante e definir preços personalizados para ele. É uma ótima forma de fidelizar parceiros!" />
                )}
            </div>
        </div>
    );
};

export default EditSpecialPricesPage;