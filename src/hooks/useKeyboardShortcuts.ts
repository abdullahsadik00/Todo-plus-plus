'use client';

import { useEffect } from 'react';

/**
 * Element ids the shortcuts focus. Kept here so the hook and the components that
 * render those inputs agree on one string instead of two copies of a literal.
 */
export const SEARCH_INPUT_ID = 'task-search';
export const NEW_TASK_INPUT_ID = 'new-task-title';

/** True when focus is already in a field, so a bare letter key means "type", not "command". */
function isTypingInAField(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
    );
}

function focusById(id: string) {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.focus();
        el.select();
        return true;
    }
    return false;
}

/**
 * Global shortcuts:
 *   `/` or `Cmd/Ctrl+K` — focus search
 *   `n`                 — focus the new-task field
 *   `Escape`            — leave the field you're in
 *
 * Registered once, at the page level. A listener per task row would be N listeners
 * competing for the same keys.
 */
export function useKeyboardShortcuts() {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const typing = isTypingInAField(e.target);

            // Cmd/Ctrl+K works even while typing — it's an explicit chord, not a letter.
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                if (focusById(SEARCH_INPUT_ID)) e.preventDefault();
                return;
            }

            if (e.key === 'Escape' && typing) {
                (e.target as HTMLElement).blur();
                return;
            }

            // Bare letter keys are only commands when you're not in a field.
            if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

            if (e.key === '/') {
                if (focusById(SEARCH_INPUT_ID)) e.preventDefault();
            } else if (e.key.toLowerCase() === 'n') {
                if (focusById(NEW_TASK_INPUT_ID)) e.preventDefault();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
}
