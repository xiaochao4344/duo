// The address book's shape and the sample book it starts with. Phone's recents
// read the same names, so a person seen there can be found here.

export type Contact = {
  id: string
  first: string
  last: string
  company: string
  phone: string
  email: string
  notes: string
  favorite: boolean
  blocked: boolean
  /** The lists this person is in, by list id. */
  lists: string[]
}

export type ContactList = { id: string; name: string }

export type Book = {
  contacts: Contact[]
  lists: ContactList[]
  /** The card the owner keeps at the top of the book, by contact id. */
  me: string
}

const person = (
  id: string,
  first: string,
  last: string,
  phone: string,
  company = '',
  extra: Partial<Contact> = {}
): Contact => ({
  id,
  first,
  last,
  company,
  phone,
  email: extra.email ?? `${(first || company).split(' ')[0]!.toLowerCase()}@icloud.com`,
  notes: extra.notes ?? '',
  favorite: extra.favorite ?? false,
  blocked: false,
  lists: extra.lists ?? []
})

export const SEED: Book = {
  me: 'me',
  lists: [
    { id: 'family', name: 'Family' },
    { id: 'studio', name: 'Studio' }
  ],
  contacts: [
    person('me', 'Thành', 'Đoàn', '+84 90 555 0001', 'Doan Labs', { email: 'thanh@doan-labs.com' }),
    person('jony', '王磊', '', '+86 138 0217 4451', 'Apple', { favorite: true, lists: ['studio'] }),
    person('ada', 'Ada', 'Lovelace', '+86 150 2671 8890', '', { notes: 'Analytical Engine notes, appended.' }),
    person('mum', '妈妈', '', '+86 139 1882 3304', '', { favorite: true, lists: ['family'] }),
    person('kim', 'Kim', 'Minh', '+86 136 3639 5521', '', { favorite: true, lists: ['studio'] }),
    person('blender', 'Blender', 'Foundation', '+86 95338', '快递驿站', {
      email: 'foundation@blender.org'
    }),
    person('alan', '刘建国', '', '+86 137 8890 2214'),
    person('apple-park', 'Apple Park', 'Reception', '+86 21 5555 0166', 'Apple', { email: 'reception@apple.com' }),
    person('grace', 'Grace', 'Hopper', '+86 135 2480 7719'),
    person('hideo', 'Hideo', 'Kojima', '+86 188 0176 3342', 'Kojima Productions'),
    person('katherine', 'Katherine', 'Johnson', '+86 133 9102 6687'),
    person('thanh', 'Nguyễn', 'Thanh', '+86 159 0098 4413'),
    person('radia', 'Radia', 'Perlman', '+86 152 2130 9058'),
    person('susan', 'Susan', 'Kare', '+86 131 2267 1185', '', { lists: ['studio'] }),
    person('tim', '丁总', '', '+86 138 1755 9026', 'Apple', { favorite: true }),
    person('vera', 'Vera', 'Rubin', '+86 186 2190 7734')
  ]
}

/** How the book names a person: first and last, or the company when both are blank. */
export const fullName = (c: Pick<Contact, 'first' | 'last' | 'company'>) =>
  [c.first, c.last].filter(Boolean).join(' ').trim() || c.company || 'No Name'

/** The A-Z list sorts on the last name, as Contacts does by default; one-word names sort on themselves. */
export const sortKey = (c: Contact) => (c.last || c.first || c.company || '').normalize('NFD')

/** The letter a name files under; anything outside A-Z goes to '#'. */
export function letterOf(c: Contact) {
  const ch =
    sortKey(c)
      .replace(/[\u0300-\u036f]/g, '')[0]
      ?.toUpperCase() ?? '#'
  return /[A-Z]/.test(ch) ? ch : '#'
}

export const initials = (c: Pick<Contact, 'first' | 'last' | 'company'>) =>
  (
    [c.first, c.last]
      .filter(Boolean)
      .map((w) => w[0])
      .join('') || c.company.slice(0, 1)
  ).toUpperCase()

export const byName = (a: Contact, b: Contact) => sortKey(a).localeCompare(sortKey(b)) || a.first.localeCompare(b.first)

export const matches = (c: Contact, needle: string) =>
  !needle || [fullName(c), c.company, c.phone, c.email].some((s) => s.toLowerCase().includes(needle))
