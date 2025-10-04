import { useEffect, useState } from 'react';
import HttpClient from '../utils/http';
import { CreditCard, Banknote, Wallet, FileText, RefreshCw, Search } from 'lucide-react';

interface Invoice {
  id: string;
  accountNumber?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | string;
  totalAmount?: number;
  dueDate?: string;
}

export default function PaymentsBilling() {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const resp = await HttpClient.get('/admin/invoices');
      const data = resp?.data?.invoices || resp?.data || resp?.invoices || [];
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching invoices', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (
      inv.id?.toLowerCase().includes(q) ||
      inv.accountNumber?.toLowerCase().includes(q) ||
      inv.status?.toLowerCase().includes(q)
    );
  });

  const formatCurrency = (val?: number) => {
    if (typeof val !== 'number') return '-';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pagos y Facturación</h1>
            <p className="text-gray-600">Gestiona pagos, facturas y métodos de cobro</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cuenta, estado o ID"
              className="ml-2 bg-transparent outline-none"
            />
          </div>
          <button onClick={fetchInvoices} className="flex items-center px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Actualizar</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Facturas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vence</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{inv.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{inv.accountNumber || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center">
                      <FileText className="h-4 w-4" />
                      <span className="ml-2">Ver</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>No hay facturas para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Wallet className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold">Métodos de pago disponibles</h3>
          </div>
          <ul className="mt-3 text-sm text-gray-700 space-y-1">
            <li>• PSE (Transferencia bancaria)</li>
            <li>• Tarjetas de crédito</li>
            <li>• Efecty</li>
            <li>• Baloto</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Banknote className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold">Resumen de cobros</h3>
          </div>
          <p className="mt-3 text-sm text-gray-600">Resumen de pagos y facturas próximamente.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold">Integraciones</h3>
          </div>
          <p className="mt-3 text-sm text-gray-600">Configura pasarelas de pago desde esta sección.</p>
        </div>
      </div>
    </div>
  );
}