// Test different import approaches
import { CalendarIcon as Calendar1 } from '@heroicons/react/24/outline'
import * as HeroIcons from '@heroicons/react/24/outline'
import { DirectIconTest } from './DirectIconTest'

export function IconImportTest() {
    const Calendar2 = HeroIcons.CalendarIcon

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid black' }}>
            <h3>Icon Import Tests</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '20px 0' }}>
                <div>
                    <p>Named import:</p>
                    <Calendar1 style={{ width: '24px', height: '24px', stroke: 'blue', fill: 'none' }} />
                </div>
                <div>
                    <p>Namespace import:</p>
                    <Calendar2 style={{ width: '24px', height: '24px', stroke: 'red', fill: 'none' }} />
                </div>
                <div>
                    <p>Inline SVG test:</p>
                    <svg width="24" height="24" fill="none" stroke="green" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 0 5.25 9h13.5A2.25 2.25 0 0 0 21 11.25v7.5" />
                    </svg>
                </div>
            </div>
            <p>If you can see the inline SVG (green calendar) but not the Heroicons, there's an import/render issue.</p>
            <DirectIconTest />
        </div>
    )
}
