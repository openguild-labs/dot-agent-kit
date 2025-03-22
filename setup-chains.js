const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Ensure the .papi/descriptors directory exists
 */
try {
  fs.mkdirSync(path.resolve(__dirname, './.papi/descriptors'), { recursive: true });
  console.log('The .papi/descriptors directory has been created or already exists');
} catch (error) {
  console.error('Error creating directory:', error);
  process.exit(1);
}

/**
 * Read the configuration file
 */
try {
  const configPath = path.resolve(__dirname, './test/config-tests/chains.config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log('Configuration loaded:', config);
  
  if (!config.chains || !Array.isArray(config.chains) || config.chains.length === 0) {
    console.error('No valid chain configuration found!');
    process.exit(1);
  }
  
  /**
   * Install each chain
   */
  config.chains.forEach(chain => {
    if (!chain.id || !chain.name) {
      console.warn('Skipping invalid chain:', chain);
      return;
    }
    
    console.log(`Installing chain ${chain.id} with name ${chain.name}...`);
    
    try {
      const command = `npx papi add ${chain.id} -n ${chain.name}`;
      console.log(`Executing: ${command}`);
      
      execSync(command, { stdio: 'inherit' });
      
      console.log(`Successfully installed chain ${chain.id}`);
    } catch (error) {
      console.error(`Error installing chain ${chain.id}:`, error.message);
    }
  });
  
  console.log('Completed installing all chains!');
} catch (error) {
  console.error('Error reading or processing configuration file:', error);
  process.exit(1);
} 