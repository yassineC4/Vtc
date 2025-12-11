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
import { getTranslations, type Locale } from '@/lib/i18n'
import { Plus, Edit, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Driver = Database['public']['Tables']['drivers']['Row']

interface DriversListProps {
  locale: Locale
}

export function DriversList({ locale }: DriversListProps) {
  const t = getTranslations(locale)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    is_online: false,
  })

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrivers(data || [])
    } catch (error) {
      console.error('Error loading drivers:', error)
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      is_online: false,
    })
    setEditingDriver(null)
  }

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver)
      setFormData({
        first_name: driver.first_name,
        last_name: driver.last_name,
        phone: driver.phone,
        email: driver.email || '',
        is_online: driver.is_online,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      
      if (editingDriver) {
        const { error } = await (supabase
          .from('drivers') as any)
          .update(formData)
          .eq('id', editingDriver.id)
        
        if (error) throw error
      } else {
        const { error } = await (supabase
          .from('drivers') as any)
          .insert([formData])
        
        if (error) throw error
      }
      
      await loadDrivers()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving driver:', error)
      alert(locale === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving driver')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce chauffeur ?' : 'Are you sure you want to delete this driver?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await loadDrivers()
    } catch (error) {
      console.error('Error deleting driver:', error)
      alert(locale === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting driver')
    }
  }

  const toggleOnlineStatus = async (driver: Driver) => {
    try {
      const supabase = createClient()
      const { error } = await (supabase
        .from('drivers') as any)
        .update({ is_online: !driver.is_online })
        .eq('id', driver.id)
      
      if (error) throw error
      await loadDrivers()
    } catch (error) {
      console.error('Error updating driver status:', error)
      alert(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating driver status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{locale === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {locale === 'fr' ? 'Gestion des Chauffeurs' : 'Drivers Management'}
        </h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {locale === 'fr' ? 'Ajouter un chauffeur' : 'Add Driver'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card key={driver.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {driver.first_name} {driver.last_name}
                </CardTitle>
                <button
                  onClick={() => toggleOnlineStatus(driver)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title={driver.is_online ? (locale === 'fr' ? 'Mettre hors ligne' : 'Set offline') : (locale === 'fr' ? 'Mettre en ligne' : 'Set online')}
                >
                  {driver.is_online ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {locale === 'fr' ? 'Téléphone:' : 'Phone:'}
                  </span>
                  <span className="text-sm">{driver.phone}</span>
                </div>
                {driver.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      {locale === 'fr' ? 'Email:' : 'Email:'}
                    </span>
                    <span className="text-sm">{driver.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      driver.is_online
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {driver.is_online ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {locale === 'fr' ? 'En ligne' : 'Online'}
                      </>
                    ) : (
                      <>
                        <Circle className="h-3 w-3" />
                        {locale === 'fr' ? 'Hors ligne' : 'Offline'}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(driver)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {locale === 'fr' ? 'Modifier' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(driver.id)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {locale === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {drivers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {locale === 'fr' ? 'Aucun chauffeur enregistré' : 'No drivers registered'}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDriver
                ? locale === 'fr' ? 'Modifier le chauffeur' : 'Edit Driver'
                : locale === 'fr' ? 'Ajouter un chauffeur' : 'Add Driver'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'fr'
                ? 'Remplissez les informations du chauffeur'
                : 'Fill in the driver information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">
                    {locale === 'fr' ? 'Prénom' : 'First Name'} *
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">
                    {locale === 'fr' ? 'Nom' : 'Last Name'} *
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">
                  {locale === 'fr' ? 'Téléphone' : 'Phone'} *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">
                  {locale === 'fr' ? 'Email' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_online"
                  checked={formData.is_online}
                  onChange={(e) =>
                    setFormData({ ...formData, is_online: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_online" className="cursor-pointer">
                  {locale === 'fr' ? 'En ligne' : 'Online'}
                </Label>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button type="submit">
                {editingDriver
                  ? locale === 'fr' ? 'Enregistrer' : 'Save'
                  : locale === 'fr' ? 'Ajouter' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

