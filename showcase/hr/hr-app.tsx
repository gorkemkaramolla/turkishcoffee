import { useState } from 'react'
import { Button, EmptyState, Toaster } from '../../src'
import { employeeById } from './data'
import { WalletIcon } from '../../src/lib/icons'
import { DocumentsPage } from './documents-page'
import { PeoplePage } from './people-page'
import { ProfilePage } from './profile-page'
import { SettingsPage } from './settings-page'
import { AppShell, PageHeader, type Crumb, type Page } from './shell'
import { TimeOffPage } from './time-off-page'

/**
 * Torun HR: a people-operations app built only from turkishcoffee parts.
 * The sidebar switches screens; there is no router.
 */
export function HrApp({ initialPage = 'people', initialEmployee = 'emp_1' }: { initialPage?: Page; initialEmployee?: string }) {
  const [page, setPage] = useState<Page>(initialPage)
  const [employeeId, setEmployeeId] = useState(initialEmployee)

  const openProfile = (id: string) => {
    setEmployeeId(id)
    setPage('profile')
  }

  const crumbs: Crumb[] =
    page === 'people'
      ? [{ label: 'People' }]
      : page === 'profile'
        ? [{ label: 'People', onClick: () => setPage('people') }, { label: employeeById(employeeId)?.name ?? 'Employee' }]
        : page === 'time-off'
          ? [{ label: 'Time off' }]
          : page === 'documents'
            ? [{ label: 'Documents' }]
            : page === 'payroll'
              ? [{ label: 'Finance' }, { label: 'Payroll' }]
              : [{ label: 'Settings' }]

  return (
    <div className="isolate">
      <AppShell page={page} onNavigate={setPage} crumbs={crumbs}>
        {page === 'people' && <PeoplePage onOpenProfile={openProfile} />}
        {page === 'profile' && <ProfilePage key={employeeId} employeeId={employeeId} />}
        {page === 'time-off' && <TimeOffPage />}
        {page === 'documents' && <DocumentsPage />}
        {page === 'settings' && <SettingsPage />}
        {page === 'payroll' && (
          <>
            <PageHeader title="Payroll" description="Salaries, deductions and payslips." />
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-16">
              <EmptyState
                icon={<WalletIcon />}
                title="Payroll isn't set up yet"
                description="Connect your bank and SGK account to run October payroll from here."
                action={
                  <div className="flex gap-2">
                    <Button>Set up payroll</Button>
                    <Button variant="secondary">Read the guide</Button>
                  </div>
                }
              />
            </div>
          </>
        )}
      </AppShell>
      <Toaster />
    </div>
  )
}
