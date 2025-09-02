export class EditorHistory {
  private history: string[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;
  private debounceTimer: number | null = null;
  private pendingContent: string | null = null;
  private lastSaveTime: number = 0;
  private minSaveInterval: number = 1000; // 1 segundo mínimo entre saves

  addState(content: string, immediate: boolean = false) {
    // Si es inmediato (como drag&drop, formato, etc.), agregar sin debounce
    if (immediate) {
      this.saveToHistory(content);
      return;
    }

    // Para cambios de texto, usar debounce
    this.pendingContent = content;
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.pendingContent) {
        this.saveToHistory(this.pendingContent);
        this.pendingContent = null;
      }
    }, 500); // 500ms de debounce
  }

  private saveToHistory(content: string) {
    const now = Date.now();
    
    // Evitar guardar muy frecuentemente
    if (now - this.lastSaveTime < this.minSaveInterval && this.history.length > 0) {
      return;
    }

    // Remover estados futuros si estamos en el medio del historial
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Agregar nuevo estado solo si es diferente al actual
    const currentContent = this.history[this.currentIndex];
    if (currentContent !== content && content.trim() !== '') {
      this.history.push(content);
      this.currentIndex++;
      this.lastSaveTime = now;

      // Mantener el tamaño del historial
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }

      console.log('📚 Estado guardado en historial. Total estados:', this.history.length);
    }
  }

  undo(): string | null {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo(): string | null {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  getCurrentState(): string | null {
    return this.history[this.currentIndex] || null;
  }

  getHistoryInfo() {
    return {
      totalStates: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  // Forzar guardar el estado pendiente
  flushPending() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    if (this.pendingContent) {
      this.saveToHistory(this.pendingContent);
      this.pendingContent = null;
    }
  }
}