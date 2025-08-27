import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Reply,
  Filter,
  Search,
  Calendar
} from 'lucide-react';

interface PQR {
  id: number;
  type: 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  createdAt: string;
  updatedAt: string;
  response?: string;
  assignedTo?: string;
}

export default function PQRManagement() {
  const [pqrs, setPqrs] = useState<PQR[]>([]);
  const [selectedPQR, setSelectedPQR] = useState<PQR | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState('');

  // Mock data - en producción vendría del backend
  useEffect(() => {
    const mockPQRs: PQR[] = [
      {
        id: 1,
        type: 'queja',
        subject: 'Baja presión de agua en el sector norte',
        description: 'Desde hace una semana tenemos muy poca presión de agua en las horas de la mañana. Esto afecta nuestras actividades diarias.',
        customerName: 'María González',
        customerEmail: 'maria.gonzalez@email.com',
        customerPhone: '3001234567',
        status: 'pendiente',
        priority: 'alta',
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-01-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'reclamo',
        subject: 'Facturación incorrecta - cobro excesivo',
        description: 'Mi factura del mes pasado llegó por $150.000 cuando normalmente pago $45.000. Solicito revisión urgente.',
        customerName: 'Carlos Rodríguez',
        customerEmail: 'carlos.rodriguez@email.com',
        customerPhone: '3009876543',
        status: 'en_proceso',
        priority: 'urgente',
        createdAt: '2025-01-14T14:20:00Z',
        updatedAt: '2025-01-15T09:15:00Z',
        assignedTo: 'Ana Martínez'
      },
      {
        id: 3,
        type: 'peticion',
        subject: 'Solicitud de nuevo punto de agua',
        description: 'Solicito la instalación de un nuevo punto de agua para mi propiedad ubicada en la Calle 15 #23-45.',
        customerName: 'Luis Herrera',
        customerEmail: 'luis.herrera@email.com',
        status: 'resuelto',
        priority: 'media',
        createdAt: '2025-01-10T16:45:00Z',
        updatedAt: '2025-01-13T11:30:00Z',
        response: 'Su solicitud ha sido aprobada. El equipo técnico se contactará con usted en los próximos 5 días hábiles para coordinar la instalación.'
      },
      {
        id: 4,
        type: 'sugerencia',
        subject: 'Implementar pagos en línea',
        description: 'Sería muy útil poder pagar las facturas a través de la página web o una aplicación móvil.',
        customerName: 'Ana Jiménez',
        customerEmail: 'ana.jimenez@email.com',
        status: 'pendiente',
        priority: 'baja',
        createdAt: '2025-01-12T09:15:00Z',
        updatedAt: '2025-01-12T09:15:00Z'
      }
    ];
    setPqrs(mockPQRs);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'en_proceso': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resuelto': return 'text-green-600 bg-green-50 border-green-200';
      case 'cerrado': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente': return <Clock className="h-4 w-4" />;
      case 'en_proceso': return <AlertCircle className="h-4 w-4" />;
      case 'resuelto': return <CheckCircle className="h-4 w-4" />;
      case 'cerrado': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja': return 'text-green-600 bg-green-50';
      case 'media': return 'text-yellow-600 bg-yellow-50';
      case 'alta': return 'text-orange-600 bg-orange-50';
      case 'urgente': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'peticion': return 'text-blue-600 bg-blue-50';
      case 'queja': return 'text-orange-600 bg-orange-50';
      case 'reclamo': return 'text-red-600 bg-red-50';
      case 'sugerencia': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredPQRs = pqrs.filter(pqr => {
    const matchesStatus = filterStatus === 'all' || pqr.status === filterStatus;
    const matchesType = filterType === 'all' || pqr.type === filterType;
    const matchesSearch = searchTerm === '' || 
      pqr.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pqr.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleRespond = (pqr: PQR) => {
    setSelectedPQR(pqr);
    setResponse(pqr.response || '');
    setShowModal(true);
  };

  const saveResponse = () => {
    if (selectedPQR) {
      // Aquí iría la llamada al backend
      console.log('Guardando respuesta:', { pqrId: selectedPQR.id, response });
      setShowModal(false);
      setSelectedPQR(null);
      setResponse('');
    }
  };

  const stats = {
    total: pqrs.length,
    pendientes: pqrs.filter(p => p.status === 'pendiente').length,
    enProceso: pqrs.filter(p => p.status === 'en_proceso').length,
    resueltos: pqrs.filter(p => p.status === 'resuelto').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              Gestión de PQR
            </h1>
            <p className="text-gray-600">Peticiones, Quejas, Reclamos y Sugerencias</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PQR</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Proceso</p>
              <p className="text-3xl font-bold text-blue-600">{stats.enProceso}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resueltos</p>
              <p className="text-3xl font-bold text-green-600">{stats.resueltos}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por asunto o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="peticion">Petición</option>
            <option value="queja">Queja</option>
            <option value="reclamo">Reclamo</option>
            <option value="sugerencia">Sugerencia</option>
          </select>
        </div>
      </div>

      {/* PQR List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PQR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPQRs.map((pqr) => (
                <tr key={pqr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">#{pqr.id}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">{pqr.subject}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{pqr.customerName}</div>
                      <div className="text-sm text-gray-600">{pqr.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(pqr.type)}`}>
                      {pqr.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 w-fit ${getStatusColor(pqr.status)}`}>
                      {getStatusIcon(pqr.status)}
                      <span className="capitalize">{pqr.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(pqr.priority)}`}>
                      {pqr.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(pqr.createdAt).toLocaleDateString('es-CO')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleRespond(pqr)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Responder"
                      >
                        <Reply className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-700 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPQRs.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay PQR</h3>
            <p className="text-gray-600">No se encontraron registros con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showModal && selectedPQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Responder PQR #{selectedPQR.id}
              </h3>
              <p className="text-gray-600 mt-1">{selectedPQR.subject}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Descripción del cliente:</h4>
                <p className="text-gray-600">{selectedPQR.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respuesta:
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Escriba su respuesta aquí..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveResponse}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200"
              >
                Enviar Respuesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}