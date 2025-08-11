// Icon size mappings for fixing Tailwind v4 compatibility issues
export const iconSizes = {
    'h-3 w-3': { width: '0.75rem', height: '0.75rem' }, // 12px
    'h-4 w-4': { width: '1rem', height: '1rem' },       // 16px  
    'h-5 w-5': { width: '1.25rem', height: '1.25rem' }, // 20px
    'h-6 w-6': { width: '1.5rem', height: '1.5rem' },   // 24px
    'h-8 w-8': { width: '2rem', height: '2rem' },       // 32px
} as const

// Helper function to get size style from Tailwind class
export function getIconSize(sizeClass: keyof typeof iconSizes) {
    return iconSizes[sizeClass]
}

// Standard icon props for consistent rendering
export const iconProps = {
    stroke: 'currentColor',
    fill: 'none',
    strokeWidth: '1.5',
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
} as const
