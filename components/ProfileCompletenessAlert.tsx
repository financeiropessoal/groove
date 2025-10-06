import React from 'react';
import { Link } from 'react-router-dom';
import { ProfileCompleteness } from '../data';

interface ProfileCompletenessAlertProps {
    completeness: ProfileCompleteness | undefined;
    userType: 'artist' | 'venue' | 'musician';
}

// FIX: Explicitly type `fieldToLinkMap` with a Record type. This provides a clear index signature,
// allowing TypeScript to safely access its properties using a string variable (`field`).
// This resolves an error where the compiler couldn't guarantee `field` was a valid key for the inferred object union type.
const fieldToLinkMap: Record<'artist' | 'venue' | 'musician', Record<string, string>> = {
    artist: {
        'Adicionar uma biografia com pelo menos 50 caracteres.': '/edit-profile',
        'Adicionar uma foto de perfil.': '/edit-profile',
        'Adicionar um vídeo de performance do YouTube.': '/edit-profile',
        'Cadastrar pelo menos um pacote de show.': '/edit-plans',
    },
    venue: {
        'Adicionar uma descrição com pelo menos 50 caracteres.': '/edit-venue-profile',
        'Adicionar uma foto principal do local.': '/edit-venue-profile',
        'Preencher o endereço do local.': '/edit-venue-profile',
        'Especificar os estilos musicais que o local costuma ter.': '/edit-venue-profile',
    },
    musician: {
        'Adicionar uma biografia com pelo menos 30 caracteres.': '/edit-musician-profile',
        'Adicionar uma foto de perfil.': '/edit-musician-profile',
        'Especificar seu instrumento principal.': '/edit-musician-profile',
        'Informar sua cidade de atuação.': '/edit-musician-profile',
    }
};


const ProfileCompletenessAlert: React.FC<ProfileCompletenessAlertProps> = ({ completeness, userType }) => {
    if (!completeness || completeness.is_complete) {
        return null;
    }

    const progress = 100 - (completeness.missing_fields.length * 25); // Simple progress simulation

    return (
        <div className="bg-gray-800 border-l-4 border-yellow-500 p-6 rounded-r-lg mb-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <i className="fas fa-exclamation-triangle text-yellow-400 text-3xl"></i>
                <div>
                    <h2 className="text-xl font-bold text-white">Complete seu perfil para ser descoberto!</h2>
                    <p className="text-gray-300">Seu perfil não ficará visível para outros usuários até que as informações essenciais sejam preenchidas.</p>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                {completeness.missing_fields.map((field, index) => {
                    const link = fieldToLinkMap[userType][field] || '#';
                    return (
                        <Link to={link} key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50 transition-colors">
                            <i className="fas fa-times-circle text-red-500"></i>
                            <span className="text-gray-300">{field}</span>
                            <i className="fas fa-arrow-right text-gray-500 ml-auto"></i>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfileCompletenessAlert;
