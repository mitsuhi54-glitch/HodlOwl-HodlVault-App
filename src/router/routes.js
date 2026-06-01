const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
      // Legacy routes — kept for backward compatibility, redirect to dashboard
      { path: 'vault', redirect: '/dashboard' },
      { path: 'my-vaults', redirect: '/dashboard' },
      { path: 'vault/manage', redirect: '/dashboard' },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
