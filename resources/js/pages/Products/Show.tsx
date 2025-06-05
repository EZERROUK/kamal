import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
  ArrowLeft, Pencil, Info, Sliders,
  Image as GalleryIcon, FileText, Link2,
  Hash, Calendar, Store, BadgeEuro, Tag, Layers, Package,
} from 'lucide-react'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import type { PageProps, Product as ProductType, CompatibilityItem } from '@/types'

import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

/* ------------------------------------------------------------------ */
/* Types & props                                                      */
/* ------------------------------------------------------------------ */
type Tab = 'details' | 'specs' | 'gallery' | 'description' | 'compat'

interface Props extends PageProps<{
  product: ProductType & {
    images?: {                   // ← optionnel
      id: number; path: string; is_primary: boolean; deleted_at: string|null;
    }[]
    /* spécialisations camelCase (facultatives) */
    ram?: Record<string, any>;           processor?: Record<string, any>;
    hardDrive?: Record<string, any>;     powerSupply?: Record<string, any>;
    motherboard?: Record<string, any>;   networkCard?: Record<string, any>;
    graphicCard?: Record<string, any>;   license?: Record<string, any>;
    software?: Record<string, any>;      accessory?: Record<string, any>;
    laptop?: Record<string, any>;        desktop?: Record<string, any>;
    server?: Record<string, any>;
  }
  allCompatibilities?: CompatibilityItem[]   // optionnel
}> {}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function ShowProduct({

  product,
  allCompatibilities = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [open, setOpen]           = useState<number | false>(false)

  /* ---------------------------------------------------------------- */
  /* Données dérivées                                                 */
  /* ---------------------------------------------------------------- */
  const imgs       = product.images ?? []
  const slides     = imgs.map(i => ({ src: `/storage/${i.path}`, alt: product.name }))
  const primaryImg = imgs.find(i => i.is_primary) ?? imgs[0]

  const isDeleted  = !!product.deleted_at
  const created    = new Date(product.created_at!)
  const updated    = product.updated_at ? new Date(product.updated_at) : null

  const specs = [
    ['RAM',          product.ram],
    ['Processeur',   product.processor],
    ['Disque dur',   product.hardDrive],
    ['Alimentation', product.powerSupply],
    ['Carte mère',   product.motherboard],
    ['Carte réseau', product.networkCard],
    ['Carte graphique', product.graphicCard],
    ['Licence',      product.license],
    ['Logiciel',     product.software],
    ['Accessoire',   product.accessory],
    ['Laptop',       product.laptop],
    ['Desktop',      product.desktop],
    ['Serveur',      product.server],
  ].filter(([, v]) => v)

  const humanize = (k: string) =>
    k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <>
      <Head title={`Produit – ${product.name}`} />

      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Produits',  href: '/products' },
        { title: product.name, href: route('products.show', product.id) },
      ]}>

        {/* -------- Bandeau haut -------- */}
        <div className="p-6 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-32 h-32 flex items-center justify-center bg-gray-50 border rounded-lg overflow-hidden">
              {primaryImg
                ? <img
                    src={`/storage/${primaryImg.path}`}
                    alt={product.name}
                    className={`w-full h-full ${
                      primaryImg.path.toLowerCase().endsWith('.png')
                        ? 'object-contain' : 'object-cover'
                    }`}
                  />
                : <Package className="w-12 h-12 text-gray-400" />}
            </div>

            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-sm text-gray-500">{product.category?.name}</p>
              <p className="text-sm"><span className="font-medium">Modèle :</span> {product.model ?? '—'}</p>
              <p className="text-sm"><span className="font-medium">Stock :</span> {product.stock_quantity}</p>
              {isDeleted
                ? <Badge text="Désactivé" color="red" />
                : <Badge text="Actif"      color="green" />}
            </div>

            <div className="flex flex-col gap-2">
              <Link href={route('products.index')}>
                <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1" />Retour</Button>
              </Link>
              {!isDeleted && (
                <Link href={route('products.edit', product.id)}>
                  <Button><Pencil className="w-4 h-4 mr-1" />Modifier</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* -------- Onglets -------- */}
        <div className="flex-grow p-6">
          <div className="bg-white rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 min-h-[350px]">
            {/* liste des tabs */}
            <div className="border-r flex flex-col">
              {(['details','specs','gallery','description','compat'] as Tab[]).map(tab => (
                <TabButton key={tab} tab={tab} active={activeTab} setActive={setActiveTab} />
              ))}
            </div>

            {/* contenu */}
            <div className="p-6 md:col-span-3 overflow-y-auto">
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Detail icon={Hash}    label="SKU"        value={product.sku} />
                  <Detail icon={Tag}     label="Marque"     value={product.brand?.name} />
                  <Detail icon={BadgeEuro} label="Prix"     value={`${product.price} ${product.currency?.symbol}`} />
                  <Detail icon={Store}   label="Catégorie"  value={product.category?.name} />
                  <Detail icon={Calendar} label="Créé le"   value={created.toLocaleString('fr-FR')} />
                  {updated && <Detail icon={Calendar} label="Mis à jour le" value={updated.toLocaleString('fr-FR')} />}
                </div>
              )}

              {activeTab === 'specs' && (
                specs.length ? specs.map(([label, spec]) => (
                  <div key={label} className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold">{label}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.entries(spec!)
                        .filter(([k]) => !['product_id','created_at','updated_at','deleted_at'].includes(k))
                        .filter(([,v]) => !(typeof v === 'boolean' && v === false))
                        .map(([k, v]) => (
                          <Detail
                            key={k}
                            icon={Layers}
                            label={humanize(k)}
                            value={typeof v === 'boolean' ? 'Oui' : v ?? '—'}
                          />
                        ))}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 italic">Aucune spécification disponible.</p>
                )
              )}

              {activeTab === 'gallery' && (
                slides.length ? (
                  <GalleryGrid slides={slides} open={open} setOpen={setOpen} />
                ) : (
                  <p className="text-gray-500 italic text-center py-8">Aucune image disponible.</p>
                )
              )}

              {activeTab === 'description' && (
                product.description
                  ? <p className="whitespace-pre-line">{product.description}</p>
                  : <p className="text-gray-400 italic">Aucune description disponible.</p>
              )}

             {activeTab === 'compat' && (
  allCompatibilities.length ? (
    Object.entries(
      allCompatibilities.reduce((acc, c) => {
        const key = c.category ?? 'Autre';
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
      }, {} as Record<string, CompatibilityItem[]>)
    ).map(([cat, items]) => (
      <div key={cat} className="mb-8">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">{cat}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(c => (
            <Link
              key={c.id}
              href={route('products.show', c.id)}
              className="block border rounded-xl p-4 hover:shadow transition bg-white"
            >
              <div className="font-medium text-blue-600 hover:underline truncate">
                {c.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {c.direction === 'uni' ? 'Unidirectionnelle' : 'Bidirectionnelle'}
              </div>
              {c.note && (
                <div className="text-xs text-gray-600 italic mt-1 line-clamp-2">
                  {c.note}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500 italic">Aucune compatibilité enregistrée.</p>
  )
)}

            </div>
          </div>
        </div>
      </AppLayout>

      {/* Lightbox global */}
      <Lightbox
        open={typeof open === 'number'}
        index={open || 0}
        close={() => setOpen(false)}
        slides={slides}
        plugins={[Fullscreen, Thumbnails]}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* UI helpers                                                         */
/* ------------------------------------------------------------------ */
const Badge = ({ text, color }: { text:string; color:'red'|'green' }) => (
  <span className={`inline-block px-2 py-1 text-xs rounded-full
    ${color==='red' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
    {text}
  </span>
)

const Detail = ({ icon: Icon, label, value }:{
  icon: typeof Layers; label:string; value:React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-400 mt-1" />
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
)

const TabButton = ({ tab, active, setActive }:{
  tab:Tab; active:Tab; setActive:(t:Tab)=>void;
}) => {
  const icons:Record<Tab,JSX.Element> = {
    details:<Info className="inline w-4 h-4 mr-2"/>,
    specs:<Sliders className="inline w-4 h-4 mr-2"/>,
    gallery:<GalleryIcon className="inline w-4 h-4 mr-2"/>,
    description:<FileText className="inline w-4 h-4 mr-2"/>,
    compat:<Link2 className="inline w-4 h-4 mr-2"/>,
  }
  const labels:Record<Tab,string> = {
    details:'Détails', specs:'Spécifications', gallery:'Galerie',
    description:'Description', compat:'Compatibilités',
  }
  return (
    <button
      onClick={() => setActive(tab)}
      className={`w-full px-4 py-3 text-left text-sm font-medium transition
        ${active===tab ? 'bg-gray-100 text-gray-900 rounded-l-xl'
                        :'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
      {icons[tab]} {labels[tab]}
    </button>
  )
}

const GalleryGrid = ({ slides, open, setOpen }:{
  slides:{src:string;alt:string}[]; open:number|false; setOpen:(n:number|false)=>void;
}) => (
  <div className="flex flex-wrap gap-4">
    {slides.map((img,i) => {
      const isPng = img.src.toLowerCase().endsWith('.png')
      return (
        <button
          key={i}
          onClick={() => setOpen(i)}
          className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md"
          style={{
            width:120,height:90,
            backgroundColor:'#f8f8f8',
            backgroundImage:isPng
              ? `linear-gradient(45deg,rgba(200,200,200,.2) 25%,transparent 25%,transparent 75%,rgba(200,200,200,.2) 75%),
                 linear-gradient(45deg,rgba(200,200,200,.2) 25%,transparent 25%,transparent 75%,rgba(200,200,200,.2) 75%)`
              :'none',
            backgroundSize:'16px 16px',
            backgroundPosition:'0 0,8px 8px',
          }}
        >
          <img
            src={img.src}
            alt={img.alt}
            className={`w-full h-full ${isPng ? 'object-contain' : 'object-cover'}`}
          />
          {/* overlay + loupe */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="opacity-0 group-hover:opacity-100 z-30 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-lg" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 5a6 6 0 104.24 10.24l4.53 4.53a1 1 0 001.42-1.42l-4.53-4.53A6 6 0 0011 5z" />
              </svg>
            </div>
          </div>
        </button>
      )
    })}
  </div>
)
