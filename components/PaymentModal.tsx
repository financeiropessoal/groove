import React, { useState, useEffect } from 'react';
import { BookingService } from '../services/BookingService';
import { PaymentService } from '../services/PaymentService';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingPayload: { artistId: string; venueId: string; planId: number; dates: string[] };
    totalCost: number;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookingPayload, totalCost, onPaymentSuccess }) => {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Conectando ao gateway de pagamento...');

    useEffect(() => {
        if (!isOpen) return;

        setStatus('processing');
        setMessage('Conectando ao gateway de pagamento...');

        const executePaymentAndBooking = async () => {
            // Etapa 1: Processar o pagamento através do serviço de placeholder
            setMessage('Processando pagamento seguro...');
            const paymentResult = await PaymentService.processPayment({
                amount: totalCost,
                description: `Reserva para artista ID: ${bookingPayload.artistId}`,
            });

            if (!paymentResult.success || !paymentResult.transactionId) {
                setMessage(paymentResult.error || 'Falha ao processar o pagamento.');
                setStatus('error');
                return;
            }

            // Etapa 2: Se o pagamento for bem-sucedido, criar o registro da reserva
            setMessage('Confirmando reserva...');
            const bookingSuccess = await BookingService.createBooking(bookingPayload, paymentResult.transactionId);

            if (bookingSuccess) {
                setStatus('success');
                // Aguarda um momento para o usuário ver a mensagem de sucesso antes de fechar
                setTimeout(() => {
                    onPaymentSuccess();
                }, 2000);
            } else {
                setMessage('O pagamento foi aprovado, mas houve um erro ao criar a reserva. Contate o suporte.');
                setStatus('error');
                // Em uma aplicação real, você precisaria de um processo de reconciliação aqui.
            }
        };

        // Inicia o processo logo após a abertura do modal
        const timer = setTimeout(executePaymentAndBooking, 1000);

        return () => clearTimeout(timer);
    }, [isOpen, bookingPayload, totalCost, onPaymentSuccess]);

    if (!isOpen) return null;
    
    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <>
                        <div className="flex justify-center items-center mb-6">
                           <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-center">Processando Pagamento</h2>
                        <p className="text-gray-400 text-center mt-2">Valor: R$ {totalCost.toFixed(2).replace('.', ',')}</p>
                        <p className="text-center text-gray-300 mt-4 h-6">{message}</p>
                    </>
                );
            case 'success':
                return (
                    <>
                        <i className="fas fa-check-circle text-6xl text-green-400 mb-6"></i>
                        <h2 className="text-3xl font-bold">Pagamento Aprovado!</h2>
                        <p className="text-gray-300 mt-2">O show foi confirmado. Você será redirecionado em breve...</p>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <i className="fas fa-times-circle text-6xl text-red-400 mb-6"></i>
                        <h2 className="text-3xl font-bold">Falha no Pagamento</h2>
                        <p className="text-gray-300 mt-2">{message}</p>
                        <button onClick={onClose} className="mt-8 w-full bg-gray-600 font-bold py-3 rounded-lg">Tentar Novamente</button>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md text-white text-center animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentModal;