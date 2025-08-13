# Figma Node Export Guide

This guide shows you how to export specific nodes (like `glydcar/info-bar/counter-sm`) from Figma to HTML using your plugin's export logic.

## 🎯 Exporting `glydcar/info-bar/counter-sm`

### Method 1: Using Your Plugin (Recommended)

#### Step 1: Get Node Data from Figma
1. **Open your Figma file** containing the `glydcar/info-bar/counter-sm` node
2. **Navigate to the node** in the layers panel
3. **Select the node** by clicking on it
4. **Run your plugin** in Figma
5. **Click "Export JSON"** to get the node data
6. **Save the JSON** to a file (e.g., `glydcar-info-bar-counter.json`)

#### Step 2: Generate HTML with CLI
```bash
npm run dev:cli test-file glydcar-info-bar-counter.json
```

### Method 2: Using Figma API (Direct Export)

#### Step 1: Get Required Information

**File Key:**
- Open your Figma file in browser
- URL format: `https://www.figma.com/file/FILE_KEY/...`
- Copy the FILE_KEY part

**Node ID:**
- Right-click on the `glydcar/info-bar/counter-sm` node
- Select "Copy/Paste as" → "Copy link"
- The URL will contain `node-id=NODE_ID`
- Copy the NODE_ID part

**Access Token:**
- Go to Figma.com → Settings → Account
- Scroll down to "Personal access tokens"
- Click "Generate new token"
- Copy the token

#### Step 2: Export Using CLI
```bash
npm run export-node <file-key> <node-id> <access-token> [output-path]
```

**Example:**
```bash
npm run export-node abc123def 1:2 your-figma-token glydcar-export.html
```

## 🔍 Finding Your Node Information

### Finding the File Key
1. Open your Figma file in the browser
2. Look at the URL: `https://www.figma.com/file/abc123def/Project-Name`
3. The file key is `abc123def`

### Finding the Node ID
1. Right-click on the `glydcar/info-bar/counter-sm` node
2. Select "Copy/Paste as" → "Copy link"
3. The URL will look like: `https://www.figma.com/file/abc123def/Project-Name?node-id=1%3A2`
4. The node ID is `1:2` (after decoding the URL encoding)

### Getting Access Token
1. Go to [Figma.com](https://www.figma.com)
2. Click your profile → Settings
3. Go to Account tab
4. Scroll to "Personal access tokens"
5. Click "Generate new token"
6. Give it a name (e.g., "HTML Export")
7. Copy the token (you won't see it again!)

## 📋 Step-by-Step Example

Let's say you want to export the `glydcar/info-bar/counter-sm` node:

### Option A: Plugin Method
```bash
# 1. Export JSON from plugin and save as glydcar-node.json
# 2. Generate HTML
npm run dev:cli test-file glydcar-node.json
```

### Option B: API Method
```bash
# 1. Get your file key from URL: https://www.figma.com/file/abc123def/Glydcar-Project
# 2. Get node ID from right-click → Copy link
# 3. Get access token from Figma settings
# 4. Export
npm run export-node abc123def 1:2 your-token-here glydcar-counter.html
```

## 📁 Output Files

Both methods will create:
- **HTML file**: Complete HTML document with your exported node
- **JSON file**: Raw node data for future use

## 🎨 What You'll Get

The exported HTML will include:
- ✅ Complete styling and layout
- ✅ Font loading and embedding
- ✅ Interactive elements (if any)
- ✅ Responsive design
- ✅ All Figma properties preserved

## 🔧 Troubleshooting

### "Node not found" Error
- Double-check the node ID
- Make sure the file is public or you have access
- Verify your access token is correct

### "File not found" Error
- Check the file key in the URL
- Ensure the file exists and you have access

### "Access denied" Error
- Verify your access token is valid
- Check if the file is private (needs to be public or shared with you)

### Plugin Export Issues
- Make sure the node is selected in Figma
- Try selecting a parent frame if the node is nested
- Check the plugin console for errors

## 🚀 Advanced Usage

### Batch Export Multiple Nodes
```bash
# Export multiple nodes by creating a script
for node in "1:2" "1:3" "1:4"; do
  npm run export-node abc123def $node your-token "export-$node.html"
done
```

### Custom Output Directory
```bash
npm run export-node abc123def 1:2 your-token exports/glydcar-counter.html
```

### Using with Version Control
```bash
# Export and commit to git
npm run export-node abc123def 1:2 your-token src/components/glydcar-counter.html
git add src/components/glydcar-counter.html
git commit -m "Export glydcar/info-bar/counter-sm from Figma"
```

## 📝 Notes

- **File Access**: The file must be public or you must have edit/view access
- **Rate Limits**: Figma API has rate limits, so don't export too frequently
- **Token Security**: Keep your access token secure and don't commit it to version control
- **Node Hierarchy**: For nested nodes, you might need to export the parent frame

## 🎉 Success!

Once exported, you'll have a complete HTML file that you can:
- Open in any browser
- Embed in your web application
- Use as a reference for development
- Share with your team
