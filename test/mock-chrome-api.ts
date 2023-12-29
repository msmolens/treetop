// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

class NotImplementedError extends Error {
  constructor(message = 'Not implemented') {
    super(message);
    this.name = this.constructor.name;
  }
}

const notImplemented = () => {
  throw new NotImplementedError();
};

const createEventListener = () => ({
  addListener: notImplemented,
  removeListener: notImplemented,
  hasListener: notImplemented,
  hasListeners: notImplemented,
  addRules: notImplemented,
  getRules: notImplemented,
  removeRules: notImplemented,
});

global.chrome = {
  action: {
    onClicked: createEventListener(),
  },
  bookmarks: {
    get: notImplemented,
    getChildren: notImplemented,
    getTree: notImplemented,
    onCreated: createEventListener(),
    onRemoved: createEventListener(),
    onChanged: createEventListener(),
    onMoved: createEventListener(),
    search: notImplemented,
  },
  contextMenus: {
    onClicked: createEventListener(),
    update: notImplemented,
  },
  history: {
    getVisits: notImplemented,
    onVisited: createEventListener(),
    onVisitRemoved: createEventListener(),
  },
  i18n: {
    getMessage: notImplemented,
  },
  runtime: {
    OnInstalledReason: {
      INSTALL: 'install',
      UPDATE: 'update',
      CHROME_UPDATE: 'chrome_update',
    },
    getURL: notImplemented,
    onInstalled: createEventListener(),
    openOptionsPage: notImplemented,
  },
  storage: {
    local: {
      get: notImplemented,
      set: notImplemented,
    },
    onChanged: createEventListener(),
  },
  tabs: {
    create: notImplemented,
    getCurrent: notImplemented,
    update: notImplemented,
  },
};

export {};
