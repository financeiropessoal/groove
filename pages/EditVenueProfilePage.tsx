import React, { useState, useRef } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Venue } from '../data';
import { useToast } from '../contexts/ToastContext';
import { StorageService } from '../services/StorageService';

// Helper component for list inputs
const ListEditor: React.FC<{
    title: string;
    items: string[];
    onItemsChange: (newItems: string[]) => void;
    placeholder: string;
}> = ({ title, items, onItemsChange, placeholder }) => {

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onItemsChange(newItems);
    };

    const addItem = () => {
        onItemsChange([...items, '']);
    };

    const removeItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder={placeholder}
                        />
                        <button type="button" onClick={() => removeItem(index)} className="text-gray-500 hover:text-red-500 p-2"><i className="fas fa-minus-circle"></i></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors"><i className="fas fa-plus mr-2"></i>Adicionar item</button>
        </div>
    );
};


const EditVenueProfilePage: React.FC = () => {
    const { currentVenue, logout, updateVenueProfile } = useVenueAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const galleryFileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: currentVenue?.name || '',
        address: currentVenue?.address || '',
        imageUrl: currentVenue?.imageUrl || '',
        description: currentVenue?.description || '',
        musicStyles: currentVenue?.musicStyles?.join(', ') || '',
        capacity: currentVenue?.capacity || '',
        contactName: currentVenue?.contact?.name || '',
        contactPhone: currentVenue?.contact?.phone || '',
        website: currentVenue?.website || '',
        instagram: currentVenue?.socials?.instagram || '',
        equipment: currentVenue?.equipment || [],
    });

    const [photos, setPhotos] = useState<string[]>(currentVenue?.photos || []);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(formData.imageUrl);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    
    if (!currentVenue) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do local...</p>
            </div>
        );
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('A imagem é muito grande. O limite é de 5MB.', 'error');
                return;
            }
            setProfileImageFile(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (photos.length >= 4) {
                showToast("Você pode ter no máximo 4 fotos na galeria.", 'info'); return;
            }
            if (file.size > 5 * 1024 * 1024) { showToast('A imagem é muito grande (Máx 5MB).', 'error'); return; }

            setIsUploading(true);
            const filePath = `venues/${currentVenue.id}/gallery/${Date.now()}_${file.name}`;
            const publicUrl = await StorageService.uploadFile(file, filePath);
            setIsUploading(false);

            if (publicUrl) {
                setPhotos(prev => [...prev, publicUrl]);
                showToast("Imagem adicionada à galeria!", 'success');
            } else {
                showToast("Falha no upload da imagem.", 'error');
            }
        }
    };

    const removeGalleryImage = async (imageUrl: string) => {
        if (!window.confirm("Remover esta imagem da galeria?")) return;
        const success = await StorageService.deleteFile(imageUrl);
        if (success) {
            setPhotos(prev => prev.filter(url => url !== imageUrl));
            showToast("Imagem removida.", 'success');
        } else {
            showToast("Erro ao remover a imagem.", 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        let uploadedImageUrl = formData.imageUrl;
        if (profileImageFile) {
            const filePath = `venues/${currentVenue.id}/profile.jpg`;
            const publicUrl = await StorageService.uploadFile(profileImageFile, filePath);
            if (publicUrl) {
                uploadedImageUrl = publicUrl;
            } else {
                showToast("Erro ao fazer upload da imagem de perfil.", 'error');
                setIsSaving(false);
                return;
            }
        }
        
        const venueUpdatePayload: Partial<Venue> = {
            name: formData.name,
            address: formData.address,
            imageUrl: uploadedImageUrl,
            description: formData.description,
            musicStyles: formData.musicStyles.split(',').map(s => s.trim()).filter(Boolean),
            capacity: Number(formData.capacity) || undefined,
            contact: { name: formData.contactName, phone: formData.contactPhone },
            website: formData.website,
            socials: { instagram: formData.instagram },
            photos: photos.filter(Boolean),
            equipment: formData.equipment.filter(Boolean),
        };

        try {
            await updateVenueProfile(venueUpdatePayload);
            showToast("Perfil do local atualizado com sucesso!", 'success');
            navigate('/venue-dashboard');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/venue-dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Editar Perfil do Local</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-gray-800/50 p-8 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <div className="border-b border-gray-700 pb-8">
                             <h2 className="text-2xl font-bold text-white mb-2">Imagem Principal</h2>
                             <p className="text-sm text-gray-400 -mt-2 mb-6">Esta é a imagem que aparece no card do seu estabelecimento.</p>
                             <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative w-48 h-32 shrink-0">
                                    {profileImagePreview ? (
                                        <img src={profileImagePreview} alt="Pré-visualização" className="w-full h-full object-cover rounded-lg shadow-md bg-gray-900" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-center p-2"><i className="fas fa-image text-3xl text-gray-600"></i></div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="profileImageUpload" className="cursor-pointer bg-gray-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                                        {profileImagePreview ? 'Trocar Imagem' : 'Escolher Imagem'}
                                    </label>
                                    <input id="profileImageUpload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleProfileImageChange} className="hidden" />
                                    <p className="text-xs text-gray-500 mt-2">Use uma imagem horizontal (paisagem). Máx 5MB.</p>
                                </div>
                             </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Informações Gerais</h2>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Nome do Estabelecimento</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
                                <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Descrição do Local</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Fale sobre o ambiente, o público, a proposta da casa..."></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                    <label htmlFor="musicStyles" className="block text-sm font-medium text-gray-300 mb-2">Estilos Musicais (separados por vírgula)</label>
                                    <input id="musicStyles" name="musicStyles" type="text" value={formData.musicStyles} onChange={handleChange} placeholder="Ex: MPB, Samba, Rock Clássico" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div>
                                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-300 mb-2">Capacidade (Nº de Pessoas)</label>
                                    <input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-8 border-t border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-2">Contato & Mídia</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-2">Nome do Contato Principal</label>
                                    <input id="contactName" name="contactName" type="text" value={formData.contactName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div>
                                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-300 mb-2">Telefone de Contato</label>
                                    <input id="contactPhone" name="contactPhone" type="text" value={formData.contactPhone} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                    <input id="website" name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                                    <div>
                                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                                    <input id="instagram" name="instagram" type="url" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-700">
                            <ListEditor
                                title="Equipamentos Disponíveis no Local"
                                items={formData.equipment}
                                onItemsChange={(newItems) => setFormData(p => ({ ...p, equipment: newItems }))}
                                placeholder="Ex: 2 Caixas Ativas, Mesa de Som 8 canais"
                            />
                        </div>
                        
                        <div className="pt-8 border-t border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-3">Galeria de Fotos (Máx. 4)</h3>
                             <input type="file" ref={galleryFileInputRef} onChange={handleGalleryFileSelect} accept="image/png, image/jpeg, image/webp" className="hidden"/>
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {photos.map((img, i) => (
                                    <div key={i} className="relative group aspect-square">
                                        <img src={img} className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" onClick={() => removeGalleryImage(img)} className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full text-lg"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                                {isUploading && <div className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center"><i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i><span className="text-sm mt-2 text-gray-400">Enviando...</span></div>}
                                {photos.length < 4 && !isUploading && (
                                    <button type="button" onClick={() => galleryFileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-400 hover:text-white rounded-lg flex flex-col items-center justify-center"><i className="fas fa-plus text-2xl"></i><span className="text-sm mt-2">Adicionar</span></button>
                                )}
                             </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                            <button type="button" onClick={() => navigate('/venue-dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || isUploading}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2"
                            >
                               {isSaving ? (
                                   <>
                                       <i className="fas fa-spinner fa-spin"></i>
                                       <span>Salvando...</span>
                                   </>
                               ) : (
                                   'Salvar Alterações'
                               )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditVenueProfilePage;
