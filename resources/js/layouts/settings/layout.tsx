import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import { type PropsWithChildren } from 'react'

// Tu peux rajouter ici autant de tabs que tu veux !
const sidebarNavItems: NavItem[] = [
  {
    title: 'Profil',
    href: '/settings/profile',
    icon: null,
  },
  {
    title: 'Mot de passe',
    href: '/settings/password',
    icon: null,
  },
  {
    title: 'Apparence',
    href: '/settings/appearance',
    icon: null,
  },
  {
    title: 'Préférences',
    href: '/settings/app',
    icon: null,
  },
]

export default function SettingsLayout({ children }: PropsWithChildren) {
  // On évite le SSR sur ce composant
  if (typeof window === 'undefined') {
    return null
  }

  const currentPath = window.location.pathname

  return (
    <div className="px-4 py-6">
      <Heading
        title="Paramètres"
        description="Gérez votre profil, votre mot de passe et vos préférences d’application"
      />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        {/* Sidebar */}
        <aside className="w-full max-w-xs lg:w-56">
          <nav className="flex flex-col space-y-1">
            {sidebarNavItems.map((item, index) => (
              <Button
                key={`${item.href}-${index}`}
                size="sm"
                variant="ghost"
                asChild
                className={cn(
                  'w-full justify-start rounded-md px-4 py-2 text-sm',
                  currentPath === item.href
                    ? 'bg-gray-100 font-semibold text-gray-900'
                    : 'text-gray-700'
                )}
              >
                <Link href={item.href} prefetch>
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <Separator className="my-6 md:hidden" />

        {/* Content */}
        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-12">{children}</section>
        </div>
      </div>
    </div>
  )
}
