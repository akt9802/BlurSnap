import { useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';

export function useKeyboardShortcuts() {
  const { setActiveTool, undo, redo, selection, removeElement } = useEditorStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for modifier keys
      const isMod = e.metaKey || e.ctrlKey;

      // Undo/Redo
      if (isMod && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      // Delete selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection.selectedIds.length > 0) {
          e.preventDefault();
          selection.selectedIds.forEach((id) => removeElement(id));
        }
        return;
      }

      // Tool shortcuts (only if no modifier keys)
      if (!isMod && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'b':
            setActiveTool('blur');
            break;
          case 'h':
            setActiveTool('highlighter');
            break;
          case 'p':
            setActiveTool('pen');
            break;
          case 'a':
            setActiveTool('arrow');
            break;
          case 'l':
            setActiveTool('line');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'escape':
            setActiveTool('select');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setActiveTool, undo, redo, selection, removeElement]);
}
