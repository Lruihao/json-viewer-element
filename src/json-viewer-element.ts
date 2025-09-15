export interface CopyableOptions {
  copyText?: string;
  copiedText?: string;
  timeout?: number;
  align?: 'left' | 'right';
}

export interface JsonViewerElementProps {
  value: any;
  expandDepth?: number;
  copyable?: boolean | CopyableOptions;
  sort?: boolean;
  boxed?: boolean;
  theme?: string;
  parse?: boolean;
}

const tpl = document.createElement('template');
tpl.innerHTML = `
<style>
:host{display:block;width:100%;max-width:100%;font-family:Consolas,Menlo,Courier,monospace;font-size:14px;padding:8px;overflow-x:auto;box-sizing:border-box;position:relative}
:host([boxed]){border:1px solid #ddd;border-radius:4px;padding:16px;transition:box-shadow 0.2s ease}
:host([boxed]:hover){box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.jv-copy{cursor:pointer;font-size:12px;background:#eee;padding:4px 8px;border-radius:3px;opacity:0;transition:opacity 0.2s ease}
:host(:hover) .jv-copy{opacity:1}
slot[name="copy-button"]{position:absolute;top:8px;right:8px;z-index:10;opacity:0;transition:opacity 0.2s ease;display:block !important}
slot[name="copy-button"][hidden]{display:none !important}
slot[name="copy-button"].align-left{left:8px;right:auto}
slot[name="copy-button"].align-right{right:8px;left:auto}
:host(:hover) slot[name="copy-button"]{opacity:1}
.jv-toggle{cursor:pointer;margin-right:4px;color:#49b3ff;user-select:none}
.jv-key{color:#111}
.jv-string{color:#42b983}
.jv-number{color:#fc1e70}
.jv-boolean{color:#fc1e70}
.jv-null{color:#e08331}
.jv-function{color:#067bca}
.jv-regexp{color:#fc1e70}
.jv-list{margin-left:16px}
.jv-node:not(:has(.jv-toggle)) .jv-list {
  margin-left: 28px;
}
.jv-list > div:not(:has(.jv-toggle)) .jv-key {
  margin-left: 12px;
}
.jv-list > div:not(:last-child):after {
  content: ',';
}
.jv-node>.jv-ellipsis{display:none;}
.jv-node.empty {
  >.jv-list {
    display: inline-block;
    margin-inline: 4px;
  }
}
.jv-node.collapsed {
  >.jv-list,
  &.empty>.jv-ellipsis {
    display: none;
  }
  >.jv-ellipsis {
    color: #999999;
    background-color: #eeeeee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.85em;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
    padding: 2px 4px;
    margin: 0px 4px;
    border-radius: 3px;
  }
}
</style>
<div id="root" part="root"></div>
<slot name="copy-button" part="copy-button">
  <span class="jv-copy">Copy</span>
</slot>
`;

/* ---------- 组件主体 ---------- */
export class JsonViewerElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'value',
      'expand-depth',
      'copyable',
      'sort',
      'boxed',
      'theme',
      'parse'
    ];
  }

  private _value: any = null;
  private root: ShadowRoot;
  private container: HTMLElement;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(tpl.content.cloneNode(true));
    this.container = this.root.getElementById('root')!;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  /* ---- 公开属性 ---- */
  set value(v: any) {
    if (v === this._value) return;
    this._value = v;
    this.render();
  }
  get value() {
    return this._value ?? this.getAttribute('value');
  }

  /* ---------- 私有 getter ---------- */
  private get expandDepth() {
    return Number(this.getAttribute('expand-depth') ?? 1);
  }
  private get sort() {
    return this.hasAttribute('sort');
  }
  private get boxed() {
    return this.hasAttribute('boxed');
  }
  private get theme() {
    return this.getAttribute('theme') || 'light';
  }
  private get parse() {
    return this.getAttribute('parse') !== 'false';
  }
  private get copyable(): CopyableOptions | false {
    if (!this.hasAttribute('copyable')) return false;
    const attr = this.getAttribute('copyable');
    if (attr === '' || attr === null) return { copyText: 'Copy', copiedText: 'Copied', timeout: 2000, align: 'right' };
    try {
      return JSON.parse(attr);
    } catch {
      return { copyText: 'Copy', copiedText: 'Copied', timeout: 2000, align: 'right' };
    }
  }

  private copyText(text: string): Promise<void> {
    if (navigator.clipboard) {
      this.copyText = (text: string) => navigator.clipboard.writeText(text);
      return this.copyText(text);
    }
    this.copyText = (text: string) => new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      if (document.execCommand('copy')) {
        document.body.removeChild(input);
        resolve();
      } else {
        document.body.removeChild(input);
        reject(new Error('Copy failed'));
      }
    });
    return this.copyText(text);
  }

  /* ---- 渲染 ---- */
  private render() {
    if (typeof this.value === 'string' && this.parse) {
      try {
        this._value = JSON.parse(this.value);
      } catch {
        /* keep original */
      }
    }

    this.container.innerHTML = '';
    this.container.appendChild(this.build(this._value, 0));

    const copyableOptions = this.copyable;
    const copySlot = this.root.querySelector('slot[name="copy-button"]') as HTMLSlotElement;
    const customCopyButton = copySlot.assignedElements()[0] as HTMLElement;
    const defaultCopyBtn = this.root.querySelector('.jv-copy') as HTMLElement;

    if (copyableOptions) {
      // 显示复制按钮容器并设置对齐
      const align = copyableOptions.align || 'right';
      copySlot.hidden = false;
      copySlot.className = `align-${align}`;

      if (customCopyButton) {
        // 使用自定义复制按钮
        // 为自定义按钮设置数据和事件
        customCopyButton.dataset.value = JSON.stringify(this._value, null, 2);
        customCopyButton.dataset.copyableOptions = JSON.stringify(copyableOptions);

        // 根据自定义按钮的 copyable 属性判断是否添加默认复制事件
        const shouldAddCopyEvent = customCopyButton.getAttribute('copyable') !== 'false';

        if (shouldAddCopyEvent && !customCopyButton.onclick) {
          customCopyButton.onclick = () => {
            const textToCopy = customCopyButton.dataset.value!;
            this.copyText(textToCopy).then(() => {
              // 触发自定义事件，允许外部处理成功状态
              customCopyButton.dispatchEvent(new CustomEvent('copy-success', {
                detail: { text: textToCopy, options: copyableOptions }
              }));
            }).catch(() => {
              customCopyButton.dispatchEvent(new CustomEvent('copy-error', {
                detail: { text: textToCopy, options: copyableOptions }
              }));
            });
          };
        }
      } else {
        // 使用默认复制按钮（slot 的默认内容）
        defaultCopyBtn.textContent = copyableOptions.copyText || 'Copy';
        defaultCopyBtn.className = 'jv-copy';

        let copyTimeout: number;
        defaultCopyBtn.onclick = () => {
          const textToCopy = JSON.stringify(this._value, null, 2);
          this.copyText(textToCopy).then(() => {
            const originalText = defaultCopyBtn.textContent;
            defaultCopyBtn.textContent = copyableOptions.copiedText || 'Copied';

            clearTimeout(copyTimeout);
            copyTimeout = window.setTimeout(() => {
              defaultCopyBtn.textContent = originalText;
            }, copyableOptions.timeout || 2000);
          }).catch(() => {
            console.warn('Failed to copy text to clipboard');
          });
        };
      }
    } else {
      // 隐藏复制按钮容器
      copySlot.hidden = true;
      copySlot.className = '';
    }
  }

  /* ---- 递归建树 ---- */
  private build(data: any, depth: number): Node {
    /* 原始值 */
    if (data === null) return this.leaf('null', 'jv-null');
    if (typeof data === 'boolean') return this.leaf(String(data), 'jv-boolean');
    if (typeof data === 'number') return this.leaf(String(data), 'jv-number');
    if (typeof data === 'string') return this.leaf(`"${data}"`, 'jv-string');
    if (typeof data === 'function') return this.leaf('<function>', 'jv-function');
    if (data instanceof RegExp) return this.leaf('<regexp>', 'jv-regexp');
    if (data instanceof Date) return this.leaf(`"${data.toLocaleString()}"`, 'jv-string');

    const isArr = Array.isArray(data);
    const node = document.createElement('span');
    node.className = 'jv-node';
    node.setAttribute('part', 'node');

    const list = document.createElement('div');
    list.className = 'jv-list';
    list.setAttribute('part', 'list');
    const keys = isArr
      ? (this.sort ? [...data.keys()].sort((a, b) => a - b) : [...data.keys()])
      : (this.sort ? Object.keys(data).sort() : Object.keys(data));

    for (const k of keys) {
      const item = document.createElement('div');
      const childNode = this.build(data[k], depth + 1);

      // 如果子节点是对象或数组，将 toggle 按钮移到前面
      if (childNode instanceof Element && childNode.classList.contains('jv-node')) {
        const childToggle = childNode.querySelector('.jv-toggle');
        if (childToggle) {
          childToggle.remove(); // 从原位置移除
          item.append(childToggle); // 添加到新位置
        }
      }

      if (!isArr) {
        const keySpan = document.createElement('span');
        keySpan.className = 'jv-key';
        keySpan.setAttribute('part', 'key');
        keySpan.textContent = `"${k}": `;
        item.append(keySpan);
      }
      item.append(childNode);
      list.append(item);
    }

    /* 省略号 */
    const ellipsis = document.createElement('span');
    ellipsis.className = 'jv-ellipsis';
    ellipsis.setAttribute('part', 'ellipsis');
    ellipsis.textContent = `...${keys.length}`
    ellipsis.onclick = () => {
      node.classList.remove('collapsed');
      toggle.textContent = '▾';
    };

    if (depth >= this.expandDepth) node.classList.add('collapsed');
    if (!keys.length) node.classList.add('empty')

    /* 折叠按钮 */
    const toggle = document.createElement('span');
    toggle.className = 'jv-toggle';
    toggle.setAttribute('part', 'toggle');
    toggle.textContent = node.classList.contains('collapsed') ? '▸' : '▾';
    toggle.onclick = () => {
      node.classList.toggle('collapsed');
      toggle.textContent = node.classList.contains('collapsed') ? '▸' : '▾';
    };

    /* 组装 DOM */
    node.append(toggle, isArr ? '[' : '{', ellipsis, list, isArr ? ']' : '}');

    return node;
  }

  private leaf(text: string, cls: string) {
    const s = document.createElement('span');
    s.className = `jv-value ${cls}`;
    s.setAttribute('part', `value ${cls.replace('jv-', '')}`);
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
