import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import BookingCalendar from './BookingCalendar';
import CateringSelector from './CateringSelector';
import './BookingModal.css';

Modal.setAppElement('#root');

const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }> = ({ 
  message, type, onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle'
  };

  return (
    <div className={`createad-notification createad-${type}`}>
      <div className="createad-notification-content">
        <i className={`createad-notification-icon ${icons[type]}`}></i>
        <span className="createad-notification-text">{message}</span>
      </div>
      <button className="createad-notification-close" onClick={onClose}>&times;</button>
    </div>
  );
};

interface CateringItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CateringSelection {
    cateringOwnerId: number;
    items: CateringItem[];
}

interface BookingRequestData {
    houseId: number;
    bookingDate: string;
    cateringOwnerId?: number;
    cateringItems?: {
        menuItemId: number;
        name: string;
        price: number;
        quantity: number;
    }[];
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    houseId: number;
    rentType: 'day' | 'month';
    onBookingSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, houseId, rentType, onBookingSuccess }) => {
    const [step, setStep] = useState<'calendar' | 'catering'>('calendar');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'warning') => setNotification({ message, type });
    const closeNotification = () => setNotification(null);

    // При открытии модалки устанавливаем завтрашнюю дату
    useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            setSelectedDate(tomorrow);
            if (rentType === 'month') {
                const end = new Date(tomorrow);
                end.setDate(end.getDate() + 29);
                setSelectedEndDate(end);
            } else {
                setSelectedEndDate(null);
            }
        }
    }, [isOpen, rentType]);

    const resetState = () => {
        setStep('calendar');
        setSelectedDate(null);
        setSelectedEndDate(null);
        setNotification(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleDateSelect = (date: Date | null, endDate?: Date | null) => {
        setSelectedDate(date);
        setSelectedEndDate(endDate || null);
    };

    const handleCalendarNext = () => {
        if (selectedDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysDiff = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            if (daysDiff <= 1) {
                submitBooking(null);
            } else {
                setStep('catering');
            }
        }
    };

    const getCheckInDate = (): Date | null => {
        if (!selectedDate) return null;
        const date = new Date(selectedDate);
        date.setHours(12, 0, 0, 0);
        return date;
    };

    const getCheckOutDate = (): Date | null => {
        if (!selectedDate) return null;
        if (rentType === 'day') {
            const lastDate = selectedEndDate || selectedDate;
            const out = new Date(lastDate);
            out.setDate(out.getDate() + 1);
            out.setHours(12, 0, 0, 0);
            return out;
        } else {
            if (selectedEndDate) {
                const out = new Date(selectedEndDate);
                out.setHours(12, 0, 0, 0);
                return out;
            }
            const out = new Date(selectedDate);
            out.setDate(out.getDate() + 30);
            out.setHours(12, 0, 0, 0);
            return out;
        }
    };

    const formatDateForDisplay = (date: Date): string => {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) + ' в 12:00';
    };

    const submitBooking = async (catering: CateringSelection | null) => {
        if (!selectedDate) return;
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Необходимо авторизоваться', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const startDate = new Date(selectedDate);
            let endDate: Date;
            if (rentType === 'day') {
                endDate = selectedEndDate ? new Date(selectedEndDate) : new Date(selectedDate);
            } else {
                endDate = selectedEndDate ? new Date(selectedEndDate) : new Date(selectedDate);
                endDate.setDate(endDate.getDate() + 29);
            }

            const datesToBook = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                datesToBook.push(new Date(d));
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (const date of datesToBook) {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                if (d <= today) {
                    showNotification('Нельзя забронировать сегодняшний или прошедший день', 'error');
                    setIsSubmitting(false);
                    return;
                }
            }

            if (rentType === 'day' && datesToBook.length > 30) {
                showNotification('Для посуточной аренды нельзя бронировать более 30 дней подряд', 'error');
                setIsSubmitting(false);
                return;
            }

            const bookingRequests = [];
            for (const date of datesToBook) {
                const bookingDateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                const bookingData: BookingRequestData = {
                    houseId,
                    bookingDate: bookingDateUTC.toISOString().split('T')[0]
                };
                if (catering && catering.items.length > 0) {
                    bookingData.cateringOwnerId = catering.cateringOwnerId;
                    bookingData.cateringItems = catering.items.map(item => ({
                        menuItemId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }));
                }
                bookingRequests.push(
                    fetch('http://localhost:5213/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(bookingData),
                    })
                );
            }

            const responses = await Promise.all(bookingRequests);
            const results = await Promise.all(responses.map(r => r.json()));
            const allSuccess = results.every(r => r.success === true || r.success === undefined);

            if (allSuccess) {
                const daysCount = datesToBook.length;
                const message = rentType === 'month' 
                    ? `Заявка на бронирование на месяц (${daysCount} дней) отправлена` 
                    : `Заявка на бронирование на ${daysCount} суток отправлена`;
                showNotification(message, 'success');
                onBookingSuccess();
                setTimeout(handleClose, 1500);
            } else {
                const errorMessages = results.filter(r => !r.success && r.message).map(r => r.message);
                showNotification(errorMessages[0] || 'Ошибка при бронировании некоторых дат', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Ошибка сети', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCateringComplete = (selection: CateringSelection) => submitBooking(selection);
    const handleCateringSkip = () => submitBooking(null);

    const checkIn = getCheckInDate();
    const checkOut = getCheckOutDate();
    const daysCount = selectedDate && selectedEndDate 
        ? Math.ceil((selectedEndDate.getTime() - selectedDate.getTime()) / (1000*60*60*24)) + 1
        : (selectedDate ? 1 : 0);

    return (
        <Modal isOpen={isOpen} onRequestClose={handleClose} className="booking-modal" overlayClassName="booking-modal-overlay">
            {notification && <Notification message={notification.message} type={notification.type} onClose={closeNotification} />}
            <div className="modal-header">
                <h2>Бронирование дома {rentType === 'month' ? '(помесячно)' : '(посуточно)'}</h2>
                <button onClick={handleClose} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
                {step === 'calendar' && (
                    <div className="calendar-step">
                        <BookingCalendar
                            houseId={houseId}
                            selectedDate={selectedDate}
                            selectedEndDate={selectedEndDate}
                            onSelectDate={handleDateSelect}
                            bookedDates={[]}
                            rentType={rentType}
                        />
                        {selectedDate && checkIn && checkOut && (
                            <div className="booking-dates-info">
                                <div className="info-row">
                                    <i className="fas fa-sign-in-alt"></i>
                                    <span className="info-label">Заезд:</span>
                                    <span className="info-value">{formatDateForDisplay(checkIn)}</span>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span className="info-label">Выезд:</span>
                                    <span className="info-value">{formatDateForDisplay(checkOut)}</span>
                                </div>
                                <div className="info-note">
                                    <i className="fas fa-info-circle"></i>
                                    <span>
                                        {rentType === 'month' 
                                            ? 'Бронирование на 30 дней' 
                                            : `Количество суток: ${daysCount}`
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="step-actions">
                            <button onClick={handleClose} className="cancel-btn">Отмена</button>
                            <button onClick={handleCalendarNext} className="next-btn" disabled={!selectedDate}>Далее</button>
                        </div>
                    </div>
                )}
                {step === 'catering' && (
                    <CateringSelector houseId={houseId} onComplete={handleCateringComplete} onSkip={handleCateringSkip} />
                )}
            </div>
            {isSubmitting && <div className="loading-overlay">Отправка...</div>}
        </Modal>
    );
};

export default BookingModal;