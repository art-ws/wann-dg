const self = {
  current: null,
  active: false,
  open: (opts) => {
    self.current = opts;
    const {ppEl} = self;
    ppEl.classList.add('visible');
    if (opts.el) ppEl.appendChild(opts.el);
    self.active = true;
  }, 
  close: () => {
    if (!self.current) return;
    self.ppEl.classList.remove('visible');
    if (self.current.onClose){
      self.current.onClose();
    }
    self.current = null;
    self.active = false;
  }
}

window.popoverController = self;

function initPagePopover() {
  self.ppEl = document.getElementById("page-popover");   
  document.getElementById("page-popover-close")?.addEventListener('click', () => {
    self.close();  
  });
}

window.initPagePopover = initPagePopover;