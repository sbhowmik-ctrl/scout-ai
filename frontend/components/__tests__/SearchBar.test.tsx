/**
 * Unit Tests for SearchBar Component
 * 
 * Tests:
 * - Input handling and state updates
 * - Form submission with valid input
 * - Empty input prevention
 * - Loading state display
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '../SearchBar';

describe('SearchBar Component', () => {
  describe('Input Handling', () => {
    it('should render input field with placeholder', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      expect(input).toBeInTheDocument();
    });

    it('should update input value when user types', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i) as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'Kylian Mbappe' } });
      
      expect(input.value).toBe('Kylian Mbappe');
    });

    it('should maintain controlled input state', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i) as HTMLInputElement;
      
      // Type multiple characters
      fireEvent.change(input, { target: { value: 'M' } });
      expect(input.value).toBe('M');
      
      fireEvent.change(input, { target: { value: 'Mb' } });
      expect(input.value).toBe('Mb');
      
      fireEvent.change(input, { target: { value: 'Mbappe' } });
      expect(input.value).toBe('Mbappe');
    });
  });

  describe('Form Submission', () => {
    it('should call onSearch with valid input when form is submitted', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      const form = input.closest('form')!;
      
      fireEvent.change(input, { target: { value: 'Lionel Messi' } });
      fireEvent.submit(form);
      
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('Lionel Messi');
    });

    it('should call onSearch when search button is clicked', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      const button = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'Cristiano Ronaldo' } });
      fireEvent.click(button);
      
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('Cristiano Ronaldo');
    });

    it('should trim whitespace from input before calling onSearch', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      const form = input.closest('form')!;
      
      fireEvent.change(input, { target: { value: '  Neymar Jr  ' } });
      fireEvent.submit(form);
      
      expect(mockOnSearch).toHaveBeenCalledWith('Neymar Jr');
    });
  });

  describe('Empty Input Prevention', () => {
    it('should not call onSearch when input is empty', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const form = screen.getByPlaceholderText(/enter player name/i).closest('form')!;
      
      fireEvent.submit(form);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not call onSearch when input contains only whitespace', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      const form = input.closest('form')!;
      
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.submit(form);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should disable submit button when input is empty', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const button = screen.getByRole('button', { name: /search/i });
      
      expect(button).toBeDisabled();
    });

    it('should enable submit button when input has valid text', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      const button = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'Player Name' } });
      
      expect(button).not.toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should display loading text when isLoading is true', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
      
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });

    it('should display normal search text when isLoading is false', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const button = screen.getByRole('button', { name: /search/i });
      expect(button).toHaveTextContent('[ SEARCH ]');
      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
    });

    it('should disable input field when isLoading is true', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      expect(input).toBeDisabled();
    });

    it('should disable submit button when isLoading is true', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should enable input field when isLoading is false', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByPlaceholderText(/enter player name/i);
      expect(input).not.toBeDisabled();
    });

    it('should show loading spinner when isLoading is true', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
      
      // Check for spinner SVG element
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on input', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      const input = screen.getByLabelText(/player name search/i);
      expect(input).toBeInTheDocument();
    });

    it('should have search icon visible', () => {
      const mockOnSearch = jest.fn();
      render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
      
      // Check for search icon SVG
      const searchIcon = document.querySelector('svg path[d*="M21 21l-6-6"]');
      expect(searchIcon).toBeInTheDocument();
    });
  });
});
