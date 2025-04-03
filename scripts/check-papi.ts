import fs from 'fs';
import path from 'path';

/* Path to the .papi directory */
const papiDir: string = path.resolve(process.cwd(), '.papi');
/* Path to the package.json file */
const packageJsonPath: string = path.resolve(process.cwd(), 'package.json');

interface PackageJson {
  dependencies?: Record<string, string>;
  [key: string]: any;
}

/* Check if the .papi directory exists */
if (!fs.existsSync(papiDir)) {
  console.log('❌ The .papi directory does not exist. Removing dependency @polkadot-api/descriptors from package.json...');
  
  try {
    /* Read the contents of the package.json file */
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    /* Remove the dependency @polkadot-api/descriptors if it exists */
    if (packageJson.dependencies && packageJson.dependencies['@polkadot-api/descriptors']) {
      delete packageJson.dependencies['@polkadot-api/descriptors'];
      
      /* Write back to the package.json file */
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Successfully removed dependency @polkadot-api/descriptors!');
    } else {
      console.log('ℹ️ Dependency @polkadot-api/descriptors not found in package.json.');
    }
  } catch (error) {
    console.error('❌ Error processing package.json file:', error);
    process.exit(1);
  }
} else {
  console.log('✅ The .papi directory exists, keeping the current configuration.');
}

/* Continue the installation process */
console.log('ℹ️ Continuing the installation process...'); 