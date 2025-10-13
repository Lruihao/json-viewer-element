/**
 * Options for copyable feature.
 * @property {string} [copyText] Text shown on the copy button
 * @property {string} [copiedText] Text shown after successful copy
 * @property {number} [timeout] How long to show copiedText (ms)
 * @property {'left'|'right'} [align] Copy button alignment
 */
export interface CopyableOptions {
  copyText?: string
  copiedText?: string
  timeout?: number
  align?: 'left' | 'right'
}

/**
 * Props for JsonViewerElement.
 * @property {*} value JSON data to display
 * @property {number} [expandDepth] Initial expand depth
 * @property {boolean|CopyableOptions} [copyable] Enable copy button
 * @property {boolean} [sort] Whether to sort object keys
 * @property {boolean} [boxed] Whether to show a box around the viewer
 * @property {'light'|'dark'} [theme] Theme
 * @property {boolean} [parse] Whether to parse string value as JSON
 */
export interface JsonViewerElementProps {
  value: any
  expandDepth?: number
  copyable?: boolean | CopyableOptions
  sort?: boolean
  boxed?: boolean
  theme?: 'light' | 'dark'
  parse?: boolean
}

const togglerSvg = 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyBoZWlnaHQ9IjE2IiB3aWR0aD0iOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMCAwIDggOC04IDh6IiBmaWxsPSIjNjY2Ii8+PC9zdmc+'
const tpl = document.createElement('template')
tpl.innerHTML = `
<style>
/* Light Theme (default) */
:host {
  --jv-bg-color: #ffffff;
  --jv-border-color: #ddd;
  --jv-text-color: #111;
  --jv-key-color: #111;
  --jv-string-color: #42b983;
  --jv-number-color: #fc1e70;
  --jv-boolean-color: #fc1e70;
  --jv-null-color: #e08331;
  --jv-undefined-color: #b0b0b0;
  --jv-function-color: #067bca;
  --jv-regexp-color: #fc1e70;
  --jv-copy-bg: #eee;
  --jv-copy-text: #333;
  --jv-ellipsis-color: #999999;
  --jv-ellipsis-bg: #eeeeee;
  --jv-hover-shadow: rgba(0,0,0,0.1);
}

/* Dark Theme */
:host([theme="dark"]) {
  --jv-bg-color: #23272f;
  --jv-border-color: #2c313a;
  --jv-text-color: #d4d4d4;
  --jv-key-color: #79c0ff;
  --jv-string-color: #a5d6a7;
  --jv-number-color: #e2b86b;
  --jv-boolean-color: #ff7b72;
  --jv-null-color: #ffab70;
  --jv-undefined-color: #d2a8ff;
  --jv-function-color: #c678dd;
  --jv-regexp-color: #56b6c2;
  --jv-copy-bg: #3a3f4b;
  --jv-copy-text: #fff;
  --jv-ellipsis-color: #6e7681;
  --jv-ellipsis-bg: #2c313a;
  --jv-hover-shadow: rgba(0,0,0,0.4);
}

:host {
  display: block;
  width: 100%;
  max-width: 100%;
  font-family: Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  padding: 8px;
  overflow-x: auto;
  box-sizing: border-box;
  position: relative;
  background-color: var(--jv-bg-color);
  color: var(--jv-text-color);
}

:host([boxed]) {
  border: 1px solid var(--jv-border-color);
  border-radius: 4px;
  padding: 16px;
  transition: box-shadow 0.2s ease;
}
:host([boxed]:hover) {
  box-shadow: 0 2px 8px var(--jv-hover-shadow);
}
#root:has(+.align-left) {
  margin-top: 16px;
}
.jv-copy {
  cursor: pointer;
  font-size: 12px;
  background: var(--jv-copy-bg);
  color: var(--jv-copy-text);
  padding: 4px 8px;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
:host(:hover) .jv-copy {
  opacity: 1;
}
slot[name="copy-button"] {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: block !important;
}
slot[name="copy-button"][hidden] {
  display: none !important;
}
slot[name="copy-button"].align-left {
  left: 8px;
  right: auto;
}
slot[name="copy-button"].align-right {
  right: 8px;
  left: auto;
}
:host(:hover) slot[name="copy-button"] {
  opacity: 1;
}
.jv-toggle {
  background-image: url("${togglerSvg}");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
  cursor: pointer;
  width: 10px;
  height: 10px;
  margin-right: 2px;
  display: inline-block;
  transition: rotate .1s;
}
.jv-toggle.open {
  rotate: 90deg;
}
.jv-key {
  color: var(--jv-key-color);
}
.jv-string {
  color: var(--jv-string-color);
}
.jv-number {
  color: var(--jv-number-color);
}
.jv-boolean {
  color: var(--jv-boolean-color);
}
.jv-null {
  color: var(--jv-null-color);
}
.jv-undefined {
  color: var(--jv-undefined-color);
}
.jv-function {
  color: var(--jv-function-color);
}
.jv-regexp {
  color: var(--jv-regexp-color);
}
.jv-list {
  margin-left: 16px;
}
.jv-item:not(:has(.jv-toggle)) .jv-key {
  margin-left: 12px;
}
.jv-item:not(:last-child):after {
  content: ',';
}
.jv-node > .jv-ellipsis {
  display: none;
}
.jv-node.empty > .jv-list {
  display: inline-block;
  margin-inline: 4px;
}
.jv-node.collapsed > .jv-list,
.jv-node.collapsed.empty > .jv-ellipsis {
  display: none;
}
.jv-node.collapsed > .jv-ellipsis {
  color: var(--jv-ellipsis-color);
  background-color: var(--jv-ellipsis-bg);
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
</style>
<div id="root" part="root"></div>
<slot name="copy-button" part="copy-button" hidden>
  <span class="jv-copy"></span>
</slot>
`

export class JsonViewerElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'value',
      'expand-depth',
      'copyable',
      'sort',
      'boxed',
      'theme',
      'parse',
    ]
  }

  private _value: any = null
  private root: ShadowRoot
  private container: HTMLElement

  constructor() {
    super()
    // Attach shadow DOM and clone template
    this.root = this.attachShadow({ mode: 'open' })
    this.root.appendChild(tpl.content.cloneNode(true))
    this.container = this.root.getElementById('root')!
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  // ----- Public property: value -----
  set value(v: any) {
    if (v === this._value)
      return
    this._value = v
    this.render()
  }

  get value() {
    return this._value ?? this.getAttribute('value')
  }

  // ----- Private getters for props -----
  private get expandDepth() {
    return Number(this.getAttribute('expand-depth') ?? 1)
  }

  private get sort() {
    return this.hasAttribute('sort')
  }

  private get theme() {
    return this.getAttribute('theme') || 'light'
  }

  private get parse() {
    return this.getAttribute('parse') !== 'false'
  }

  private get copyable(): CopyableOptions | false {
    if (!this.hasAttribute('copyable'))
      return false
    const attr = this.getAttribute('copyable')
    const defaultCopyableOptions: CopyableOptions = { copyText: 'Copy', copiedText: 'Copied', timeout: 2000, align: 'right' }
    if (attr === '' || attr === null)
      return defaultCopyableOptions
    try {
      return {
        ...defaultCopyableOptions,
        ...JSON.parse(attr),
      }
    }
    catch {
      return defaultCopyableOptions
    }
  }

  /**
   * Copy text to clipboard. Uses Clipboard API if available, otherwise fallback.
   */
  private copyText(text: string): Promise<void> {
    if (navigator.clipboard) {
      this.copyText = (text: string) => navigator.clipboard.writeText(text)
      return this.copyText(text)
    }
    // Fallback for older browsers
    this.copyText = (text: string) => new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      if (document.execCommand('copy')) {
        document.body.removeChild(input)
        resolve()
      }
      else {
        document.body.removeChild(input)
        reject(new Error('Copy failed'))
      }
    })
    return this.copyText(text)
  }

  /**
   * Render the JSON viewer.
   */
  private render() {
    // Parse string value if needed
    if (typeof this.value === 'string' && this.parse) {
      try {
        this._value = JSON.parse(this.value)
      }
      catch {
        /* keep original */
      }
    }

    // Clear and rebuild the tree
    this.container.innerHTML = ''
    this.container.appendChild(this.build(this._value, 0))

    const copyableOptions = this.copyable

    if (copyableOptions) {
      const align = copyableOptions.align || 'right'
      const copySlot = this.root.querySelector('slot[name="copy-button"]') as HTMLSlotElement
      const customCopyButton = copySlot.assignedElements()[0] as HTMLElement
      const defaultCopyBtn = this.root.querySelector('.jv-copy') as HTMLElement

      copySlot.hidden = false
      copySlot.className = `align-${align}`

      if (!customCopyButton) {
        let copyTimeout: number
        defaultCopyBtn.textContent = copyableOptions.copyText
        // Remove previous event by replacing node (ensures only one listener)
        const newBtn = defaultCopyBtn.cloneNode(true) as HTMLElement
        defaultCopyBtn.replaceWith(newBtn)

        newBtn.textContent = copyableOptions.copyText

        // Bind copy event
        newBtn.addEventListener('click', () => {
          const textToCopy = JSON.stringify(this._value, null, 2)
          this.copyText(textToCopy).then(() => {
            newBtn.textContent = copyableOptions.copiedText

            copyTimeout = window.setTimeout(() => {
              newBtn.textContent = copyableOptions.copyText
              clearTimeout(copyTimeout)
            }, copyableOptions.timeout)

            this.dispatchEvent(new CustomEvent('copy-success', {
              detail: { text: textToCopy, options: copyableOptions },
            }))
          }).catch(() => {
            console.warn('Failed to copy text to clipboard')

            this.dispatchEvent(new CustomEvent('copy-error', {
              detail: { text: textToCopy, options: copyableOptions },
            }))
          })
        })
      }
    }
  }

  /**
   * Recursively build the JSON tree.
   */
  private build(data: any, depth: number): Node {
    if (data === null)
      return this.leaf('null', 'jv-null')
    if (data === undefined)
      return this.leaf('undefined', 'jv-undefined')
    if (typeof data === 'boolean')
      return this.leaf(String(data), 'jv-boolean')
    if (typeof data === 'number')
      return this.leaf(String(data), 'jv-number')
    if (typeof data === 'string')
      return this.leaf(`"${data}"`, 'jv-string')
    if (typeof data === 'function')
      return this.leaf('<function>', 'jv-function')
    if (data instanceof RegExp)
      return this.leaf('<regexp>', 'jv-regexp')
    if (data instanceof Date)
      return this.leaf(`"${data.toLocaleString()}"`, 'jv-string')

    const isArr = Array.isArray(data)
    const node = document.createElement('span')
    node.className = 'jv-node'
    node.setAttribute('part', 'node')

    const list = document.createElement('div')
    list.className = 'jv-list'
    list.setAttribute('part', 'list')
    const keys = isArr
      ? (this.sort ? [...data.keys()].sort((a, b) => a - b) : [...data.keys()])
      : (this.sort ? Object.keys(data).sort() : Object.keys(data))

    for (const k of keys) {
      const item = document.createElement('div')
      const childNode = this.build(data[k], depth + 1)
      item.className = 'jv-item'

      // If child is an object/array, move toggle button to front
      if (childNode instanceof Element && childNode.classList.contains('jv-node')) {
        const childToggle = childNode.querySelector('.jv-toggle')
        if (childToggle) {
          childToggle.remove()
          item.append(childToggle)
        }
      }

      if (!isArr) {
        const keySpan = document.createElement('span')
        keySpan.className = 'jv-key'
        keySpan.setAttribute('part', 'key')
        keySpan.textContent = `"${k}": `
        item.append(keySpan)
      }
      item.append(childNode)
      list.append(item)
    }

    // Toggle button for collapse/expand
    const toggle = document.createElement('span')
    toggle.className = 'jv-toggle'
    toggle.setAttribute('part', 'toggle')
    if (!node.classList.contains('collapsed')) {
      toggle.classList.add('open')
    }
    toggle.addEventListener('click', () => {
      node.classList.toggle('collapsed')
      toggle.classList.toggle('open')
      this.dispatchEvent(new CustomEvent('toggle', {
        detail: {
          node,
          data,
          isCollapsed: node.classList.contains('collapsed'),
        },
      }))
    })

    // Ellipsis for collapsed nodes
    const ellipsis = document.createElement('span')
    ellipsis.className = 'jv-ellipsis'
    ellipsis.setAttribute('part', 'ellipsis')
    ellipsis.textContent = `...${keys.length}`
    ellipsis.addEventListener('click', () => {
      node.classList.remove('collapsed')
      toggle.classList.add('open')
    })

    if (depth >= this.expandDepth) {
      node.classList.add('collapsed')
      toggle.classList.remove('open')
    }
    if (!keys.length)
      node.classList.add('empty')

    // Assemble node
    node.append(toggle, isArr ? '[' : '{', ellipsis, list, isArr ? ']' : '}')

    return node
  }

  /**
   * Create a leaf node for primitive values.
   */
  private leaf(text: string, cls: string) {
    const s = document.createElement('span')
    s.className = `jv-value ${cls}`
    s.setAttribute('part', `value ${cls.replace('jv-', '')}`)
    s.textContent = text
    return s
  }
}

customElements.define('json-viewer', JsonViewerElement)

// Export type for global usage
declare global {
  interface HTMLElementTagNameMap {
    'json-viewer': JsonViewerElement
  }
}
