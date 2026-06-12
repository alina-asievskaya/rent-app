import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faBuilding, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './CateringAddRequestsList.css';

interface AddRequest {
    id: number;
    houseId: number;
    houseAddress: string;
    createdAt: string;
    houseTitle: string;
    mainPhoto?: string | null;   // новое поле
}

const CateringAddRequestsList: React.FC = () => {
    const [requests, setRequests] = useState<AddRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchRequests = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5213/api/cateringrequests/incoming', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setRequests(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const updateStatus = async (requestId: number, action: 'approve' | 'reject') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5213/api/cateringrequests/${requestId}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchRequests();
            } else {
                alert(data.message || 'Ошибка');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleHouseDetails = (houseId: number) => {
        navigate(`/house/${houseId}`);
    };

    if (loading) return (
        <div className="profilepage-loading-inner">
            <div className="profilepage-spinner-small"></div>
            <p>Загрузка заявок...</p>
        </div>
    );

    if (requests.length === 0) return (
        <div className="profilepage-empty">
            <FontAwesomeIcon icon={faBuilding} size="3x" />
            <p>Нет заявок на добавление в объявления</p>
        </div>
    );

    return (
        <div className="catering-add-requests-list">
            {requests.map(req => (
                <div key={req.id} className="catering-add-request-card">
                    <div className="request-image">
                        <img 
                            src={req.mainPhoto || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop'} 
                            alt="Фото дома"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop'; }}
                        />
                    </div>
                    <div className="request-info">
                        <div className="request-date-badge">
                            {new Date(req.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                        <h4>{req.houseAddress}</h4>
                        <p className="house-description">{req.houseTitle}</p>
                        <button 
                            className="house-details-button"
                            onClick={() => handleHouseDetails(req.houseId)}
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} /> Подробнее о доме
                        </button>
                    </div>
                    <div className="request-actions">
                        <button className="profilepage-btn-approve" onClick={() => updateStatus(req.id, 'approve')}>
                            <FontAwesomeIcon icon={faCheck} /> Одобрить
                        </button>
                        <button className="profilepage-btn-reject" onClick={() => updateStatus(req.id, 'reject')}>
                            <FontAwesomeIcon icon={faTimes} /> Отклонить
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CateringAddRequestsList;