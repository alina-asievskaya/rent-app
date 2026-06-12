import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faTimes, faUtensils, faSpinner, faCheckCircle, 
  faClock, faCalendarAlt, faUser, faPhone, faComment 
} from '@fortawesome/free-solid-svg-icons';
import '../pages/ProfilePage.css';
import './CateringOrdersList.css';

interface OrderItem {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
}

interface CateringOrder {
    id: number;
    bookingId: number;
    houseId: number;
    houseAddress: string;
    userName: string;
    userPhone: string;
    userId: number;
    items: OrderItem[];
    status: string;
    createdAt: string;
    bookingDate?: string;
    respondedAt?: string | null;
}

const CateringOrdersList: React.FC = () => {
    const [orders, setOrders] = useState<CateringOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<CateringOrder | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
    const navigate = useNavigate();

    // Функция форматирования цены с иконкой
    const formatPriceWithIcon = (price: number): React.ReactNode => {
        if (price == null || isNaN(price)) return null;
        return (
            <>
                {price} <i className="nbrb-icon">&#xe901;</i>
            </>
        );
    };

    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5213/api/cateringorders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const ordersWithExpiry = data.data.map((order: CateringOrder) => {
                    let isExpired = false;
                    if (order.bookingDate) {
                        const bookingDate = new Date(order.bookingDate);
                        bookingDate.setHours(0, 0, 0, 0);
                        isExpired = bookingDate < today;
                    }
                    if (order.status === 'approved' && isExpired) {
                        return { ...order, status: 'expired' };
                    }
                    return order;
                });
                
                const sortedOrders = ordersWithExpiry.sort((a: CateringOrder, b: CateringOrder) => {
                    const statusOrder: { [key: string]: number } = { pending: 0, approved: 1, expired: 2, rejected: 3 };
                    return (statusOrder[a.status] || 1) - (statusOrder[b.status] || 1);
                });
                setOrders(sortedOrders);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (orderId: number, status: 'approved' | 'rejected') => {
        setActionLoading(orderId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5213/api/cateringorders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert(data.message || 'Ошибка');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка соединения');
        } finally {
            setActionLoading(null);
            setShowModal(false);
            setSelectedOrder(null);
            setModalAction(null);
        }
    };

    const openModal = (order: CateringOrder, action: 'approve' | 'reject') => {
        setSelectedOrder(order);
        setModalAction(action);
        setShowModal(true);
    };

    const handleWriteToClient = async (order: CateringOrder) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Необходимо авторизоваться');
            return;
        }
        try {
            const response = await fetch('http://localhost:5213/api/chats/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    otherUserId: order.userId,
                    houseId: order.houseId
                })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                const chatId = result.data.chat_id;
                navigate(`/chat/${chatId}`);
            } else {
                alert(result.message || 'Не удалось создать чат');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: 'Ожидает', class: 'pending', icon: faClock };
            case 'approved':
                return { text: 'Подтверждён', class: 'approved', icon: faCheckCircle };
            case 'rejected':
                return { text: 'Отклонён', class: 'rejected', icon: faTimes };
            case 'expired':
                return { text: 'Истёк', class: 'expired', icon: faClock };
            default:
                return { text: status, class: 'pending', icon: faClock };
        }
    };

    const handleModalConfirm = () => {
        if (selectedOrder && modalAction) {
            const status: 'approved' | 'rejected' = modalAction === 'approve' ? 'approved' : 'rejected';
            updateStatus(selectedOrder.id, status);
        }
    };

    if (loading) {
        return (
            <div className="catering-orders-loading">
                <div className="profilepage-spinner-small"></div>
                <p>Загрузка заказов...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="catering-orders-empty">
                <FontAwesomeIcon icon={faUtensils} size="3x" />
                <p>Нет заказов на кейтеринг</p>
            </div>
        );
    }

    return (
        <div className="catering-orders-list">
            {orders.map(order => {
                const statusInfo = getStatusInfo(order.status);
                const isPending = order.status === 'pending';
                const totalSum = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                
                return (
                    <div key={order.id} className={`catering-orders-card ${order.status === 'expired' ? 'expired' : ''}`}>
                        <div className="catering-orders-card__content">
                            <div className="catering-orders-header">
                                <h4 className="catering-orders-title">Заказ #{order.id}</h4>
                                <div className={`catering-orders-status ${statusInfo.class}`}>
                                    <FontAwesomeIcon icon={statusInfo.icon} />
                                    <span>{statusInfo.text}</span>
                                </div>
                            </div>
                            
                            <div className="catering-orders-details">
                                <p><FontAwesomeIcon icon={faUtensils} /> <strong>Дом:</strong> {order.houseAddress}</p>
                                {order.bookingDate && (
                                    <p><FontAwesomeIcon icon={faCalendarAlt} /> <strong>Дата бронирования:</strong> {formatDate(order.bookingDate)}</p>
                                )}
                                <p><FontAwesomeIcon icon={faUser} /> <strong>Клиент:</strong> {order.userName}</p>
                                <p><FontAwesomeIcon icon={faPhone} /> <strong>Телефон:</strong> {order.userPhone}</p>
                            </div>

                            <div className="catering-orders-items">
                                <strong>Состав заказа:</strong>
                                <div className="catering-orders-items__list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="catering-orders-item">
                                            <span className="catering-orders-item__name">{item.name}</span>
                                            <span className="catering-orders-item__qty">x{item.quantity}</span>
                                            <span className="catering-orders-item__price">{formatPriceWithIcon(item.price)}</span>
                                            <span className="catering-orders-item__total">{formatPriceWithIcon(item.quantity * item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="catering-orders-total">
                                    <span>Итого:</span> {formatPriceWithIcon(totalSum)}
                                </div>
                            </div>
                        </div>

                        <div className="catering-orders-actions">
                            {isPending ? (
                                <>
                                    <button 
                                        className="catering-orders-btn catering-orders-btn--approve" 
                                        onClick={() => openModal(order, 'approve')}
                                        disabled={actionLoading === order.id}
                                    >
                                        {actionLoading === order.id ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />}
                                        Принять
                                    </button>
                                    <button 
                                        className="catering-orders-btn catering-orders-btn--reject" 
                                        onClick={() => openModal(order, 'reject')}
                                        disabled={actionLoading === order.id}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                        Отклонить
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="catering-orders-btn catering-orders-btn--write" 
                                    onClick={() => handleWriteToClient(order)}
                                >
                                    <FontAwesomeIcon icon={faComment} />
                                    Написать клиенту
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

            {showModal && selectedOrder && (
                <div className="catering-orders-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="catering-orders-modal" onClick={e => e.stopPropagation()}>
                        <div className="catering-orders-modal__header">
                            <h4>{modalAction === 'approve' ? 'Подтверждение заказа' : 'Отклонение заказа'}</h4>
                            <button className="catering-orders-modal__close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="catering-orders-modal__body">
                            <p>
                                {modalAction === 'approve'
                                    ? `Вы уверены, что хотите ПРИНЯТЬ заказ от ${selectedOrder.userName}?`
                                    : `Вы уверены, что хотите ОТКЛОНИТЬ заказ от ${selectedOrder.userName}?`}
                            </p>
                            <div className="catering-orders-modal__warning">
                                {modalAction === 'approve'
                                    ? 'После подтверждения клиент получит уведомление, и заказ будет отмечен как подтверждённый.'
                                    : 'После отклонения клиент получит уведомление об отказе.'}
                            </div>
                        </div>
                        <div className="catering-orders-modal__actions">
                            <button className="catering-orders-modal__cancel" onClick={() => setShowModal(false)}>Отмена</button>
                            <button 
                                className={`catering-orders-modal__confirm ${modalAction === 'approve' ? 'approve' : 'reject'}`}
                                onClick={handleModalConfirm}
                                disabled={actionLoading === selectedOrder.id}
                            >
                                {actionLoading === selectedOrder.id && <FontAwesomeIcon icon={faSpinner} spin />}
                                {modalAction === 'approve' ? 'Да, принять' : 'Да, отклонить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CateringOrdersList;