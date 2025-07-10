import { useEffect, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'
import { type NavItem, type SharedData, type AppSettings } from '@/types'
import {
  LayoutGrid, Users, UserCircle, Shield,
  Lock, Activity, Monitor, Folder, Box,
  Settings, ChevronDown, UserCog,
  Warehouse, TrendingUp, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppearance } from '@/hooks/use-appearance'

type Props = SharedData & { settings: AppSettings }

const elementsNavigation: NavItem[] = [
  { title: 'Tableau de bord', href: '/dashboard', icon: LayoutGrid },
  {
    title: 'Gestion des utilisateurs',
    icon: Users,
    children: [
      { title: 'Utilisateurs', href: '/users', icon: UserCircle },
      { title: 'Rôles', href: '/roles', icon: UserCog },
      { title: 'Permissions', href: '/permissions', icon: Lock },
    ],
  },
  {
    title: 'Historique des journaux',
    icon: Activity,
    children: [
      { title: 'Journaux d\'audit', href: '/audit-logs', icon: Activity },
      { title: 'Connexions', href: '/login-logs', icon: Monitor },
    ],
  },
  {
    title: 'Catalogue',
    icon: Folder,
    children: [
      { title: 'Catégories', href: '/categories', icon: Folder },
      { title: 'Produits', href: '/products', icon: Box },
    ],
  },
  {
    title: 'Gestion de stock',
    icon: Warehouse,
    children: [
      {
        title: 'Mouvements de stock',
        href: '/stock-movements',
        icon: TrendingUp,
      },
      {
        title: 'Rapport de stock',
        href: '/stock-movements/report',
        icon: FileText,
      }
    ]
  },
  {
    title: 'Paramètres financiers',
    icon: Settings,
    children: [
      { title: 'TVA', href: '/tax-rates', icon: Activity },
      { title: 'Devises', href: '/currencies', icon: Box },
    ],
  },
]

export function AppSidebar() {
  const { url, props: { settings } } = usePage<Props>()
  const { isDark } = useAppearance()
  const { state: sidebarState } = useSidebar()
  const estRéduit = sidebarState === 'collapsed'
  const [menusOuverts, setMenusOuverts] = useState<string[]>([])

  useEffect(() => {
    elementsNavigation.forEach(item => {
      if (item.children && item.children.some(c => estActif(c.href))) {
        if (!menusOuverts.includes(item.title)) {
          setMenusOuverts(prev => [...prev, item.title])
        }
      }
    })
  }, [url])

  const basculerMenu = (titre: string) =>
    setMenusOuverts(prev =>
      prev.includes(titre)
        ? prev.filter(x => x !== titre)
        : [...prev, titre]
    )

  // Fonction améliorée pour vérifier si un lien est actif
  const estActif = (href?: string) => {
    if (!href) return false

    // Cas spécial pour la racine
    if (href === '/') return url === '/'

    // Vérification exacte d'abord
    if (url === href) return true

    // Vérifier si l'URL courante commence par le href suivi d'un slash
    // mais seulement si ce n'est pas un sous-chemin d'un autre élément
    const allHrefs = getAllHrefs(elementsNavigation)
    const urlStartsWithHref = url.startsWith(href + '/')

    // Trouver tous les hrefs qui sont plus longs que le href actuel
    // et qui commencent par le href actuel
    const longerMatchingHrefs = allHrefs.filter(h =>
      h !== href &&
      h.startsWith(href + '/') &&
      url.startsWith(h)
    )

    // Si on a trouvé des correspondances plus longues, privilégier la plus longue
    return urlStartsWithHref && longerMatchingHrefs.length === 0
  }

  // Fonction helper pour récupérer tous les hrefs de la navigation
  const getAllHrefs = (items: NavItem[]): string[] => {
    const hrefs: string[] = []
    items.forEach(item => {
      if (item.href) hrefs.push(item.href)
      if (item.children) {
        hrefs.push(...getAllHrefs(item.children))
      }
    })
    return hrefs
  }

  const logoUrl = isDark ? settings.logo_dark_url || settings.logo_url : settings.logo_url

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex justify-center py-4">
                <img
                  key={logoUrl}
                  src={logoUrl || '/logo.svg'}
                  alt={settings.app_name}
                  className="h-10 w-auto object-contain rounded"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden text-sidebar-foreground">
        <nav className="space-y-1">
          {elementsNavigation.map(item =>
            item.children ? (
              <div key={item.title}>
                <button
                  onClick={() => basculerMenu(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    menusOuverts.includes(item.title)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                    {!estRéduit && <span className="truncate">{item.title}</span>}
                  </div>
                  {!estRéduit && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        menusOuverts.includes(item.title) && 'rotate-180'
                      )}
                    />
                  )}
                </button>
                {!estRéduit && menusOuverts.includes(item.title) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.title}
                        href={child.href!}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          estActif(child.href)
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        {child.icon && <child.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                        <span className="truncate">{child.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.title}
                href={item.href!}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  estActif(item.href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                )}
              >
                {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                {!estRéduit && <span className="truncate">{item.title}</span>}
              </Link>
            )
          )}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
