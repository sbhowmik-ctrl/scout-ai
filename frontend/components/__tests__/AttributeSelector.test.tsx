/**
 * Unit Tests for AttributeSelector Component
 * 
 * Tests rendering, click handlers, selected state styling, and disabled state.
 * Validates: Requirements 1.1, 1.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttributeSelector } from '../AttributeSelector';

describe('AttributeSelector Component', () => {
  describe('Rendering Tests', () => {
    /**
     * **Validates: Requirement 1.1**
     * 
     * Test that all 6 attribute category buttons are rendered.
     */
    it('should render all 6 attribute category buttons', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      // Verify all 6 buttons are rendered
      expect(screen.getByLabelText('Select Pace attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Shooting attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Passing attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Dribbling attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Defending attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Physical attribute')).toBeInTheDocument();
    });

    it('should render section header', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      // Verify header is displayed
      expect(screen.getByText('> SEARCH BY ATTRIBUTE')).toBeInTheDocument();
    });

    it('should render all attribute labels', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      // Verify all labels are displayed (case-insensitive)
      expect(screen.getByText(/pace/i)).toBeInTheDocument();
      expect(screen.getByText(/shooting/i)).toBeInTheDocument();
      expect(screen.getByText(/passing/i)).toBeInTheDocument();
      expect(screen.getByText(/dribbling/i)).toBeInTheDocument();
      expect(screen.getByText(/defending/i)).toBeInTheDocument();
      expect(screen.getByText(/physical/i)).toBeInTheDocument();
    });

    it('should render all attribute icons', () => {
      const mockOnSelect = jest.fn();

      const { container } = render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      // Verify icons are rendered (checking for emoji characters)
      expect(container.textContent).toContain('⚡'); // Pace
      expect(container.textContent).toContain('🎯'); // Shooting
      expect(container.textContent).toContain('🔄'); // Passing
      expect(container.textContent).toContain('⚽'); // Dribbling
      expect(container.textContent).toContain('🛡️'); // Defending
      expect(container.textContent).toContain('💪'); // Physical
    });
  });

  describe('Click Handler Tests', () => {
    /**
     * **Validates: Requirement 1.3**
     * 
     * Test that clicking buttons triggers the onAttributeSelect callback.
     */
    it('should call onAttributeSelect with "pace" when Pace button is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');
      fireEvent.click(paceButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith('pace');
    });

    it('should call onAttributeSelect with "shooting" when Shooting button is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const shootingButton = screen.getByLabelText('Select Shooting attribute');
      fireEvent.click(shootingButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith('shooting');
    });

    it('should call onAttributeSelect with "passing" when Passing button is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const passingButton = screen.getByLabelText('Select Passing attribute');
      fireEvent.click(passingButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith('passing');
    });

    it('should call onAttributeSelect with "dribbling" when Dribbling button is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const dribblingButton = screen.getByLabelText('Select Dribbling attribute');
      fireEvent.click(dribblingButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith('dribbling');
    });

    it('should call onAttributeSelect with "defending" when Defending button is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const defendingButton = screen.getByLabelText('Select Defending attribute');
      fireEvent.click(defendingButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith('defending');
    });

    it('should call onAttributeSelect with "physical" when Physical button is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const physicalButton = screen.getByLabelText('Select Physical attribute');
      fireEvent.click(physicalButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith('physical');
    });

    it('should handle multiple button clicks', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');
      const shootingButton = screen.getByLabelText('Select Shooting attribute');

      fireEvent.click(paceButton);
      fireEvent.click(shootingButton);
      fireEvent.click(paceButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
      expect(mockOnSelect).toHaveBeenNthCalledWith(1, 'pace');
      expect(mockOnSelect).toHaveBeenNthCalledWith(2, 'shooting');
      expect(mockOnSelect).toHaveBeenNthCalledWith(3, 'pace');
    });
  });

  describe('Selected State Styling Tests', () => {
    /**
     * **Validates: Requirement 1.5**
     * 
     * Test that the selected attribute is visually indicated.
     */
    it('should apply selected styling when pace is selected', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute="pace"
          onAttributeSelect={mockOnSelect}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');

      // Selected button should have specific classes
      expect(paceButton.className).toContain('bg-cyber-green');
      expect(paceButton.className).toContain('text-cyber-black');
      expect(paceButton.className).toContain('shadow-neon-green');
    });

    it('should apply selected styling when shooting is selected', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute="shooting"
          onAttributeSelect={mockOnSelect}
        />
      );

      const shootingButton = screen.getByLabelText('Select Shooting attribute');

      expect(shootingButton.className).toContain('bg-cyber-green');
      expect(shootingButton.className).toContain('text-cyber-black');
    });

    it('should NOT apply selected styling to unselected buttons', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute="pace"
          onAttributeSelect={mockOnSelect}
        />
      );

      const shootingButton = screen.getByLabelText('Select Shooting attribute');

      // Unselected button should have different classes
      expect(shootingButton.className).toContain('bg-cyber-dark-gray');
      expect(shootingButton.className).toContain('text-cyber-green');
      // Check that it doesn't have the selected shadow (only has hover shadow)
      expect(shootingButton.className).not.toMatch(/\sshadow-neon-green\s/);
      expect(shootingButton.className).not.toContain('bg-cyber-green');
      expect(shootingButton.className).not.toContain('text-cyber-black');
    });

    it('should apply correct aria-pressed attribute to selected button', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute="dribbling"
          onAttributeSelect={mockOnSelect}
        />
      );

      const dribblingButton = screen.getByLabelText('Select Dribbling attribute');
      const paceButton = screen.getByLabelText('Select Pace attribute');

      expect(dribblingButton).toHaveAttribute('aria-pressed', 'true');
      expect(paceButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should handle null selectedAttribute (no selection)', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      // All buttons should have unselected styling
      const allButtons = [
        screen.getByLabelText('Select Pace attribute'),
        screen.getByLabelText('Select Shooting attribute'),
        screen.getByLabelText('Select Passing attribute'),
        screen.getByLabelText('Select Dribbling attribute'),
        screen.getByLabelText('Select Defending attribute'),
        screen.getByLabelText('Select Physical attribute'),
      ];

      allButtons.forEach((button) => {
        expect(button.className).toContain('bg-cyber-dark-gray');
        expect(button.className).toContain('text-cyber-green');
        expect(button).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('should update styling when selectedAttribute changes', () => {
      const mockOnSelect = jest.fn();

      const { rerender } = render(
        <AttributeSelector
          selectedAttribute="pace"
          onAttributeSelect={mockOnSelect}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');
      const shootingButton = screen.getByLabelText('Select Shooting attribute');

      // Initially pace is selected
      expect(paceButton.className).toContain('bg-cyber-green');
      expect(shootingButton.className).toContain('bg-cyber-dark-gray');

      // Change selection to shooting
      rerender(
        <AttributeSelector
          selectedAttribute="shooting"
          onAttributeSelect={mockOnSelect}
        />
      );

      // Now shooting should be selected
      expect(paceButton.className).toContain('bg-cyber-dark-gray');
      expect(shootingButton.className).toContain('bg-cyber-green');
    });
  });

  describe('Disabled State Tests', () => {
    /**
     * Test that the disabled prop correctly disables all buttons.
     */
    it('should disable all buttons when disabled prop is true', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
          disabled={true}
        />
      );

      const allButtons = [
        screen.getByLabelText('Select Pace attribute'),
        screen.getByLabelText('Select Shooting attribute'),
        screen.getByLabelText('Select Passing attribute'),
        screen.getByLabelText('Select Dribbling attribute'),
        screen.getByLabelText('Select Defending attribute'),
        screen.getByLabelText('Select Physical attribute'),
      ];

      allButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should apply disabled styling when disabled prop is true', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
          disabled={true}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');

      expect(paceButton.className).toContain('opacity-50');
      expect(paceButton.className).toContain('cursor-not-allowed');
    });

    it('should NOT call onAttributeSelect when disabled button is clicked', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
          disabled={true}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');
      fireEvent.click(paceButton);

      // Callback should not be called when disabled
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should enable all buttons when disabled prop is false', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
          disabled={false}
        />
      );

      const allButtons = [
        screen.getByLabelText('Select Pace attribute'),
        screen.getByLabelText('Select Shooting attribute'),
        screen.getByLabelText('Select Passing attribute'),
        screen.getByLabelText('Select Dribbling attribute'),
        screen.getByLabelText('Select Defending attribute'),
        screen.getByLabelText('Select Physical attribute'),
      ];

      allButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should enable all buttons when disabled prop is omitted (default)', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');
      expect(paceButton).not.toBeDisabled();
    });

    it('should maintain selected styling even when disabled', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute="pace"
          onAttributeSelect={mockOnSelect}
          disabled={true}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');

      // Should have both selected and disabled styling
      expect(paceButton.className).toContain('bg-cyber-green');
      expect(paceButton.className).toContain('opacity-50');
      expect(paceButton).toBeDisabled();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper aria-label for each button', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      expect(screen.getByLabelText('Select Pace attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Shooting attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Passing attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Dribbling attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Defending attribute')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Physical attribute')).toBeInTheDocument();
    });

    it('should have proper focus styling', () => {
      const mockOnSelect = jest.fn();

      render(
        <AttributeSelector
          selectedAttribute={null}
          onAttributeSelect={mockOnSelect}
        />
      );

      const paceButton = screen.getByLabelText('Select Pace attribute');

      // Check for focus ring classes
      expect(paceButton.className).toContain('focus:outline-none');
      expect(paceButton.className).toContain('focus:ring-2');
      expect(paceButton.className).toContain('focus:ring-cyber-green-light');
    });
  });
});
