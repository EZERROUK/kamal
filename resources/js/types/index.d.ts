/* ------------------------------------------------------------------
   Déclarations globales – application Inertia + catalogue
------------------------------------------------------------------ */
import { LucideIcon } from 'lucide-react'
import type { Config } from 'ziggy-js'

/* ---------- Navigation / Layout --------------------------------- */
export interface BreadcrumbItem { title: string; href: string }
export interface NavItem {
  title: string
  href?: string
  icon?: LucideIcon | null
  isActive?: boolean
  children?: NavItem[]
}
export interface NavGroup { title: string; items: NavItem[] }

/* ---------- TaxRates ---------------------------------- */
export interface TaxRate {
  id: number;
  name: string;
  rate: number;
   created_at: string
  updated_at: string
  deleted_at: string | null
}

/* ---------- Currencies ---------------------------------- */
export interface Currency {
  id: number
  name: string
  code: string   // e.g. EUR, USD, MAD
  symbol: string // e.g. €, $, د.م.
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

/* ---------- Auth / Utilisateur ---------------------------------- */
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  roles: { name: string }[]
  [key: string]: unknown
}
export interface Auth { user: User }

/* ---------- Données partagées Inertia --------------------------- */
export interface SharedData {
  name: string
  quote: { message: string; author: string }
  auth: Auth
  ziggy: Config & { location: string }
  sidebarOpen: boolean
  [key: string]: any
}
export type PageProps<T = unknown> = SharedData & T

/* ---------- Catalogue ------------------------------------------ */
export interface Category {
  id: number
  name: string
  slug: string
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  price: string
  stock_quantity: number
  currency: Currency
  tax_rate: TaxRate
  category: Category
  is_active: boolean
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
  [key: string]: unknown           // pour champs spécialisés
}
