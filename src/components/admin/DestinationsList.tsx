'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PopularDestination } from '@/types'
import { getTranslations, type Locale } from '@/lib/i18n'
import { Plus, Edit, Trash2, MapPin, Plane, Train, Navigation } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface DestinationsListProps {
  locale: Locale
}

const iconOptions = [
  { value: 'airplane', label: 'Avion', icon: Plane },
  { value: 'train', label: 'Train', icon: Train },
  { value: 'mapPin', label: 'Localisation', icon: MapPin },
  { value: 'navigation', label: 'Navigation', icon: Navigation },
]

export function DestinationsList({ locale }: DestinationsListProps) {
  const t = getTranslations(locale)
  const [destinations, setDestinations] = useState<PopularDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<PopularDestination | null>(null)
  const [formData, setFormData] = useState({
    name_fr: '',
    name_en: '',
    address: '',
    icon: 'mapPin',
    fixed_price: '',
    display_order: '0',
    is_active: true,
  })

  useEffect(() => {
    loadDestinations()
  }, [])

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/destinations')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.data) {
        setDestinations(result.data as PopularDestination[])
      }
    } catch (error) {
      console.error('Error loading destinations:', error)
      // Laissez les destinations vides en cas d'erreur
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name_fr: '',
      name_en: '',
      address: '',
      icon: 'mapPin',
      fixed_price: '',
      display_order: '0',
      is_active: true,
    })
    setEditingDestination(null)
  }

  const handleOpenDialog = (destination?: PopularDestination) => {
    if (destination) {
      setEditingDestination(destination)
      setFormData({
        name_fr: destination.name_fr,
        name_en: destination.name_en,
        address: destination.address,
        icon: destination.icon || 'mapPin',
        fixed_price: destination.fixed_price.toString(),
        display_order: destination.display_order.toString(),
        is_active: destination.is_active,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSave = async () => {
    if (!formData.name_fr || !formData.name_en || !formData.address || !formData.fixed_price) {
      alert(locale === 'fr' ? 'Veuillez remplir tous les champs requis' : 'Please fill all required fields')
      return
    }

    const url = '/api/destinations'
    const method = editingDestination ? 'PATCH' : 'POST'
    const body = editingDestination
      ? { id: editingDestination.id, ...formData }
      : formData

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: 'Erreur réseau' }))
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      handleCloseDialog()
      await loadDestinations()
    } catch (error) {
      console.error('Error saving destination:', error)
      const errorMessage = error instanceof Error ? error.message : (locale === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving')
      alert(locale === 'fr' 
        ? `Erreur : ${errorMessage}. Vérifiez votre connexion et réessayez.`
        : `Error: ${errorMessage}. Check your connection and try again.`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cette destination ?' : 'Are you sure you want to delete this destination?')) {
      return
    }

    try {
      const response = await fetch('/api/destinations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await loadDestinations()
    } catch (error) {
      console.error('Error deleting destination:', error)
      alert(locale === 'fr' 
        ? 'Erreur lors de la suppression. Vérifiez votre connexion et réessayez.'
        : 'Error deleting. Check your connection and try again.')
    }
  }

  const handleToggleActive = async (destination: PopularDestination) => {
    try {
      const response = await fetch('/api/destinations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: destination.id,
          is_active: !destination.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await loadDestinations()
    } catch (error) {
      console.error('Error toggling destination:', error)
      alert(locale === 'fr' 
        ? 'Erreur lors de la modification. Vérifiez votre connexion et réessayez.'
        : 'Error updating. Check your connection and try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-8">{t.common.loading}</div>
  }

  const selectedIcon = iconOptions.find((opt) => opt.value === formData.icon)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {locale === 'fr' ? 'Destinations Populaires' : 'Popular Destinations'}
        </h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          {locale === 'fr' ? 'Ajouter une destination' : 'Add destination'}
        </Button>
      </div>

      {destinations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {locale === 'fr' ? 'Aucune destination configurée' : 'No destinations configured'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((destination) => {
            const IconComponent = destination.icon
              ? iconOptions.find((opt) => opt.value === destination.icon)?.icon || MapPin
              : MapPin

            return (
              <Card key={destination.id} className={!destination.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        <IconComponent className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {locale === 'fr' ? destination.name_fr : destination.name_en}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{destination.address}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'fr' ? 'Prix fixe' : 'Fixed price'}
                      </span>
                      <span className="text-xl font-bold text-indigo-600">
                        {formatPrice(destination.fixed_price, locale === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'fr' ? 'Ordre' : 'Order'}
                      </span>
                      <span className="text-sm font-medium">{destination.display_order}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(destination)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t.common.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(destination)}
                      >
                        {destination.is_active
                          ? locale === 'fr' ? 'Désactiver' : 'Disable'
                          : locale === 'fr' ? 'Activer' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(destination.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDestination
                ? locale === 'fr' ? 'Modifier la destination' : 'Edit destination'
                : locale === 'fr' ? 'Ajouter une destination' : 'Add destination'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'fr'
                ? 'Remplissez les informations de la destination populaire'
                : 'Fill in the popular destination information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name_fr">
                {locale === 'fr' ? 'Nom (Français)' : 'Name (French)'} *
              </Label>
              <Input
                id="name_fr"
                value={formData.name_fr}
                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                placeholder={locale === 'fr' ? 'Ex: Aéroport CDG' : 'Ex: CDG Airport'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_en">
                {locale === 'fr' ? 'Nom (Anglais)' : 'Name (English)'} *
              </Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder={locale === 'fr' ? 'Ex: CDG Airport' : 'Ex: CDG Airport'}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">
                {locale === 'fr' ? 'Adresse' : 'Address'} *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={locale === 'fr' ? 'Ex: 95700 Roissy-en-France' : 'Ex: 95700 Roissy-en-France'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">
                {locale === 'fr' ? 'Icône' : 'Icon'}
              </Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedIcon && (
                      <div className="flex items-center gap-2">
                        <selectedIcon.icon className="h-4 w-4" />
                        <span>{selectedIcon.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fixed_price">
                {locale === 'fr' ? 'Prix fixe (€)' : 'Fixed price (€)'} *
              </Label>
              <Input
                id="fixed_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.fixed_price}
                onChange={(e) => setFormData({ ...formData, fixed_price: e.target.value })}
                placeholder="60.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">
                {locale === 'fr' ? 'Ordre d\'affichage' : 'Display order'}
              </Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">
                  {locale === 'fr' ? 'Active' : 'Active'}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave}>
              {editingDestination ? t.common.save : locale === 'fr' ? 'Ajouter' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

