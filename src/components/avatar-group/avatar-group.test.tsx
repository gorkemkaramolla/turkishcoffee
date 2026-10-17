import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { AvatarGroup, AvatarGroupItem } from './avatar-group'

const names = ['Mona Kane', 'Mehmet Polat', 'Kevin Sturgis', 'Elif Demir', 'Ayşe Yılmaz', 'Can Öztürk']

function Group({ count, max }: { count: number; max?: number }) {
  return (
    <AvatarGroup aria-label="Reviewers" max={max}>
      {names.slice(0, count).map((name) => (
        <AvatarGroupItem key={name} name={name} />
      ))}
    </AvatarGroup>
  )
}

describe('AvatarGroup', () => {
  it('names the group and each avatar', () => {
    render(<Group count={3} />)
    const group = screen.getByRole('group', { name: 'Reviewers' })
    expect(within(group).getAllByRole('img').map((el) => el.getAttribute('aria-label'))).toEqual(
      names.slice(0, 3),
    )
  })

  it('shows initials without an image, hidden from screen readers', () => {
    render(<Group count={1} />)
    const initials = screen.getByText('MK')
    expect(initials.getAttribute('aria-hidden')).toBe('true')
  })

  it('has no overflow button when everyone fits', () => {
    render(<Group count={4} />)
    expect(screen.getAllByRole('img')).toHaveLength(4)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('collapses everyone past max into +N', () => {
    render(<Group count={6} />)
    expect(screen.getAllByRole('img')).toHaveLength(4)
    const more = screen.getByRole('button', { name: 'View 2 more people' })
    expect(more.textContent).toBe('+2')
  })

  it('grows the +N disc, never the button the list is anchored to', () => {
    render(<Group count={6} />)
    const more = screen.getByRole('button', { name: 'View 2 more people' })
    // A scaled anchor moves the list when the pointer leaves the button for it.
    expect(more.className).not.toMatch(/scale/)
    const disc = more.querySelector('[data-slot="avatar-group-more"]')!
    expect(disc.className).toContain('group-hover/more:scale-110')
    expect(disc.className).toContain('group-data-popup-open/more:scale-110')
  })

  it('makes an avatar a link with render, in the stack and in the +N list', async () => {
    render(
      <AvatarGroup aria-label="Reviewers" max={1}>
        <AvatarGroupItem name="Mona Kane" render={<a href="/people/1" />} />
        <AvatarGroupItem name="Elif Demir" render={<a href="/people/2" />} />
      </AvatarGroup>,
    )
    const mona = screen.getByRole('link', { name: 'Mona Kane' })
    expect(mona.getAttribute('href')).toBe('/people/1')
    expect(mona.getAttribute('role')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'View 1 more people' }))
    const row = await screen.findByRole('link', { name: 'Elif Demir' })
    expect(row.getAttribute('href')).toBe('/people/2')
    expect(row.closest('li')).toBeTruthy()
  })

  it('lists the hidden people by name', async () => {
    render(<Group count={6} max={3} />)
    fireEvent.click(screen.getByRole('button', { name: 'View 3 more people' }))
    const list = await screen.findByRole('list')
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'EDElif Demir',
      'AYAyşe Yılmaz',
      'CÖCan Öztürk',
    ])
  })
})
