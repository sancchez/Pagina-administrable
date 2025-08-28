export class EditorHistory {
  private history: string[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  addState(content: string) {
    // Remover estados futuros si estamos en el medio del historial
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Agregar nuevo estado solo si es diferente al actual
    if (this.history[this.currentIndex] !== content) {
      this.history.push(content);
      this.currentIndex++;

      // Mantener el tamaño del historial
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }
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
}