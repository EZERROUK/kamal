import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, X, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompatibilityEntry } from '@/types'

interface Props {
  compatibilities: CompatibilityEntry[]
  allProducts: { id: string; name: string }[]
  onChange: (list: CompatibilityEntry[]) => void
  isComponentCategory?: boolean
}

export default function CompatibilityFields({
  compatibilities,
  allProducts,
  onChange,
  isComponentCategory = false
}: Props) {
  const set = (i: number, field: keyof CompatibilityEntry, value: any) => {
    const draft = [...compatibilities]
    draft[i] = { ...draft[i], [field]: value }
    onChange(draft)
  }

  const remove = (i: number) =>
    onChange(compatibilities.filter((_, idx) => idx !== i))

  const usedIds = compatibilities.map(e => e.compatible_with_id)

  const add = () => {
    const remaining = allProducts.filter(p => !usedIds.includes(p.id))
    if (remaining.length > 0) {
      onChange([
        ...compatibilities,
        {
          compatible_with_id: remaining[0].id,
          direction: 'uni',
        }
      ])
    }
  }

  const isAddDisabled = allProducts.length === usedIds.length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary/80" />
          <h2 className="text-xl font-medium tracking-tight">Compatibilités</h2>
        </div>
        <Button
          onClick={add}
          type="button"
          disabled={isAddDisabled}
          variant="outline"
          size="sm"
          className={cn(
            "h-10 px-5 rounded-full",
            "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
            "border-none shadow-sm",
            "flex items-center gap-2 transition-all duration-200",
            isAddDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
          Ajouter une compatibilité
        </Button>
      </div>

      <div className="space-y-4">
        {compatibilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 border border-dashed rounded-xl bg-muted/30">
            <Link2 className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucune compatibilité n'a été ajoutée</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {compatibilities.map((entry, idx) => {
              const selectedId = entry.compatible_with_id
              const availableProducts = allProducts.filter(p =>
                !usedIds.includes(p.id) || p.id === selectedId
              )

              return (
                <div
                  key={idx}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-[1.2fr,1.5fr,auto] gap-4",
                    "p-4 rounded-xl bg-card",
                    "border border-border/50",
                    "group hover:shadow-md hover:border-primary/20",
                    "transition-all duration-200 ease-in-out"
                  )}
                >
                  <Select
                    value={entry.compatible_with_id}
                    onValueChange={v => set(idx, 'compatible_with_id', v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sélectionner un produit compatible" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="Notes à propos de cette compatibilité..."
                    value={entry.note ?? ''}
                    onChange={e => set(idx, 'note', e.target.value)}
                    className={cn(
                      "h-10 min-h-[40px] resize-none py-2 px-3",
                      "bg-background"
                    )}
                  />

                  <Button
                    onClick={() => remove(idx)}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 w-10 p-0",
                      "text-muted-foreground opacity-0 group-hover:opacity-100",
                      "hover:bg-destructive/10 hover:text-destructive",
                      "transition-all duration-200"
                    )}
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Supprimer la compatibilité</span>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
