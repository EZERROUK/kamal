import { Head, useForm } from '@inertiajs/react'
import { useRef } from 'react'
import { BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputError from '@/components/input-error'
import HeadingSmall from '@/components/heading-small'
import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings/layout'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Paramètres généraux', href: '/settings/app' },
]

export default function AppSettings({ settings, flash }: { settings: any; flash?: { success?: string } }) {
  const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
    app_name: settings.app_name ?? '',
    app_slogan: settings.app_slogan ?? '',
    primary_color: settings.primary_color ?? '#6366f1',
    secondary_color: settings.secondary_color ?? '#f59e42',
    contact_email: settings.contact_email ?? '',
    contact_phone: settings.contact_phone ?? '',
    contact_address: settings.contact_address ?? '',
    cgu_url: settings.cgu_url ?? '',
    privacy_url: settings.privacy_url ?? '',
    copyright: settings.copyright ?? '',
    meta_keywords: settings.meta_keywords ?? '',
    meta_description: settings.meta_description ?? '',
    social_links: settings.social_links ? JSON.parse(settings.social_links) : {},
    logo: null,
    logo_dark: null,
    favicon: null,
  })

  const logoInput = useRef<HTMLInputElement>(null)
  const logoDarkInput = useRef<HTMLInputElement>(null)
  const faviconInput = useRef<HTMLInputElement>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post(route('settings.app.update'), {
      forceFormData: true,
      preserveScroll: true,
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Paramètres de l'application" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Préférences générales"
            description="Gérez l'identité visuelle et les coordonnées de votre application."
          />

          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="app_name">Nom de l’application</Label>
              <Input
                id="app_name"
                value={data.app_name}
                onChange={(e) => setData('app_name', e.target.value)}
                required
              />
              <InputError message={errors.app_name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="app_slogan">Slogan</Label>
              <Input
                id="app_slogan"
                value={data.app_slogan}
                onChange={(e) => setData('app_slogan', e.target.value)}
              />
              <InputError message={errors.app_slogan} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="primary_color">Couleur principale</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={data.primary_color}
                  onChange={(e) => setData('primary_color', e.target.value)}
                  className="w-16 h-10 p-0 border-none"
                />
                <InputError message={errors.primary_color} />
              </div>

              <div>
                <Label htmlFor="secondary_color">Couleur secondaire</Label>
                <Input
                  id="secondary_color"
                  type="color"
                  value={data.secondary_color}
                  onChange={(e) => setData('secondary_color', e.target.value)}
                  className="w-16 h-10 p-0 border-none"
                />
                <InputError message={errors.secondary_color} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo principal</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                ref={logoInput}
                onChange={e => setData('logo', e.target.files?.[0] ?? null)}
              />
              <InputError message={errors.logo} />
              {settings.logo_path && (
                <img src={`/storage/${settings.logo_path}`} alt="Logo actuel de l'application" className="w-28 mt-3 border rounded" />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo_dark">Logo mode sombre (optionnel)</Label>
              <Input
                id="logo_dark"
                type="file"
                accept="image/*"
                ref={logoDarkInput}
                onChange={e => setData('logo_dark', e.target.files?.[0] ?? null)}
              />
              <InputError message={errors.logo_dark} />
              {settings.logo_dark_path && (
                <img src={`/storage/${settings.logo_dark_path}`} alt="Logo pour le mode sombre" className="w-28 mt-3 border rounded bg-neutral-900" />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="favicon">Favicon (optionnel, sinon généré automatiquement)</Label>
              <Input
                id="favicon"
                type="file"
                accept="image/png, image/x-icon"
                ref={faviconInput}
                onChange={e => setData('favicon', e.target.files?.[0] ?? null)}
              />
              <InputError message={errors.favicon} />
              {settings.favicon_path && (
                <img src={`/storage/${settings.favicon_path}`} alt="Favicon actuel" className="w-10 h-10 border rounded bg-white" />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact_email">Email de contact</Label>
              <Input
                id="contact_email"
                value={data.contact_email}
                onChange={e => setData('contact_email', e.target.value)}
              />
              <InputError message={errors.contact_email} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                value={data.contact_phone}
                onChange={e => setData('contact_phone', e.target.value)}
              />
              <InputError message={errors.contact_phone} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact_address">Adresse</Label>
              <Input
                id="contact_address"
                value={data.contact_address}
                onChange={e => setData('contact_address', e.target.value)}
              />
              <InputError message={errors.contact_address} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cgu_url">Lien vers les Conditions Générales d’Utilisation (optionnel)</Label>
              <Input
                id="cgu_url"
                value={data.cgu_url}
                onChange={e => setData('cgu_url', e.target.value)}
              />
              <InputError message={errors.cgu_url} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="privacy_url">Lien vers la Politique de confidentialité (optionnel)</Label>
              <Input
                id="privacy_url"
                value={data.privacy_url}
                onChange={e => setData('privacy_url', e.target.value)}
              />
              <InputError message={errors.privacy_url} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="copyright">Copyright</Label>
              <Input
                id="copyright"
                value={data.copyright}
                onChange={e => setData('copyright', e.target.value)}
              />
              <InputError message={errors.copyright} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="social_links">Réseaux sociaux</Label>
              {["twitter", "linkedin", "facebook", "instagram"].map(network => (
                <div key={network} className="flex items-center gap-2 mb-1">
                  <span className="w-24 capitalize">{network}</span>
                  <Input
                    value={data.social_links?.[network] ?? ''}
                    onChange={e => setData('social_links', { ...data.social_links, [network]: e.target.value })}
                    placeholder={`URL ${network}`}
                  />
                </div>
              ))}
              <InputError message={errors.social_links} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meta_keywords">Mots-clés (SEO)</Label>
              <Input
                id="meta_keywords"
                value={data.meta_keywords}
                onChange={e => setData('meta_keywords', e.target.value)}
                placeholder="Exemple : SaaS, gestion, hébergement, cloud"
              />
              <InputError message={errors.meta_keywords} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meta_description">Description méta (SEO)</Label>
              <Input
                id="meta_description"
                value={data.meta_description}
                onChange={e => setData('meta_description', e.target.value)}
                placeholder="Exemple : Plateforme SaaS pour la gestion des ressources informatiques"
              />
              <InputError message={errors.meta_description} />
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Button type="submit" disabled={processing}>Enregistrer</Button>
              {recentlySuccessful && <span className="text-sm text-green-600">Enregistré !</span>}
            </div>
          </form>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
