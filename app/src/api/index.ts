import type { BayanApi } from './contract';
import { httpApi } from './http';
import { mockApi } from './mock';

const URL = process.env.NEXT_PUBLIC_API_URL;

/** The app's single API instance. Mock unless NEXT_PUBLIC_API_URL is set. */
export const api: BayanApi = URL ? httpApi(URL) : mockApi;
export const usingMock = !URL;
export * from './contract';
