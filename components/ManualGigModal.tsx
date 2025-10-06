import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ManualGigService, ManualGigPayload } from '../services/ManualGigService';
import { EnrichedBooking } from '../services/BookingService';

interface ManualGigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    gig: EnrichedBooking | null;
}

const ManualGigModal: React.FC<ManualGigModalProps> = ({ isOpen, onClose, onSave, gig }) => {
    const { artist } = useAuth();
    const [formData, setFormData] = useState({
        event_name: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '20:00',
        end_time: '23:00',
        payment: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (gig && gig.isManual) {
            setFormData({
                event_name: gig.venueName || '',
                date: gig.date,
                start_time: gig.startTime || '20:00',
                end_time: gig.endTime || '23:00',
                payment: gig.payment || 0,
            });
        } else {
            // Reset for new gig
            setFormData({
                event_name: '',
                date: new Date().toISOString().split('T')[0],
                start_time: '20:00',
                end_time: '23:00',
                payment: 0,
            });
        }
    }, [gig, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'payment' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!artist) return;
        setIsSaving(true);
        
        const payload: ManualGigPayload = formData;
        let success = false;

        if (gig) {
            const gigId = parseInt(String(gig.id).replace('manual_', ''));
            success = await ManualGigService.updateManualGig(gigId, payload, artist.id, artist.bookedDates || []);
        } else {
            success = await ManualGigService.addManualGig(payload, artist.id, artist.bookedDates || []);
        }
        
        setIsSaving(false);
        if (success) {
            onSave();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{gig ? 'Editar' : 'Adicionar'} Show Externo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-400">Nome do Evento / Local</label>
                        <input name="event_name" value={formData.event_name} onChange={handleChange} required className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-400">Data</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-400">Início</label>
                            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Fim</label>
                            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-400">Cachê (R$)</label>
                        <input name="payment" type="number" step="0.01" value={formData.payment === 0 ? '' : formData.payment} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" placeholder="Opcional" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded font-semibold">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="bg-pink-600 px-4 py-2 rounded font-semibold disabled:opacity-50">
                            {isSaving ? 'Salvando...' : 'Salvar na Agenda'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualGigModal;