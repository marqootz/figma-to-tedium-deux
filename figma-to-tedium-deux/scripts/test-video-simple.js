// Simple test for video functionality
// This tests the core logic without requiring the Figma plugin environment

// Mock the video detection functions based on the implementation
function isVideoFrame(node) {
  return typeof node.name === 'string' && node.name.startsWith('[VIDEO]');
}

function extractVideoFilename(node) {
  if (!isVideoFrame(node)) return null;
  
  // Extract the filename after [VIDEO] prefix
  const match = node.name.match(/^\[VIDEO\]\s*(.+)$/);
  const extracted = match && match[1] ? match[1].trim() : null;
  // Return null if the extracted string is empty
  return extracted && extracted.length > 0 ? extracted : null;
}

// Test cases
const testCases = [
  {
    name: '[VIDEO] myvideo.mp4',
    expected: {
      isVideo: true,
      filename: 'myvideo.mp4'
    }
  },
  {
    name: '[VIDEO] demo-video.mp4',
    expected: {
      isVideo: true,
      filename: 'demo-video.mp4'
    }
  },
  {
    name: '[VIDEO]  test-video.mp4  ',
    expected: {
      isVideo: true,
      filename: 'test-video.mp4'
    }
  },
  {
    name: 'Regular Frame',
    expected: {
      isVideo: false,
      filename: null
    }
  },
  {
    name: '[VIDEO]',
    expected: {
      isVideo: true,
      filename: null
    }
  },
  {
    name: '[VIDEO] ',
    expected: {
      isVideo: true,
      filename: null
    }
  }
];

console.log('Testing Video Frame Detection...\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const mockNode = { name: testCase.name };
  
  const isVideo = isVideoFrame(mockNode);
  const filename = extractVideoFilename(mockNode);
  
  const passed = isVideo === testCase.expected.isVideo && 
                 filename === testCase.expected.filename;
  
  if (passed) passedTests++;
  
  console.log(`Test ${index + 1}: "${testCase.name}"`);
  console.log(`  Expected: isVideo=${testCase.expected.isVideo}, filename="${testCase.expected.filename}"`);
  console.log(`  Got:      isVideo=${isVideo}, filename="${filename}"`);
  console.log(`  Result:   ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log(`\nTest Summary: ${passedTests}/${totalTests} tests passed`);
console.log('Video functionality test completed!');
