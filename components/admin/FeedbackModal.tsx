import React, { useState, useEffect } from 'react';
import { Artist } from '../../data';
import { AdminService } from '../../services/AdminService';

interface FeedbackModalProps {
    artist: Artist;
    onClose: () => void;
    onSend: (artist: Artist, message: string) => void;
}

const templates = [
    { id: 'incomplete', label: 'Perfil incompleto', text: 'Seu perfil parece estar incompleto. Por favor, preencha todos os campos, como bio, fotos e vídeo, para que os contratantes possam te conhecer melhor.'},
    { id: 'quality', label: 'Qualidade do conteúdo', text: 'A qualidade das fotos ou do vídeo enviados não atende aos nossos padrões. Recomendamos usar mídias mais profissionais para aumentar suas chances.'},
    { id: 'unprofessional', label: 'Conteúdo inadequado', text: 'Identificamos conteúdo em seu perfil que não está de acordo com nossas diretrizes. Por favor, revise e ajuste as informações.'},
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ artist, onClose, onSend }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [customMessage, setCustomMessage] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    useEffect(() => {
        if(artist.quality_issues && artist.quality_issues.length > 0) {
            handleGenerateAI();
        }
    }, [artist]);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = templates.find(t => t.id === templateId);
        setCustomMessage(template ? template.text : '');
    };

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        const feedback = await AdminService.generateRejectionFeedback(artist.name, artist.quality_issues || ['O perfil precisa de melhorias gerais.']);
        setCustomMessage(feedback);
        setSelectedTemplate('');
        setIsGenerating(false);
    };

    const handleSendClick = () => {
        const finalMessage = `Olá ${artist.name},\n\nAgradecemos seu interesse em fazer parte da Groove Music. No momento, seu perfil precisa de alguns ajustes para ser aprovado. \n\n${customMessage}\n\nApós fazer as alterações, seu perfil será revisado novamente. \n\nAtenciosamente,\nEquipe Groove Music`;
        onSend(artist, finalMessage);
    };

    return (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Enviar Feedback para {artist.name}</h2>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {templates.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => handleTemplateChange(t.id)}
                                className={`px-3 py-1 text-sm rounded-full border-2 ${selectedTemplate === t.id ? 'bg-pink-600 border-pink-600' : 'bg-gray-700 border-gray-600 hover:border-pink-500'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                         <button 
                            onClick={handleGenerateAI}
                            disabled={isGenerating}
                            className="px-3 py-1 text-sm rounded-full border-2 bg-purple-600 border-purple-500 hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                            Gerar com IA
                        </button>
                    </div>
                    <textarea
                        value={customMessage}
                        onChange={e => {
                            setCustomMessage(e.target.value);
                            setSelectedTemplate('');
                        }}
                        rows={8}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3"
                        placeholder="Escreva uma mensagem ou use um template..."
                    />
                </div>
                 <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded font-semibold">Cancelar</button>
                    <button onClick={handleSendClick} className="bg-red-600 px-4 py-2 rounded font-semibold">
                        Enviar e Recusar Perfil
                    </button>
                </div>
            </div>
         </div>
    );
};

export default FeedbackModal;
