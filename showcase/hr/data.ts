export type Status = 'active' | 'on-leave' | 'probation' | 'passive'

export type Employee = {
  id: string
  name: string
  title: string
  department: string
  email: string
  phone: string
  location: string
  managerId: string | null
  salary: number
  startDate: Date
  status: Status
  contract: 'Permanent' | 'Fixed term'
}

const firstNames = ['Ayşe', 'Çağrı', 'Can', 'Şule', 'Zeynep', 'İlker', 'Öykü', 'Mert', 'Ümit', 'Gökhan', 'Deniz', 'Ece', 'Selin', 'Burak', 'Elif', 'Kerem']
const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Öztürk', 'Aydın', 'Arslan', 'Doğan', 'Kılıç', 'Koç', 'Polat']
export const departments = ['Engineering', 'Sales', 'Finance', 'Operations', 'Human Resources', 'Legal']
const titlesByDepartment: Record<string, string[]> = {
  Engineering: ['Software engineer', 'Senior engineer', 'Engineering manager', 'QA engineer'],
  Sales: ['Account executive', 'Sales manager', 'Sales development rep'],
  Finance: ['Accountant', 'Financial analyst', 'Finance manager'],
  Operations: ['Operations specialist', 'Office manager', 'Logistics coordinator'],
  'Human Resources': ['HR specialist', 'Recruiter', 'People partner'],
  Legal: ['Legal counsel', 'Compliance officer'],
}
const locations = ['İstanbul', 'İstanbul', 'Ankara', 'İzmir', 'Remote']
const statusCycle: Status[] = ['active', 'active', 'active', 'active', 'on-leave', 'active', 'probation', 'active', 'passive', 'active']

const ascii = (text: string) =>
  text
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c] ?? c)

export const employees: Employee[] = Array.from({ length: 64 }, (_, i) => {
  const first = firstNames[i % firstNames.length]!
  const last = lastNames[(i * 7) % lastNames.length]!
  const department = departments[(i * 5) % departments.length]!
  const titles = titlesByDepartment[department]!
  return {
    id: `emp_${i + 1}`,
    name: `${first} ${last}`,
    title: titles[(i * 3) % titles.length]!,
    department,
    email: `${ascii(first)}.${ascii(last)}@torun.example`,
    phone: `+90 5${30 + (i % 20)} ${String(100 + ((i * 37) % 900))} ${String(10 + (i % 90)).padStart(2, '0')} ${String(10 + ((i * 7) % 90))}`,
    location: locations[i % locations.length]!,
    managerId: i < 6 ? null : `emp_${(i % 6) + 1}`,
    salary: 54_000 + ((i * 7919) % 96_000),
    startDate: new Date(2016 + (i % 10), (i * 3) % 12, 1 + (i % 27)),
    status: statusCycle[i % statusCycle.length]!,
    contract: i % 7 === 3 ? 'Fixed term' : 'Permanent',
  }
})

export const employeeById = (id: string) => employees.find((e) => e.id === id)

export const statusTone = { active: 'success', 'on-leave': 'info', probation: 'warning', passive: 'neutral' } as const
export const statusLabel: Record<Status, string> = {
  active: 'Active',
  'on-leave': 'On leave',
  probation: 'Probation',
  passive: 'Passive',
}

export type LeaveStatus = 'pending' | 'approved' | 'declined'
export type LeaveType = 'Annual leave' | 'Sick leave' | 'Parental leave' | 'Unpaid leave' | 'Marriage leave'
export type Leave = {
  id: string
  employeeId: string
  type: LeaveType
  from: Date
  to: Date
  days: number
  status: LeaveStatus
  reason?: string
}

const leaveSeed: Array<[number, LeaveType, number, number, LeaveStatus, string?]> = [
  [0, 'Annual leave', 14, 5, 'pending', 'Family visit in Trabzon'],
  [1, 'Sick leave', 10, 2, 'pending'],
  [3, 'Parental leave', 27, 20, 'approved'],
  [5, 'Annual leave', 20, 3, 'pending', 'Long weekend'],
  [6, 'Unpaid leave', 28, 5, 'declined'],
  [7, 'Annual leave', 16, 1, 'approved'],
  [4, 'Annual leave', 33, 8, 'pending', 'Holiday in Kaş'],
  [8, 'Sick leave', 12, 1, 'approved'],
  [11, 'Annual leave', 19, 4, 'pending'],
  [2, 'Marriage leave', 52, 3, 'pending', 'Wedding'],
  [9, 'Annual leave', 37, 5, 'approved'],
  [10, 'Sick leave', 13, 2, 'pending'],
  [13, 'Annual leave', 23, 2, 'approved'],
  [14, 'Annual leave', 40, 6, 'pending'],
]

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
const october1 = new Date(2026, 9, 1)

export const leaves: Leave[] = leaveSeed.map(([emp, type, offset, days, status, reason], i) => {
  const from = addDays(october1, offset)
  return { id: `leave_${i + 1}`, employeeId: employees[emp]!.id, type, from, to: addDays(from, days - 1), days, status, reason }
})

export const leaveTone = { pending: 'warning', approved: 'success', declined: 'danger' } as const
export const leaveLabel: Record<LeaveStatus, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' }

export type Document = { id: string; name: string; kind: string; size: string; uploaded: Date; signed: boolean }
export const documents: Document[] = [
  { id: 'd1', name: 'Employment contract.pdf', kind: 'Contract', size: '412 KB', uploaded: new Date(2024, 0, 8), signed: true },
  { id: 'd2', name: 'ID card copy.pdf', kind: 'Identity', size: '1.2 MB', uploaded: new Date(2024, 0, 8), signed: true },
  { id: 'd3', name: 'Diploma.pdf', kind: 'Education', size: '860 KB', uploaded: new Date(2024, 0, 12), signed: true },
  { id: 'd4', name: 'Remote-work addendum.pdf', kind: 'Contract', size: '96 KB', uploaded: new Date(2026, 8, 30), signed: false },
]

export type Activity = { id: string; when: Date; actor: string; text: string; tone?: 'success' | 'warning' | 'info' }
export const activity: Activity[] = [
  { id: 'a1', when: new Date(2026, 9, 8, 14, 20), actor: 'Ayşe Yılmaz', text: 'requested 5 days of annual leave', tone: 'warning' },
  { id: 'a2', when: new Date(2026, 8, 30, 10, 5), actor: 'Görkem Karamolla', text: 'uploaded Remote-work addendum.pdf' },
  { id: 'a3', when: new Date(2026, 8, 12, 9, 0), actor: 'Çağrı Kaya', text: 'completed the Q3 performance review', tone: 'success' },
  { id: 'a4', when: new Date(2026, 6, 1, 9, 0), actor: 'System', text: 'applied the July salary adjustment (+12%)', tone: 'info' },
  { id: 'a5', when: new Date(2024, 0, 8, 9, 0), actor: 'Görkem Karamolla', text: 'created the employee record' },
]

export const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })
export const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
export const longDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })
export const dateTime = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

export const dateSpan = (from: Date, to: Date) =>
  from.getTime() === to.getTime() ? shortDate.format(from) : `${shortDate.format(from)} – ${shortDate.format(to)}`
