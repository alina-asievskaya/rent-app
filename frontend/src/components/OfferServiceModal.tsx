import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './OfferServiceModal.css';  

interface OfferServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const OfferServiceModal: React.FC<OfferServiceModalProps> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !city || !description) {
      onError('Заполните все поля');
      return;
    }
    if (description.length > 2000) {
      onError('Описание не более 2000 символов');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5213/api/ServiceRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: 'catering',
          companyName,
          city,
          description,
        }),
      });
      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
        setCompanyName('');
        setCity('');
        setDescription('');
      } else {
        onError(data.message || 'Ошибка отправки заявки');
      }
    } catch (error) {
      console.error(error);
      onError('Ошибка соединения с сервером');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="offer-service-modal-overlay" onClick={onClose}>
      <div className="offer-service-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="offer-service-modal-header">
          <h3>Предложить кейтеринг</h3>
          <button className="offer-service-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="offer-service-form-group">
            <label>Название компании / ИП *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="offer-service-form-group">
            <label>Город *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="offer-service-form-group">
            <label>Описание услуги *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={2000}
            />
            <small>{description.length}/2000</small>
          </div>
          <div className="offer-service-modal-actions">
            <button type="button" className="offer-service-btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="offer-service-btn-primary" disabled={submitting}>
              {submitting ? 'Отправка...' : <><FontAwesomeIcon icon={faPaperPlane} /> Отправить заявку</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferServiceModal;