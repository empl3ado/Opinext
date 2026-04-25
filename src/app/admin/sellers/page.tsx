'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar/Navbar'
import { getAllProfiles, updateSellerStatus } from '@/app/actions/admin'
import { useAuth } from '@/components/auth/AuthProvider'
import { ShieldCheck, User, CreditCard, AlertTriangle, CheckCircle2, Search } from 'lucide-react'
import Image from 'next/image'

export default function AdminSellersPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers()
    }
  }, [profile])

  const fetchUsers = async () => {
    try {
      const data = await getAllProfiles()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newRole: string, newStatus: string) => {
    setUpdatingId(userId)
    const res = await updateSellerStatus(userId, newRole, newStatus)
    if (res.success) {
      await fetchUsers()
    } else {
      alert('Error: ' + res.error)
    }
    setUpdatingId(null)
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-6 text-center">
        <div>
          <ShieldCheck size={64} className="mx-auto mb-4 text-red-500 opacity-20" />
          <h1 className="text-2xl font-serif">Acceso Restringido</h1>
          <p className="text-text-dark/60 mt-2">Solo el propietario de Opinext puede ver esta página.</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-bg-page flex flex-col">
      <Navbar mode="listas" onModeChange={() => {}} />

      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-serif mb-4">Gestión de Vendedores</h1>
            <p className="text-text-dark/60 max-w-xl">
              Controla quién puede vender en Opinext y gestiona el estado de sus suscripciones manualmente.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dark/30 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar usuario..."
              className="w-full bg-white border border-black/5 rounded-full pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-text-dark/10 shadow-sm outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse font-serif italic text-text-dark/40">Cargando base de datos de usuarios...</div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/5">
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-text-dark/40">Usuario</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-text-dark/40">Rol Actual</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-text-dark/40">Estado Suscripción</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-text-dark/40 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-black/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-black/5 relative overflow-hidden shrink-0">
                            {u.avatar_url && <Image src={u.avatar_url} alt="" fill className="object-cover" />}
                          </div>
                          <div>
                            <p className="font-semibold text-text-dark">{u.display_name || 'Sin nombre'}</p>
                            <p className="text-xs text-text-dark/40">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                          u.role === 'admin' ? 'bg-red-100 text-red-600' :
                          u.role === 'seller' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {u.seller_status === 'active' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {u.seller_status === 'debtor' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                          {u.seller_status === 'suspended' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className={`text-sm font-medium ${
                            u.seller_status === 'active' ? 'text-green-600' :
                            u.seller_status === 'debtor' ? 'text-orange-600' :
                            u.seller_status === 'suspended' ? 'text-red-600' :
                            'text-text-dark/40'
                          }`}>
                            {u.seller_status === 'active' ? 'Al día / Pagado' :
                             u.seller_status === 'debtor' ? 'Moroso / Deuda' :
                             u.seller_status === 'suspended' ? 'Suspendido' : 'No Vendedor'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {u.seller_status !== 'active' && (
                            <button 
                              disabled={updatingId === u.id}
                              onClick={() => handleStatusChange(u.id, 'seller', 'active')}
                              className="px-4 py-2 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-green-600 transition-all disabled:opacity-50"
                            >
                              Activar Venta
                            </button>
                          )}
                          {u.seller_status === 'active' && (
                            <button 
                              disabled={updatingId === u.id}
                              onClick={() => handleStatusChange(u.id, 'seller', 'debtor')}
                              className="px-4 py-2 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-orange-600 transition-all disabled:opacity-50"
                            >
                              Marcar Moroso
                            </button>
                          )}
                          {u.role === 'user' && (
                            <button 
                              disabled={updatingId === u.id}
                              onClick={() => handleStatusChange(u.id, 'seller', 'active')}
                              className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-black/80 transition-all disabled:opacity-50"
                            >
                              Hacer Vendedor
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
