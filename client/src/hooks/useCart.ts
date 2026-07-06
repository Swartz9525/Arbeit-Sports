import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addToCart, removeFromCart, clearCart } from '../features/cart/store/cartSlice';

export function useCart() {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleAddItem = (item: any) => {
    dispatch(addToCart(item));
  };

  const handleRemoveItem = (product: string, size?: string, color?: string) => {
    dispatch(removeFromCart({ product, size, color }));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  return {
    cart,
    addItem: handleAddItem,
    removeItem: handleRemoveItem,
    clear: handleClear,
  };
}
