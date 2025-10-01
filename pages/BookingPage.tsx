import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { ArtistService } from '../services/ArtistService';
import { BookingService } from '../services/BookingService';
import { Artist, Plan } from '../data';
import { useToast } from '../contexts/ToastContext';

type CheckoutStep = 'review' | 'payment' | 'confirmation';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const { currentVenue } = useVenueAuth();
  
  const [step, setStep] = useState<CheckoutStep>('review');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment form state (dummy)
  const [paymentDetails, setPaymentDetails] = useState({
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      cardholderName: ''
  });

  useEffect(() => {
    const fetchArtist = async () => {
        if (id) {
            setIsLoading(true);
            const fetchedArtist = await ArtistService.getArtistById(id);
            setArtist(fetchedArtist);
            if(fetchedArtist?.plans && fetchedArtist.plans.length > 0) {
                setSelectedPlanId(fetchedArtist.plans[0].id);
            }
            setIsLoading(false);
        }
    };
    fetchArtist();
  }, [id]);

  const selectedDatesStr = searchParams.get('dates');
  const selectedDates = useMemo(() => {
    if (!selectedDatesStr) return [];
    return selectedDatesStr.split(',').map(dateStr => new Date(`${dateStr}T00:00:00`));
  }, [selectedDatesStr]);

  const selectedPlan = useMemo(() => {
      return artist?.plans?.find(p => p.id === selectedPlanId);
  }, [artist, selectedPlanId]);
  
  const totalCost = useMemo(() => {
      if (!selectedPlan) return 0;
      return selectedPlan.price * selectedDates.length;
  }, [selectedPlan, selectedDates]);

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPaymentDetails(prev => ({ ...prev, [name]: value }));
  }

  const handleConfirmBooking = async () => {
    if (!selectedPlan || !currentVenue || selectedDates.length === 0 || !artist) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = await BookingService.createBooking({
        artistId: artist.id,
        venueId: currentVenue.id,
        planId: selectedPlan.id,
        dates: selectedDates.map(d => d.toISOString().split('T')[0])
    });

    setIsProcessing(false);

    if (success) {
        showToast("Reserva confirmada com sucesso!", 'success');
        setStep('confirmation');
    } else {
        showToast("Ocorreu um erro ao processar sua reserva. Tente novamente.", 'error');
        setStep('payment'); // Go back to payment step
    }
  }

  if (isLoading) {
    return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
  }

  if (!artist) {
    return (
        <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Artista não encontrado</h2>
            <Link to="/artists" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">Voltar</Link>
        </div>
    );
  }
  
  const OrderSummary: React.FC = () => (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h2>
          <div className="flex items-center gap-4 mb-4">
              <img src={artist.imageUrl} alt={artist.name} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                  <h3 className="font-bold text-white">{artist.name}</h3>
                  <p className="text-sm text-gray-400">{artist.genre.primary}</p>
              </div>
          </div>
          <div className="space-y-3 text-sm border-t border-gray-700 pt-4">
              <div className="flex justify-between"><span className="text-gray-400">Pacote:</span> <span className="font-semibold">{selectedPlan?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Datas:</span> <span className="font-semibold">{selectedDates.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Valor por show:</span> <span>R$ {selectedPlan?.price.toFixed(2).replace('.',',')}</span></div>
              <div className="flex justify-between text-lg font-bold text-white mt-4 pt-4 border-t border-gray-700">
                  <span>Total:</span>
                  <span className="text-red-500">R$ {totalCost.toFixed(2).replace('.',',')}</span>
              </div>
          </div>
      </div>
  );

  return (
    <div>
        <div className="mb-8">
            <Link to={`/artists/${artist.id}`} className="text-red-500 hover:text-red-400 transition-colors">
                <i className="fas fa-arrow-left mr-2"></i>
                Voltar para o perfil do artista
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <main>
                {step === 'review' && (
                    <div className="bg-gray-800/50 p-8 rounded-lg animate-fade-in">
                        <h1 className="text-3xl font-bold text-white mb-2">1. Revise seu Pedido</h1>
                        <p className="text-gray-400 mb-6">Confirme os detalhes do show e do pacote selecionado.</p>
                        <div className="space-y-4 mb-6">
                            {artist.plans?.map(plan => (
                                <div key={plan.id} onClick={() => setSelectedPlanId(plan.id)} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPlanId === plan.id ? 'border-red-500 bg-gray-800' : 'border-gray-700 hover:border-red-600'}`}>
                                    <h3 className="font-bold text-white">{plan.name}</h3>
                                    <p className="text-sm text-gray-400">{plan.description}</p>
                                    <p className="text-right font-bold text-red-400 mt-2">R$ {plan.price.toFixed(2).replace('.',',')} / show</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep('payment')} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
                            Ir para o Pagamento <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                )}

                {step === 'payment' && (
                    <div className="bg-gray-800/50 p-8 rounded-lg animate-fade-in">
                        <h1 className="text-3xl font-bold text-white mb-2">2. Pagamento</h1>
                        <p className="text-gray-400 mb-6">Insira os dados do seu cartão. O valor será cobrado apenas após a confirmação.</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleConfirmBooking(); }} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-300">Nome no Cartão</label>
                                <input type="text" name="cardholderName" onChange={handlePaymentInputChange} required className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 focus:ring-red-500"/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-300">Número do Cartão</label>
                                <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" onChange={handlePaymentInputChange} required className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 focus:ring-red-500"/>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-300">Validade</label>
                                    <input type="text" name="expiryDate" placeholder="MM/AA" onChange={handlePaymentInputChange} required className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 focus:ring-red-500"/>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-300">CVC</label>
                                    <input type="text" name="cvc" placeholder="123" onChange={handlePaymentInputChange} required className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 focus:ring-red-500"/>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <button type="button" onClick={() => setStep('review')} className="text-sm text-gray-400 hover:text-white">&larr; Voltar</button>
                                <button type="submit" disabled={isProcessing} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-wait">
                                    {isProcessing ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processando...</> : `Pagar R$ ${totalCost.toFixed(2).replace('.',',')}`}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {step === 'confirmation' && (
                    <div className="bg-gray-800/50 p-8 rounded-lg text-center animate-fade-in">
                        <div className="text-6xl text-green-400 mb-4"><i className="fas fa-check-circle"></i></div>
                        <h1 className="text-3xl font-bold text-white mb-2">Reserva Confirmada!</h1>
                        <p className="text-gray-300 mb-6">O show com {artist.name} está agendado. O artista foi notificado e os detalhes estão no seu painel.</p>
                        <p className="text-sm text-gray-400">ID da Transação: #{(Math.random() * 1000000).toFixed(0)}</p>
                        <Link to="/venue-dashboard" className="mt-6 inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors">
                            Ir para Meu Painel
                        </Link>
                    </div>
                )}
            </main>
            <aside className="lg:sticky top-6 self-start">
                <OrderSummary />
            </aside>
        </div>
    </div>
  );
};

export default BookingPage;