import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { StorageService } from '../services/StorageService';

const EditGalleryPage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [gallery, setGallery] = useState<string[]>(artist?.gallery || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);


    if (!artist) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }

    const removeImage = async (imageUrl: string) => {
        if (!window.confirm("Tem certeza que deseja remover esta imagem?")) return;

        const success = await StorageService.deleteFile(imageUrl);
        if (!success) {
            showToast("Erro ao remover a imagem do servidor. Tente novamente.", 'error');
            return;
        }
        
        setGallery(prev => prev.filter(url => url !== imageUrl));
        showToast("Imagem removida.", 'success');
    };
    
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (gallery.length >= 4) {
                showToast("Você pode ter no máximo 4 fotos na galeria.", 'info');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('A imagem é muito grande. O limite é de 5MB.', 'error');
                return;
            }

            setIsUploading(true);
            const filePath = `artists/${artist.id}/gallery/${Date.now()}_${file.name}`;
            const publicUrl = await StorageService.uploadFile(file, filePath);
            setIsUploading(false);

            if (publicUrl) {
                setGallery(prev => [...prev, publicUrl]);
                showToast("Imagem adicionada!", 'success');
            } else {
                showToast("Falha no upload da imagem.", 'error');
            }
        }
    };


    const addImage = () => {
        if (gallery.length >= 4) {
            showToast("Você atingiu o limite de 4 fotos na galeria.", 'info');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateArtistProfile({ gallery });
            showToast("Galeria atualizada com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to save gallery:", error);
            showToast("Ocorreu um erro ao salvar a galeria. Tente novamente.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Editar Galeria de Fotos</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                 <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                     <div className="bg-gray-800/50 p-6 rounded-lg">
                        <p className="text-sm text-gray-400 mb-6">Adicione até 4 fotos que serão exibidas em seu perfil público.</p>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {gallery.map((image, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={image} alt={`Foto da galeria ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => removeImage(image)} className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full text-lg" aria-label="Remover imagem">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {isUploading && (
                                <div className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center">
                                    <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                                    <span className="text-sm mt-2 text-gray-400">Enviando...</span>
                                </div>
                            )}
                            
                            {gallery.length < 4 && !isUploading && (
                                 <button type="button" onClick={addImage} className="aspect-square border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-400 hover:text-white font-semibold rounded-lg transition-colors flex flex-col items-center justify-center">
                                    <i className="fas fa-plus text-2xl"></i>
                                    <span className="text-sm mt-2">Adicionar Foto</span>
                                </button>
                            )}
                        </div>
                     </div>
                     
                     <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving || isUploading} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                            {isSaving ? (<><i className="fas fa-spinner fa-spin"></i><span>Salvando...</span></>) : ('Salvar Galeria')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditGalleryPage;
