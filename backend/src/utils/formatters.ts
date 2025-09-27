// Utilidades de formateo para el backend

// Formateo de fechas
export const formatDate = {
  // Formato ISO string
  toISO: (date: Date): string => {
    return date.toISOString();
  },
  
  // Formato legible en español
  toSpanish: (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  // Formato corto
  toShort: (date: Date): string => {
    return date.toLocaleDateString('es-ES');
  },
  
  // Formato con hora
  toDateTime: (date: Date): string => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  // Tiempo relativo (hace X tiempo)
  toRelative: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return formatDate.toShort(date);
  },
};

// Formateo de números
export const formatNumber = {
  // Formato de moneda en pesos colombianos
  toCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  },
  
  // Formato con separadores de miles
  withSeparators: (num: number): string => {
    return new Intl.NumberFormat('es-CO').format(num);
  },
  
  // Formato de porcentaje
  toPercentage: (num: number, decimals: number = 1): string => {
    return `${(num * 100).toFixed(decimals)}%`;
  },
  
  // Formato de bytes a tamaño legible
  toFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${size.toFixed(1)} ${sizes[i]}`;
  },
};

// Formateo de texto
export const formatText = {
  // Capitalizar primera letra
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  // Título (capitalizar cada palabra)
  toTitle: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
  
  // Slug para URLs
  toSlug: (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno solo
  },
  
  // Truncar texto
  truncate: (str: string, length: number, suffix: string = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },
  
  // Limpiar HTML tags
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, '');
  },
  
  // Escapar HTML
  escapeHtml: (str: string): string => {
    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    
    return str.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
  },
};

// Formateo de datos de usuario
export const formatUser = {
  // Nombre completo
  fullName: (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  },
  
  // Iniciales
  initials: (firstName: string, lastName: string): string => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  },
  
  // Ocultar email parcialmente
  maskEmail: (email: string): string => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const masked = username.charAt(0) + '*'.repeat(username.length - 2) + username.slice(-1);
    return `${masked}@${domain}`;
  },
  
  // Ocultar teléfono parcialmente
  maskPhone: (phone: string): string => {
    if (phone.length <= 4) return phone;
    const visible = phone.slice(-4);
    const masked = '*'.repeat(phone.length - 4);
    return `${masked}${visible}`;
  },
};

// Formateo de estados y enums
export const formatStatus = {
  // Traducir estados de reportes
  reportStatus: (status: string): string => {
    const translations: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso',
      'RESOLVED': 'Resuelto',
      'CLOSED': 'Cerrado',
    };
    return translations[status] || status;
  },
  
  // Traducir tipos de PQR
  pqrType: (type: string): string => {
    const translations: { [key: string]: string } = {
      'PETITION': 'Petición',
      'COMPLAINT': 'Queja',
      'CLAIM': 'Reclamo',
      'SUGGESTION': 'Sugerencia',
    };
    return translations[type] || type;
  },
  
  // Traducir estados de factura
  invoiceStatus: (status: string): string => {
    const translations: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'SENT': 'Enviada',
      'PAID': 'Pagada',
      'OVERDUE': 'Vencida',
      'CANCELLED': 'Cancelada',
    };
    return translations[status] || status;
  },
  
  // Traducir prioridades
  priority: (priority: string): string => {
    const translations: { [key: string]: string } = {
      'LOW': 'Baja',
      'MEDIUM': 'Media',
      'HIGH': 'Alta',
      'URGENT': 'Urgente',
    };
    return translations[priority] || priority;
  },
  
  // Traducir roles de usuario
  userRole: (role: string): string => {
    const translations: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'MANAGER': 'Gerente',
      'USER': 'Usuario',
    };
    return translations[role] || role;
  },
};

// Formateo de respuestas API
export const formatResponse = {
  // Respuesta exitosa
  success: <T>(data: T, message?: string) => ({
    success: true,
    message: message || 'Operación exitosa',
    data,
    timestamp: new Date().toISOString(),
  }),
  
  // Respuesta de error
  error: (message: string, code?: string, details?: any) => ({
    success: false,
    message,
    error: {
      code: code || 'UNKNOWN_ERROR',
      details,
    },
    timestamp: new Date().toISOString(),
  }),
  
  // Respuesta paginada
  paginated: <T>(data: T[], total: number, page: number, limit: number) => ({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  }),
};

// Utilidades de validación de formato
export const validateFormat = {
  // Validar email
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validar teléfono colombiano
  isColombianPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  // Validar cédula colombiana
  isColombianId: (id: string): boolean => {
    const cleanId = id.replace(/\D/g, '');
    if (cleanId.length < 6 || cleanId.length > 10) return false;
    
    // Algoritmo de validación de cédula colombiana
    let sum = 0;
    for (let i = 0; i < cleanId.length - 1; i++) {
      let digit = parseInt(cleanId[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(cleanId[cleanId.length - 1]);
  },
  
  // Validar URL
  isUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

// Exportación para compatibilidad con CommonJS
module.exports = {
  formatDate,
  formatNumber,
  formatText,
  formatUser,
  formatStatus,
  formatResponse,
  validateFormat,
};