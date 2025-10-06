import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMusicianAuth } from '../contexts/MusicianAuthContext';
import { useToast } from '../contexts/ToastContext';
import { StorageService } from '../services/StorageService';
import EmptyState from '../components/EmptyState';

const EditMusicianGalleryPage: React.FC = () => {
    const { musician, updateMusicianProfile } = useMusicianAuth();
    const [gallery, setGallery] = useState<string[]>(musician?.gallery || []);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    if (!musician) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            const filePath = `musicians/${musician.id}/gallery/${Date.now()}_${file.name}`;
            const publicUrl = await StorageService.uploadFile(file, filePath);
            setIsUploading(false);

            if (publicUrl) {
                const newGallery = [...gallery, publicUrl];
                setGallery(newGallery);
                await updateMusicianProfile({ gallery: newGallery });
                showToast('Imagem adicionada!', 'success');
            } else {
                showToast('Falha no upload da imagem.', 'error');
            }
        }
    };
    
    const handleRemoveImage = async (imageUrl: string) => {
        if (!window.confirm("Tem certeza que deseja remover esta imagem?")) return;
        
        const originalGallery = [...gallery];
        const newGallery = gallery.filter(img => img !== imageUrl);
        setGallery(newGallery);

        try {
            await updateMusicianProfile({ gallery: newGallery });
            showToast('Imagem removida com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao remover a imagem. Restaurando...', 'error');
            setGallery(originalGallery);
        }
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/musician-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Gerenciar Galeria</h1>
                         <p className="text-gray-400">Adicione ou remova fotos do seu portfólio.</p>
                    </div>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                    className="bg-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-700 disabled:bg-gray-500 flex items-center justify-center gap-2"
                >
                    {isUploading ? <><i className="fas fa-spinner fa-spin"></i>Enviando...</> : <><i className="fas fa-upload"></i>Adicionar Imagem</>}
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            {gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.map((img, index) => (
                        <div key={index} className="relative group aspect-square">
                           <img src={img} alt={`Imagem da galeria ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleRemoveImage(img)} className="w-12 h-12 bg-red-600 text-white rounded-full text-lg flex items-center justify-center hover:bg-red-700">
                                    <i className="fas fa-trash"></i>
                                </button>
                           </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="fa-images"
                    title="Sua galeria está vazia"
                    message="Adicione fotos para mostrar seu trabalho, seu instrumento ou você em ação."
                />
            )}
        </div>
    );
};

export default EditMusicianGalleryPage;