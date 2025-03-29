/* Start of Selection */
import fs from 'fs';
import path from 'path';

/* Path to the .papi directory */
const papiDir = path.resolve(process.cwd(), '.papi');
/* Path to the package.json file */
const packageJsonPath = path.resolve(process.cwd(), 'package.json');

/* Check if the .papi directory exists */
if (!fs.existsSync(papiDir)) {
  console.log('❌ The .papi directory does not exist. Removing @polkadot-api/descriptors dependency from package.json...');
  
  try {
    /* Read the contents of the package.json file */
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    /* Remove the @polkadot-api/descriptors dependency if it exists */
    if (packageJson.dependencies && packageJson.dependencies['@polkadot-api/descriptors']) {
      delete packageJson.dependencies['@polkadot-api/descriptors'];
      
      /* Write back to the package.json file */
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Successfully removed the @polkadot-api/descriptors dependency!');
    } else {
      console.log('ℹ️ The @polkadot-api/descriptors dependency was not found in package.json.');
    }
  } catch (error) {
    console.error('❌ Error processing the package.json file:', error);
    process.exit(1);
  }
} else {
  console.log('✅ The .papi directory exists, keeping the current configuration.');
}

/* Continue with the installation process */
console.log('ℹ️ Continuing with the installation process...'); 
/* End of Selection */