"use client";

import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

function CartButtonComponent() {
  const { state, toggleCart } = useCart();

  const totalItems = useMemo(() => 
    state.items.reduce((sum, item) => sum + item.cantidad, 0),
    [state.items]
  );

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center space-x-2 text-black hover:text-gray-700 transition-colors py-1 px-2 rounded-lg hover:bg-black/5"
      title="Ver carrito de compras"
    >
      {/* Icono del carrito */}
      <div className="w-8 h-8 relative rounded-full overflow-hidden bg-white/10 p-1">
        <Image
          src="/assets/images/Iconos/ico-paso5-carrocompra-q85.webp"
          alt="Carrito de compras"
          fill
          className="object-contain rounded-full"
        />
      </div>
      
      {/* Texto (oculto en móviles) */}
      <span className="hidden sm:inline text-sm font-medium">Carrito</span>
      
      {/* Badge de cantidad */}
      {totalItems > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg">
          {totalItems}
        </div>
      )}
    </button>
  );
}

const CartButton = memo(CartButtonComponent);
export default CartButton;