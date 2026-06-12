import { describe, it, expect, vi } from 'vitest';
import { formatPid } from './utils.ts';

// ---------------------------------------------------------------------------
// formatPid
// ---------------------------------------------------------------------------

describe('formatPid', () => {
    it('formats a 9-digit number with dashes every 3 digits', () => {
        expect(formatPid(123456789)).toBe('123-456-789');
    });

    it('zero-pads numbers shorter than 9 digits', () => {
        expect(formatPid(1)).toBe('000-000-001');
        expect(formatPid(12345)).toBe('000-012-345');
    });

    it('formats zero as all-zero segments', () => {
        expect(formatPid(0)).toBe('000-000-000');
    });

    it('returns null for null or undefined input', () => {
        // @ts-expect-error
        expect(formatPid(null)).toBeNull();
        // @ts-expect-error
        expect(formatPid(undefined)).toBeNull();
    });
});
