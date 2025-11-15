# Voice Assistant Widget API

## External Control via PostMessage

The voice assistant widget can be controlled by parent websites using the postMessage API.

### Configuration

```javascript
// Change widget appearance
window.postMessage({
  type: 'VOICE_WIDGET_CONFIG',
  payload: {
    shape: 'circle' | 'rounded' | 'square',
    size: 'small' | 'medium' | 'large',
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
    primaryColor: '#hex-color' // optional
  }
}, '*');
```

### Control Commands

```javascript
// Start conversation
window.postMessage({ type: 'VOICE_WIDGET_START' }, '*');

// End conversation
window.postMessage({ type: 'VOICE_WIDGET_END' }, '*');

// Toggle minimize/maximize
window.postMessage({ type: 'VOICE_WIDGET_TOGGLE_MINIMIZE' }, '*');
```

### Example Usage

```html
<iframe src="https://your-staylite-url.com" id="staylite"></iframe>

<script>
  const iframe = document.getElementById('staylite');
  
  // Configure widget appearance
  iframe.contentWindow.postMessage({
    type: 'VOICE_WIDGET_CONFIG',
    payload: {
      shape: 'rounded',
      size: 'medium',
      position: 'bottom-right'
    }
  }, '*');
  
  // Start voice assistant
  setTimeout(() => {
    iframe.contentWindow.postMessage({
      type: 'VOICE_WIDGET_START'
    }, '*');
  }, 2000);
</script>
```

## Features

- **Persistent conversation**: The voice assistant maintains its state across page navigation
- **Client-side tools**: Can navigate pages, search listings, and perform actions without interrupting the conversation
- **Customizable appearance**: Shape, size, position, and colors can be controlled
- **Cross-origin control**: Parent websites can control the widget via postMessage API
