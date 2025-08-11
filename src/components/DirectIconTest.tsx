// Alternative import approach using direct file paths
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon.js'
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon.js'
import PlusIcon from '@heroicons/react/24/outline/PlusIcon.js'

export function DirectIconTest() {
    return (
        <div style={{ padding: '20px', backgroundColor: 'yellow', border: '1px solid orange', marginTop: '20px' }}>
            <h3>Direct Import Test</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '20px 0' }}>
                <div>
                    <p>Direct Calendar:</p>
                    <CalendarIcon style={{ width: '24px', height: '24px', stroke: 'blue', fill: 'none', strokeWidth: '1.5' }} />
                </div>
                <div>
                    <p>Direct X:</p>
                    <XMarkIcon style={{ width: '24px', height: '24px', stroke: 'red', fill: 'none', strokeWidth: '1.5' }} />
                </div>
                <div>
                    <p>Direct Plus:</p>
                    <PlusIcon style={{ width: '24px', height: '24px', stroke: 'green', fill: 'none', strokeWidth: '1.5' }} />
                </div>
            </div>
            <p>Testing direct file imports from @heroicons/react/24/outline/[IconName].js</p>
        </div>
    )
}
