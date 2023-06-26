// https://unpkg.com/simple-treeview@0.0.9/docs/index.html

import { BootstrapTreeView } from 'https://unpkg.com/simple-treeview/dist/treeview.bootstrap.js';

console.log('drawTree.loaded', BootstrapTreeView)

let treeView = null;

async function buildTree(el){
  const { content } = await fetchData
  const paths = Object.keys(content);
  const folders = {};
  paths.forEach(x => {
    const i = x.lastIndexOf('/');
    if (i > 0) {
      const folder = x.substring(0, i);
      folders[folder] = folders[folder] || {
        depth: folder.split('/').length-1,
        items: []
      };
      folders[folder].items.push(x);  
    }
  }) 
  console.log('folders', folders);
  const opts = {
    provider: {
        async getChildren(id) {
            if (!id) {
              const root = content['/']; 
                return [
                    { id: '/', label: root.title || '/', state: 'expanded' }
                ];
            } else {
                await new Promise((resolve, reject) => setTimeout(resolve, 100));
                const depth = id.split('/').length;
                if (id === '/') {
                  const items = folders['/'].items.filter(x => x.depth === depth);
                  console.log('!!items', id, depth, items)
                }
                switch (id) {
                    case 'p1':
                        return [
                            { id: 'c1', label: 'Child #1', icon: { classes: ['bi', 'bi-file-earmark'] }, state: 'collapsed' },
                            { id: 'c2', label: 'Child #2', icon: { classes: ['bi', 'bi-file-earmark'] } }
                        ];
                    case 'p2':
                        return [
                            { id: 'c3', label: 'Child #3', icon: { classes: ['bi', 'bi-file-earmark'] } },
                            { id: 'c4', label: 'Child #4', icon: { classes: ['bi', 'bi-file-earmark'] } }
                        ];
                    case 'c1':
                        return [
                            { id: 'g1', label: 'Grandchild #1', icon: { classes: ['bi', 'bi-clock'] } }
                        ];
                    default:
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