import { useState, useEffect } from 'react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  BookOpen, ChevronDown, Folder, LayoutGrid, Users, Monitor,
  UserCircle, Shield, Lock, Activity, Logs, Box, Settings               // ⬅️  Ajout de Box
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLogo from './app-logo';

/* ------------------------------------------------------------------
   Menu principal
------------------------------------------------------------------ */
const mainNavItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  /* ----- Gestion utilisateurs ------------------------------------ */
  {
    title: 'Gestion des utilisateurs',
    icon: Users,
    children: [
      { title: 'Utilisateurs', href: '/users',   icon: UserCircle },
      { title: 'Rôles',        href: '/roles',   icon: Shield },
      { title: 'Permissions',  href: '/permissions', icon: Lock },
    ],
  },
  /* ----- Logs ----------------------------------------------------- */
  {
    title: 'Historique des logs',
    icon: Logs,
    children: [
      { title: "Journal d'activités", href: '/audit-logs',  icon: Activity },
      { title: "Journal de connexions", href: '/login-logs', icon: Monitor },
    ],
  },
    /* ----- Catalogue (NOUVEAU) ------------------------------------- */
  {
    title: 'Catalogue',
    icon: Folder,
    children: [
      { title: 'Catégories', href: '/categories', icon: Folder },
      { title: 'Produits',   href: '/products',   icon: Box },

    ],
  },
  {
  title: 'Paramètres financiers',
  icon: Settings, // ou un autre icône
  children: [
    { title: 'Taux de TVA', href: '/tax-rates', icon: Activity },
    { title: 'Devises', href: '/currencies', icon: Box },
  ],
},
];

/* ------------------------------------------------------------------
   Liens pied de page
------------------------------------------------------------------ */
const footerNavItems: NavItem[] = [
  { title: 'Dépôt',         href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
  { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits',        icon: BookOpen },
];

/* ------------------------------------------------------------------
   Composant Sidebar
------------------------------------------------------------------ */
export function AppSidebar() {
  const { url } = usePage();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  /* Ouvre automatiquement le parent si une route enfant est active */
  useEffect(() => {
    mainNavItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => url.startsWith(child.href!));
        if (hasActiveChild && !openMenus.includes(item.title)) {
          setOpenMenus(prev => [...prev, item.title]);
        }
      }
    });
  }, [url]);

  const toggleMenu = (title: string) =>
    setOpenMenus(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);

  const isActive = (href: string | undefined) => href && url.startsWith(href);

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* Logo ------------------------------------------------------- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Menu principal ------------------------------------------- */}
      <SidebarContent>
        <nav className="space-y-1">
          {mainNavItems.map(item => (
            <div key={item.title}>
              {item.children ? (
                <>
                  {/* Bouton parent */}
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md',
                      'hover:bg-gray-100 hover:text-gray-900',
                      openMenus.includes(item.title) ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        openMenus.includes(item.title) && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Enfants */}
                  {openMenus.includes(item.title) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map(child => (
                        <Link
                          key={child.title}
                          href={child.href!}
                          className={cn(
                            'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                            'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                            isActive(child.href) && 'bg-gray-200 text-gray-900'
                          )}
                        >
                          {child.icon && <child.icon className="mr-3 h-5 w-5" />}
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    isActive(item.href) && 'bg-gray-200 text-gray-900'
                  )}
                >
                  {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </SidebarContent>

      {/* Pied de sidebar ----------------------------------------- */}
      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
