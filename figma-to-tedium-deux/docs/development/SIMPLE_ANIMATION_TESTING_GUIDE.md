# Simple Animation Testing Guide

This guide shows you how to test the simple animation system with actual Figma exports.

## 🎯 Testing Methods

### Method 1: Using the Figma Plugin (Recommended)

#### Step 1: Export from Figma Plugin
1. **Open your Figma file** containing components with variants
2. **Select the component set** you want to test
3. **Run your plugin** in Figma
4. **Click "Export JSON"** to get the node data
5. **Save the JSON** to a file (e.g., `my-component.json`)

#### Step 2: Test with Simple Animation System
```bash
npm run test-simple-animation my-component.json
```

This will:
- ✅ Generate HTML using the simple animation system
- ✅ Create a test page with animation controls
- ✅ Open the result in your browser
- ✅ Show debug information and logs

### Method 2: Using Figma API (Direct Export)

#### Step 1: Get Required Information

**File Key:**
- Open your Figma file in browser
- URL format: `https://www.figma.com/file/FILE_KEY/...`
- Copy the FILE_KEY part

**Node ID:**
- Right-click on the component set
- Select "Copy/Paste as" → "Copy link"
- The URL will contain `node-id=NODE_ID`
- Copy the NODE_ID part

**Access Token:**
- Go to Figma.com → Settings → Account
- Scroll down to "Personal access tokens"
- Click "Generate new token"
- Copy the token

#### Step 2: Export and Test
```bash
# First export using the API
npm run export-node <file-key> <node-id> <access-token> my-component.json

# Then test with simple animation system
npm run test-simple-animation my-component.json
```

## 🧪 What You'll See

The test page includes:

### **Test Controls**
- **Test Simple Animation**: Tests basic position, color, shadow, and size animations
- **Test Color Animation**: Tests color transitions specifically
- **Test Shadow Animation**: Tests shadow transitions specifically
- **Test Size Animation**: Tests size transitions specifically
- **Test Instant Switch**: Tests instant variant switching
- **Reset**: Resets all variants to initial state
- **Clear Logs**: Clears the debug log

### **Debug Information**
- Real-time animation logs
- Console output capture
- Animation status updates
- Error reporting

### **Exported Content**
- Your actual Figma component rendered as HTML
- All variants visible and testable
- Interactive animation controls

## 🎬 Animation Features to Test

### **Position Animation**
- Elements smoothly move between positions
- Uses hardware-accelerated `transform: translate()`
- Supports both X and Y movement simultaneously

### **Color Animation**
- Background color transitions
- Border color transitions
- Opacity changes
- Smooth color interpolation

### **Shadow Animation**
- Box-shadow property animations
- Shadow blur, spread, and color changes
- Smooth shadow transitions

### **Size Animation**
- Width and height changes
- Min/max dimension constraints
- Smooth size transitions

### **Combined Animations**
- Multiple properties animate simultaneously
- Hardware-accelerated performance
- Smooth, consistent timing

## 🔍 Debugging Tips

### **Check Console Logs**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for animation-related logs with emojis:
   - 🎬 Animation start
   - 📋 Source/target info
   - 📊 Position calculations
   - ✅ Animation completion
   - ⏰ Timeout fallbacks
   - 🔄 Variant switching
   - ⚡ Instant switches

### **Common Issues**

#### **"No variants found"**
- Make sure you selected a component set, not a single component
- Check that the component has multiple variants
- Verify the JSON contains variant data

#### **"Animation not working"**
- Check browser console for errors
- Verify CSS is loading properly
- Ensure variants have different properties to animate

#### **"Performance issues"**
- The simple system uses hardware acceleration
- Should be smooth on modern browsers
- Check if other browser tabs are consuming resources

## 📊 Performance Comparison

### **Simple Animation System**
- ✅ Hardware-accelerated transforms
- ✅ GPU-optimized animations
- ✅ Minimal DOM manipulation
- ✅ Clean state management
- ✅ Reliable completion detection

### **Official System (for comparison)**
- ❌ Complex DOM copying
- ❌ Multiple state transitions
- ❌ Complex cleanup phases
- ❌ More failure points
- ❌ Harder to debug

## 🚀 Advanced Testing

### **Custom Animation Parameters**
You can modify the test script to test different animation parameters:

```typescript
// In the test script, modify these values:
window.handleSimpleAnimatedVariantSwitch(
  sourceVariant,
  targetVariant,
  [sourceVariant, targetVariant],
  'SMART_ANIMATE',  // Try: 'EASE_IN_AND_OUT', 'BOUNCY', 'LINEAR'
  1.0               // Duration in seconds
);
```

### **Testing Different Easing Functions**
- `SMART_ANIMATE`: Smooth ease-in-out
- `EASE_IN_AND_OUT`: Standard ease-in-out
- `BOUNCY`: Bouncy with overshoot
- `LINEAR`: Linear interpolation
- `EASE_IN`: Ease-in only
- `EASE_OUT`: Ease-out only

### **Testing Multiple Variants**
If your component has more than 2 variants, the test will cycle through them:
- First click: Variant 1 → Variant 2
- Second click: Variant 2 → Variant 3
- And so on...

## 📁 Output Files

The test generates:
- **HTML file**: Complete test page with your exported component
- **Debug logs**: Real-time animation information
- **Console output**: Detailed animation tracking

## 🎯 Example Test Session

```bash
# 1. Export from Figma plugin and save as my-button.json

# 2. Test the simple animation system
npm run test-simple-animation my-button.json

# 3. Browser opens with test page

# 4. Click "Test Simple Animation" to see:
#    - Button moves to new position
#    - Color changes smoothly
#    - Shadow updates
#    - Size adjusts if different

# 5. Check console for detailed logs:
#    [10:30:15] 🎬 SIMPLE ANIMATION: Starting animation
#    [10:30:15] 📋 Source: button-variant-1
#    [10:30:15] 📋 Target: button-variant-2
#    [10:30:15] 📊 Position delta: { deltaX: 50, deltaY: 0 }
#    [10:30:16] ✅ SIMPLE ANIMATION: Animation completed
```

## 🔧 Troubleshooting

### **"Script not found" Error**
```bash
# Make sure you're in the project directory
cd figma-to-tedium-deux

# Install dependencies if needed
npm install

# Try the test again
npm run test-simple-animation my-component.json
```

### **"Module not found" Error**
```bash
# Rebuild the project
npm run build

# Try the test again
npm run test-simple-animation my-component.json
```

### **Browser Issues**
- Try a different browser (Chrome, Firefox, Safari)
- Check if JavaScript is enabled
- Clear browser cache and try again

## 🎉 Success Indicators

You'll know the simple animation system is working when you see:

1. **Smooth Animations**: Elements move smoothly without jank
2. **Hardware Acceleration**: Animations are GPU-accelerated
3. **Reliable Completion**: Animations always complete successfully
4. **Clean Logs**: Console shows clear, organized debug information
5. **No Errors**: No JavaScript errors in the console
6. **Consistent Behavior**: Same animation works every time

## 📈 Performance Metrics

The simple animation system should achieve:
- **60 FPS**: Smooth animations at 60 frames per second
- **< 16ms**: Each frame completes in under 16ms
- **GPU Usage**: Animations use GPU acceleration
- **Memory Efficient**: Minimal memory footprint
- **Reliable**: 100% success rate for animations

This testing approach allows you to validate that the simple animation system works correctly with real Figma exports and provides a solid foundation for replacing the complex official system.
