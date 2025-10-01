import React, { useState, useEffect } from 'react';
import { Activity, ActivityService } from '../../services/ActivityService';

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `há ${Math.floor(interval)} min`;
    return "agora";
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const config = {
        NEW_ARTIST: { icon: 'fa-user-plus', color: 'text-blue-400', text: <>{activity.details.artistName} <span className="text-gray-400">se cadastrou como artista.</span></> },
        ARTIST_APPROVED: { icon: 'fa-user-check', color: 'text-green-400', text: <>{activity.details.artistName} <span className="text-gray-400">teve seu perfil aprovado.</span></> },
        NEW_VENUE: { icon: 'fa-store', color: 'text-purple-400', text: <>{activity.details.venueName} <span className="text-gray-400">cadastrou um novo local.</span></> },
        NEW_GIG_OFFER: { icon: 'fa-bullhorn', color: 'text-yellow-400', text: <>{activity.details.venueName} <span className="text-gray-400">publicou uma vaga para {activity.details.genre}.</span></> },
        GIG_BOOKED: { icon: 'fa-calendar-check', color: 'text-red-400', text: <>{activity.details.artistName} <span className="text-gray-400">reservou um show no</span> {activity.details.venueName}.</> }
    };
    const { icon, color, text } = config[activity.type];

    return (
        <div className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 ${color}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <p className="text-sm font-semibold">{text}</p>
                <p className="text-xs text-gray-500">{timeAgo(activity.timestamp)}</p>
            </div>
        </div>
    );
};

const AdminActivityPage: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            setIsLoading(true);
            const data = await ActivityService.getRecentActivities();
            setActivities(data);
            setIsLoading(false);
        };
        fetchActivities();
    }, []);

    if (isLoading) {
         return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Atividades da Plataforma</h1>

            <div className="bg-gray-800 p-6 rounded-lg space-y-6">
                {activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                ))}
            </div>
        </div>
    );
};

export default AdminActivityPage;
