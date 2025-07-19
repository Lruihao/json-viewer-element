class JsonViewer extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'expand-depth', 'copyable', 'sort', 'theme',
            'show-array-index', 'show-double-quotes'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // 插入默认样式
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './json-viewer.css';
    this.shadowRoot.append(link);
    this.container = document.createElement('div');
    this.shadowRoot.append(this.container);
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  render() {
    const data = this._parseData();
    if (data === undefined) return;
    this.container.innerHTML = '';
    this.container.className = `jv-root ${this.theme || 'jv-light'}`;

    // 复制按钮
    if (this.copyable) {
      const btn = document.createElement('span');
      btn.className = 'jv-button jv-copy';
      btn.title = 'Copy JSON';
      btn.textContent = '📋';
      btn.addEventListener('click', () =>
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      );
      this.container.append(btn);
    }

    // 递归渲染
    this.container.append(this._buildNode(data));
    this._bindToggle();
  }

  _parseData() {
    try {
      return JSON.parse(this.getAttribute('data'));
    } catch {
      return this.getAttribute('data');
    }
  }

  _buildNode(obj, depth = 0) {
    if (obj === null) return this._leaf('null', 'jv-null');
    if (typeof obj === 'boolean')
      return this._leaf(obj, 'jv-boolean');
    if (typeof obj === 'number')
      return this._leaf(obj, 'jv-number');
    if (typeof obj === 'string')
      return this._leaf(
        (this.showDoubleQuotes ? `"${obj}"` : obj),
        'jv-string'
      );
    if (typeof obj === 'function')
      return this._leaf('function', 'jv-function');
    if (Array.isArray(obj)) {
      const fragment = document.createDocumentFragment();
      const arrSpan = document.createElement('span');
      arrSpan.className = 'jv-node jv-array';
      arrSpan.dataset.type = 'array';
      arrSpan.dataset.length = obj.length;

      const toggle = this._toggle(depth);
      arrSpan.append(toggle);

      const open = document.createElement('span');
      open.textContent = '[';
      arrSpan.append(open);

      const list = document.createElement('div');
      list.className = 'jv-list';

      const sortedKeys = this.sort ? [...obj.keys()].sort((a, b) => a - b) : [...obj.keys()];
      sortedKeys.forEach((i) => {
        const item = document.createElement('div');
        item.className = 'jv-item';
        if (this.showArrayIndex) {
          const idx = document.createElement('span');
          idx.className = 'jv-index';
          idx.textContent = `${i}: `;
          item.append(idx);
        }
        item.append(this._buildNode(obj[i], depth + 1));
        list.append(item);
      });

      arrSpan.append(list);
      const close = document.createElement('span');
      close.textContent = ']';
      arrSpan.append(close);

      if (depth >= this.expandDepth) arrSpan.classList.add('collapsed');
      return arrSpan;
    }

    // Object
    const fragment = document.createDocumentFragment();
    const objSpan = document.createElement('span');
    objSpan.className = 'jv-node jv-object';
    objSpan.dataset.type = 'object';

    const toggle = this._toggle(depth);
    objSpan.append(toggle);

    const open = document.createElement('span');
    open.textContent = '{';
    objSpan.append(open);

    const list = document.createElement('div');
    list.className = 'jv-list';

    const keys = this.sort ? Object.keys(obj).sort() : Object.keys(obj);
    keys.forEach((k) => {
      const item = document.createElement('div');
      item.className = 'jv-item';
      const key = document.createElement('span');
      key.className = 'jv-key';
      key.textContent = this.showDoubleQuotes ? `"${k}"` : k;
      item.append(key);
      item.append(document.createTextNode(': '));
      item.append(this._buildNode(obj[k], depth + 1));
      list.append(item);
    });

    objSpan.append(list);
    const close = document.createElement('span');
    close.textContent = '}';
    objSpan.append(close);

    if (depth >= this.expandDepth) objSpan.classList.add('collapsed');
    return objSpan;
  }

  _leaf(value, cls) {
    const span = document.createElement('span');
    span.className = `jv-value ${cls}`;
    span.textContent = value;
    return span;
  }

  _toggle(depth) {
    const btn = document.createElement('span');
    btn.className = 'jv-toggle';
    btn.innerHTML = '▸';
    return btn;
  }

  _bindToggle() {
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('jv-toggle')) {
        const node = e.target.closest('.jv-node');
        node.classList.toggle('collapsed');
        e.stopPropagation();
      }
      // Alt+click expand all
      if (e.altKey && e.target.closest('.jv-node')) {
        const root = this.container.querySelector('.jv-node');
        const expand = root.classList.contains('collapsed');
        this.container
          .querySelectorAll('.jv-node')
          .forEach(n => n.classList.toggle('collapsed', !expand));
        e.stopPropagation();
      }
    });
  }

  /* 属性读取器 */
  get expandDepth() { return Number(this.getAttribute('expand-depth') ?? 1); }
  get copyable() { return this.hasAttribute('copyable'); }
  get sort() { return this.hasAttribute('sort'); }
  get theme() { return this.getAttribute('theme'); }
  get showArrayIndex() { return this.getAttribute('show-array-index') !== 'false'; }
  get showDoubleQuotes() { return this.hasAttribute('show-double-quotes'); }
}

customElements.define('json-viewer', JsonViewer);
