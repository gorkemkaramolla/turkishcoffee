import type { TablePageSize } from '../table-pagination'

export function validateNonnegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Table: ${name} must be a nonnegative safe integer.`)
}

export function validatePageSize(value: TablePageSize): void {
  if (value !== 'all' && (!Number.isSafeInteger(value) || value <= 0)) {
    throw new Error('Table: pageSize must be a positive safe integer or "all".')
  }
}
