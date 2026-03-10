const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('npx prisma validate');
  fs.writeFileSync('error.txt', 'SUCCESS:\n' + result.toString());
} catch (e) {
  fs.writeFileSync('error.txt', 'STDOUT:\n' + e.stdout.toString('utf8') + '\nSTDERR:\n' + e.stderr.toString('utf8'));
}
