import { describe, it, expect } from 'vitest';
import { cn } from "@/lib/utils";

describe('utils', () => {
  describe('cn', () => {
    it('should merge single class correctly', () => {
      expect(cn('text-red-500')).toBe('text-red-500');
    });

    it('should merge multiple classes correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes with truthy values', () => {
      const isActive = true;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class');
    });

    it('should handle conditional classes with falsy values', () => {
      const isActive = false;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class');
    });

    it('should handle null and undefined values', () => {
      expect(cn('base-class', null, undefined)).toBe('base-class');
    });

    it('should handle array of classes', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
    });

    it('should handle object with truthy keys', () => {
      expect(cn({ 'class1': true, 'class2': false })).toBe('class1');
    });

    it('should merge tailwind classes properly', () => {
      // tailwind-merge should handle conflicting classes
      expect(cn('px-2 px-4')).toBe('px-4');
    });

    it('should handle complex combinations', () => {
      const variant = 'primary';
      const size = 'large';
      const disabled = false;
      
      const result = cn(
        'base',
        variant === 'primary' && 'bg-blue-500',
        size === 'large' ? 'text-lg' : 'text-sm',
        disabled && 'opacity-50',
        ['flex', 'items-center'],
        { 'justify-center': true }
      );
      
      expect(result).toBe('base bg-blue-500 text-lg flex items-center justify-center');
    });

    it('should handle empty string arguments', () => {
      expect(cn('', 'class1', '', 'class2', '')).toBe('class1 class2');
    });

    it('should handle boolean false values', () => {
      expect(cn('class1', false, 'class2')).toBe('class1 class2');
    });

    it('should handle zero as falsy in objects', () => {
      expect(cn({ 'class1': 0, 'class2': 1 })).toBe('class2');
    });
  });
});
