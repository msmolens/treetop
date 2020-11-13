/* eslint no-irregular-whitespace: ["error", { "skipComments": true }] */

import { Writable, writable } from 'svelte/store';
import { render, screen } from '@testing-library/svelte';

import { BOOKMARKS_ROOT_GUID } from '@Treetop/treetop/constants';
import Folder from '@Treetop/treetop/Folder.svelte';
import type * as Treetop from '@Treetop/treetop/types';

import ContextWrapper from '../utils/ContextWrapper.svelte';
import {
  createBookmarkNode,
  createFolderNode,
  createSeparatorNode,
} from '../utils/factories';

// Folder component requirements
let nodeStoreMap: Treetop.NodeStoreMap;
let nodeId: string;

// Bookmark component requirements
let lastVisitTimeMap: Treetop.LastVisitTimeMap;
let truncate: Writable<boolean>;
let tooltips: Writable<boolean>;

let rootNode: Treetop.FolderNode;

const setup = () => {
  render(ContextWrapper, {
    Component: Folder,
    Props: {
      nodeId,
      root: true,
    },
    Context: {
      nodeStoreMap,
      lastVisitTimeMap,
      truncate,
      tooltips,
    },
  });
};

/**
 * Expect that the document title is the specified value.
 */
const expectDocumentTitle = (title: string) => {
  const elems = document.getElementsByTagName('title');
  expect(elems).toHaveLength(1);

  const titleElem = elems[0];
  expect(titleElem).toHaveTextContent(title);
};

// TODO: Consider writing custom matcher:
// https://jestjs.io/docs/en/expect.html#expectextendmatchers
/**
 * Given a child element and a folder heading link element, expect that the child
 * element is in the folder contents element.
 */
const expectToBeInContentsOfFolder = (
  child: HTMLElement,
  headerLink: HTMLElement
) => {
  const contents = child.parentElement;
  expect(contents).not.toBeNull();
  expect(contents!).toHaveClass('contents');

  const heading = headerLink.parentElement?.parentElement;
  expect(heading).not.toBeNull();
  expect(heading!).toHaveClass('heading');

  expect(contents!.parentElement).not.toBeNull();
  expect(heading!.parentElement).not.toBeNull();
  expect(contents!.parentElement!).toBe(heading!.parentElement!);
};

// TODO: Consider writing custom matcher:
// https://jestjs.io/docs/en/expect.html#expectextendmatchers
/**
 * Given a child element and a folder heading link element, expect that the child
 * element is a subfolder in the folder contents element.
 */
const expectFolderInFolder = (child: HTMLElement, headerLink: HTMLElement) => {
  const contents =
    child.parentElement?.parentElement?.parentElement?.parentElement;
  expect(contents).not.toBeNull();
  expect(contents!).toHaveClass('contents');

  const heading = headerLink.parentElement?.parentElement;
  expect(heading).not.toBeNull();
  expect(heading!).toHaveClass('heading');

  expect(contents!.parentElement).not.toBeNull();
  expect(heading!.parentElement).not.toBeNull();
  expect(contents!.parentElement!).toBe(heading!.parentElement!);
};

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;
  lastVisitTimeMap = new Map() as Treetop.LastVisitTimeMap;
  truncate = writable(false);
  tooltips = writable(false);
});

describe('rooted at bookmarks root', () => {
  describe('no children', () => {
    beforeEach(() => {
      // Create node tree:
      // rootNode
      rootNode = createFolderNode();
      rootNode.id = BOOKMARKS_ROOT_GUID;

      nodeStoreMap.set(rootNode.id, writable(rootNode));

      nodeId = rootNode.id;

      mockBrowser.i18n.getMessage
        .expect('emptyFolder')
        .andReturn('Empty folder');

      setup();
    });

    it('renders', () => {
      expect(
        screen.getByRole('link', { name: rootNode.title })
      ).toBeInTheDocument();
      expect(screen.getByText(/^empty folder/i)).toBeInTheDocument();

      const link = screen.getByRole('link', { name: rootNode.title });
      expect(link.dataset.nodeId).toBe(rootNode.id);
      expect(link).toHaveAttribute('href', `#${rootNode.id}`);

      const emptyFolder = screen.getByText(/^empty folder/i);
      expectToBeInContentsOfFolder(emptyFolder, link);
    });

    it('sets document title', () => {
      expectDocumentTitle(`Treetop: ${rootNode.title}`);
    });
  });

  describe('root node without title', () => {
    let title: string;

    beforeEach(() => {
      // Create node tree:
      // rootNode
      rootNode = createFolderNode();
      rootNode.id = BOOKMARKS_ROOT_GUID;
      rootNode.title = '';

      nodeStoreMap.set(rootNode.id, writable(rootNode));

      nodeId = rootNode.id;

      title = 'Bookmarks';
      mockBrowser.i18n.getMessage.expect('bookmarks').andReturn(title);
      mockBrowser.i18n.getMessage
        .expect('emptyFolder')
        .andReturn('Empty folder');

      setup();
    });

    it('uses fallback title', () => {
      expect(screen.getByRole('link', { name: title })).toBeInTheDocument();
      expect(screen.getByText(/^empty folder/i)).toBeInTheDocument();

      const link = screen.getByRole('link', { name: title });
      expect(link.dataset.nodeId).toBe(rootNode.id);
      expect(link).toHaveAttribute('href', `#${rootNode.id}`);
    });

    it('uses default document title', () => {
      expectDocumentTitle('Treetop');
    });
  });

  describe('one empty child folder', () => {
    let folderNode: Treetop.FolderNode;

    beforeEach(() => {
      // Create node tree:
      // rootNode
      //   └── folderNode
      rootNode = createFolderNode();
      rootNode.id = BOOKMARKS_ROOT_GUID;

      folderNode = createFolderNode();
      folderNode.parentId = rootNode.id;
      rootNode.children.push(folderNode);

      nodeStoreMap.set(rootNode.id, writable(rootNode));
      nodeStoreMap.set(folderNode.id, writable(folderNode));

      nodeId = rootNode.id;

      mockBrowser.i18n.getMessage
        .expect('emptyFolder')
        .andReturn('Empty folder');

      setup();
    });

    it('renders', () => {
      expect(
        screen.getByRole('link', { name: rootNode.title })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: folderNode.title })
      ).toBeInTheDocument();
      expect(screen.getByText(/^empty folder/i)).toBeInTheDocument();

      const rootNodeLink = screen.getByRole('link', { name: rootNode.title });
      expect(rootNodeLink.dataset.nodeId).toBe(rootNode.id);
      expect(rootNodeLink).toHaveAttribute('href', `#${rootNode.id}`);

      const folderNodeLink = screen.getByRole('link', {
        name: folderNode.title,
      });
      expect(folderNodeLink.dataset.nodeId).toBe(folderNode.id);
      expect(folderNodeLink).toHaveAttribute('href', `#${folderNode.id}`);

      const emptyFolder = screen.getByText(/^empty folder/i);
      expectToBeInContentsOfFolder(emptyFolder, folderNodeLink);
    });

    it('sets document title', () => {
      expectDocumentTitle(`Treetop: ${rootNode.title}`);
    });
  });

  describe('one child folder with children', () => {
    let folderNode1: Treetop.FolderNode;
    let folderNode2: Treetop.FolderNode;

    beforeEach(() => {
      // Create node tree:
      // rootNode
      //   └── folderNode1
      //      ├── bookmarkNode
      //      ├── bookmarkNode
      //      └── folderNode2
      //         └── bookmarkNode
      rootNode = createFolderNode();
      rootNode.id = BOOKMARKS_ROOT_GUID;

      folderNode1 = createFolderNode();
      folderNode1.parentId = rootNode.id;
      folderNode1.children.push(createBookmarkNode());
      folderNode1.children.push(createBookmarkNode());
      rootNode.children.push(folderNode1);

      folderNode2 = createFolderNode();
      folderNode2.parentId = folderNode1.id;
      folderNode2.children.push(createBookmarkNode());
      folderNode1.children.push(folderNode2);

      nodeStoreMap.set(rootNode.id, writable(rootNode));
      nodeStoreMap.set(folderNode1.id, writable(folderNode1));
      nodeStoreMap.set(folderNode2.id, writable(folderNode2));

      nodeId = rootNode.id;

      setup();
    });

    it('renders', () => {
      expect(
        screen.getByRole('link', { name: rootNode.title })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: folderNode1.title })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: folderNode2.title })
      ).toBeInTheDocument();
      expect(screen.queryByText(/^empty folder/i)).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', {
          name: (folderNode1.children[0] as Treetop.BookmarkNode).title,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', {
          name: (folderNode1.children[1] as Treetop.BookmarkNode).title,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', {
          name: (folderNode2.children[0] as Treetop.BookmarkNode).title,
        })
      ).toBeInTheDocument();

      const rootNodeLink = screen.getByRole('link', { name: rootNode.title });
      expect(rootNodeLink.dataset.nodeId).toBe(rootNode.id);
      expect(rootNodeLink).toHaveAttribute('href', `#${rootNode.id}`);

      const folderNode1Link = screen.getByRole('link', {
        name: folderNode1.title,
      });
      expect(folderNode1Link.dataset.nodeId).toBe(folderNode1.id);
      expect(folderNode1Link).toHaveAttribute('href', `#${folderNode1.id}`);
      expectFolderInFolder(folderNode1Link, rootNodeLink);

      const bookmarkLink1 = screen.getByRole('link', {
        name: (folderNode1.children[0] as Treetop.BookmarkNode).title,
      });
      const bookmarkLink2 = screen.getByRole('link', {
        name: (folderNode1.children[1] as Treetop.BookmarkNode).title,
      });
      expect(bookmarkLink1.dataset.nodeId).toBe(folderNode1.children[0].id);
      expect(bookmarkLink1).toHaveAttribute(
        'href',
        (folderNode1.children[0] as Treetop.BookmarkNode).url
      );
      expect(bookmarkLink2.dataset.nodeId).toBe(folderNode1.children[1].id);
      expect(bookmarkLink2).toHaveAttribute(
        'href',
        (folderNode1.children[1] as Treetop.BookmarkNode).url
      );
      expectToBeInContentsOfFolder(bookmarkLink1, folderNode1Link);
      expectToBeInContentsOfFolder(bookmarkLink2, folderNode1Link);

      const folderNode2Link = screen.getByRole('link', {
        name: folderNode2.title,
      });
      expect(folderNode2Link.dataset.nodeId).toBe(folderNode2.id);
      expect(folderNode2Link).toHaveAttribute('href', `#${folderNode2.id}`);
      expectFolderInFolder(folderNode2Link, folderNode1Link);

      const bookmarkLink3 = screen.getByRole('link', {
        name: (folderNode2.children[0] as Treetop.BookmarkNode).title,
      });
      expect(bookmarkLink3.dataset.nodeId).toBe(folderNode2.children[0].id);
      expect(bookmarkLink3).toHaveAttribute(
        'href',
        (folderNode2.children[0] as Treetop.BookmarkNode).url
      );
      expectToBeInContentsOfFolder(bookmarkLink3, folderNode2Link);
    });

    it('sets document title', () => {
      expectDocumentTitle(`Treetop: ${rootNode.title}`);
    });
  });

  describe('two child folders with children', () => {
    let folderNode1: Treetop.FolderNode;
    let folderNode2: Treetop.FolderNode;

    beforeEach(() => {
      // Create node tree:
      // rootNode
      //   ├── folderNode1
      //   │  └── bookmarkNode
      //   └── folderNode2
      //      ├── bookmarkNode
      //      └── separatorNode
      rootNode = createFolderNode();
      rootNode.id = BOOKMARKS_ROOT_GUID;

      folderNode1 = createFolderNode();
      folderNode1.parentId = rootNode.id;
      folderNode1.children.push(createBookmarkNode());
      rootNode.children.push(folderNode1);

      folderNode2 = createFolderNode();
      folderNode2.parentId = rootNode.id;
      folderNode2.children.push(createBookmarkNode());
      folderNode2.children.push(createSeparatorNode());
      rootNode.children.push(folderNode2);

      nodeStoreMap.set(rootNode.id, writable(rootNode));
      nodeStoreMap.set(folderNode1.id, writable(folderNode1));
      nodeStoreMap.set(folderNode2.id, writable(folderNode2));

      nodeId = rootNode.id;

      setup();
    });

    it('renders', () => {
      expect(
        screen.getByRole('link', { name: rootNode.title })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: folderNode1.title })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: folderNode2.title })
      ).toBeInTheDocument();
      expect(screen.queryByText(/^empty folder/i)).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', {
          name: (folderNode1.children[0] as Treetop.BookmarkNode).title,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', {
          name: (folderNode2.children[0] as Treetop.BookmarkNode).title,
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();

      const rootNodeLink = screen.getByRole('link', { name: rootNode.title });
      expect(rootNodeLink.dataset.nodeId).toBe(rootNode.id);
      expect(rootNodeLink).toHaveAttribute('href', `#${rootNode.id}`);

      const folderNode1Link = screen.getByRole('link', {
        name: folderNode1.title,
      });
      expect(folderNode1Link.dataset.nodeId).toBe(folderNode1.id);
      expect(folderNode1Link).toHaveAttribute('href', `#${folderNode1.id}`);
      expectFolderInFolder(folderNode1Link, rootNodeLink);

      const bookmarkLink1 = screen.getByRole('link', {
        name: (folderNode1.children[0] as Treetop.BookmarkNode).title,
      });
      expect(bookmarkLink1.dataset.nodeId).toBe(folderNode1.children[0].id);
      expect(bookmarkLink1).toHaveAttribute(
        'href',
        (folderNode1.children[0] as Treetop.BookmarkNode).url
      );
      expectToBeInContentsOfFolder(bookmarkLink1, folderNode1Link);

      const folderNode2Link = screen.getByRole('link', {
        name: folderNode2.title,
      });
      expect(folderNode2Link.dataset.nodeId).toBe(folderNode2.id);
      expect(folderNode2Link).toHaveAttribute('href', `#${folderNode2.id}`);
      expectFolderInFolder(folderNode2Link, rootNodeLink);

      const bookmarkLink2 = screen.getByRole('link', {
        name: (folderNode2.children[0] as Treetop.BookmarkNode).title,
      });
      expect(bookmarkLink2.dataset.nodeId).toBe(folderNode2.children[0].id);
      expect(bookmarkLink2).toHaveAttribute(
        'href',
        (folderNode2.children[0] as Treetop.BookmarkNode).url
      );
      expectToBeInContentsOfFolder(bookmarkLink2, folderNode2Link);

      const separator = screen.getByRole('separator');
      expectToBeInContentsOfFolder(separator, folderNode2Link);
    });

    it('sets document title', () => {
      expectDocumentTitle(`Treetop: ${rootNode.title}`);
    });
  });
});

describe('rooted at subfolder', () => {
  let folderNode1: Treetop.FolderNode;
  let folderNode2: Treetop.FolderNode;
  let folderNode3: Treetop.FolderNode;

  beforeEach(() => {
    // Create node tree:
    // rootNode
    //   ├── folderNode1
    //   │  └── bookmarkNode
    //   └── folderNode2
    //      ├── bookmarkNode
    //      └── folderNode3
    //         └── bookmarkNode
    rootNode = createFolderNode();
    rootNode.id = BOOKMARKS_ROOT_GUID;

    folderNode1 = createFolderNode();
    folderNode1.parentId = rootNode.id;
    folderNode1.children.push(createBookmarkNode());
    rootNode.children.push(folderNode1);

    folderNode2 = createFolderNode();
    folderNode2.parentId = rootNode.id;
    folderNode2.children.push(createBookmarkNode());
    rootNode.children.push(folderNode2);

    folderNode3 = createFolderNode();
    folderNode3.parentId = folderNode2.id;
    folderNode3.children.push(createBookmarkNode());
    folderNode2.children.push(folderNode3);

    nodeStoreMap.set(rootNode.id, writable(rootNode));
    nodeStoreMap.set(folderNode1.id, writable(folderNode1));
    nodeStoreMap.set(folderNode2.id, writable(folderNode2));
    nodeStoreMap.set(folderNode3.id, writable(folderNode3));

    nodeId = folderNode2.id;

    setup();
  });

  it('renders when rooted at subfolder', () => {
    expect(
      screen.getByRole('link', { name: rootNode.title })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: folderNode1.title })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: folderNode2.title })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: folderNode3.title })
    ).toBeInTheDocument();
    expect(screen.queryByText(/^empty folder/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: (folderNode2.children[0] as Treetop.BookmarkNode).title,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: (folderNode3.children[0] as Treetop.BookmarkNode).title,
      })
    ).toBeInTheDocument();

    const rootNodeLink = screen.getByRole('link', { name: rootNode.title });
    expect(rootNodeLink.dataset.nodeId).toBe(rootNode.id);
    expect(rootNodeLink).toHaveAttribute('href', `#${rootNode.id}`);

    const folderNode2Link = screen.getByRole('link', {
      name: folderNode2.title,
    });
    expect(folderNode2Link.dataset.nodeId).toBe(folderNode2.id);
    expect(folderNode2Link).toHaveAttribute('href', `#${folderNode2.id}`);

    const bookmarkLink1 = screen.getByRole('link', {
      name: (folderNode2.children[0] as Treetop.BookmarkNode).title,
    });
    expect(bookmarkLink1.dataset.nodeId).toBe(folderNode2.children[0].id);
    expect(bookmarkLink1).toHaveAttribute(
      'href',
      (folderNode2.children[0] as Treetop.BookmarkNode).url
    );
    expectToBeInContentsOfFolder(bookmarkLink1, folderNode2Link);

    const folderNode3Link = screen.getByRole('link', {
      name: folderNode3.title,
    });
    expect(folderNode3Link.dataset.nodeId).toBe(folderNode3.id);
    expect(folderNode3Link).toHaveAttribute('href', `#${folderNode3.id}`);
    expectFolderInFolder(folderNode3Link, folderNode2Link);

    const bookmarkLink2 = screen.getByRole('link', {
      name: (folderNode3.children[0] as Treetop.BookmarkNode).title,
    });
    expect(bookmarkLink2.dataset.nodeId).toBe(folderNode3.children[0].id);
    expect(bookmarkLink2).toHaveAttribute(
      'href',
      (folderNode3.children[0] as Treetop.BookmarkNode).url
    );
    expectToBeInContentsOfFolder(bookmarkLink2, folderNode3Link);
  });

  it('sets document title', () => {
    expectDocumentTitle(`Treetop: ${folderNode2.title}`);
  });

  describe('breadcrumbs', () => {
    it('text and links', () => {
      const breadcrumbs = `${rootNode.title} / ${folderNode2.title}`;

      const node = screen.getByText((_content, node) => {
        if (node.children.length !== 2) {
          return false;
        }

        const node1 = node.children[0] as HTMLElement;
        if (node1.dataset.nodeId !== rootNode.id || !node1.textContent) {
          return false;
        }

        const node2 = node.children[1] as HTMLElement;
        if (node2.dataset.nodeId !== folderNode2.id || !node2.textContent) {
          return false;
        }

        return `${node1.textContent} / ${node2.textContent}` === breadcrumbs;
      });
      expect(node).toBeInTheDocument();

      const node1 = node.children[0] as HTMLElement;
      expect(node1).toHaveAttribute('href', `#${rootNode.id}`);

      const node2 = node.children[1] as HTMLElement;
      expect(node2).toHaveAttribute('href', `#${folderNode2.id}`);
    });
  });
});
