// resources/js/components/AppSidebar.tsx

import { useState, useEffect } from 'react'
import { Link, usePage } from '@inertiajs/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavFooter } from '@/components/nav-footer'
import { NavUser }   from '@/components/nav-user'
import { type NavItem, type SharedData } from '@/types'
import {
  LayoutGrid, Users, UserCircle, Shield,
  Lock, Activity, Monitor, Folder, Box,
  Settings, ChevronDown, BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppSettings {
  app_name:      string
  logo_path:     string
  logo_dark_path: string | null
  favicon_path:  string
}

// On s’attend à trouver page.props.settings partagé via AppServiceProvider
type Props = SharedData & { settings: AppSettings }

const mainNavItems: NavItem[] = [
  { title: 'Tableau de bord', href: '/dashboard', icon: LayoutGrid },
  {
    title: 'Gestion des utilisateurs',
    icon: Users,
    children: [
      { title: 'Utilisateurs', href: '/users', icon: UserCircle },
      { title: 'Rôles',        href: '/roles', icon: Shield },
      { title: 'Permissions',  href: '/permissions', icon: Lock },
    ],
  },
  {
    title: 'Historique des logs',
    icon: Activity,
    children: [
      { title: 'Audit logs', href: '/audit-logs', icon: Activity },
      { title: 'Login logs', href: '/login-logs', icon: Monitor },
    ],
  },
  {
    title: 'Catalogue',
    icon: Folder,
    children: [
      { title: 'Catégories', href: '/categories', icon: Folder },
      { title: 'Produits',   href: '/products',   icon: Box },
    ],
  },
  {
    title: 'Param. financiers',
    icon: Settings,
    children: [
      { title: 'TVA',     href: '/tax-rates',  icon: Activity },
      { title: 'Devises', href: '/currencies', icon: Box },
    ],
  },
]

const footerNavItems: NavItem[] = [
  { title: 'Dépôt', href: 'https://github.com/laravel/react-starter-kit', icon: BookOpen },
  { title: 'Docs',  href: 'https://laravel.com/docs/starter-kits',         icon: BookOpen },
]

//  ⇣⇣⇣ Export nommé ⇣⇣⇣
export function AppSidebar() {
  const { url, props: { settings } } = usePage<Props>()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  useEffect(() => {
    mainNavItems.forEach(item => {
      if (item.children && item.children.some(c => url.startsWith(c.href!))) {
        if (!openMenus.includes(item.title)) {
          setOpenMenus(prev => [...prev, item.title])
        }
      }
    })
  }, [url])

  const toggleMenu = (title: string) =>
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(x => x !== title)
        : [...prev, title]
    )

  const isActive = (href?: string) => href && url.startsWith(href)

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* Logo centré */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex justify-center py-4">
                <img
                  src={settings.logo_path}
                  alt={settings.app_name}
                  className="h-10 w-auto object-contain rounded"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Menu principal */}
      <SidebarContent className="overflow-hidden">
        <nav className="space-y-1">
          {mainNavItems.map(item =>
            item.children ? (
              <div key={item.title}>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md',
                    openMenus.includes(item.title)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                    <span className="flex-1 truncate">{item.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      openMenus.includes(item.title) && 'rotate-180'
                    )}
                  />
                </button>
                {openMenus.includes(item.title) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.title}
                        href={child.href!}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                          isActive(child.href)
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        {child.icon && (
                          <child.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        )}
                        <span className="flex-1 truncate">{child.title}</span>
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
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  isActive(item.href)
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                <span className="flex-1 truncate">{item.title}</span>
              </Link>
            )
          )}
        </nav>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

//  ⇣⇣⇣ Export par défaut (pour ceux qui importent `import AppSidebar from ...`) ⇣⇣⇣
export default AppSidebar
