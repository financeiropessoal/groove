
import React from 'react';
import { Link } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';

const LiveEventPage: React.FC = () => {
    const { currentVenue } = useVenueAuth();

    if (!currentVenue) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    // --- AJUDA PARA DESENVOLVIMENTO LOCAL ---
    // Para testar o QR Code em outros dispositivos (como seu celular) na mesma rede Wi-Fi,
    // você precisa substituir a string vazia abaixo pelo endereço de IP da sua máquina na rede.
    // 1. Encontre o IP da sua máquina (no Windows, use 'ipconfig'; no Mac/Linux, use 'ifconfig').
    // 2. Preencha a variável com o IP e a porta. Exemplo:
    // const DEV_NETWORK_URL = 'http://192.168.0.10:5173';
    //
    // Para produção (quando o site estiver online), deixe esta variável como uma string vazia ('').
    // FIX: Explicitly type DEV_NETWORK_URL as a string to prevent it from being inferred as type 'never' inside a truthiness check.
    const DEV_NETWORK_URL: string = '';

    const generateBaseUrl = () => {
        if (DEV_NETWORK_URL && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            return DEV_NETWORK_URL.endsWith('/') ? DEV_NETWORK_URL : `${DEV_NETWORK_URL}/`;
        }
        
        // window.location.origin provides the canonical base URL (scheme, hostname, port)
        // and correctly resolves the origin even when the page is served via a blob URL.
        // This avoids including the blob's unique path in the base URL.
        const origin = window.location.origin;
        // We append a slash to ensure it's a valid base for constructing the final URL.
        return origin.endsWith('/') ? origin : `${origin}/`;
    };


    const baseUrl = generateBaseUrl();
    const publicUrl = `${baseUrl}#/v/${currentVenue.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="max-w-2xl mx-auto text-center">
                 <div className="flex items-center gap-4 mb-8 text-left">
                    <Link to="/venue-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">QR Code Fixo do Estabelecimento</h1>
                    </div>
                </div>

                <div className="bg-gray-800 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold">Feedback do Público</h2>
                    <p className="text-gray-400 mb-6">Este é o QR Code permanente do seu local. Imprima e coloque nas mesas para que seus clientes possam avaliar os shows que acontecem aqui.</p>
                    <div className="bg-white p-4 inline-block rounded-lg shadow-lg">
                        <img src={qrCodeUrl} alt="QR Code para feedback do seu local" />
                    </div>
                     <p className="text-xs text-gray-500 mt-4">Este QR Code é sempre o mesmo e identificará automaticamente o artista do dia, se ele for da nossa plataforma.</p>
                    
                     <button 
                        onClick={handlePrint} 
                        className="mt-6 w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-shadow hover:shadow-[0_0_20px_rgba(236,72,153,0.7)]"
                    >
                        <i className="fas fa-print mr-2"></i>
                        Baixar para Impressão (PDF)
                    </button>
                    <button
                        onClick={() => window.open(publicUrl, '_blank', 'noopener,noreferrer')}
                        className="mt-4 block w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        <i className="fas fa-eye mr-2"></i>
                        Visualizar Página de Votação (Teste)
                    </button>
                </div>
            </div>

            {/* Hidden printable area */}
            <div id="printable-area" className="hidden">
                <h1>{currentVenue.name}</h1>
                <img src={qrCodeUrl} alt={`QR Code para ${currentVenue.name}`} />
                <p>Aponte a câmera do seu celular para avaliar o show de hoje!</p>
            </div>
        </>
    );
};
export default LiveEventPage;
