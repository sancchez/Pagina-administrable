import { useState } from 'react';
import { Search, FileText, Calendar, DollarSign, User } from 'lucide-react';
import Layout from '../components/Layout';

interface Invoice {
  id: number;
  accountNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: string;
  description?: string;
}

export default function InvoiceQuery() {
  const [account, setAccount] = useState('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const searchInvoice = async () => {
    if (!account.trim()) {
      setError('Por favor ingrese un número de cuenta');
      return;
    }

    setIsLoading(true);
    setError('');
    setInvoice(null);

    try {
      const response = await fetch(`/api/invoices/${account}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        setError('Factura no encontrada');
      }
    } catch {
      setError('Error al consultar la factura');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      default: return 'Desconocido';
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Consultar Factura</h1>
            <p className="text-gray-600 mt-2">
              Ingrese su número de cuenta o cédula para consultar su factura
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cuenta / Cédula
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="account"
                  name="account"  // ← Agregar esta línea
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInvoice()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Ej: 12345 o 1234567890"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              onClick={searchInvoice}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Buscar Factura</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {invoice && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Información de la Factura
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Cliente:</span>
                  </div>
                  <span className="text-gray-900">{invoice.customerName}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">N° Cuenta:</span>
                  </div>
                  <span className="text-gray-900">{invoice.accountNumber}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Monto:</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    ${invoice.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Vence:</span>
                  </div>
                  <span className="text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString('es-CO')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusText(invoice.status)}
                  </span>
                </div>

                {invoice.description && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium block mb-2">Descripción:</span>
                    <span className="text-gray-700">{invoice.description}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm text-center">
                  💡 Puede pagar en nuestras oficinas o puntos de pago autorizados
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}