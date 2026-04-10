import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { apiData, firstImage, safeArray } from '../lib/api-helpers';

interface Variant {
  id: string;
  grindType: string;
  weight: number;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  imageUrls: string[];
  origin: string;
  roastLevel: string;
  flavorNotes: string[];
  stock: number;
  variants: Variant[];
  category: { name: string };
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug) return;
    api.get(`/products/${slug}`)
      .then(r => {
        const apiProduct = apiData<Product>(r);
        setProduct(apiProduct);
        const variants = safeArray<Variant>(apiProduct?.variants);
        if (variants.length) setSelectedVariant(variants[0]);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400">Ürün bulunamadı</p>
    </div>
  );

  const variants = safeArray<Variant>(product.variants);
  const imageUrls = safeArray<string>(product.imageUrls);
  const flavorNotes = safeArray<string>(product.flavorNotes);
  const currentPrice = Number(selectedVariant?.price || product.price || 0);
  const grindTypes = [...new Set(variants.map(v => v.grindType).filter(Boolean))];
  const weights = [...new Set(variants.map(v => v.weight).filter((weight): weight is number => typeof weight === 'number'))].sort((a, b) => a - b);

  const handleAddToCart = () => {
    addItem({
      id: uuidv4(),
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: currentPrice,
      imageUrl: firstImage(imageUrls),
      quantity,
      grindType: selectedVariant?.grindType,
      weight: selectedVariant?.weight,
    });
    toast.success(`${product.name} sepete eklendi`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden mb-4">
            <img
              src={imageUrls[selectedImage] || firstImage(imageUrls)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {imageUrls.length > 1 && (
            <div className="flex gap-3">
              {imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-brand-gold' : 'border-transparent'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-brand-gold text-sm font-semibold uppercase tracking-wide mb-2">{product.category?.name}</p>
          <h1 className="text-3xl font-bold text-brand-brown mb-4">{product.name}</h1>

          <div className="flex gap-4 mb-4 text-sm">
            {product.origin && (
              <div>
                <span className="text-gray-400">{t('product.origin')}: </span>
                <span className="font-medium">{product.origin}</span>
              </div>
            )}
            {product.roastLevel && (
              <div>
                <span className="text-gray-400">{t('product.roast_level')}: </span>
                <span className="font-medium">{product.roastLevel}</span>
              </div>
            )}
          </div>

          {flavorNotes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">{t('product.flavor_notes')}</p>
              <div className="flex flex-wrap gap-2">
                {flavorNotes.map((note) => (
                  <span key={note} className="bg-brand-cream text-brand-brown px-3 py-1 rounded-full text-sm font-medium">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Variants */}
          {weights.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">{t('product.weight')}</p>
              <div className="flex gap-2 flex-wrap">
                {weights.map((w) => {
                  const variant = variants.find(
                    v => v.weight === w && (selectedVariant ? v.grindType === selectedVariant.grindType : true)
                  );
                  return (
                    <button
                      key={w}
                      onClick={() => variant && setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${selectedVariant?.weight === w ? 'bg-brand-brown text-brand-cream border-brand-brown' : 'border-gray-300 hover:border-brand-brown'}`}
                    >
                      {w}g
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {grindTypes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2">{t('product.grind_type')}</p>
              <div className="flex gap-2 flex-wrap">
                {grindTypes.map((grind) => {
                  const variant = variants.find(
                    v => v.grindType === grind && (selectedVariant ? v.weight === selectedVariant.weight : true)
                  );
                  return (
                    <button
                      key={grind}
                      onClick={() => variant && setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${selectedVariant?.grindType === grind ? 'bg-brand-brown text-brand-cream border-brand-brown' : 'border-gray-300 hover:border-brand-brown'}`}
                    >
                      {grind}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Qty */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-brand-brown">
              {currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-lg hover:bg-brand-cream">-</button>
              <span className="px-4 py-2 font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-lg hover:bg-brand-cream">+</button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              {t('product.add_to_cart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
