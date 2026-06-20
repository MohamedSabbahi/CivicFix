import { test, expect } from '@playwright/test';

const API_BASE = '**/api';

const ADMIN_USER = { id: 10, name: 'Admin User', email: 'admin@civicfix.com', role: 'ADMIN' };

const MOCK_STATS = {
  totalCivicIssues: 42,
  pendingCivicIssues: 12,
  inProgressCivicIssues: 18,
  resolvedCivicIssues: 12,
};

const MOCK_REPORTS = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    description: 'Large pothole',
    status: 'PENDING',
    category: { id: 1, name: 'Roads & infrastructure' },
    createdAt: '2024-01-15T10:00:00.000Z',
    latitude: 36.75,
    longitude: 3.05,
  },
];

const MOCK_DEPT_STATS = [
  { department: 'Roads', resolvedCivicIssuesCount: 8, averageResolutionTime: '3 days' },
  { department: 'Sanitation', resolvedCivicIssuesCount: 5, averageResolutionTime: '2 days' },
];

const MOCK_DEPARTMENTS = [
  {
    id: 1,
    name: 'Roads & infrastructure',
    categories: [{ id: 1, name: 'Pothole' }, { id: 2, name: 'Sidewalk' }],
  },
  {
    id: 2,
    name: 'Sanitation & waste',
    categories: [{ id: 3, name: 'Garbage' }],
  },
];

function setupAdminAuthMocks(page) {
  return page.addInitScript(() => {
    localStorage.setItem('token', 'fake-admin-token');
    localStorage.setItem('user', JSON.stringify({
      id: 10,
      name: 'Admin User',
      email: 'admin@civicfix.com',
      role: 'ADMIN',
    }));
  });
}

function setupCommonAdminRoutes(page) {
  page.route(`${API_BASE}/auth/profile`, async route => {
    await route.fulfill({ status: 200, json: ADMIN_USER });
  });

  page.route(`${API_BASE}/admin/stats/overview`, async route => {
    await route.fulfill({
      status: 200,
      json: { data: MOCK_STATS },
    });
  });

  page.route(`${API_BASE}/reports**`, async route => {
    await route.fulfill({
      status: 200,
      json: { data: MOCK_REPORTS, results: MOCK_REPORTS.length },
    });
  });

  page.route(`${API_BASE}/chatbot/**`, async route => {
    await route.fulfill({ status: 200, json: {} });
  });
}

test.describe('Admin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminAuthMocks(page);
    await setupCommonAdminRoutes(page);
  });

  test('shows stats cards with overview numbers', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=42')).toBeVisible();
  });

  test('shows pending stat card', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Pending')).toBeVisible();
  });

  test('shows in progress stat card', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('shows resolved stat card', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Resolved')).toBeVisible();
  });

  test('shows reports table with data', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Pothole on Main Street')).toBeVisible();
  });
});

test.describe('Analytics page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminAuthMocks(page);
    await setupCommonAdminRoutes(page);

    await page.route(`${API_BASE}/admin/stats/department`, async route => {
      await route.fulfill({
        status: 200,
        json: MOCK_DEPT_STATS,
      });
    });

    await page.route(`${API_BASE}/admin/civic-issues/period**`, async route => {
      await route.fulfill({
        status: 200,
        json: { data: [] },
      });
    });
  });

  test('shows department performance section', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.locator('text=Department Performance')).toBeVisible();
  });

  test('shows department stats cards', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.locator('text=Roads')).toBeVisible();
    await expect(page.locator('text=Sanitation')).toBeVisible();
  });

  test('shows analytics page within admin layout', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.locator('text=Analytics').first()).toBeVisible();
  });
});

test.describe('Departments page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminAuthMocks(page);
    await setupCommonAdminRoutes(page);

    await page.route(`${API_BASE}/admin/departments`, async route => {
      await route.fulfill({
        status: 200,
        json: { data: MOCK_DEPARTMENTS },
      });
    });
  });

  test('shows departments list', async ({ page }) => {
    await page.goto('/admin/Departments');
    await expect(page.locator('text=Roads & infrastructure')).toBeVisible();
    await expect(page.locator('text=Sanitation & waste')).toBeVisible();
  });

  test('shows departments count', async ({ page }) => {
    await page.goto('/admin/Departments');
    await expect(page.locator('text=2 departments total')).toBeVisible();
  });

  test('shows add department button', async ({ page }) => {
    await page.goto('/admin/Departments');
    await expect(page.locator('button', { hasText: 'Add Department' })).toBeVisible();
  });

  test('shows Departments heading', async ({ page }) => {
    await page.goto('/admin/Departments');
    await expect(page.locator('text=Departments').first()).toBeVisible();
  });
});
