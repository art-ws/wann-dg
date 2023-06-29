// https://unpkg.com/simple-treeview@0.0.9/docs/index.html
// https://www.npmjs.com/package/simple-treeview
// https://unpkg.com/simple-treeview@0.0.9/dist/treeview.bootstrap.css
import { BootstrapTreeView } from 'https://unpkg.com/simple-treeview/dist/treeview.bootstrap.js';

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
  const getDirs = (paths) => {
    let res = [...(new Set(paths.map(getDir)))];
    res.sort().reverse();
    return res.filter(Boolean);
  };

  const allDirs = getDirs(allFiles);
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

async function buildTree(el) {
  const { content } = await fetchData
  console.log('content', content);
  const model = getTreeModel({ content })
  console.log('model', model);
  const opts = {
    provider: {
      async getChildren(id) {
        if (!id) {
          const root = model['/'];
          return [
            { id: '/', label: root.label || '/', state: 'expanded' }
          ];
        } else {
          const item = model[id];
          if (item) {
            return (item.children || []).map(x => ({ id: x.key, label: x.label, icon: { classes: [] }, state: x.dir ? 'collapsed' : undefined }))
          } else {
            return [];
          }
        }
      }
    }
  };
  const tree = new BootstrapTreeView(el, opts);
  const onNodeClicked = tree.onNodeClicked.bind(tree);
  tree.onNodeClicked = function (...args) {
    onNodeClicked(...args);
    const d = args[0];
    const baseUrl = window.baseUrl || window.location.origin;
    const href = `${baseUrl}${decodeURI(d.id)}`
    console.log('href', href)
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
  return tree;
}

function drawTree() {
  const el = document.getElementById('tree-container');
  console.log('drawTree', !!window.treeView, window.treeViewBuilding, el.children.length);
  if (window.treeViewBuilding) return;
  window.treeViewBuilding = window.treeViewBuilding || 0;
  window.treeViewBuilding++;
  const done = () => {
    window.treeViewBuilding--;
  }  
  el.innerHTML = ""
  buildTree(el).then((t) => {
    window.treeView = t;
    done()
  },done)
}

window.drawTree = drawTree;