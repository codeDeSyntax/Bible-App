# Multi-Monitor Projection Testing Guide

## 🖥️ Testing Without Physical Projector

### Method 1: Windows Virtual Display (Recommended)

1. **Enable Virtual Display in Windows:**

   - Right-click Desktop → Display Settings
   - Scroll to "Multiple displays"
   - Select "Extend these displays"
   - Click "Detect" to force Windows to look for displays
   - You can also try "Duplicate these displays" for testing

2. **Create Virtual Second Monitor (Windows 10/11):**
   - Open Device Manager
   - View → Show hidden devices
   - Look for "Microsoft Basic Display Adapter"
   - Enable if disabled

### Method 2: Remote Desktop Testing

1. Connect via Remote Desktop to the same computer
2. This creates a virtual second display scenario
3. Test projection behavior in this setup

### Method 3: Display Emulator Software

- **Spacedesk** (Free): Creates virtual displays over network
- **Virtual Display Manager**: Software-based virtual monitors
- **TeamViewer**: Has multi-monitor support for testing

## 🔍 Debug Information Analysis

From your logs:

```
🖥️ Song Presentation - All displays detected: 1
🖥️ Display 0: {
  id: 2528732444,
  bounds: { x: 0, y: 0, width: 1280, height: 720 },
  internal: true
}
⚠️ Song Presentation - Only one display detected, using primary
```

**This is CORRECT behavior** - your app properly detected 1 display and used fallback logic.

## 🎯 Real Projector Connection Troubleshooting

When you tested with HDMI projector and it didn't work, check:

### Windows Display Configuration:

1. **Windows + P** → Select "Extend"
2. **Display Settings** → Ensure projector shows as Display 2
3. **Resolution Matching** → Set compatible resolution
4. **Refresh Rate** → Match projector's refresh rate

### Common HDMI Issues:

- **Cable Quality**: Use high-quality HDMI cable
- **Port Selection**: Try different HDMI ports
- **Driver Issues**: Update display drivers
- **Power Management**: Disable USB selective suspend

### App-Specific Checks:

1. **Run app AFTER** connecting projector
2. **Check logs** for "Display 1" with different bounds
3. **Manual Testing**: Use DisplayTester component

## 🧪 Test Scenarios

### Scenario 1: Single Display (Current)

- ✅ Expected: Fullscreen on primary display
- ✅ Your Result: Working correctly

### Scenario 2: Dual Display (Target)

Expected logs should show:

```
🖥️ Song Presentation - All displays detected: 2
🖥️ Display 0: { id: xxx, bounds: { x: 0, y: 0, ... }, internal: true }
🖥️ Display 1: { id: xxx, bounds: { x: 1280, y: 0, ... }, internal: false }
🎯 Song Presentation - Using external display: { bounds: { x: 1280, y: 0, ... } }
```

### Scenario 3: Projector Specific Issues

If projector connects but app doesn't detect:

- Check if projector appears in Display Settings
- Verify `internal: false` in logs
- Ensure `bounds.x !== 0` or `bounds.y !== 0`

## 📝 Testing Checklist

- [ ] App detects displays correctly (check console)
- [ ] Single display: Uses fullscreen on primary
- [ ] Dual display: Creates window on secondary
- [ ] Window positioning matches target display bounds
- [ ] Content renders correctly in projection window
- [ ] Main window remains on primary display

## 🚨 Known Issues & Solutions

### Issue: Projector detected but projection appears on wrong display

**Solution**: Check display arrangement in Windows Display Settings

### Issue: Projection window too small/large

**Solution**: Display scaling differences - we handle with `scaleFactor`

### Issue: App doesn't detect projector immediately

**Solution**: Restart app after connecting projector

## 💡 Enhancement Recommendations

Based on your logs, consider adding:

1. **Manual Display Selection**: UI to choose target display
2. **Display Change Detection**: Auto-refresh when displays change
3. **Resolution Override**: Manual resolution settings
4. **Connection Status**: Real-time display status indicator

## 🏃‍♂️ Quick Test Commands

Add these to test multi-monitor without projector:

```javascript
// In browser console (renderer process)
window.api.getDisplayInfo().then(console.log)

// Expected single display result:
{
  success: true,
  data: {
    totalDisplays: 1,
    allDisplays: [{ internal: true, bounds: { x: 0, y: 0, ... } }]
  }
}
```
