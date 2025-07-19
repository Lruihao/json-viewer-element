const tpl = document.createElement('template');
tpl.innerHTML = `
<style>
:host{display:block;font-family:Consolas,Menlo,Courier,monospace;font-size:14px;padding:8px}
.jv-copy{position:absolute;top:8px;right:8px;cursor:pointer;font-size:12px;background:#eee;padding:2px 4px;border-radius:3px}
.jv-node.collapsed>.jv-list{display:none}
.jv-toggle{cursor:pointer;margin-right:4px;color:#49b3ff;user-select:none}
.jv-key{color:#111}
.jv-string{color:#42b983}
.jv-number{color:#fc1e70}
.jv-boolean{color:#fc1e70}
.jv-null{color:#e08331}
.jv-list{margin-left:16px}
.jv-ellipsis {color:#999;font-size:0.9em;padding-inline:0.25rem;}
</style>
<div>
  <span class="jv-copy" hidden>Copy</span>
  <span id="root"></span>
</div>
`;

export class JsonViewerElement extends HTMLElement {
  static get observedAttributes() { return ['value', 'expand-depth', 'copyable']; }

  private _value: any = {};
  private root: ShadowRoot;
  private container: HTMLElement;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(tpl.content.cloneNode(true));
    this.container = this.root.getElementById('root')!;
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  /* ---- 公开属性 ---- */
  set value(v: any) { this._value = v; this.render(); }
  get value()      { return this._value; }

  private get expandDepth() { return Number(this.getAttribute('expand-depth') ?? 1); }
  private get copyable()    { return this.hasAttribute('copyable'); }

  /* ---- 渲染 ---- */
  private render() {
    try {
      const raw = this.getAttribute('value');
      this._value = raw ? JSON.parse(raw) : this._value;
    } catch { /* 外部已直接设 value */ }

    this.container.innerHTML = '';
    this.container.appendChild(this.build(this._value, 0));

    const cpBtn = this.root.querySelector('.jv-copy') as HTMLElement;
    cpBtn.hidden = !this.copyable;
    cpBtn.onclick = () => navigator.clipboard.writeText(JSON.stringify(this._value, null, 2));
  }

  /* ---- 递归建树 ---- */
  private build(data: any, depth: number): Node {
    if (data === null)            return this.leaf('null', 'jv-null');
    if (typeof data === 'boolean')return this.leaf(String(data), 'jv-boolean');
    if (typeof data === 'number') return this.leaf(String(data), 'jv-number');
    if (typeof data === 'string') return this.leaf(`"${data}"`, 'jv-string');

    const isArr = Array.isArray(data);
    const node = document.createElement('span');
    node.className = 'jv-node';
    node.innerHTML = isArr ? '[' : '{';

    const list = document.createElement('div');
    list.className = 'jv-list';
    const keys = isArr ? Array.from(data.keys()) : Object.keys(data);
    for (const k of keys) {
      const item = document.createElement('div');
      if (!isArr) {
        const keySpan = document.createElement('span');
        keySpan.className = 'jv-key';
        keySpan.textContent = `"${k}": `;
        item.append(keySpan);
      }
      item.append(this.build(data[k], depth + 1));
      list.append(item);
    }

    /* 省略号 */
    const ellipsis = document.createElement('span');
    ellipsis.className = 'jv-ellipsis';
    ellipsis.style.display = node.classList.contains('collapsed') ? 'inline' : 'none';
    ellipsis.textContent = isArr
      ? `... ${data.length} items`
      : `... ${keys.length} keys`;
    node.append(ellipsis);
    node.append(list, isArr ? ']' : '}');

    if (depth >= this.expandDepth) node.classList.add('collapsed');

    /* 折叠按钮 */
    const toggle = document.createElement('span');
    toggle.className = 'jv-toggle';
    toggle.textContent = '▸';
    toggle.onclick = () => {
      node.classList.toggle('collapsed');
      ellipsis.style.display = node.classList.contains('collapsed') ? 'inline' : 'none';
    };
    node.prepend(toggle);

    return node;
  }

  private leaf(text: string, cls: string) {
    const s = document.createElement('span');
    s.className = `jv-value ${cls}`;
    s.textContent = text;
    return s;
  }
}

customElements.define('json-viewer', JsonViewerElement);

// 导出类型以便外部引用
declare global {
  interface HTMLElementTagNameMap {
    'json-viewer': JsonViewerElement;
  }
}
