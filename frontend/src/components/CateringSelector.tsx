import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faUtensils, faTrashAlt, faShoppingCart, faTimes } from '@fortawesome/free-solid-svg-icons';
import './CateringSelector.css';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number | null;
    weightGrams: number | null;
    photoUrl: string;
}

interface CateringCompany {
    id: number;
    companyName: string;
}

interface CateringSelectorProps {
    houseId: number;
    onComplete: (selected: { cateringOwnerId: number; items: { id: number; name: string; price: number; quantity: number }[] }) => void;
    onSkip: () => void;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

// Тип для элемента ответа от API /houses/{houseId}/caterings
interface ApiCateringItem {
    cateringOwnerId: number;
    companyName: string;
}

const CateringSelector: React.FC<CateringSelectorProps> = ({ houseId, onComplete, onSkip }) => {
    const [companies, setCompanies] = useState<CateringCompany[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<Map<number, CartItem>>(new Map());
    const [loading, setLoading] = useState(true);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    // Загрузка компаний (одобренные)
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5213/api/houses/${houseId}/caterings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && data.data.length) {
                    const comps: CateringCompany[] = data.data.map((c: ApiCateringItem) => ({
                        id: c.cateringOwnerId,
                        companyName: c.companyName
                    }));
                    setCompanies(comps);
                    setSelectedCompanyId(comps[0].id);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [houseId]);

    // Загрузка меню выбранной компании (публичный эндпоинт)
    useEffect(() => {
        if (!selectedCompanyId) return;
        const fetchMenu = async () => {
            try {
                const res = await fetch(`http://localhost:5213/api/cateringmenu/by-owner/${selectedCompanyId}`);
                const data = await res.json();
                if (data.success) setMenuItems(data.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMenu();
    }, [selectedCompanyId]);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const newCart = new Map(prev);
            const existing = newCart.get(item.id);
            if (existing) {
                newCart.set(item.id, { ...existing, quantity: existing.quantity + 1 });
            } else {
                newCart.set(item.id, {
                    id: item.id,
                    name: item.name,
                    price: item.price || 0,
                    quantity: 1
                });
            }
            return newCart;
        });
    };

    const updateQuantity = (itemId: number, delta: number) => {
        setCart(prev => {
            const newCart = new Map(prev);
            const existing = newCart.get(itemId);
            if (!existing) return prev;
            const newQuantity = existing.quantity + delta;
            if (newQuantity <= 0) {
                newCart.delete(itemId);
            } else {
                newCart.set(itemId, { ...existing, quantity: newQuantity });
            }
            return newCart;
        });
    };

    const removeFromCart = (itemId: number) => {
        setCart(prev => {
            const newCart = new Map(prev);
            newCart.delete(itemId);
            return newCart;
        });
    };

    const clearCart = () => setCart(new Map());

    const totalPrice = Array.from(cart.values()).reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);

    const handleComplete = () => {
        if (!selectedCompanyId) {
            onSkip();
            return;
        }
        onComplete({
            cateringOwnerId: selectedCompanyId,
            items: Array.from(cart.values())
        });
    };

    if (loading) {
        return (
            <div className="catering-loading">
                <div className="spinner"></div>
                <p>Загрузка меню...</p>
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="catering-empty">
                <FontAwesomeIcon icon={faUtensils} size="3x" />
                <p>К этому дому не привязана кейтеринговая компания.</p>
                <button onClick={onSkip} className="skip-btn">Продолжить без кейтеринга</button>
            </div>
        );
    }

    return (
        <div className="catering-selector">
            {/* Верхняя панель */}
            <div className="catering-header">
                <h2>Выберите кейтеринг</h2>
                {companies.length === 1 ? (
                    <div className="company-badge">{companies[0].companyName}</div>
                ) : (
                    <select
                        value={selectedCompanyId || ''}
                        onChange={(e) => {
                            setSelectedCompanyId(Number(e.target.value));
                            setCart(new Map());
                        }}
                        className="company-select"
                    >
                        {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.companyName}</option>
                        ))}
                    </select>
                )}
                <button className="cart-icon-btn" onClick={() => setIsCartModalOpen(true)}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                    {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                </button>
            </div>

            {/* Сетка меню */}
            {selectedCompanyId && menuItems.length > 0 && (
                <div className="menu-grid">
                    {menuItems.map(item => {
                        const cartItem = cart.get(item.id);
                        const quantity = cartItem?.quantity || 0;
                        return (
                            <div key={item.id} className="menu-card">
                                {item.photoUrl && <img src={item.photoUrl} alt={item.name} className="menu-card-image" />}
                                <div className="menu-card-content">
                                    <div className="menu-card-title">{item.name}</div>
                                    <div className="menu-card-desc">{item.description}</div>
                                    <div className="menu-card-footer">
                                        <div className="price-weight">
                                            <span className="price">{item.price} BYN</span>
                                            {item.weightGrams && <span className="weight">{item.weightGrams} г</span>}
                                        </div>
                                        {quantity === 0 ? (
                                            <button onClick={() => addToCart(item)} className="add-to-cart-btn">
                                                Добавить
                                            </button>
                                        ) : (
                                            <div className="quantity-control">
                                                <button onClick={() => updateQuantity(item.id, -1)}>
                                                    <FontAwesomeIcon icon={faMinus} />
                                                </button>
                                                <span>{quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedCompanyId && menuItems.length === 0 && (
                <div className="no-menu">
                    <p>У этой компании пока нет блюд в меню.</p>
                </div>
            )}

            {/* Модальное окно корзины */}
            {isCartModalOpen && (
                <div className="cart-modal-overlay" onClick={() => setIsCartModalOpen(false)}>
                    <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-modal-header">
                            <h3>Ваш заказ</h3>
                            <button className="close-modal" onClick={() => setIsCartModalOpen(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        {cart.size === 0 ? (
                            <p className="empty-cart">Корзина пуста</p>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {Array.from(cart.values()).map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="cart-item-info">
                                                <span className="cart-item-name">{item.name}</span>
                                                <span className="cart-item-price">{item.price} BYN</span>
                                            </div>
                                            <div className="cart-item-controls">
                                                <button onClick={() => updateQuantity(item.id, -1)}>
                                                    <FontAwesomeIcon icon={faMinus} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                                <button onClick={() => removeFromCart(item.id)} className="remove-item">
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-total">
                                    <span>Итого:</span>
                                    <strong>{totalPrice} BYN</strong>
                                </div>
                                <button onClick={clearCart} className="clear-cart">Очистить корзину</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Кнопки действий */}
            <div className="actions">
                <button onClick={onSkip} className="skip-btn">Пропустить кейтеринг</button>
                <button onClick={handleComplete} className="complete-btn" disabled={cart.size === 0}>
                    Завершить бронирование {totalItems > 0 && `(${totalItems})`}
                </button>
            </div>
        </div>
    );
};

export default CateringSelector;