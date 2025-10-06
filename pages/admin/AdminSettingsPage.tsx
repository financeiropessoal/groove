import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/AdminService';
import { useToast } from '../../contexts/ToastContext';
import { BannerService } from '../../services/BannerService';
import { PlatformBanner } from '../../types';

const BannerSettings: React.FC = () => {
    const { showToast } = useToast();
    const [settings, setSettings] = useState<Partial<PlatformBanner>>({ is_active: false });
    const [desktopFile, setDesktopFile] = useState<File | null>(null);
    const [mobileFile, setMobileFile] = useState<File | null>(null);
    const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
    const [mobilePreview, setMobilePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        BannerService.getBannerSettings().then(data => {
            if (data) {
                setSettings(data);
                setDesktopPreview(data.desktop_image_url);
                setMobilePreview(data.mobile_image_url);
            }
            setIsLoading(false);
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            if (type === 'desktop') {
                setDesktopFile(file);
                setDesktopPreview(previewUrl);
            } else {
                setMobileFile(file);
                setMobilePreview(previewUrl);
            }
        }
    };

    const handleSaveBanner = async () => {
        setIsSaving(true);
        const result = await BannerService.updateBanner(settings, desktopFile, mobileFile);
        setIsSaving(false);
        if (result) {
            showToast('Banner salvo com sucesso!', 'success');
        } else {
            showToast('Erro ao salvar o banner.', 'error');
        }
    };

    if (isLoading) return <p>Carregando configurações do banner...</p>;

    return (
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-bold mb-4">Gerenciador de Banner Promocional</h2>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-lg font-semibold mb-2">Banner para Desktop</label>
                        <p className="text-xs text-gray-400 mb-2">Recomendado: 1920px por 400px</p>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'desktop')} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"/>
                        {desktopPreview && <img src={desktopPreview} alt="Preview Desktop" className="mt-4 rounded-md w-full aspect-[1920/400] object-cover bg-gray-700" />}
                    </div>
                     <div>
                        <label className="block text-lg font-semibold mb-2">Banner para Mobile</label>
                        <p className="text-xs text-gray-400 mb-2">Recomendado: 320px por 100px</p>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'mobile')} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"/>
                        {mobilePreview && <img src={mobilePreview} alt="Preview Mobile" className="mt-4 rounded-md w-full aspect-[320/100] object-cover bg-gray-700" />}
                    </div>
                </div>
                 <div>
                    <label className="block text-lg font-semibold mb-2">Número de WhatsApp (opcional)</label>
                    <p className="text-xs text-gray-400 mb-2">Quando clicado, o banner abrirá uma conversa no WhatsApp.</p>
                     <input
                        type="tel"
                        placeholder="Ex: 5511999998888"
                        value={settings.link_url || ''}
                        onChange={e => {
                            const numericValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
                            setSettings(prev => ({...prev, link_url: numericValue}));
                        }}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Insira o número completo com código do país, sem '+', espaços ou traços.</p>
                </div>
                 <div>
                    <label className="flex items-center gap-3">
                         <input
                            type="checkbox"
                            checked={settings.is_active}
                            onChange={e => setSettings(prev => ({...prev, is_active: e.target.checked}))}
                            className="w-5 h-5 accent-pink-600"
                        />
                        <span className="text-lg font-semibold">Ativar banner no painel do contratante</span>
                    </label>
                </div>
                 <button onClick={handleSaveBanner} disabled={isSaving} className="w-full bg-pink-600 font-bold py-3 rounded-lg mt-4 disabled:bg-gray-500">
                    {isSaving ? 'Salvando...' : 'Salvar Banner'}
                </button>
            </div>
        </div>
    );
}


const AdminSettingsPage: React.FC = () => {
    const [commissionRate, setCommissionRate] = useState<number>(10);
    const [proCommissionRate, setProCommissionRate] = useState<number>(5);
    const [transactionFee, setTransactionFee] = useState<number>(4.99);
    const [payoutFee, setPayoutFee] = useState<number>(3.67);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        AdminService.getPlatformSettings().then(settings => {
            setCommissionRate(settings.commission.standard * 100);
            setProCommissionRate(settings.commission.pro * 100);
            setTransactionFee(settings.paymentGateway.transactionPercent * 100);
            setPayoutFee(settings.paymentGateway.payoutFixed);
            setIsLoading(false);
        });
    }, []);

    const handleSave = () => {
        AdminService.updatePlatformSettings({
            standardRate: commissionRate,
            proRate: proCommissionRate,
            transactionFee: transactionFee,
            payoutFee: payoutFee,
        }).then(success => {
            if (success) {
                showToast('Configurações salvas com sucesso!', 'success');
            } else {
                showToast('Erro ao salvar as configurações.', 'error');
            }
        });
    };

    if (isLoading) return <p>Carregando...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Configurações da Plataforma</h1>
            <div className="max-w-xl bg-gray-800 p-6 rounded-lg space-y-6">
                 <div>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Comissões</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Comissão Padrão (%)</label>
                            <input
                                type="number"
                                value={commissionRate}
                                onChange={e => setCommissionRate(parseFloat(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Comissão PRO (%)</label>
                            <input
                                type="number"
                                value={proCommissionRate}
                                onChange={e => setProCommissionRate(parseFloat(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Taxas do Gateway (Ex: Mercado Pago)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Transação (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={transactionFee}
                                onChange={e => setTransactionFee(parseFloat(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Repasse (Saque) (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={payoutFee}
                                onChange={e => setPayoutFee(parseFloat(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>
                
                <button onClick={handleSave} className="mt-4 w-full bg-pink-600 font-bold py-3 rounded-lg hover:bg-pink-700 transition-colors">
                    Salvar Configurações
                </button>
            </div>
            <BannerSettings />
        </div>
    );
};

export default AdminSettingsPage;
