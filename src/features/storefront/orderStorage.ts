import type { DemoOrder } from './types'

/** Use a stable query key so account pages invalidate and share one local order record. */
export const storefrontOrdersKey = 'storefront-orders'

/** Return the current account's actual locally placed demo orders, newest first. */
export function readOrders(userId: number): DemoOrder[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(orderKey(userId)) ?? '[]')
    return Array.isArray(value) ? value as DemoOrder[] : []
  } catch {
    return []
  }
}

/** Save a demo order under the authenticated API user ID and return no server-side claim. */
export function saveOrder(userId: number, order: DemoOrder): void {
  window.localStorage.setItem(orderKey(userId), JSON.stringify([order, ...readOrders(userId)]))
}

/** Keep each browser account's demo history separated in storage. */
function orderKey(userId: number) {
  return `stockroom.orders.${userId}`
}
