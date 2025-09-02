import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, AlignLeft, AlignCenter, AlignRight, Palette } from 'lucide-react';

interface TableEditorProps {
  position: { x: number; y: number };
  onTableCreate: (tableHTML: string) => void;
  onClose: () => void;
  existingTable?: HTMLTableElement;
}

interface TableCell {
  content: string;
  isHeader: boolean;
  align: 'left' | 'center' | 'right';
  backgroundColor: string;
  textColor: string;
}

interface TableData {
  rows: TableCell[][];
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  headerBackgroundColor: string;
  alternateRowColor: string;
  cellPadding: number;
}

export default function TableEditor({ position, onTableCreate, onClose, existingTable }: TableEditorProps) {
  const [tableData, setTableData] = useState<TableData>({
    rows: [
      [
        { content: 'Encabezado 1', isHeader: true, align: 'left', backgroundColor: '#f3f4f6', textColor: '#1f2937' },
        { content: 'Encabezado 2', isHeader: true, align: 'left', backgroundColor: '#f3f4f6', textColor: '#1f2937' },
        { content: 'Encabezado 3', isHeader: true, align: 'left', backgroundColor: '#f3f4f6', textColor: '#1f2937' }
      ],
      [
        { content: 'Celda 1', isHeader: false, align: 'left', backgroundColor: '#ffffff', textColor: '#1f2937' },
        { content: 'Celda 2', isHeader: false, align: 'left', backgroundColor: '#ffffff', textColor: '#1f2937' },
        { content: 'Celda 3', isHeader: false, align: 'left', backgroundColor: '#ffffff', textColor: '#1f2937' }
      ],
      [
        { content: 'Celda 4', isHeader: false, align: 'left', backgroundColor: '#f9fafb', textColor: '#1f2937' },
        { content: 'Celda 5', isHeader: false, align: 'left', backgroundColor: '#f9fafb', textColor: '#1f2937' },
        { content: 'Celda 6', isHeader: false, align: 'left', backgroundColor: '#f9fafb', textColor: '#1f2937' }
      ]
    ],
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderStyle: 'solid',
    headerBackgroundColor: '#f3f4f6',
    alternateRowColor: '#f9fafb',
    cellPadding: 8
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Cargar tabla existente si se proporciona
  useEffect(() => {
    if (existingTable) {
      // Aquí podrías implementar la lógica para cargar una tabla existente
      // Por simplicidad, mantenemos la tabla por defecto
    }
  }, [existingTable]);

  // Agregar fila
  const addRow = () => {
    const newRow: TableCell[] = tableData.rows[0].map((_, index) => ({
      content: `Nueva celda ${index + 1}`,
      isHeader: false,
      align: 'left',
      backgroundColor: tableData.rows.length % 2 === 0 ? '#ffffff' : tableData.alternateRowColor,
      textColor: '#1f2937'
    }));
    
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  // Eliminar fila
  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length > 1) {
      setTableData(prev => ({
        ...prev,
        rows: prev.rows.filter((_, index) => index !== rowIndex)
      }));
    }
  };

  // Agregar columna
  const addColumn = () => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, rowIndex) => [
        ...row,
        {
          content: rowIndex === 0 ? 'Nuevo encabezado' : 'Nueva celda',
          isHeader: rowIndex === 0,
          align: 'left',
          backgroundColor: rowIndex === 0 ? prev.headerBackgroundColor : (rowIndex % 2 === 0 ? '#ffffff' : prev.alternateRowColor),
          textColor: '#1f2937'
        }
      ])
    }));
  };

  // Eliminar columna
  const removeColumn = (colIndex: number) => {
    if (tableData.rows[0].length > 1) {
      setTableData(prev => ({
        ...prev,
        rows: prev.rows.map(row => row.filter((_, index) => index !== colIndex))
      }));
    }
  };

  // Actualizar contenido de celda
  const updateCellContent = (rowIndex: number, colIndex: number, content: string) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, rIndex) => 
        rIndex === rowIndex 
          ? row.map((cell, cIndex) => 
              cIndex === colIndex ? { ...cell, content } : cell
            )
          : row
      )
    }));
  };

  // Actualizar alineación de celda
  const updateCellAlignment = (rowIndex: number, colIndex: number, align: 'left' | 'center' | 'right') => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, rIndex) => 
        rIndex === rowIndex 
          ? row.map((cell, cIndex) => 
              cIndex === colIndex ? { ...cell, align } : cell
            )
          : row
      )
    }));
  };

  // Generar HTML de la tabla
  const generateTableHTML = () => {
    const tableStyle = `
      border-collapse: collapse;
      width: 100%;
      border: ${tableData.borderWidth}px ${tableData.borderStyle} ${tableData.borderColor};
    `;

    const cellStyle = (cell: TableCell) => `
      padding: ${tableData.cellPadding}px;
      border: ${tableData.borderWidth}px ${tableData.borderStyle} ${tableData.borderColor};
      text-align: ${cell.align};
      background-color: ${cell.backgroundColor};
      color: ${cell.textColor};
    `;

    const rows = tableData.rows.map((row) => {
      const cells = row.map((cell) => {
        const tag = cell.isHeader ? 'th' : 'td';
        return `<${tag} style="${cellStyle(cell)}" contenteditable="true">${cell.content}</${tag}>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `<table style="${tableStyle}" data-movable="true" data-resizable="true">${rows}</table>`;
  };

  // Aplicar estilos predefinidos
  const applyTableStyle = (styleName: string) => {
    const styles = {
      minimal: {
        borderColor: '#e5e7eb',
        borderWidth: 1,
        headerBackgroundColor: '#f9fafb',
        alternateRowColor: '#ffffff'
      },
      modern: {
        borderColor: '#3b82f6',
        borderWidth: 2,
        headerBackgroundColor: '#3b82f6',
        alternateRowColor: '#eff6ff'
      },
      dark: {
        borderColor: '#374151',
        borderWidth: 1,
        headerBackgroundColor: '#1f2937',
        alternateRowColor: '#374151'
      }
    };

    const style = styles[styleName as keyof typeof styles];
    if (style) {
      setTableData(prev => ({ ...prev, ...style }));
    }
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={editorRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold text-gray-800">Editor de Tablas</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ×
        </button>
      </div>

      {/* Controles de estructura */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={addRow}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            <Plus size={12} /> Fila
          </button>
          <button
            onClick={addColumn}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <Plus size={12} /> Columna
          </button>
          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            <Palette size={12} /> Estilos
          </button>
        </div>

        {/* Estilos predefinidos */}
        {showStylePanel && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => applyTableStyle('minimal')}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Minimal
              </button>
              <button
                onClick={() => applyTableStyle('modern')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Moderno
              </button>
              <button
                onClick={() => applyTableStyle('dark')}
                className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Oscuro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vista previa de la tabla */}
      <div className="p-3">
        <div className="border rounded overflow-hidden">
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const CellComponent = cell.isHeader ? 'th' : 'td';
                    return (
                      <CellComponent
                        key={`${rowIndex}-${colIndex}`}
                        className="border p-1 cursor-pointer hover:bg-blue-50"
                        style={{
                          backgroundColor: cell.backgroundColor,
                          color: cell.textColor,
                          textAlign: cell.align,
                          borderColor: tableData.borderColor
                        }}
                        onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      >
                        <input
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateCellContent(rowIndex, colIndex, e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs"
                          style={{ color: cell.textColor }}
                        />
                      </CellComponent>
                    );
                  })}
                  <td className="p-1">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar fila"
                    >
                      <Minus size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                {tableData.rows[0].map((_, colIndex) => (
                  <td key={colIndex} className="p-1 text-center">
                    <button
                      onClick={() => removeColumn(colIndex)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar columna"
                    >
                      <Minus size={12} />
                    </button>
                  </td>
                ))}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de celda seleccionada */}
      {selectedCell && (
        <div className="p-3 border-t bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">
            Celda seleccionada: Fila {selectedCell.row + 1}, Columna {selectedCell.col + 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCellAlignment(selectedCell.row, selectedCell.col, 'left')}
              className={`p-1 rounded ${
                tableData.rows[selectedCell.row][selectedCell.col].align === 'left'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              <AlignLeft size={12} />
            </button>
            <button
              onClick={() => updateCellAlignment(selectedCell.row, selectedCell.col, 'center')}
              className={`p-1 rounded ${
                tableData.rows[selectedCell.row][selectedCell.col].align === 'center'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              <AlignCenter size={12} />
            </button>
            <button
              onClick={() => updateCellAlignment(selectedCell.row, selectedCell.col, 'right')}
              className={`p-1 rounded ${
                tableData.rows[selectedCell.row][selectedCell.col].align === 'right'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              <AlignRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 p-3 border-t">
        <button
          onClick={() => {
            const tableHTML = generateTableHTML();
            onTableCreate(tableHTML);
            onClose();
          }}
          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Insertar Tabla
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}