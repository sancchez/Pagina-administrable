import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface EditableTableProps {
  id: string;
  rows: number;
  columns: number;
  position: Position;
  size: Size;
  onUpdate: (updates: Partial<any>) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({
  id,
  rows,
  columns,
  position,
  size,
  onUpdate
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [tableData, setTableData] = useState<string[][]>(() => {
    return Array(rows).fill(null).map((_, rowIndex) => 
      Array(columns).fill(null).map((_, colIndex) => 
        rowIndex === 0 ? `Encabezado ${colIndex + 1}` : `Celda ${rowIndex}-${colIndex + 1}`
      )
    );
  });

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
    onUpdate({ tableData: newData });
  };

  const handleAddRow = () => {
    const newRow = Array(columns).fill('').map((_, colIndex) => `Nueva ${tableData.length}-${colIndex + 1}`);
    const newData = [...tableData, newRow];
    setTableData(newData);
    onUpdate({ rows: rows + 1, tableData: newData });
  };

  const handleRemoveRow = () => {
    if (tableData.length > 1) {
      const newData = tableData.slice(0, -1);
      setTableData(newData);
      onUpdate({ rows: rows - 1, tableData: newData });
    }
  };

  const handleAddColumn = () => {
    const newData = tableData.map((row, rowIndex) => [
      ...row,
      rowIndex === 0 ? `Encabezado ${row.length + 1}` : `Celda ${rowIndex}-${row.length + 1}`
    ]);
    setTableData(newData);
    onUpdate({ columns: columns + 1, tableData: newData });
  };

  const handleRemoveColumn = () => {
    if (tableData[0]?.length > 1) {
      const newData = tableData.map(row => row.slice(0, -1));
      setTableData(newData);
      onUpdate({ columns: columns - 1, tableData: newData });
    }
  };

  const handleDelete = () => {
    onUpdate({ deleted: true });
  };

  return (
    <div
      className={`absolute select-none ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
      onClick={() => setIsSelected(!isSelected)}
    >
      <div className="w-full h-full overflow-auto border border-gray-300 rounded">
        <table className="w-full h-full border-collapse">
          <thead>
            <tr>
              {tableData[0]?.map((cell, colIndex) => (
                <th
                  key={colIndex}
                  className="border border-gray-300 bg-gray-100 p-2 text-left font-semibold"
                >
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(0, colIndex, e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex + 1}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex + 1, colIndex, e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isSelected && (
        <div className="absolute -top-12 left-0 flex gap-1 bg-white border rounded shadow-lg p-1">
          <button
            onClick={handleAddRow}
            className="p-1 hover:bg-gray-100 rounded"
            title="Agregar fila"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleRemoveRow}
            className="p-1 hover:bg-gray-100 rounded"
            title="Quitar fila"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleAddColumn}
            className="p-1 hover:bg-gray-100 rounded"
            title="Agregar columna"
          >
            <Plus size={14} className="rotate-90" />
          </button>
          <button
            onClick={handleRemoveColumn}
            className="p-1 hover:bg-gray-100 rounded"
            title="Quitar columna"
          >
            <Minus size={14} className="rotate-90" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Eliminar tabla"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableTable;