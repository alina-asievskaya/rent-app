import React, { useState } from 'react';
import Modal from 'react-modal';
import BookingCalendar from './BookingCalendar';
import CateringSelector from './CateringSelector';
import './BookingModal.css';

Modal.setAppElement('#root');

// Типы для кейтеринга
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

// Тип для отправляемых данных на бекенд
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
    onBookingSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, houseId, onBookingSuccess }) => {
    const [step, setStep] = useState<'calendar' | 'catering'>('calendar');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetState = () => {
        setStep('calendar');
        setSelectedDate(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
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

    const submitBooking = async (catering: CateringSelection | null) => {
        if (!selectedDate) return;
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Необходимо авторизоваться');
            setIsSubmitting(false);
            return;
        }

        const bookingDateUTC = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
        ));
        const bookingDateString = bookingDateUTC.toISOString().split('T')[0];

        const bookingData: BookingRequestData = {
            houseId,
            bookingDate: bookingDateString
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

        try {
            const response = await fetch('http://localhost:5213/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                alert(result.message || 'Ошибка при создании бронирования');
                setIsSubmitting(false);
                return;
            }
            alert('Заявка на бронирование отправлена владельцу дома');
            onBookingSuccess();
            handleClose();
        } catch (error) {
            console.error(error);
            alert('Ошибка сети');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCateringComplete = (selection: CateringSelection) => {
        submitBooking(selection);
    };

    const handleCateringSkip = () => {
        submitBooking(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            className="booking-modal"
            overlayClassName="booking-modal-overlay"
            contentLabel="Бронирование дома"
        >
            <div className="modal-header">
                <h2>Бронирование дома</h2>
                <button onClick={handleClose} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
                {step === 'calendar' && (
                    <div className="calendar-step">
                        <BookingCalendar
                            houseId={houseId}
                            selectedDate={selectedDate}
                            onSelectDate={handleDateSelect}
                            bookedDates={[]}
                        />
                        <div className="step-actions">
                            <button onClick={handleClose} className="cancel-btn">Отмена</button>
                            <button
                                onClick={handleCalendarNext}
                                className="next-btn"
                                disabled={!selectedDate}
                            >
                                Далее
                            </button>
                        </div>
                    </div>
                )}
                {step === 'catering' && (
                    <CateringSelector
                        houseId={houseId}
                        onComplete={handleCateringComplete}
                        onSkip={handleCateringSkip}
                    />
                )}
            </div>
            {isSubmitting && <div className="loading-overlay">Отправка...</div>}
        </Modal>
    );
};

export default BookingModal;