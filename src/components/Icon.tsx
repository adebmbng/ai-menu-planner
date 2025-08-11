import type { ComponentProps, FC, SVGProps } from 'react'

// Type for Heroicons components
type HeroIconComponent = FC<SVGProps<SVGSVGElement>>

interface IconProps extends ComponentProps<'svg'> {
    Icon: HeroIconComponent
    className?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
}

/**
 * Wrapper component for Heroicons to ensure consistent rendering
 */
export function Icon({ Icon: IconComponent, className = '', size = 'md', ...props }: IconProps) {
    return (
        <IconComponent
            className={`${sizeClasses[size]} ${className}`}
            style={{
                stroke: 'currentColor',
                fill: 'none',
                strokeWidth: '1.5',
                display: 'inline-block',
                verticalAlign: 'middle',
                flexShrink: 0,
                ...props.style
            }}
            aria-hidden="true"
            {...props}
        />
    )
}
