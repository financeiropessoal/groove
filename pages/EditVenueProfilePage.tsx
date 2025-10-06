import React, { useState, useRef } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Venue } from '../data';
import { useToast } from '../contexts/ToastContext';
import { StorageService } from '../services/StorageService';
import Tooltip from '../components/Tooltip';
import ListEditor from '../components/ListEditor';

const EditVenueProfilePage: React.FC = () => {
    const { currentVenue, updateVenueProfile } = useVenueAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const galleryFileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: currentVenue?.name || '',
        address: currentVenue?.address || '',
        city: currentVenue?.city || '',
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
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(currentVenue?.imageUrl || null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    
    if (!currentVenue) {
         return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
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
            if (photos.length >= 4) { showToast("Você pode ter no máximo 4 fotos na galeria.", 'info'); return; }
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
        setPhotos(prev => prev.filter(url => url !== imageUrl));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        let uploadedImageUrl = currentVenue?.imageUrl || '';
        if (profileImageFile) {
            const filePath = `venues/${currentVenue.id}/profile_${Date.now()}.jpg`;
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
            city: formData.city,
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
        <div className="max-w-4xl mx-auto">
             <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/venue-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                            <i className="fas fa-arrow-left text-2xl"></i>
                        </Link>
                        <div>
                             <h1 className="text-3xl font-bold">Editar Perfil do Local</h1>
                             <p className="text-gray-400">Atualize as informações do seu estabelecimento.</p>
                        </div>
                    </div>
                     <button type="submit" disabled={isSaving || isUploading} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center justify-center gap-2">
                        {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Alterações'}
                    </button>
                </div>
                
                <div className="space-y-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-image text-pink-400"></i>Identidade Visual</h2>
                            <Tooltip text="Mostre o ambiente do seu local. Uma boa foto da fachada ou do palco e uma galeria de eventos anteriores atraem mais artistas.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                               <div className="relative w-48 h-32 shrink-0">
                                   {profileImagePreview ? (
                                       <img src={profileImagePreview} alt="Pré-visualização" className="w-full h-full object-cover rounded-lg shadow-md bg-gray-900" />
                                   ) : (
                                       <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-center p-2"><i className="fas fa-store text-3xl text-gray-600"></i></div>
                                   )}
                               </div>
                               <div>
                                   <label htmlFor="profileImageUpload" className="cursor-pointer bg-gray-700 hover:bg-pink-600 text-white font-semibold py-2.5 px-4 rounded-md transition-colors">
                                       {profileImagePreview ? 'Trocar Imagem Principal' : 'Escolher Imagem'}
                                   </label>
                                   <input id="profileImageUpload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleProfileImageChange} className="hidden" />
                                   <p className="text-xs text-gray-500 mt-2">Use uma imagem horizontal (paisagem). Máx 5MB.</p>
                               </div>
                            </div>
                            <div>
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
                                       <button type="button" onClick={() => galleryFileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-600 hover:border-pink-500 text-gray-400 hover:text-white rounded-lg flex flex-col items-center justify-center transition-colors"><i className="fas fa-plus text-2xl"></i><span className="text-sm mt-2">Adicionar</span></button>
                                   )}
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="bg-gray-800 p-6 rounded-lg">
                         <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-info-circle text-pink-400"></i>Informações do Local</h2>
                            <Tooltip text="Descreva o ambiente, o público e os estilos musicais que você busca. Artistas usam isso para ver se o som deles combina com seu local.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                        <div className="space-y-4">
                           <div>
                               <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Estabelecimento</label>
                               <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Conta</label>
                                <div className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2.5 px-4 text-gray-400">
                                    {currentVenue.contractor_type === 'company' ? 'Pessoa Jurídica (Empresa)' : 'Pessoa Física (Particular)'}
                                </div>
                            </div>
                             <div>
                               <label  className="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
                               <input name="city" type="text" value={formData.city} onChange={handleChange} placeholder="Ex: Curitiba, PR" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                           </div>
                           <div>
                               <label  className="block text-sm font-medium text-gray-300 mb-2">Endereço (Rua, Número, Bairro)</label>
                               <input name="address" type="text" value={formData.address} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-gray-300 mb-2">Descrição do Local</label>
                               <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" placeholder="Fale sobre o ambiente, o público, a proposta da casa..."></textarea>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-2">Estilos Musicais (separados por vírgula)</label>
                                   <input name="musicStyles" type="text" value={formData.musicStyles} onChange={handleChange} placeholder="Ex: MPB, Samba, Rock Clássico" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-2">Capacidade (Nº de Pessoas)</label>
                                   <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                               </div>
                           </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                           <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-cogs text-pink-400"></i>Detalhes Técnicos</h2>
                            <Tooltip text="Liste os equipamentos que você oferece (P.A., mesa de som, microfones). Isso economiza tempo e ajuda o artista a se preparar.">
                               <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                           </Tooltip>
                        </div>
                       <ListEditor
                           title="Equipamentos Disponíveis no Local"
                           items={formData.equipment}
                           onItemsChange={(newItems) => setFormData(p => ({ ...p, equipment: newItems }))}
                           placeholder="Ex: 2 Caixas Ativas, Mesa de Som 8 canais"
                       />
                   </div>
                   
                   <div className="bg-gray-800 p-6 rounded-lg">
                       <div className="flex items-center gap-3 mb-4">
                           <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-address-book text-pink-400"></i>Contato e Redes Sociais</h2>
                           <Tooltip text="Facilite o contato. Informações claras e redes sociais ativas mostram que seu local é profissional e engajado.">
                               <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                           </Tooltip>
                       </div>
                       <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Contato Principal</label>
                                   <input name="contactName" type="text" value={formData.contactName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-2">Telefone de Contato</label>
                                   <input name="contactPhone" type="text" value={formData.contactPhone} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                   <input name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                                   <input name="instagram" type="url" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
            </form>
        </div>
    );
};

export default EditVenueProfilePage;