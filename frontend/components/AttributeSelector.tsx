/**
 * AttributeSelector Component
 * 
 * Displays six attribute category buttons for player similarity search.
 * Validates: Requirements 1.1, 1.3, 1.5, 10.2
 */

'use client';

/**
 * Props for the AttributeSelector component.
 */
export interface AttributeSelectorProps {
  /** Currently selected attribute category (null if none selected) */
  selectedAttribute: string | null;
  /** Callback function called when an attribute is selected */
  onAttributeSelect: (attribute: string) => void;
  /** Whether the selector is disabled (e.g., during loading) */
  disabled?: boolean;
}

/**
 * Attribute category configuration with display labels and icons.
 */
const ATTRIBUTES = [
  { id: 'pace', label: 'Pace', icon: '⚡' },
  { id: 'shooting', label: 'Shooting', icon: '🎯' },
  { id: 'passing', label: 'Passing', icon: '🔄' },
  { id: 'dribbling', label: 'Dribbling', icon: '⚽' },
  { id: 'defending', label: 'Defending', icon: '🛡️' },
  { id: 'physical', label: 'Physical', icon: '💪' }
] as const;

/**
 * AttributeSelector component with cyberpunk styling.
 * 
 * Features:
 * - Displays 6 attribute category buttons (Requirement 1.1)
 * - Handles attribute selection with callback (Requirement 1.3)
 * - Visually indicates selected attribute (Requirement 1.5)
 * - Supports disabled state
 * - Cyberpunk dark theme: green/black styling (Requirement 10.2)
 */
export function AttributeSelector({
  selectedAttribute,
  onAttributeSelect,
  disabled = false
}: AttributeSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Section Header */}
      <h3 className="text-xl font-bold text-cyber-green mb-4 tracking-wider font-mono">
        &gt; SEARCH BY ATTRIBUTE
      </h3>
      
      {/* Attribute Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ATTRIBUTES.map((attr) => {
          const isSelected = selectedAttribute === attr.id;
          
          return (
            <button
              key={attr.id}
              onClick={() => onAttributeSelect(attr.id)}
              disabled={disabled}
              className={`
                px-4 py-3 rounded-lg font-mono text-sm font-bold
                transition-all duration-200
                flex flex-col items-center justify-center gap-1
                border-2
                ${
                  isSelected
                    ? 'bg-cyber-green text-cyber-black border-cyber-green shadow-neon-green'
                    : 'bg-cyber-dark-gray text-cyber-green border-cyber-green hover:bg-cyber-gray hover:shadow-neon-green-sm'
                }
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
                focus:outline-none focus:ring-2 focus:ring-cyber-green-light
              `}
              aria-label={`Select ${attr.label} attribute`}
              aria-pressed={isSelected}
            >
              {/* Icon */}
              <span className="text-2xl" role="img" aria-hidden="true">
                {attr.icon}
              </span>
              
              {/* Label */}
              <span className="tracking-wide uppercase text-xs">
                {attr.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
