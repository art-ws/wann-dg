// https://unpkg.com/simple-treeview@0.0.9/docs/index.html
// https://www.npmjs.com/package/simple-treeview
import { BootstrapTreeView } from 'https://unpkg.com/simple-treeview/dist/treeview.bootstrap.js';

//console.log('drawTree.loaded', BootstrapTreeView)

let treeView = null;

function getTreeModel({ content }) {

  const itemDepth = (s) => s.split('/').length - 1;

  const toItem = (key, level, x) => {
    return {
      key,
      label: x.title || key,
      tags: x.tags || [],
      children: [],
      level,
      dir: x.dir
    }
  }
  const root = toItem('/', 0, content['/'])

  const result = {};

  const allFiles = Object.keys(content);
 
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
  console.log('allFiles', allFiles);
  console.log('allDirs', allDirs);
  const allItems = [...allDirs, ...allFiles];

  const isFile = (key) => content[key]

  const isInDir = (file, dir) => {
    if (dir === '/') return true;
    const p1 = file.split(dir);
    if (p1.length === 2 && !p1[0] && p1[1]) {
      const p2 = p1[1].split("/");
      return p2.length === 2 && !p2[0] && p2[1];
    }
    return false;
  }

  const getFiles = (key, paths) => {
    return paths.filter(x => isInDir(x, key))
  };

  const getChildren = (key) => allItems.filter(x => isInDir(x, key));

  const getDirPart = (s, i) => s.split('/')[i] || null;

  const handleItem = (itm, parent) => {
    console.log(`!!!:${itm.level}`, itm);
    if (result[itm.key]) return;
    result[itm.key] = itm;
    itm.parent = parent;
    if (parent) {
      parent.children.push(itm);
    }
    const childrenPaths = getChildren(itm.key).filter(x => isInDir(x, itm.key));
    console.log(`!!!.childrenPaths for '${itm.key}'`, childrenPaths);
    const dirs = childrenPaths.filter(x => !isFile(x));
    console.log(`!!!.dirs for '${itm.key}'`, dirs);
    const files = childrenPaths.filter(x => !isFile(x));
    //console.log(`!!!.files for '${itm.key}'`, files);
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
            return (item.children || []).map(x => ({ id: x.key, label: x.label, icon: { classes: [] }, state: x.dir ? 'collapsed': undefined }))
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

async function drawTree() {
  console.log('drawTree', !!treeView);
  if (!treeView) {
    treeView = buildTree(document.getElementById('tree-container'))
  }
}

window.drawTree = drawTree;