const {
  formatDate,
  formatNumber,
  formatText,
  formatUser,
  formatStatus,
  formatResponse,
  validateFormat,
} = require('../formatters');

describe('Date Formatters', () => {
  const testDate = new Date('2023-06-15T14:30:00Z');

  describe('formatDate.toISO', () => {
    it('should format date to ISO string', () => {
      const result = formatDate.toISO(testDate);
      expect(result).toBe('2023-06-15T14:30:00.000Z');
    });
  });

  describe('formatDate.toSpanish', () => {
    it('should format date in Spanish', () => {
      const result = formatDate.toSpanish(testDate);
      expect(result).toMatch(/\d{1,2} de \w+ de \d{4}/);
    });
  });

  describe('formatDate.toShort', () => {
    it('should format date in short format', () => {
      const result = formatDate.toShort(testDate);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDate.toDateTime', () => {
    it('should format date and time', () => {
      const result = formatDate.toDateTime(testDate);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });
  });

  describe('formatDate.toRelative', () => {
    it('should format relative time for recent date', () => {
      const recentDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const result = formatDate.toRelative(recentDate);
      expect(result).toContain('Hace');
    });

    it('should format relative time for future date', () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const result = formatDate.toRelative(futureDate);
      expect(result).toContain('Hace');
    });
  });
});

describe('Number Formatters', () => {
  describe('formatNumber.toCurrency', () => {
    it('should format currency in COP', () => {
      const result = formatNumber.toCurrency(1234567);
      expect(result).toContain('1.234.567');
    });

    it('should format currency with decimals', () => {
      const result = formatNumber.toCurrency(1234.56);
      expect(result).toContain('1.235');
    });
  });

  describe('formatNumber.withSeparators', () => {
    it('should format number with thousand separators', () => {
      const result = formatNumber.withSeparators(1234567);
      expect(result).toBe('1.234.567');
    });
  });

  describe('formatNumber.toPercentage', () => {
    it('should format percentage', () => {
      const result = formatNumber.toPercentage(0.1234);
      expect(result).toBe('12.3%');
    });

    it('should format percentage with custom decimals', () => {
      const result = formatNumber.toPercentage(0.1234, 2);
      expect(result).toBe('12.34%');
    });
  });

  describe('formatNumber.toFileSize', () => {
    it('should format bytes', () => {
      expect(formatNumber.toFileSize(512)).toBe('512.0 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatNumber.toFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatNumber.toFileSize(1572864)).toBe('1.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatNumber.toFileSize(1610612736)).toBe('1.5 GB');
    });
  });
});

describe('Text Formatters', () => {
  describe('formatText.capitalize', () => {
    it('should capitalize first letter', () => {
      expect(formatText.capitalize('hello world')).toBe('Hello world');
    });

    it('should handle empty string', () => {
      expect(formatText.capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(formatText.capitalize('a')).toBe('A');
    });
  });

  describe('formatText.toTitle', () => {
    it('should convert to title case', () => {
      expect(formatText.toTitle('hello world test')).toBe('Hello World Test');
    });

    it('should handle mixed case', () => {
      expect(formatText.toTitle('hELLo WoRLd')).toBe('Hello World');
    });
  });

  describe('formatText.toSlug', () => {
    it('should create slug from text', () => {
      expect(formatText.toSlug('Hello World Test')).toBe('hello-world-test');
    });

    it('should handle special characters', () => {
      expect(formatText.toSlug('Hola! ¿Cómo estás?')).toBe('hola-como-estas');
    });

    it('should handle multiple spaces', () => {
      expect(formatText.toSlug('Hello    World')).toBe('hello-world');
    });
  });

  describe('formatText.truncate', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = formatText.truncate(longText, 20);
      expect(result).toBe('This is a very long...');
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = formatText.truncate(shortText, 20);
      expect(result).toBe(shortText);
    });
  });

  describe('formatText.stripHtml', () => {
    it('should remove HTML tags', () => {
      const html = '<p>Hello <strong>world</strong>!</p>';
      const result = formatText.stripHtml(html);
      expect(result).toBe('Hello world!');
    });

    it('should handle nested tags', () => {
      const html = '<div><p>Test <span>content</span></p></div>';
      const result = formatText.stripHtml(html);
      expect(result).toBe('Test content');
    });
  });

  describe('formatText.escapeHtml', () => {
    it('should escape HTML characters', () => {
      const text = '<script>alert("xss")</script>';
      const result = formatText.escapeHtml(text);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape ampersands', () => {
      const text = 'Tom & Jerry';
      const result = formatText.escapeHtml(text);
      expect(result).toBe('Tom &amp; Jerry');
    });
  });
});

describe('User Data Formatters', () => {
  describe('formatUser.fullName', () => {
    it('should format full name', () => {
      expect(formatUser.fullName('John', 'Doe')).toBe('John Doe');
    });

    it('should handle missing last name', () => {
      expect(formatUser.fullName('John', '')).toBe('John');
    });

    it('should handle empty names', () => {
      expect(formatUser.fullName('', '')).toBe('');
    });
  });

  describe('formatUser.initials', () => {
    it('should create initials from names', () => {
      expect(formatUser.initials('John', 'Doe')).toBe('JD');
    });

    it('should handle single name', () => {
      expect(formatUser.initials('John', '')).toBe('J');
    });

    it('should handle empty names', () => {
      expect(formatUser.initials('', '')).toBe('');
    });
  });

  describe('formatUser.maskEmail', () => {
    it('should mask email address', () => {
      const result = formatUser.maskEmail('john.doe@example.com');
      expect(result).toContain('*');
      expect(result).toContain('@example.com');
    });

    it('should handle short email', () => {
      const result = formatUser.maskEmail('a@b.com');
      expect(result).toBe('a@b.com');
    });
  });

  describe('formatUser.maskPhone', () => {
    it('should mask phone number', () => {
      const result = formatUser.maskPhone('1234567890');
      expect(result).toContain('*');
      expect(result).toContain('7890');
    });

    it('should handle short phone', () => {
      const result = formatUser.maskPhone('12345');
      expect(result).toBe('12345');
    });
  });
});

describe('Status Translators', () => {
  describe('formatStatus.reportStatus', () => {
    it('should translate report statuses', () => {
      expect(formatStatus.reportStatus('PENDING')).toBe('Pendiente');
      expect(formatStatus.reportStatus('IN_PROGRESS')).toBe('En Progreso');
      expect(formatStatus.reportStatus('RESOLVED')).toBe('Resuelto');
      expect(formatStatus.reportStatus('CLOSED')).toBe('Cerrado');
    });

    it('should handle unknown status', () => {
      expect(formatStatus.reportStatus('unknown')).toBe('unknown');
    });
  });

  describe('formatStatus.pqrType', () => {
    it('should translate PQR types', () => {
      expect(formatStatus.pqrType('PETITION')).toBe('Petición');
      expect(formatStatus.pqrType('COMPLAINT')).toBe('Queja');
      expect(formatStatus.pqrType('CLAIM')).toBe('Reclamo');
      expect(formatStatus.pqrType('SUGGESTION')).toBe('Sugerencia');
    });
  });

  describe('formatStatus.priority', () => {
    it('should translate priorities', () => {
      expect(formatStatus.priority('LOW')).toBe('Baja');
      expect(formatStatus.priority('MEDIUM')).toBe('Media');
      expect(formatStatus.priority('HIGH')).toBe('Alta');
      expect(formatStatus.priority('URGENT')).toBe('Urgente');
    });
  });

  describe('formatStatus.userRole', () => {
    it('should translate user roles', () => {
      expect(formatStatus.userRole('ADMIN')).toBe('Administrador');
      expect(formatStatus.userRole('MANAGER')).toBe('Gerente');
      expect(formatStatus.userRole('USER')).toBe('Usuario');
    });
  });
});

describe('API Response Formatters', () => {
  describe('formatResponse.success', () => {
    it('should format success response', () => {
      const data = { id: 1, name: 'Test' };
      const result = formatResponse.success(data, 'Success message');
      
      expect(result).toEqual({
        success: true,
        message: 'Success message',
        data,
        timestamp: expect.any(String)
      });
    });

    it('should format success response without message', () => {
      const data = { id: 1, name: 'Test' };
      const result = formatResponse.success(data);
      
      expect(result).toEqual({
        success: true,
        message: 'Operación exitosa',
        data,
        timestamp: expect.any(String)
      });
    });
  });

  describe('formatResponse.error', () => {
    it('should format error response', () => {
      const result = formatResponse.error('Error message', 'ERROR_CODE');
      
      expect(result).toEqual({
        success: false,
        message: 'Error message',
        error: {
          code: 'ERROR_CODE'
        },
        timestamp: expect.any(String)
      });
    });

    it('should format error response without error code', () => {
      const result = formatResponse.error('Error message');
      
      expect(result).toEqual({
        success: false,
        message: 'Error message',
        error: {
          code: 'UNKNOWN_ERROR'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('formatResponse.paginated', () => {
    it('should format paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = formatResponse.paginated(data, 2, 1, 10);
      
      expect(result).toEqual({
        success: true,
        data,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1,
          hasNext: false,
          hasPrev: false
        },
        timestamp: expect.any(String)
      });
    });
  });
});

describe('Format Validators', () => {
  describe('validateFormat.isEmail', () => {
    it('should validate email format', () => {
      expect(validateFormat.isEmail('test@example.com')).toBe(true);
      expect(validateFormat.isEmail('invalid-email')).toBe(false);
      expect(validateFormat.isEmail('')).toBe(false);
    });
  });

  describe('validateFormat.isColombianPhone', () => {
    it('should validate Colombian phone format', () => {
      expect(validateFormat.isColombianPhone('3001234567')).toBe(true);
      expect(validateFormat.isColombianPhone('+573001234567')).toBe(true);
      expect(validateFormat.isColombianPhone('invalid')).toBe(false);
    });
  });

  describe('validateFormat.isUrl', () => {
    it('should validate URL format', () => {
      expect(validateFormat.isUrl('https://example.com')).toBe(true);
      expect(validateFormat.isUrl('http://example.com')).toBe(true);
      expect(validateFormat.isUrl('invalid-url')).toBe(false);
    });
  });

  describe('validateFormat.isValidDate', () => {
    it('should validate date format', () => {
      expect(validateFormat.isValidDate('2023-12-25')).toBe(true);
      expect(validateFormat.isValidDate('2023/12/25')).toBe(true);
      expect(validateFormat.isValidDate('invalid-date')).toBe(false);
    });
  });
});