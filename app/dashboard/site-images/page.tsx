'use client'

import { useState, useEffect, useRef } from 'react'
import api from '@/utils/api'
import {
    Upload,
    Trash2,
    Edit2,
    X,
    Image as ImageIcon,
    Search,
    FolderOpen,
    Plus,
    Check,
    AlertCircle,
    Loader2,
    Copy,
} from 'lucide-react'
import type { SiteImage } from '@/types'

const CATEGORIES = ['backgrounds', 'cards', 'characters', 'service', 'misc', 'project'] as const

export default function SiteImagesPage() {
    const [images, setImages] = useState<SiteImage[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [editingImage, setEditingImage] = useState<SiteImage | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Upload form state
    const [uploadKey, setUploadKey] = useState('')
    const [uploadCategory, setUploadCategory] = useState<string>('backgrounds')
    const [uploadAlt, setUploadAlt] = useState('')
    const [uploadOrder, setUploadOrder] = useState('0')
    const [uploadFile, setUploadFile] = useState<File | null>(null)
    const [uploadPreview, setUploadPreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Edit form state
    const [editKey, setEditKey] = useState('')
    const [editCategory, setEditCategory] = useState<string>('backgrounds')
    const [editAlt, setEditAlt] = useState('')
    const [editOrder, setEditOrder] = useState('0')
    const [editFile, setEditFile] = useState<File | null>(null)
    const [editPreview, setEditPreview] = useState<string>('')
    const editFileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchImages()
    }, [])

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
    }

    const fetchImages = async () => {
        try {
            const { data } = await api.get<SiteImage[]>('/site-images')
            setImages(data)
        } catch (error) {
            console.error('Failed to fetch images:', error)
            showToast('Failed to fetch images', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (isEdit) {
            setEditFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setEditPreview(reader.result as string)
            reader.readAsDataURL(file)
        } else {
            setUploadFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setUploadPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!uploadFile) {
            showToast('Please select an image file', 'error')
            return
        }
        if (!uploadKey.trim()) {
            showToast('Please enter a key', 'error')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('image', uploadFile)
            formData.append('key', uploadKey.trim())
            formData.append('category', uploadCategory)
            formData.append('alt', uploadAlt)
            formData.append('order', uploadOrder)

            await api.post('/site-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            showToast('Image uploaded successfully!', 'success')
            resetUploadForm()
            setShowUploadModal(false)
            fetchImages()
        } catch (error: any) {
            console.error('Upload failed:', error)
            showToast(error.response?.data?.message || 'Failed to upload image', 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingImage) return

        setUploading(true)
        try {
            const formData = new FormData()
            if (editFile) {
                formData.append('image', editFile)
            }
            formData.append('key', editKey.trim())
            formData.append('category', editCategory)
            formData.append('alt', editAlt)
            formData.append('order', editOrder)

            await api.put(`/site-images/${editingImage._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            showToast('Image updated successfully!', 'success')
            setEditingImage(null)
            resetEditForm()
            fetchImages()
        } catch (error: any) {
            console.error('Update failed:', error)
            showToast(error.response?.data?.message || 'Failed to update image', 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string, key: string) => {
        if (!confirm(`Are you sure you want to delete "${key}"? This will also remove it from Cloudinary.`)) return

        try {
            await api.delete(`/site-images/${id}`)
            showToast('Image deleted successfully!', 'success')
            fetchImages()
        } catch (error: any) {
            console.error('Delete failed:', error)
            showToast(error.response?.data?.message || 'Failed to delete image', 'error')
        }
    }

    const openEditModal = (image: SiteImage) => {
        setEditingImage(image)
        setEditKey(image.key)
        setEditCategory(image.category)
        setEditAlt(image.alt)
        setEditOrder(image.order.toString())
        setEditPreview(image.url)
        setEditFile(null)
    }

    const resetUploadForm = () => {
        setUploadKey('')
        setUploadCategory('backgrounds')
        setUploadAlt('')
        setUploadOrder('0')
        setUploadFile(null)
        setUploadPreview('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const resetEditForm = () => {
        setEditKey('')
        setEditCategory('backgrounds')
        setEditAlt('')
        setEditOrder('0')
        setEditFile(null)
        setEditPreview('')
        if (editFileInputRef.current) editFileInputRef.current.value = ''
    }

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url)
        showToast('URL copied to clipboard!', 'success')
    }

    const filteredImages = images.filter((img) => {
        const matchesCategory = activeCategory === 'all' || img.category === activeCategory
        const matchesSearch =
            img.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.category.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const categoryCounts = images.reduce(
        (acc, img) => {
            acc[img.category] = (acc[img.category] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    <p className="mt-4 text-gray-400">Loading site images...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all animate-pulse ${toast.type === 'success'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                >
                    {toast.type === 'success' ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Site Images</h1>
                    <p className="text-gray-400">
                        Manage Astrabite website images • {images.length} total images
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetUploadForm()
                        setShowUploadModal(true)
                    }}
                    className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Upload Image
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by key, alt text, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeCategory === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    All ({images.length})
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${activeCategory === cat
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {cat} ({categoryCounts[cat] || 0})
                    </button>
                ))}
            </div>

            {/* Images Grid */}
            {filteredImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredImages.map((img) => (
                        <div
                            key={img._id}
                            className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition group"
                        >
                            {/* Image Preview */}
                            <div className="relative h-40 bg-gray-900">
                                <img
                                    src={img.url}
                                    alt={img.alt || img.key}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            'https://via.placeholder.com/400x300?text=Error'
                                    }}
                                />
                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => openEditModal(img)}
                                        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4 text-white" />
                                    </button>
                                    <button
                                        onClick={() => copyUrl(img.url)}
                                        className="p-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                                        title="Copy URL"
                                    >
                                        <Copy className="h-4 w-4 text-white" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(img._id, img.key)}
                                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Image Info */}
                            <div className="p-3">
                                <p className="font-medium text-white text-sm truncate" title={img.key}>
                                    {img.key}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded capitalize">
                                        {img.category}
                                    </span>
                                    <span className="text-xs text-gray-500">#{img.order}</span>
                                </div>
                                {img.alt && (
                                    <p className="text-xs text-gray-500 mt-1 truncate" title={img.alt}>
                                        {img.alt}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-300">No images found</h3>
                    <p className="text-gray-400 mt-2">
                        {searchTerm || activeCategory !== 'all'
                            ? 'Try adjusting your filters or '
                            : 'Get started by '}
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="text-purple-400 hover:text-purple-300 font-medium"
                        >
                            uploading a new image
                        </button>
                    </p>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Upload Image</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Image File *
                                </label>
                                <div
                                    className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploadPreview ? (
                                        <img
                                            src={uploadPreview}
                                            alt="Preview"
                                            className="max-h-40 mx-auto rounded"
                                        />
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Click to select an image</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, WebP</p>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={(e) => handleFileChange(e, false)}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Key * <span className="text-gray-500">(e.g. backgrounds.background1)</span>
                                </label>
                                <input
                                    type="text"
                                    value={uploadKey}
                                    onChange={(e) => setUploadKey(e.target.value)}
                                    placeholder="backgrounds.background1"
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={uploadCategory}
                                    onChange={(e) => setUploadCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Alt Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Alt Text
                                </label>
                                <input
                                    type="text"
                                    value={uploadAlt}
                                    onChange={(e) => setUploadAlt(e.target.value)}
                                    placeholder="Description of the image"
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                />
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={uploadOrder}
                                    onChange={(e) => setUploadOrder(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center"
                                >
                                    {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingImage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Edit Image</h2>
                            <button
                                onClick={() => {
                                    setEditingImage(null)
                                    resetEditForm()
                                }}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            {/* Current / New Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Image <span className="text-gray-500">(click to replace)</span>
                                </label>
                                <div
                                    className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition"
                                    onClick={() => editFileInputRef.current?.click()}
                                >
                                    <img
                                        src={editPreview}
                                        alt="Preview"
                                        className="max-h-40 mx-auto rounded"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                'https://via.placeholder.com/400x200?text=Error'
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Click to upload a new image</p>
                                    <input
                                        ref={editFileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={(e) => handleFileChange(e, true)}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Key *</label>
                                <input
                                    type="text"
                                    value={editKey}
                                    onChange={(e) => setEditKey(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Alt Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Alt Text</label>
                                <input
                                    type="text"
                                    value={editAlt}
                                    onChange={(e) => setEditAlt(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                />
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                                <input
                                    type="number"
                                    value={editOrder}
                                    onChange={(e) => setEditOrder(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                />
                            </div>

                            {/* Cloudinary URL (read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Current URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={editingImage.url}
                                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => copyUrl(editingImage.url)}
                                        className="px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                                    >
                                        <Copy className="h-4 w-4 text-gray-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingImage(null)
                                        resetEditForm()
                                    }}
                                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center"
                                >
                                    {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {uploading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
