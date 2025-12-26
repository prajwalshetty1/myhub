// Script to remove authentication from all routes
const fs = require('fs');
const path = require('path');

const routeFiles = ['trading.js', 'hub.js', 'diet.js', 'phoenix.js'];
const routesDir = path.join(__dirname, 'routes');

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove authenticateToken imports
  content = content.replace(/const\s*{\s*authenticateToken\s*}\s*=\s*require\(['"]\.\.\/middleware\/auth['"]\);?\s*\n/g, '');
  
  // Remove authenticateToken from route definitions
  content = content.replace(/,\s*authenticateToken/g, '');
  content = content.replace(/authenticateToken,\s*/g, '');
  
  // Remove user_id from WHERE clauses
  content = content.replace(/\s+WHERE\s+user_id\s*=\s*\$?\d+/g, '');
  content = content.replace(/\s+AND\s+user_id\s*=\s*\$?\d+/g, '');
  
  // Fix parameter arrays - remove req.user.userId
  content = content.replace(/\[req\.user\.userId\]/g, '[]');
  content = content.replace(/\[req\.user\.userId,\s*/g, '[');
  content = content.replace(/,\s*req\.user\.userId\]/g, ']');
  content = content.replace(/,\s*req\.user\.userId,\s*/g, ', ');
  
  // Fix INSERT statements - remove user_id column
  content = content.replace(/INSERT INTO\s+(\w+)\s*\(user_id,\s*/g, 'INSERT INTO $1 (');
  content = content.replace(/INSERT INTO\s+(\w+)\s*\(user_id\)/g, 'INSERT INTO $1 (id)');
  
  // Fix VALUES - remove user_id parameter
  content = content.replace(/VALUES\s*\(\$1,\s*/g, 'VALUES (');
  content = content.replace(/VALUES\s*\(req\.user\.userId,\s*/g, 'VALUES (');
  content = content.replace(/VALUES\s*\(null,\s*/g, 'VALUES (');
  
  // Fix ON CONFLICT - change user_id to id or remove
  content = content.replace(/ON CONFLICT\s*\(user_id\)/g, 'ON CONFLICT (id)');
  content = content.replace(/ON CONFLICT\s*\(user_id,\s*/g, 'ON CONFLICT (');
  
  // Fix UPDATE statements - remove user_id checks
  content = content.replace(/WHERE\s+id\s*=\s*\$?\d+\s+AND\s+user_id\s*=\s*\$?\d+/g, (match) => {
    return match.replace(/\s+AND\s+user_id\s*=\s*\$?\d+/, '');
  });
  
  // Fix DELETE statements
  content = content.replace(/DELETE FROM\s+\w+\s+WHERE\s+id\s*=\s*\$1\s+AND\s+user_id\s*=\s*\$2/g, 'DELETE FROM $1 WHERE id = $1');
  
  // Renumber parameters after removing user_id
  // This is complex, so we'll handle common cases
  content = content.replace(/\$(\d+)/g, (match, num) => {
    const n = parseInt(num);
    if (n > 1) return `$${n - 1}`;
    return match;
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${file}`);
});

console.log('All routes updated!');

