import fs from 'node:fs';
import path from 'node:path';
import { swaggerSpec } from '../src/config/swagger';

const outputPath = path.join(__dirname, '..', 'swagger.json');

try {
  // Convert the spec to JSON string with proper formatting
  const swaggerJson = JSON.stringify(swaggerSpec, null, 2);

  // Write to file
  fs.writeFileSync(outputPath, swaggerJson);

  console.log('✅ Swagger documentation generated successfully!');
  console.log(`📄 Output file: ${outputPath}`);
  console.log('🔍 You can now view the documentation at: http://localhost:3000/swagger');
} catch (error) {
  console.error('❌ Error generating Swagger documentation:', error);
  process.exit(1);
} 