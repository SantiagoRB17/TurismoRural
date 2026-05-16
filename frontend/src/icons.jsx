import React from 'react'

const Icon = ({ d, size = 16, stroke = 1.6, fill = 'none', children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
)

export const IconSearch   = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>
export const IconPlus     = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>
export const IconEdit     = (p) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></Icon>
export const IconPower    = (p) => <Icon {...p}><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></Icon>
export const IconCheck    = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>
export const IconX        = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>
export const IconAlert    = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>
export const IconInfo     = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>
export const IconCal      = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>
export const IconUser     = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>
export const IconUsers    = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>
export const IconMap      = (p) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>
export const IconCompass  = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Icon>
export const IconHome     = (p) => <Icon {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></Icon>
export const IconChev     = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>
export const IconChevL    = (p) => <Icon {...p}><polyline points="15 18 9 12 15 6"/></Icon>
export const IconClock    = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>
export const IconReceipt  = (p) => <Icon {...p}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2"/><path d="M8 7h8M8 12h8M8 17h5"/></Icon>
export const IconLoad     = (p) => <Icon {...p}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></Icon>
export const IconTrend    = (p) => <Icon {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Icon>
export const IconFilter   = (p) => <Icon {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Icon>
