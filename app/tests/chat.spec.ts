import { expect, test, type Page } from '@playwright/test';
import { prepare, watchErrors } from './helpers';

const composer = (page: Page) => page.locator('textarea');
async function ask(page: Page, text: string) {
  await composer(page).fill(text);
  await composer(page).press('Enter');
}

test.describe('book chat', () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page, { signedIn: true });
  });

  test('answers a question from the book', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/book/macbeth');
    await expect(page.getByText('Macbeth is Shakespeare’s shortest tragedy', { exact: false })).toBeVisible();
    await ask(page, 'Who is Lady Macbeth?');
    await expect(page.getByText('pushes the first murder', { exact: false })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('recommends books as cards under the reply', async ({ page }) => {
    await page.goto('/book/macbeth');
    await ask(page, 'recommend similar books');
    const recs = page.getByRole('region', { name: 'Recommended books' });
    await expect(recs).toBeVisible();
    await expect(recs.getByRole('button')).not.toHaveCount(0);
  });

  test('summary is created, shown and saved to My Library', async ({ page }) => {
    await page.goto('/book/macbeth');
    await ask(page, 'Summarize this book');
    await expect(page.getByText('Macbeth — Summary')).toBeVisible();
    await page.getByRole('button', { name: 'View more' }).click();
    await expect(page.getByRole('dialog')).toContainText('Overview');
    await page.keyboard.press('Escape');
    await page.goto('/library');
    await expect(page.getByRole('heading', { name: 'Book Summaries' })).toBeVisible();
    await expect(page.getByText('Macbeth', { exact: true }).first()).toBeVisible();
  });

  test('spoiler-free hides plot answers', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'switch is in the desktop header');
    await page.goto('/book/macbeth');
    await page.getByRole('switch', { name: 'Spoiler free' }).check();
    await ask(page, 'Tell me about the witches and the prophecy');
    await expect(page.getByText('keeping it hidden', { exact: false })).toBeVisible();
  });

  test('character and duo conversations', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'rail is desktop; phone uses the Characters sheet');
    await page.goto('/book/macbeth');
    const rail = page.getByRole('navigation', { name: 'Characters' });
    await rail.getByRole('button', { name: 'Lady Macbeth' }).click();
    await expect(page.getByText('Now talking with Lady Macbeth')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Set up your conversation' })).toContainText('1 of 4');
    for (let i = 0; i < 4; i++) await page.getByRole('region', { name: 'Set up your conversation' }).getByRole('button').first().click();
    await expect(page.getByText('I’m Lady Macbeth', { exact: false })).toBeVisible();
    await ask(page, 'What is love?');
    await expect(page.getByText('I love my husband enough to be harder than he is.')).toBeVisible();

    await rail.getByRole('button', { name: 'Banquo' }).click();
    await page.getByRole('button', { name: 'Skip setup' }).click();
    await expect(page.getByText('Duo conversation')).toBeVisible();
    await ask(page, 'Who can you trust?');
    await expect(page.getByText('Trust no one but your partner', { exact: false })).toBeVisible();
    await expect(page.getByText('I trust my friend', { exact: false })).toBeVisible();

    await page.getByRole('button', { name: 'End conversation' }).click();
    await expect(page.getByText('Back with Bayan')).toBeVisible();
    await expect(composer(page)).toHaveAttribute('placeholder', 'Ask Bayan anything…');
  });

  test('phone: characters open from the sheet', async ({ page }, info) => {
    test.skip(info.project.name !== 'phone', 'phone only');
    await page.goto('/book/macbeth');
    await page.getByRole('button', { name: 'Characters' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Lady Macbeth' }).click();
    await expect(page.getByText('Now talking with Lady Macbeth')).toBeVisible();
  });

  test('Arabic book chat replies in Arabic', async ({ page }) => {
    await prepare(page, { lang: 'ar' });
    await page.goto('/book/macbeth');
    await ask(page, 'لخّص هذا الكتاب');
    await expect(page.getByText('تم تلخيص', { exact: false })).toBeVisible();
  });
});

test('librarian category flow recommends books', async ({ page }) => {
  await prepare(page);
  await page.goto('/chat?cat=fiction');
  await expect(page.getByText('what are you in the mood for?', { exact: false })).toBeVisible();
  await page.getByRole('group', { name: 'Choose an answer' }).getByRole('button').first().click();
  await expect(page.getByText('How much time do you have for it?')).toBeVisible();
  await page.getByRole('group', { name: 'Choose an answer' }).last().getByRole('button').first().click();
  await expect(page.getByText('Based on what you told me', { exact: false })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Recommended books' })).toBeVisible();
});

test('home ask bar opens the librarian with the question', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await page.getByRole('searchbox').or(page.locator('form[role=search] input')).first().fill('something about love and loneliness');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/chat\?q=/);
  await expect(page.getByText('First pick: “', { exact: false })).toBeVisible();
});

test('duo across two books', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop');
  await prepare(page);
  await page.goto('/duo');
  await page.getByRole('button', { name: 'Macbeth', exact: true }).click();
  await page.getByRole('button', { name: 'Lady Macbeth' }).click();
  await page.getByRole('button', { name: 'Othello', exact: true }).click();
  await page.getByRole('button', { name: 'Iago' }).click();
  await page.getByRole('button', { name: 'Start the conversation' }).click();
  await expect(page.getByText('Duo conversation')).toBeVisible();
  await ask(page, 'What drives ambition?');
  await expect(page.getByText('I only want what I am owed', { exact: false })).toBeVisible();
});

test('sign in, favourites and credits', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop');
  await prepare(page);
  await page.goto('/signin');
  await page.getByPlaceholder('Email address').fill('reader@example.com');
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();

  await page.goto('/books');
  const before = Number(await page.getByRole('link', { name: 'Favorites' }).innerText());
  await page.getByRole('button', { name: 'Add to favorites' }).first().click();
  await expect(page.getByRole('link', { name: 'Favorites' })).toHaveText(String(before + 1));

  await page.goto('/profile?tab=credit');
  await expect(page.getByText('120', { exact: false }).first()).toBeVisible();
  await page.getByPlaceholder('Name on card').fill('Sara Ahmed');
  await page.getByPlaceholder('1234 5678 9012 3456').fill('4242 4242 4242 4242');
  await page.getByPlaceholder('MM/YY').fill('12/30');
  await page.getByPlaceholder('CVV').fill('123');
  await page.getByRole('button', { name: /Pay SAR/ }).click();
  await expect(page.getByText('Credits added.')).toBeVisible();
  await expect(page.getByText('370', { exact: false }).first()).toBeVisible();
});
