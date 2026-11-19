import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A version of the service worker: it records what it is told, and lets a test
// move it from "installing" to "installed".
function fakeWorker(state = 'installed') {
  const listeners: (() => void)[] = [];
  const worker = {
    state,
    postMessage: vi.fn(),
    addEventListener: (_type: string, listener: () => void) => {
      listeners.push(listener);
    },
    changeState(next: string) {
      worker.state = next;
      listeners.forEach((listener) => listener());
    },
  };
  return worker;
}

type Worker = ReturnType<typeof fakeWorker>;

function fakeRegistration(waiting?: Worker) {
  const found: (() => void)[] = [];
  const registration = {
    waiting,
    installing: undefined as Worker | undefined,
    addEventListener: (_type: string, listener: () => void) => {
      found.push(listener);
    },
    // The browser found a new version and started installing it.
    foundNewVersion(worker: Worker) {
      registration.installing = worker;
      found.forEach((listener) => listener());
    },
  };
  return registration;
}

// Puts a fake browser in place: navigator.serviceWorker and location.reload.
function setup({
  controlled = true,
  registration = fakeRegistration(),
  rejects = false,
} = {}) {
  const controllerChanges: (() => void)[] = [];
  const serviceWorker = {
    controller: controlled ? {} : null,
    register: rejects
      ? vi.fn().mockRejectedValue(new Error('blocked'))
      : vi.fn().mockResolvedValue(registration),
    addEventListener: (_type: string, listener: () => void) => {
      controllerChanges.push(listener);
    },
  };
  const reload = vi.fn();
  vi.stubGlobal('navigator', { serviceWorker });
  vi.stubGlobal('location', { reload });
  return {
    serviceWorker,
    registration,
    reload,
    changeController: () => controllerChanges.forEach((l) => l()),
  };
}

// The module keeps its state between calls, so each test loads a fresh copy.
async function load() {
  vi.resetModules();
  return import('./update');
}

// Lets the registration promise finish.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.stubEnv('PROD', true);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('registerServiceWorker', () => {
  it('registers the worker under the site base, in production', async () => {
    const { serviceWorker } = setup();
    const update = await load();
    update.registerServiceWorker();
    expect(serviceWorker.register).toHaveBeenCalledWith(
      `${import.meta.env.BASE_URL}sw.js`,
    );
  });

  it('does nothing outside production, or when the browser has no service workers', async () => {
    vi.stubEnv('PROD', false);
    const { serviceWorker } = setup();
    const update = await load();
    update.registerServiceWorker();
    expect(serviceWorker.register).not.toHaveBeenCalled();

    vi.stubEnv('PROD', true);
    vi.stubGlobal('navigator', {});
    expect(() => update.registerServiceWorker()).not.toThrow();
  });

  it('lives with a registration that fails', async () => {
    setup({ rejects: true });
    const update = await load();
    expect(() => update.registerServiceWorker()).not.toThrow();
    await settle();
    expect(update.isUpdateReady()).toBe(false);
  });

  it('sees a version already waiting behind a running one', async () => {
    setup({ registration: fakeRegistration(fakeWorker()) });
    const update = await load();
    update.registerServiceWorker();
    await settle();
    expect(update.isUpdateReady()).toBe(true);
  });

  it('does not count a waiting version on the first install, with nothing running', async () => {
    setup({ controlled: false, registration: fakeRegistration(fakeWorker()) });
    const update = await load();
    update.registerServiceWorker();
    await settle();
    expect(update.isUpdateReady()).toBe(false);
  });

  it('sees a new version when it finishes installing behind a running one', async () => {
    const { registration } = setup();
    const update = await load();
    update.registerServiceWorker();
    await settle();
    expect(update.isUpdateReady()).toBe(false);

    const next = fakeWorker('installing');
    registration.foundNewVersion(next);
    expect(update.isUpdateReady()).toBe(false);
    next.changeState('installed');
    expect(update.isUpdateReady()).toBe(true);
  });

  it('ignores a version that installs with nothing running yet', async () => {
    const { registration } = setup({ controlled: false });
    const update = await load();
    update.registerServiceWorker();
    await settle();
    const first = fakeWorker('installing');
    registration.foundNewVersion(first);
    first.changeState('installed');
    expect(update.isUpdateReady()).toBe(false);
  });
});

describe('applyUpdate', () => {
  it('tells the waiting version to take over', async () => {
    const worker = fakeWorker();
    setup({ registration: fakeRegistration(worker) });
    const update = await load();
    update.registerServiceWorker();
    await settle();
    update.applyUpdate();
    expect(worker.postMessage).toHaveBeenCalledWith('skip');
  });

  it('does nothing when no version is waiting', async () => {
    const { reload, changeController } = setup();
    const update = await load();
    update.registerServiceWorker();
    await settle();
    update.applyUpdate();
    changeController();
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads only when the controller changes after the player asked', async () => {
    const { reload, changeController } = setup({
      registration: fakeRegistration(fakeWorker()),
    });
    const update = await load();
    update.registerServiceWorker();
    await settle();

    // The first install also changes the controller: no reload for that.
    changeController();
    expect(reload).not.toHaveBeenCalled();

    update.applyUpdate();
    changeController();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('subscribeToUpdate', () => {
  it('tells listeners when a version starts waiting, until they stop', async () => {
    setup({ registration: fakeRegistration(fakeWorker()) });
    const update = await load();
    const heard = vi.fn();
    const stopped = vi.fn();
    update.subscribeToUpdate(heard);
    update.subscribeToUpdate(stopped)();
    update.registerServiceWorker();
    await settle();
    expect(heard).toHaveBeenCalledTimes(1);
    expect(stopped).not.toHaveBeenCalled();
  });
});
