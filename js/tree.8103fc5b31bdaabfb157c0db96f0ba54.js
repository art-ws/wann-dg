// https://unpkg.com/simple-treeview@0.0.9/dist/treeview.bootstrap.js

/**
 * Tree node state.
 */
var CollapsibleState;
(function (CollapsibleState) {
  /** Node cannot be neither collapsed nor expanded. It is a leaf. */
  CollapsibleState["None"] = "";
  /** Node is collapsed and can be expanded. */
  CollapsibleState["Collapsed"] = "collapsed";
  /** Node is expanded and can be collapsed. */
  CollapsibleState["Expanded"] = "expanded";
})(CollapsibleState || (CollapsibleState = {}));
/**
 * Core implementation of tree view component providing the basic functionality.
 * @abstract
 */
class TreeView {
  /**
   * Initializes a new tree view.
   * @param container HTML element that will host the tree view.
   * @param options Additional options.
   */
  constructor(container, options) {
    this.container = container;
    this.provider = options.provider;
    this.events = options.events;
    this.root = document.createElement('div');
    this._onRootClick = this._onRootClick.bind(this);
    this.attach();
  }
  /**
   * Attaches the tree view to the DOM.
   */
  attach() {
    this.root.addEventListener('click', this._onRootClick);
    this.container.appendChild(this.root);
    this._render(undefined, 0);
  }
  /**
   * Detaches the tree view from the DOM.
   */
  detach() {
    this.root.removeEventListener('click', this._onRootClick);
    this.container.removeChild(this.root);
  }
  _onRootClick(ev) {
    let el = ev.target;
    while (!this._hasMetadata(el) && el.parentElement) {
      el = el.parentElement;
    }
    const metadata = this._getMetadata(el);
    switch (metadata.state) {
      case CollapsibleState.Collapsed:
        this._expandNode(el);
        this.onNodeCollapseState(metadata, CollapsibleState.Expanded);
        break;
      case CollapsibleState.Expanded:
        this._collapseNode(el);
        this.onNodeCollapseState(metadata, CollapsibleState.Collapsed);
        break;
      default:
        this.onNodeClicked(metadata, el);
        if (this.events.onSelectionChanged) {
          this.events.onSelectionChanged(metadata, el);
        }
        break;
    }
    return false;
  }

  async _render(id, level, insertAfterEl) {
    const root = this.root;
    const children = await this.provider.getChildren(id);
    for (const { id, label, icon, state, active } of children) {
      const metadata = { id, label, level, icon, state: state || CollapsibleState.None, loading: false };
      const el = this.renderNode(metadata);
      el.style.marginLeft = `${level}em`;
      el.classList.add(`level-${level}`)
      if (active) el.classList.add('active')
      this._setMetadata(el, metadata);
      if (insertAfterEl) {
        insertAfterEl.insertAdjacentElement('afterend', el);
      }
      else {
        root.appendChild(el);
      }
      insertAfterEl = el;
      if (metadata.state === CollapsibleState.Expanded) {
        this._expandNode(el);
      }
    }
  }
  _expandNode(el) {
    const metadata = this._getMetadata(el);
    if (!metadata.loading) {
      metadata.loading = true;
      this._setMetadata(el, metadata);
      this.onNodeLoading(metadata, el);
      this._render(metadata.id, metadata.level + 1, el)
        .then(() => {
          metadata.loading = false;
          metadata.state = CollapsibleState.Expanded;
          this._setMetadata(el, metadata);
          this.onNodeExpanded(metadata, el);
        });
    }
  }

  _collapseNode(el) {
    const root = this.root;
    const metadata = this._getMetadata(el);
    if (!metadata.loading) {
      while (el.nextSibling && this._getMetadata(el.nextSibling).level > metadata.level) {
        root.removeChild(el.nextSibling);
      }
      metadata.state = CollapsibleState.Collapsed;
      this._setMetadata(el, metadata);
      this.onNodeCollapsed(metadata, el);
    }
  }
  _getMetadata(el) {
    console.assert(el.hasAttribute('data-treeview'));
    return JSON.parse(el.getAttribute('data-treeview'));
  }
  _setMetadata(el, metadata) {
    el.setAttribute('data-treeview', JSON.stringify(metadata));
  }
  _hasMetadata(el) {
    return el.hasAttribute('data-treeview');
  }
}

/**
 * Tree view component built using the Bootstrap (v5) framework.
 *
 * The component makes use of [Bootstrap Icons](https://icons.getbootstrap.com), so
 * classes such as `bi-folder` or `bi-clock` can be used in {@link INode}'s `icon` property.
 */
class BootstrapTreeView extends TreeView {
  /**
   * Creates new HTML representation of a tree node.
   * @abstract
   * @param node Input tree node.
   * @returns New block-based HTML element.
   */
  renderNode(node) {
    const el = document.createElement('div');
    el.classList.add('treeview-node');
    const isNeedExpando = [CollapsibleState.Collapsed, CollapsibleState.Expanded].includes(node.state||'')
    
    const expando = isNeedExpando ? document.createElement('i'): null;
    if (expando){
      expando.classList.add('bi', 'expando');
      el.appendChild(expando);      
    }

    el.classList.add(expando ? 'expando': 'leaf');
    
    if (node.icon) {
      const icon = document.createElement('i');
      icon.classList.add('icon');
      if (typeof node.icon === 'string') {
        icon.classList.add(node.icon);
      }
      else if ('classes' in node.icon) {
        icon.classList.add(...node.icon.classes);
      }
      else if ('src' in node.icon) {
        const img = document.createElement('img');
        img.src = node.icon.src;
        icon.appendChild(img);
      }
      el.appendChild(icon);
    }
    
    const span = document.createElement('span');
    span.innerText = node.label;
    el.appendChild(span);
    if (expando){
      switch (node.state) {
        case CollapsibleState.Collapsed:
          expando.classList.add('bi-chevron-right');
          break;
        case CollapsibleState.Expanded:
          expando.classList.add('bi-chevron-down');
          break;
        case CollapsibleState.None:
          expando.classList.add('bi-dot');
          break;
      }
    }    
    return el;
  }
  /**
   * Reacts to the event of a tree node being clicked.
   * @param node Tree node metadata.
   * @param el Tree node HTML element.
   */
  onNodeClicked(node, el) {
    for (const activeEl of this.root.querySelectorAll('.active')) {
      activeEl.classList.remove('active');
    }
    el.classList.add('active');
  }

  /**
   * Reacts to the event of a tree node loading its children.
   * @param node Tree node metadata.
   * @param el Tree node HTML element.
   */
  onNodeLoading(node, el) {
    const expando = el.querySelector('.expando');
    expando.classList.remove('bi-chevron-right', 'bi-chevron-down');
    expando.classList.add('bi-hourglass');
  }

  onNodeCollapseState(metadata, state) {
    if (this.events.onNodeCollapseState) {
      this.events.onNodeCollapseState({ metadata, state })
    }
  }

  /**
   * Reacts to the event of a tree node being collapsed.
   * @param node Tree node metadata.
   * @param el Tree node HTML element.
   */
  onNodeCollapsed(metadata, el) {
    const expando = el.querySelector('.expando');
    expando.classList.remove('bi-chevron-down', 'bi-hourglass');
    expando.classList.add('bi-chevron-right');
  }

  /**
   * Reacts to the event of a tree node being expanded.
   * @param metadata Tree node metadata.
   * @param el Tree node HTML element.
   */
  onNodeExpanded(metadata, el) {
    const expando = el.querySelector('.expando');
    expando.classList.remove('bi-chevron-right', 'bi-hourglass');
    expando.classList.add('bi-chevron-down');
  }
}

export { BootstrapTreeView };

// https://unpkg.com/simple-treeview@0.0.9/docs/index.html
// https://www.npmjs.com/package/simple-treeview
// https://unpkg.com/simple-treeview@0.0.9/dist/treeview.bootstrap.css
// import { BootstrapTreeView } from 'https://unpkg.com/simple-treeview/dist/treeview.bootstrap.js';

//console.log('drawTree.loaded', BootstrapTreeView)

const dirname = (s) => s.split('/').at(-1)
function getTreeModel({ content }) {

  const toItem = (key, level, x) => {
    return {
      key,
      label: (x.dir ? dirname(key) : x.title) || key,
      tags: x.tags || [],
      children: [],
      level,
      dir: x.dir
    }
  }
  const root = toItem('/', 0, content['/'])

  const result = {};

  const allFiles = Object.keys(content);

  // const getDirPart = (s, i) => s.split('/').filter(Boolean)[i] || null;
  const itemDepth = (s) => s.split('/').filter(Boolean).length;

  const getDir = (s) => {
    const i = s.lastIndexOf('/');
    if (i > 0) {
      const dir = s.substring(0, i);
      return content[dir] ? null : dir
    } else {
      return null;
    }
  }

  const splitDirs = (s) => {
    const r = [];
    const p = s.split('/');
    for (let i = 1; i < p.length; i++) {
      const p1 = p.slice(0, i+1);
      r.push(p1.join('/')) ;     
    }
    return r;
  }

  const getDirs = (paths) => {
    //console.log('getDirs.1', paths)

    let res = [...(new Set(paths.map(getDir)))].filter(Boolean);
    //console.log('getDirs.2', res)
   
    let res1 = [];
    res.forEach(x => {
      res1.push(splitDirs(x))
    })
    res1 =  [...(new Set([].concat(...res1)))];
    res1.sort().reverse();
    return res1.filter(Boolean);
  };

  const allDirs = getDirs(allFiles);
  //console.log('allDirs.3', allDirs);
  const allItems = [...allDirs, ...allFiles].map(x => ({ path: x, level: itemDepth(x) }));
  const isFile = (key) => content[key]

  const getChildren = (key) => {
    const pLevel = itemDepth(key);
    return allItems.filter(x => x.path.startsWith(key) && x.level === (pLevel + 1)).map(x => x.path)
  };

  const handleItem = (itm, parent) => {
    if (result[itm.key]) return;
    result[itm.key] = itm;
    itm.parent = parent;
    if (parent) {
      parent.children.push(itm);
    }
    const childrenPaths = getChildren(itm.key);
    const dirs = childrenPaths.filter(x => !isFile(x));
    const files = childrenPaths.filter(x => isFile(x));
    dirs.forEach(dirKey => {
      const dir = toItem(dirKey, itm.level + 1, { dir: true });
      handleItem(dir, itm)
    })
    files.forEach(fileKey => {
      const f = content[fileKey];
      const file = toItem(fileKey, itm.level + 1, f);
      handleItem(file, itm)
    })
  }

  handleItem(root, null);

  return result;
}

const readCollapseState = () => {
  const s = localStorage.getItem('TREE_VIEW_COLLAPSE_STATE');
  return s ? JSON.parse(s) : {}
}

const collapseState = readCollapseState();

const writeCollapseState = (key, state) => {
  collapseState[key] = state;
  localStorage.setItem('TREE_VIEW_COLLAPSE_STATE', JSON.stringify(collapseState));
}

async function buildTree(el, { activeId }) {
  const { content } = await fetchData
  //console.log('content', content);
  const model = getTreeModel({ content })
  //console.log('model', model);
  const opts = {
    events: {
      onNodeCollapseState: ({ metadata, state }) => {
        //console.log('onNodeCollapseState', { metadata, state })
        writeCollapseState(metadata.id, state);
      },
      onSelectionChanged: (...args) => {
        //console.log('onSelectionChanged', args)
        const d = args[0];
        const baseUrl = window.baseUrl || window.location.origin;
        const href = `${baseUrl}${decodeURI(d.id)}/`
        //console.log('href', href)
        window.Million.navigate(new URL(href), ".singlePage")
        plausible("Tree Node Click", {
          props: {
            href,
            broken: false,
            internal: true,
            tree: true,
          }
        })
      }
    },
    provider: {
      async getChildren(id) {
        if (!id) {
          const root = model['/'];
          return [
            { id: '/', label: root.label || '/', state: CollapsibleState.Expanded }
          ];
        } else {
          const item = model[id];
          if (item) {
            return (item.children || []).map(x => (
              {
                id: x.key,
                label: x.label,
                active: !x.dir ? (activeId ? x.key === activeId : false) : false,
                state: x.dir ? (collapseState[x.key] || CollapsibleState.Collapsed ) : undefined
              })) // collapsed
          } else {
            return [];
          }
        }
      }
    }
  };

  const tree = new BootstrapTreeView(el, opts);
  return tree;
}

function drawTree() {
  const el = document.getElementById('tree-container');
  //console.log('drawTree', !!window.treeView, window.treeViewBuilding, el.children.length);
  if (window.treeViewBuilding) return;
  window.treeViewBuilding = window.treeViewBuilding || 0;
  window.treeViewBuilding++;
  const done = () => {
    window.treeViewBuilding--;
  }
  el.innerHTML = ""
  const baseUrl = window.baseUrl;
  const href = window.location.href;
  let p = href.split(baseUrl)[1]
  if (p?.endsWith('/')) {
    p = p.substring(0, p.length - 1)
  }
  buildTree(el, { activeId: p }).then((t) => {
    window.treeView = t;
    done()
  }, done)
}

window.drawTree = drawTree;