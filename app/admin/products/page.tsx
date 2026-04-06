'use client'

import React from "react"
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, X, Loader2, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
}

async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    is_active: (row.is_active as boolean) ?? (row.active as boolean) ?? true,
  })) as Product[]
}

async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('store_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  
  if (error) throw error
  return data || []
}

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  category: '',
  stock: 1,
  condition: 'new',
  is_active: true,
}

export default function AdminProductsPage() {
  const { data: products, isLoading } = useSWR('admin-products', fetchProducts)
  const { data: categories } = useSWR('store-categories', fetchCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState(emptyProduct)
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')

  const openNewModal = () => {
    setEditingProduct(null)
    setFormData(emptyProduct)
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      category: product.category || '',
      stock: product.stock,
      condition: (product as Product & { condition?: string }).condition || 'new',
      is_active: product.is_active,
    })
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading:', uploadError)
      alert('Error al subir imagen. Asegurate de que el bucket "images" exista en Supabase.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    setFormData(prev => ({ ...prev, image_url: publicUrl }))
    setUploading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const supabase = createClient()
    
    try {
      const { is_active, condition, ...rest } = formData
      const row = {
        ...rest,
        condition,
        active: is_active,
        is_active,
      }
      if (editingProduct) {
        await supabase.from('products').update(row).eq('id', editingProduct.id)
      } else {
        await supabase.from('products').insert(row)
      }
      
      mutate('admin-products')
      mutate('products')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este producto?')) return
    
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    mutate('admin-products')
    mutate('products')
  }

  const toggleActive = async (product: Product) => {
    const supabase = createClient()
    const next = !product.is_active
    await supabase
      .from('products')
      .update({ is_active: next, active: next })
      .eq('id', product.id)
    mutate('admin-products')
  }

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products?.filter(p => p.category === filterCategory)

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-4xl mb-2">PRODUCTOS</h1>
          <p className="text-muted-foreground">Gestiona los productos de la tienda</p>
        </div>
        <Button onClick={openNewModal} className="bg-accent text-background hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          NUEVO PRODUCTO
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filterCategory === 'all' 
              ? 'bg-accent text-background' 
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          }`}
        >
          Todos ({products?.length || 0})
        </button>
        {categories?.map(cat => {
          const count = products?.filter(p => p.category === cat.slug).length || 0
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.slug)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterCategory === cat.slug 
                  ? 'bg-accent text-background' 
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {cat.name} ({count})
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className={`bg-card border overflow-hidden group ${!product.is_active ? 'opacity-50' : ''}`}
            >
              {/* Image */}
              <div className="aspect-square relative bg-secondary">
                {product.image_url ? (
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Condition Badge */}
                {(product as Product & { condition?: string }).condition && (
                  <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium ${
                    (product as Product & { condition?: string }).condition === 'new' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-black'
                  }`}>
                    {(product as Product & { condition?: string }).condition === 'new' ? 'NUEVO' : 'USADO'}
                  </span>
                )}

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 bg-background/90 hover:bg-background text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-500/90 hover:bg-red-500 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  {categories?.find(c => c.slug === product.category)?.name || product.category || 'Sin categoría'}
                </p>
                <h3 className="font-medium mb-2 line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-accent">
                    ${product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => toggleActive(product)}
                    className={`text-xs px-2 py-1 ${
                      product.is_active 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Stock: {product.stock}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No hay productos en esta categoría</p>
          <Button onClick={openNewModal} className="bg-accent text-background hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            CREAR PRODUCTO
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-background w-full max-w-lg p-6 border border-border max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-[var(--font-display)] text-2xl mb-6">
              {editingProduct ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>Imagen</Label>
                <div className="mt-2">
                  {formData.image_url ? (
                    <div className="relative aspect-video bg-secondary">
                      <Image
                        src={formData.image_url || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video bg-secondary border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-accent transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {uploading ? 'Subiendo...' : 'Click para subir imagen'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">O pega una URL:</p>
                <Input
                  value={formData.image_url}
                  onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-10 mt-1 px-3 bg-background border text-sm"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="condition">Condición</Label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full h-10 mt-1 px-3 bg-background border text-sm"
                  >
                    <option value="new">Nuevo</option>
                    <option value="used">Usado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">Producto activo (visible en tienda)</Label>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                  CANCELAR
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-accent text-background hover:bg-accent/90">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'GUARDAR'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
