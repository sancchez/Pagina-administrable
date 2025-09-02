// Componentes principales del editor profesional
export { EditorToolbar } from './EditorToolbar';
export type { EditorToolbarProps, ToolbarButton } from './EditorToolbar';

export { FormatPanel } from './FormatPanel';
export type { FormatPanelProps, FontOption, ColorOption } from './FormatPanel';

export { HistoryPanel } from './HistoryPanel';
export type { HistoryPanelProps, HistoryEntry } from './HistoryPanel';

// Re-exportar componentes por defecto
export { default as EditorToolbarDefault } from './EditorToolbar';
export { default as FormatPanelDefault } from './FormatPanel';
export { default as HistoryPanelDefault } from './HistoryPanel';