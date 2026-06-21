import { test, expect } from '@playwright/test';

const API_BASE = '**/api';

const CITIZEN_USER = { id: 1, name: 'Test User', email: 'test@test.com', role: 'CITIZEN' };

const MOCK_REPORTS = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic hazard',
    status: 'PENDING',
    category: { id: 1, name: 'Roads & infrastructure' },
    latitude: 36.7538,
    longitude: 3.0588,
    createdAt: '2024-01-15T10:00:00.000Z',
    user: CITIZEN_USER,
  },
  {
    id: 2,
    title: 'Broken streetlight',
    description: 'Streetlight not working for 3 days',
    status: 'IN_PROGRESS',
    category: { id: 2, name: 'Public safety' },
    latitude: 36.7540,
    longitude: 3.0590,
    createdAt: '2024-01-16T10:00:00.000Z',
    user: CITIZEN_USER,
  },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Roads & infrastructure' },
  { id: 2, name: 'Public safety' },
  { id: 3, name: 'Sanitation & waste' },
];

function setupAuthMocks(page) {
  return page.addInitScript(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      role: 'CITIZEN',
    }));
  });
}

test.describe('Reports list page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page);

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({ status: 200, json: CITIZEN_USER });
    });

    await page.route(`${API_BASE}/reports`, async route => {
      await route.fulfill({
        status: 200,
        json: { data: MOCK_REPORTS, results: MOCK_REPORTS.length },
      });
    });

    await page.route(`${API_BASE}/chatbot/**`, async route => {
      await route.fulfill({ status: 200, json: {} });
    });
  });

  test('shows report cards after loading', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('text=Pothole on Main Street')).toBeVisible();
    await expect(page.locator('text=Broken streetlight')).toBeVisible();
  });

  test('shows all reports page heading', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'All Reports' })).toBeVisible();
  });

  test('shows new report button', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('text=New Report')).toBeVisible();
  });
});

test.describe('Report details page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page);

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({ status: 200, json: CITIZEN_USER });
    });

    await page.route(`${API_BASE}/reports/1`, async route => {
      await route.fulfill({
        status: 200,
        json: {
          data: {
            ...MOCK_REPORTS[0],
            comments: [],
          },
        },
      });
    });

    await page.route(`${API_BASE}/reports/1/comments`, async route => {
      await route.fulfill({ status: 200, json: { data: [] } });
    });

    await page.route(`${API_BASE}/reports/1/interventions`, async route => {
      await route.fulfill({ status: 200, json: { data: [] } });
    });

    await page.route(`${API_BASE}/chatbot/**`, async route => {
      await route.fulfill({ status: 200, json: {} });
    });
  });

  test('shows report title', async ({ page }) => {
    await page.goto('/reports/1');
    await expect(page.locator('text=Pothole on Main Street')).toBeVisible();
  });

  test('shows report status', async ({ page }) => {
    await page.goto('/reports/1');
    await expect(page.locator('text=PENDING').or(page.locator('text=Pending'))).toBeVisible();
  });

  test('shows report location data', async ({ page }) => {
    await page.goto('/reports/1');
    await expect(page.locator('text=Pothole on Main Street')).toBeVisible();
    await expect(page.locator('text=Large pothole causing traffic hazard')).toBeVisible();
  });
});

test.describe('Create report page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page);

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({ status: 200, json: CITIZEN_USER });
    });

    await page.route(`${API_BASE}/reports/categories`, async route => {
      await route.fulfill({
        status: 200,
        json: { data: MOCK_CATEGORIES },
      });
    });

    await page.route(`${API_BASE}/chatbot/**`, async route => {
      await route.fulfill({ status: 200, json: {} });
    });
  });

  test('form renders with title and description fields', async ({ page }) => {
    await page.goto('/create-report');
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
  });

  test('shows Create New Report heading', async ({ page }) => {
    await page.goto('/create-report');
    await expect(page.locator('text=Create New Report')).toBeVisible();
  });

  test('submits form and creates a report', async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 36.75, longitude: 3.05 });

    await page.route(`${API_BASE}/reports`, async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: {
            data: {
              id: 99,
              title: 'New Test Report Title',
              description: 'A detailed test description for the report',
              status: 'PENDING',
              category: MOCK_CATEGORIES[0],
              createdAt: new Date().toISOString(),
            },
          },
        });
      } else {
        await route.fulfill({
          status: 200,
          json: { data: MOCK_REPORTS, results: MOCK_REPORTS.length },
        });
      }
    });

    await page.goto('/create-report');

    await page.fill('input[name="title"]', 'New Test Report Title');
    await page.fill('textarea[name="description"]', 'A detailed test description for the report');
    await page.locator('select[name="categoryId"]').selectOption({ index: 1 });

    await page.getByRole('button', { name: 'Current' }).click();
    await page.waitForTimeout(600);

    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });

    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/reports');
  });
});

test.describe('Map page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page);

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({ status: 200, json: CITIZEN_USER });
    });

    await page.route(`${API_BASE}/reports**`, async route => {
      await route.fulfill({
        status: 200,
        json: { data: MOCK_REPORTS, results: MOCK_REPORTS.length },
      });
    });

    await page.route(`${API_BASE}/reports/categories`, async route => {
      await route.fulfill({
        status: 200,
        json: { data: MOCK_CATEGORIES },
      });
    });

    await page.route(`${API_BASE}/chatbot/**`, async route => {
      await route.fulfill({ status: 200, json: {} });
    });
  });

  test('loads map page heading', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('text=Civic Map')).toBeVisible();
  });

  test('shows report sidebar with reports', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('text=Pothole on Main Street')).toBeVisible();
  });

  test('shows map container element', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('.leaflet-container').first()).toBeVisible();
  });
});
