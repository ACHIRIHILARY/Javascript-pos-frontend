export const endpoints = {
  health: '/api/health',
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  categories: '/categories',
  products: {
    list: '/products',
    byId: (id: string) => `/products/${id}`,
    adjust: (id: string) => `/products/${id}/adjust`,
    importCsv: '/products/import',
    exportCsv: '/products/export/csv',
  },
  sales: {
    list: '/sales',
    byId: (id: string) => `/sales/${id}`,
  },
  reports: {
    summary: '/reports/summary',
    topProducts: '/reports/top-products',
    summaryExportCsv: '/reports/summary/export/csv',
  },
  users: {
    list: '/users',
    byId: (id: string) => `/users/${id}`,
  },
  shifts: {
    end: '/shifts/end',
    report: '/shifts/report',
  },
} as const
