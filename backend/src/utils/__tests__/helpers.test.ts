const {
  security,
  jwtUtils,
  dataUtils,
  timeUtils,
  networkUtils,
  fileUtils,
  validationUtils,
  performanceUtils,
  errorUtils,
} = require('../helpers');

describe('Security Helpers', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashed = await security.hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(typeof hashed).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'password123';
      const hashed = await security.hashPassword(password);
      const isValid = await security.verifyPassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashed = await security.hashPassword(password);
      const isValid = await security.verifyPassword(wrongPassword, hashed);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a random token', () => {
      const token1 = security.generateToken();
      const token2 = security.generateToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
    });

    it('should generate token with specified length', () => {
      const length = 16;
      const token = security.generateToken(length);
      
      expect(token.length).toBe(length * 2); // hex encoding doubles length
    });
  });
});

describe('JWT Helpers', () => {
  const payload = { userId: 1, role: 'user' };

  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      const token = jwtUtils.generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate token with custom expiration', () => {
      const token = jwtUtils.generateAccessToken(payload, '1h');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
      const token = jwtUtils.generateRefreshToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid access token', () => {
      const token = jwtUtils.generateAccessToken(payload);
      const decoded = jwtUtils.verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it('should verify a valid refresh token', () => {
      const token = jwtUtils.generateRefreshToken(payload);
      const decoded = jwtUtils.verifyToken(token, true);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-token';
      const header = `Bearer ${token}`;
      const extracted = jwtUtils.extractTokenFromHeader(header);
      
      expect(extracted).toBe(token);
    });

    it('should return null for invalid header format', () => {
      const invalidHeader = 'Invalid header';
      const extracted = jwtUtils.extractTokenFromHeader(invalidHeader);
      
      expect(extracted).toBeNull();
    });

    it('should return null for undefined header', () => {
      const extracted = jwtUtils.extractTokenFromHeader(undefined);
      
      expect(extracted).toBeNull();
    });
  });
});

describe('Data Manipulation Helpers', () => {
  describe('removeDuplicates', () => {
    it('should remove duplicates from array', () => {
      const array = [1, 2, 2, 3, 3, 4];
      const result = dataUtils.removeDuplicates(array);
      
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should remove duplicates by key', () => {
      const array = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'John Doe' }
      ];
      const result = dataUtils.removeDuplicates(array, 'id');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const array = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 }
      ];
      const result = dataUtils.groupBy(array, 'category');
      
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('should sort array by key ascending', () => {
      const array = [{ value: 3 }, { value: 1 }, { value: 2 }];
      const result = dataUtils.sortBy(array, 'value');
      
      expect(result[0].value).toBe(1);
      expect(result[1].value).toBe(2);
      expect(result[2].value).toBe(3);
    });

    it('should sort array by key descending', () => {
      const array = [{ value: 1 }, { value: 3 }, { value: 2 }];
      const result = dataUtils.sortBy(array, 'value', 'desc');
      
      expect(result[0].value).toBe(3);
      expect(result[1].value).toBe(2);
      expect(result[2].value).toBe(1);
    });
  });

  describe('paginate', () => {
    it('should paginate array', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = dataUtils.paginate(array, 2, 3);
      
      expect(result.data).toEqual([4, 5, 6]);
      expect(result.total).toBe(10);
      expect(result.pages).toBe(4);
    });
  });

  describe('cleanObject', () => {
    it('should remove null and undefined values', () => {
      const obj = { a: 1, b: null, c: undefined, d: 'test' };
      const result = dataUtils.cleanObject(obj);
      
      expect(result).toEqual({ a: 1, d: 'test' });
    });
  });
});

describe('Object Helpers', () => {
  describe('pick', () => {
    it('should pick specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = dataUtils.pick(obj, ['a', 'c']);
      
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = dataUtils.omit(obj, ['b']);
      
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });
});

describe('Time Helpers', () => {
  describe('addTime', () => {
    it('should add minutes to date', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const result = timeUtils.addTime(date, 30, 'minutes');
      
      expect(result.getMinutes()).toBe(30);
    });

    it('should add hours to date', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const result = timeUtils.addTime(date, 2, 'hours');
      
      expect(result.getHours()).toBe(14);
    });
  });

  describe('isInRange', () => {
    it('should check if date is in range', () => {
      const date = new Date('2023-06-15');
      const start = new Date('2023-06-01');
      const end = new Date('2023-06-30');
      
      expect(timeUtils.isInRange(date, start, end)).toBe(true);
    });
  });

  describe('startOfDay', () => {
    it('should return start of day', () => {
      const date = new Date('2023-01-01T15:30:45Z');
      const result = timeUtils.startOfDay(date);
      
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    it('should return end of day', () => {
      const date = new Date('2023-01-01T15:30:45Z');
      const result = timeUtils.endOfDay(date);
      
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });
  });

  describe('isWeekend', () => {
    it('should identify weekend days', () => {
      const saturday = new Date('2023-01-07'); // Saturday
      const sunday = new Date('2023-01-08'); // Sunday
      const monday = new Date('2023-01-09'); // Monday
      
      expect(timeUtils.isWeekend(saturday)).toBe(true);
      expect(timeUtils.isWeekend(sunday)).toBe(true);
      expect(timeUtils.isWeekend(monday)).toBe(false);
    });
  });
});

describe('File Helpers', () => {
  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(fileUtils.getFileExtension('test.jpg')).toBe('jpg');
      expect(fileUtils.getFileExtension('document.pdf')).toBe('pdf');
      expect(fileUtils.getFileExtension('noextension')).toBe('');
    });
  });

  describe('isImage', () => {
    it('should identify image files', () => {
      expect(fileUtils.isImage('photo.jpg')).toBe(true);
      expect(fileUtils.isImage('image.png')).toBe(true);
      expect(fileUtils.isImage('document.pdf')).toBe(false);
    });
  });

  describe('isDocument', () => {
    it('should identify document files', () => {
      expect(fileUtils.isDocument('file.pdf')).toBe(true);
      expect(fileUtils.isDocument('doc.docx')).toBe(true);
      expect(fileUtils.isDocument('image.jpg')).toBe(false);
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate unique filename', () => {
      const filename1 = fileUtils.generateUniqueFilename('test.jpg');
      const filename2 = fileUtils.generateUniqueFilename('test.jpg');
      
      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('test');
      expect(filename1).toContain('.jpg');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filename', () => {
      const result = fileUtils.sanitizeFilename('file with spaces & symbols!.txt');
      
      expect(result).not.toContain(' ');
      expect(result).not.toContain('&');
      expect(result).not.toContain('!');
    });
  });
});

describe('Validation Helpers', () => {
  describe('isEmpty', () => {
    it('should check if string is empty', () => {
      expect(validationUtils.isEmpty('')).toBe(true);
      expect(validationUtils.isEmpty(null)).toBe(true);
      expect(validationUtils.isEmpty(undefined)).toBe(true);
      expect(validationUtils.isEmpty('test')).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('should validate numbers', () => {
      expect(validationUtils.isValidNumber(123)).toBe(true);
      expect(validationUtils.isValidNumber('123')).toBe(true);
      expect(validationUtils.isValidNumber('abc')).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    it('should validate positive integers', () => {
      expect(validationUtils.isPositiveInteger(5)).toBe(true);
      expect(validationUtils.isPositiveInteger(-5)).toBe(false);
      expect(validationUtils.isPositiveInteger(0)).toBe(false);
    });
  });

  describe('isNonEmptyArray', () => {
    it('should check if array is non-empty', () => {
      expect(validationUtils.isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(validationUtils.isNonEmptyArray([])).toBe(false);
      expect(validationUtils.isNonEmptyArray(null)).toBe(false);
    });
  });
});

describe('Performance Helpers', () => {
  describe('measureTime', () => {
    it('should measure execution time', async () => {
      const testFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'result';
      };
      
      const result = await performanceUtils.measureTime(testFunction);
      
      expect(result.result).toBe('result');
      expect(result.duration).toBeGreaterThan(90);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = performanceUtils.debounce(() => {
        callCount++;
      }, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', (done) => {
      let callCount = 0;
      const throttledFn = performanceUtils.throttle(() => {
        callCount++;
      }, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 50);
    });
  });
});

describe('Error Helpers', () => {
  describe('createError', () => {
    it('should create custom error', () => {
      const error = errorUtils.createError('Test error', 'TEST_ERROR', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('isOperationalError', () => {
    it('should identify operational errors', () => {
      const operationalError = errorUtils.createError('Test', 'TEST', 400);
      const systemError = new Error('System error');
      
      expect(errorUtils.isOperationalError(operationalError)).toBe(true);
      expect(errorUtils.isOperationalError(systemError)).toBe(false);
    });
  });

  describe('extractErrorInfo', () => {
    it('should extract error information', () => {
      const error = errorUtils.createError('Test error', 'TEST_ERROR', 400);
      const info = errorUtils.extractErrorInfo(error);
      
      expect(info.message).toBe('Test error');
      expect(info.code).toBe('TEST_ERROR');
      expect(info.statusCode).toBe(400);
    });
  });
});