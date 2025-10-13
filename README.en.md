# &lt;json-viewer&gt; Element

> 🌈 A lightweight, modern Web Component for JSON visualization and interaction.

## Features

- 🌟 **Web Component**: Native, framework-agnostic
- 🎨 **Theme**: Light & dark mode
- 📦 **Boxed**: Optional border and padding
- 📋 **Copyable**: One-click copy JSON
- 🔑 **Sort**: Key sorting support
- 🔍 **Expand Depth**: Control initial expand level
- 🧩 **Custom Copy Button**: Slot for custom copy button
- 🧬 **Type Highlight**: Colorful type highlighting
- 🛠️ **Custom Events**: Listen for copy/toggle events

## Usage

### Install

```bash
npm install json-viewer-element
```

### Import

#### As a module

```js
import 'json-viewer-element'
```

#### UMD (CDN)

```html
<script src="https://unpkg.com/json-viewer-element/dist/json-viewer-element.umd.js"></script>
```

### Basic Example

Set value by script:

```html
<json-viewer id="viewer" boxed copyable sort expand-depth="2" theme="dark"></json-viewer>
<script>
  document.getElementById('viewer').value = { hello: "world", arr: [1,2,3] };
</script>
```

Set value by attribute:

```html
<json-viewer value='{"hello":"world","arr":[1,2,3]}' boxed copyable sort expand-depth="2" theme="dark"></json-viewer>
```

> [!TIP]
> When using with frameworks like Vue, you should pass value and copyable props as strings.

```vue
<template>
  <json-viewer :value="JSON.stringify(json)" boxed copyable sort expand-depth="2" theme="dark"></json-viewer>
</template>

<script>
export default {
  data() {
    return {
      json: { hello: "world", arr: [1,2,3] },
    }
  },
}
</script>
```

## Props

| Prop         | Type                      | Default | Description                                                                 |
| :----------- | :------------------------ | :------ | :-------------------------------------------------------------------------- |
| value        | any                       |         | JSON data                                                                   |
| expand-depth | number                    | 1       | Initial expand depth                                                        |
| copyable     | boolean / CopyableOptions | false   | Enable copy button or custom copy button config (see below)                 |
| sort         | boolean                   | false   | Whether to sort object keys                                                 |
| boxed        | boolean                   | false   | Whether to show border and padding                                          |
| theme        | 'light' / 'dark'          | 'light' | Theme                                                                       |
| parse        | boolean                   | true    | Whether to parse string value as JSON                                       |

### CopyableOptions

| Prop        | Type              | Default   | Description                        |
| :---------- | :---------------- | :-------- | :---------------------------------- |
| copyText    | string            | Copy      | Text shown on the copy button       |
| copiedText  | string            | Copied    | Text shown after successful copy    |
| timeout     | number            | 2000      | How long to show copiedText (ms)    |
| align       | 'left' / 'right'  | right     | Copy button alignment               |

## Events

| Event        | Description              |
| :----------- | :----------------------- |
| copy-success | Fired after copy success |
| copy-error   | Fired after copy failure |
| toggle       | Node expand/collapse     |

## Slots

Custom copy button:

```html
<json-viewer copyable>
  <button slot="copy-button">Copy JSON</button>
</json-viewer>
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2025-present [Lruihao](https://github.com/Lruihao)
