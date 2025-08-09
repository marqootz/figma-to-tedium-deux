// Test script for video functionality
const { isVideoFrame, extractVideoFilename } = require('../dist-refactored/refactored-system.js');

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

testCases.forEach((testCase, index) => {
  const mockNode = { name: testCase.name };
  
  const isVideo = isVideoFrame(mockNode);
  const filename = extractVideoFilename(mockNode);
  
  const passed = isVideo === testCase.expected.isVideo && 
                 filename === testCase.expected.filename;
  
  console.log(`Test ${index + 1}: "${testCase.name}"`);
  console.log(`  Expected: isVideo=${testCase.expected.isVideo}, filename="${testCase.expected.filename}"`);
  console.log(`  Got:      isVideo=${isVideo}, filename="${filename}"`);
  console.log(`  Result:   ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('Video functionality test completed!');
