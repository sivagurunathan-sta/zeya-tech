const fs = require('fs');
const path = require('path');

// Function to remove git merge conflict markers
function cleanMergeConflicts(content) {
  // Remove lines with conflict markers and everything between them
  const lines = content.split('\n');
  const cleanLines = [];
  let skipMode = false;
  let keepCurrentSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for conflict start marker
    if (line.startsWith('<<<<<<< HEAD')) {
      skipMode = true;
      keepCurrentSection = true;
      continue;
    }
    
    // Check for conflict middle marker
    if (line.startsWith('=======')) {
      keepCurrentSection = false;
      continue;
    }
    
    // Check for conflict end marker
    if (line.startsWith('>>>>>>> ')) {
      skipMode = false;
      continue;
    }
    
    // If we're in skip mode, only add lines if we're keeping this section
    if (skipMode) {
      if (keepCurrentSection) {
        cleanLines.push(line);
      }
    } else {
      cleanLines.push(line);
    }
  }
  
  return cleanLines.join('\n');
}

// Function to recursively find and clean files
function cleanFilesInDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git') {
        cleanFilesInDirectory(filePath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file has merge conflicts
        if (content.includes('<<<<<<< HEAD') || content.includes('=======') || content.includes('>>>>>>> ')) {
          console.log(`🔧 Cleaning merge conflicts in: ${filePath}`);
          const cleanContent = cleanMergeConflicts(content);
          fs.writeFileSync(filePath, cleanContent, 'utf8');
          console.log(`✅ Cleaned: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  });
}

// Main execution
console.log('🚀 Starting merge conflict cleanup...\n');

try {
  // Clean the current directory (backend)
  cleanFilesInDirectory('.');
  
  console.log('\n🎉 Merge conflict cleanup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: node scripts/fullSetup.js');
  console.log('3. Run: npm start');
  
} catch (error) {
  console.error('❌ Cleanup failed:', error);
}