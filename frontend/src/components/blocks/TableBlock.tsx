import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import { Plus, Trash2, Edit3, Save, X, AlertCircle } from 'lucide-react';

interface TableCell {
  id: string;
  content: string;
  type?: 'text' | 'number' | 'date' | 'link';
}

interface CellError {
  cellId: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface TableRow {
  id: string;
  cells: TableCell[];
}

interface TableColumn {
  id: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableBlockProps {
  title?: string;
  description?: string;
  columns?: TableColumn[];
  rows?: TableRow[];
  showHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  backgroundColor?: string;
  headerColor?: string;
  textColor?: string;
  borderRadius?: number;
  padding?: number;
}

const defaultColumns: TableColumn[] = [
  { id: '1', header: 'Nombre', width: '30%', align: 'left' },
  { id: '2', header: 'Email', width: '40%', align: 'left' },
  { id: '3', header: 'Teléfono', width: '30%', align: 'center' }
];

const defaultRows: TableRow[] = [
  {
    id: '1',
    cells: [
      { id: '1-1', content: 'Juan Pérez', type: 'text' },
      { id: '1-2', content: 'juan@ejemplo.com', type: 'link' },
      { id: '1-3', content: '+51 999 888 777', type: 'text' }
    ]
  },
  {
    id: '2',
    cells: [
      { id: '2-1', content: 'María García', type: 'text' },
      { id: '2-2', content: 'maria@ejemplo.com', type: 'link' },
      { id: '2-3', content: '+51 999 888 666', type: 'text' }
    ]
  },
  {
    id: '3',
    cells: [
      { id: '3-1', content: 'Carlos López', type: 'text' },
      { id: '3-2', content: 'carlos@ejemplo.com', type: 'link' },
      { id: '3-3', content: '+51 999 888 555', type: 'text' }
    ]
  }
];

export const TableBlock: React.FC<TableBlockProps> = memo(({
  title = 'Tabla de Datos',
  description = 'Información organizada en formato tabular',
  columns = defaultColumns,
  rows = defaultRows,
  showHeader = true,
  striped = true,
  bordered = true,
  hoverable = true,
  compact = false,
  backgroundColor = '#ffffff',
  headerColor = '#f8f9fa',
  textColor = '#333333',
  borderRadius = 8,
  padding = 24
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [cellErrors, setCellErrors] = useState<CellError[]>([]);

  // Funciones de validación memoizadas
  const validateEmail = useCallback((email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return { isValid: false, error: 'El email es requerido' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    return { isValid: true };
  }, []);

  const validateNumber = useCallback((value: string): ValidationResult => {
    if (!value.trim()) {
      return { isValid: false, error: 'El número es requerido' };
    }
    if (isNaN(Number(value))) {
      return { isValid: false, error: 'Debe ser un número válido' };
    }
    return { isValid: true };
  }, []);

  const validateDate = useCallback((date: string): ValidationResult => {
    if (!date.trim()) {
      return { isValid: false, error: 'La fecha es requerida' };
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: 'Formato de fecha inválido' };
    }
    return { isValid: true };
  }, []);

  const validateCellContent = useCallback((content: string, type: string): ValidationResult => {
    if (!content.trim()) {
      return { isValid: false, error: 'El contenido es requerido' };
    }

    switch (type) {
      case 'link':
        if (content.includes('@')) {
          return validateEmail(content);
        } else if (content.startsWith('http')) {
          try {
            new URL(content);
            return { isValid: true };
          } catch {
            return { isValid: false, error: 'URL inválida' };
          }
        }
        return { isValid: true };
      case 'number':
        return validateNumber(content);
      case 'date':
        return validateDate(content);
      default:
        return { isValid: true };
    }
  }, [validateEmail, validateNumber, validateDate]);

  const startEditing = useCallback((cellId: string, currentValue: string) => {
    setEditingCell(cellId);
    setEditValue(currentValue);
    // Limpiar errores al empezar a editar
    setCellErrors(prev => prev.filter(error => error.cellId !== cellId));
  }, []);

  const saveEdit = useCallback(() => {
    if (editingCell) {
      // Encontrar el tipo de celda para validar
      const [rowId, cellIndex] = editingCell.split('-');
      const rowIndex = rows?.findIndex(r => r.id === rowId);
      const cellType = rowIndex !== undefined && rowIndex >= 0 && rows ? 
        rows[rowIndex].cells[parseInt(cellIndex) - 1].type || 'text' : 'text';
      
      // Validar el contenido
      const validation = validateCellContent(editValue, cellType);
      
      if (!validation.isValid) {
        setCellErrors(prev => [
          ...prev.filter(error => error.cellId !== editingCell),
          { cellId: editingCell, message: validation.error || 'Error de validación' }
        ]);
        return;
      }
      
      // Si la validación pasa, guardar el valor
      setProp((props: TableBlockProps) => {
        const rowIndex = props.rows?.findIndex(r => r.id === rowId);
        if (rowIndex !== undefined && rowIndex >= 0 && props.rows) {
          props.rows[rowIndex].cells[parseInt(cellIndex) - 1].content = editValue;
        }
      });
      
      // Limpiar errores y estado de edición
      setCellErrors(prev => prev.filter(error => error.cellId !== editingCell));
    }
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, rows, validateCellContent, setProp]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
    // Limpiar errores al cancelar
    if (editingCell) {
      setCellErrors(prev => prev.filter(error => error.cellId !== editingCell));
    }
  }, [editingCell]);

  // Función para obtener errores de una celda específica
  const getCellError = useCallback((cellId: string) => {
    return cellErrors.find(error => error.cellId === cellId);
  }, [cellErrors]);

  const renderCellContent = useCallback((cell: TableCell) => {
    const cellError = getCellError(cell.id);
    const hasError = !!cellError;
    
    if (editingCell === cell.id) {
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`flex-1 px-2 py-1 border rounded text-sm ${
                hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button
              onClick={saveEdit}
              className="text-green-600 hover:text-green-800"
            >
              <Save size={14} />
            </button>
            <button
              onClick={cancelEdit}
              className="text-red-600 hover:text-red-800"
            >
              <X size={14} />
            </button>
          </div>
          {hasError && (
            <div className="flex items-center space-x-1 text-red-600 text-xs">
              <AlertCircle size={12} />
              <span>{cellError.message}</span>
            </div>
          )}
        </div>
      );
    }

    const content = cell.content;
    
    switch (cell.type) {
      case 'link':
        if (content.includes('@')) {
          return (
            <a href={`mailto:${content}`} className="text-blue-600 hover:text-blue-800 underline">
              {content}
            </a>
          );
        } else if (content.startsWith('http')) {
          return (
            <a href={content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
              {content}
            </a>
          );
        }
        return content;
      case 'number':
        return <span className="font-mono">{content}</span>;
      case 'date':
        return <span className="text-gray-600">{content}</span>;
      default:
        return content;
    }
  }, [editingCell, editValue, getCellError, saveEdit, cancelEdit]);

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor,
        color: textColor,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`
      }}
    >
      {selected && (
        <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Tabla
        </div>
      )}
      
      <div className="text-center mb-6">
        {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      
      <div className="overflow-x-auto">
        <table className={`w-full ${bordered ? 'border-collapse' : ''}`}>
          {showHeader && (
            <thead>
              <tr style={{ backgroundColor: headerColor }}>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} text-left font-semibold ${
                      bordered ? 'border border-gray-300' : ''
                    }`}
                    style={{
                      width: column.width,
                      textAlign: column.align
                    }}
                  >
                    {column.header}
                  </th>
                ))}
                {selected && (
                  <th className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} w-20 ${
                    bordered ? 'border border-gray-300' : ''
                  }`}>
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`${
                  striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''
                } ${
                  hoverable ? 'hover:bg-gray-100' : ''
                } transition-colors`}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cell.id}
                    className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} ${
                      bordered ? 'border border-gray-300' : ''
                    } group cursor-pointer`}
                    style={{ textAlign: columns[cellIndex]?.align || 'left' }}
                    onClick={() => selected && startEditing(cell.id, cell.content)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {renderCellContent(cell)}
                      </div>
                      {selected && editingCell !== cell.id && (
                        <button
                          className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(cell.id, cell.content);
                          }}
                        >
                          <Edit3 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                ))}
                {selected && (
                  <td className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} ${
                    bordered ? 'border border-gray-300' : ''
                  }`}>
                    <button
                      onClick={() => {
                        setProp((props: TableBlockProps) => {
                          props.rows = props.rows?.filter(r => r.id !== row.id) || [];
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selected && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              const newRowId = Date.now().toString();
              const newRow: TableRow = {
                id: newRowId,
                cells: columns.map((col, index) => ({
                  id: `${newRowId}-${index + 1}`,
                  content: '',
                  type: 'text'
                }))
              };
              setProp((props: TableBlockProps) => {
                props.rows = [...(props.rows || []), newRow];
              });
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Agregar Fila</span>
          </button>
        </div>
      )}
    </div>
  );
});

const TableBlockSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  const [newColumn, setNewColumn] = useState({ header: '', width: '25%', align: 'left' as const });

  const addColumn = () => {
    if (newColumn.header) {
      const columnId = Date.now().toString();
      const column: TableColumn = {
        id: columnId,
        header: newColumn.header,
        width: newColumn.width,
        align: newColumn.align
      };
      
      setProp((props: TableBlockProps) => {
        props.columns = [...(props.columns || []), column];
        // Agregar celda vacía a cada fila existente
        props.rows = props.rows?.map(row => ({
          ...row,
          cells: [...row.cells, {
            id: `${row.id}-${(props.columns?.length || 0) + 1}`,
            content: '',
            type: 'text'
          }]
        })) || [];
      });
      
      setNewColumn({ header: '', width: '25%', align: 'left' });
    }
  };

  const removeColumn = (columnId: string) => {
    setProp((props: TableBlockProps) => {
      const columnIndex = props.columns?.findIndex(c => c.id === columnId);
      if (columnIndex !== undefined && columnIndex >= 0) {
        props.columns = props.columns?.filter(c => c.id !== columnId) || [];
        // Remover celda correspondiente de cada fila
        props.rows = props.rows?.map(row => ({
          ...row,
          cells: row.cells.filter((_, index) => index !== columnIndex)
        })) || [];
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((props: TableBlockProps) => props.title = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={props.description || ''}
          onChange={(e) => setProp((props: TableBlockProps) => props.description = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Color de Fondo</label>
          <input
            type="color"
            value={props.backgroundColor || '#ffffff'}
            onChange={(e) => setProp((props: TableBlockProps) => props.backgroundColor = e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color del Encabezado</label>
          <input
            type="color"
            value={props.headerColor || '#f8f9fa'}
            onChange={(e) => setProp((props: TableBlockProps) => props.headerColor = e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Color de Texto</label>
        <input
          type="color"
          value={props.textColor || '#333333'}
          onChange={(e) => setProp((props: TableBlockProps) => props.textColor = e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Radio de Borde</label>
        <input
          type="range"
          min="0"
          max="20"
          value={props.borderRadius || 8}
          onChange={(e) => setProp((props: TableBlockProps) => props.borderRadius = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.borderRadius || 8}px</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Padding</label>
        <input
          type="range"
          min="8"
          max="48"
          value={props.padding || 24}
          onChange={(e) => setProp((props: TableBlockProps) => props.padding = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.padding || 24}px</span>
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.showHeader || false}
            onChange={(e) => setProp((props: TableBlockProps) => props.showHeader = e.target.checked)}
            className="mr-2"
          />
          Mostrar encabezado
        </label>
        
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.striped || false}
            onChange={(e) => setProp((props: TableBlockProps) => props.striped = e.target.checked)}
            className="mr-2"
          />
          Filas alternadas
        </label>
        
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.bordered || false}
            onChange={(e) => setProp((props: TableBlockProps) => props.bordered = e.target.checked)}
            className="mr-2"
          />
          Mostrar bordes
        </label>
        
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.hoverable || false}
            onChange={(e) => setProp((props: TableBlockProps) => props.hoverable = e.target.checked)}
            className="mr-2"
          />
          Efecto hover
        </label>
        
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.compact || false}
            onChange={(e) => setProp((props: TableBlockProps) => props.compact = e.target.checked)}
            className="mr-2"
          />
          Diseño compacto
        </label>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Columnas</h4>
        
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {props.columns?.map((column: TableColumn) => (
            <div key={column.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div>
                <div className="font-medium text-sm">{column.header}</div>
                <div className="text-xs text-gray-500">
                  {column.width} - {column.align}
                </div>
              </div>
              <button
                onClick={() => removeColumn(column.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 p-3 border border-gray-200 rounded">
          <h5 className="text-sm font-medium">Agregar Columna</h5>
          
          <input
            type="text"
            placeholder="Nombre de la columna"
            value={newColumn.header}
            onChange={(e) => setNewColumn(prev => ({ ...prev, header: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Ancho (ej: 25%)"
              value={newColumn.width}
              onChange={(e) => setNewColumn(prev => ({ ...prev, width: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <select
              value={newColumn.align}
              onChange={(e) => setNewColumn(prev => ({ ...prev, align: e.target.value as any }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          
          <button
            onClick={addColumn}
            className="w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
          >
            <Plus size={16} className="inline mr-1" />
            Agregar Columna
          </button>
        </div>
      </div>
    </div>
  );
};

TableBlock.craft = {
  props: {
    title: 'Tabla de Datos',
    description: 'Información organizada en formato tabular',
    columns: defaultColumns,
    rows: defaultRows,
    showHeader: true,
    striped: true,
    bordered: true,
    hoverable: true,
    compact: false,
    backgroundColor: '#ffffff',
    headerColor: '#f8f9fa',
    textColor: '#333333',
    borderRadius: 8,
    padding: 24
  },
  related: {
    settings: TableBlockSettings
  }
};

export { TableBlockSettings };