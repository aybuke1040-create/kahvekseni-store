import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { firstImage, safeArray } from '../../lib/api-helpers';

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  imageUrls: string[];
  isFeatured: boolean;
  origin: string;
  roastLevel: string;
  flavorNotes: string[];
  stock: number;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const imageUrl = firstImage(product?.imageUrls);
  const flavorNotes = safeArray<string>(product?.flavorNotes);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      price: Number(product.price || 0),
      imageUrl,
      quantity: 1,
    });
    toast.success(`${product.name} sepete eklendi`);
  };

  return (
    <Link to={`/shop/${product.slug}`} className="card group block">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-brand-gold text-white text-xs px-2 py-1 rounded-full font-semibold">
            Öne Çıkan
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold">{t('shop.out_of_stock')}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {product.origin && (
          <p className="text-xs text-brand-gold font-medium uppercase tracking-wide mb-1">{product.origin}</p>
        )}
        <h3 className="font-semibold text-brand-brown text-lg leading-tight mb-1">{product.name}</h3>
        {product.shortDesc && (
          <p className="text-sm text-gray-500 mb-3">{product.shortDesc}</p>
        )}

        {/* Flavor notes */}
        {flavorNotes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {flavorNotes.slice(0, 3).map((note) => (
              <span key={note} className="text-xs bg-brand-cream px-2 py-0.5 rounded-full text-brand-brown-light">
                {note}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-brand-brown">
            {Number(product.price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {t('common.tl')}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary text-sm py-2 px-4"
          >
            {t('shop.add_to_cart')}
          </button>
        </div>
      </div>
    </Link>
  );
}
