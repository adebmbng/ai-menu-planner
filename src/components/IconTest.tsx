import {
    CalendarIcon,
    XMarkIcon,
    PlusIcon
} from '@heroicons/react/24/outline'
import { Icon } from './Icon'

export function IconTest() {
    return (
        <div style={{
            padding: '32px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            border: '2px solid red' // Debug border
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'black' }}>
                Icon Test - Using Icon Wrapper
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: '1px solid blue' }}>
                    <Icon Icon={CalendarIcon} size="xl" className="text-blue-600" />
                    <span style={{ fontSize: '14px', marginTop: '4px', color: 'black' }}>Calendar (Wrapper)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: '1px solid red' }}>
                    <Icon Icon={XMarkIcon} size="xl" className="text-red-600" />
                    <span style={{ fontSize: '14px', marginTop: '4px', color: 'black' }}>X Mark (Wrapper)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: '1px solid green' }}>
                    <Icon Icon={PlusIcon} size="xl" className="text-green-600" />
                    <span style={{ fontSize: '14px', marginTop: '4px', color: 'black' }}>Plus (Wrapper)</span>
                </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '24px', marginBottom: '8px', color: 'black' }}>
                Direct Icon Usage (Original)
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: '1px solid blue' }}>
                    <CalendarIcon style={{
                        height: '32px',
                        width: '32px',
                        color: 'blue',
                        stroke: 'currentColor',
                        fill: 'none',
                        strokeWidth: '1.5'
                    }} />
                    <span style={{ fontSize: '14px', marginTop: '4px', color: 'black' }}>Calendar (Direct)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: '1px solid red' }}>
                    <XMarkIcon style={{
                        height: '32px',
                        width: '32px',
                        color: 'red',
                        stroke: 'currentColor',
                        fill: 'none',
                        strokeWidth: '1.5'
                    }} />
                    <span style={{ fontSize: '14px', marginTop: '4px', color: 'black' }}>X Mark (Direct)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', border: '1px solid green' }}>
                    <PlusIcon style={{
                        height: '32px',
                        width: '32px',
                        color: 'green',
                        stroke: 'currentColor',
                        fill: 'none',
                        strokeWidth: '1.5'
                    }} />
                    <span style={{ fontSize: '14px', marginTop: '4px', color: 'black' }}>Plus (Direct)</span>
                </div>
            </div>
            <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
                If you can see colored borders but no icons, the Heroicons are not rendering properly.
                <br />
                If you can see both borders and icons, the icons are working!
                <br />
                Test both the wrapper and direct usage to see which works.
            </div>
        </div>
    )
}
