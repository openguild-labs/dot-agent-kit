#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

/** Define common chains */
const COMMON_CHAINS = [
  { id: "west", name: "westend2", description: "Westend 2 Testnet" },
  { id: "west_asset_hub", name: "westend2_asset_hub", description: "Westend 2 Asset Hub" },
  { id: "polkadot", name: "polkadot", description: "Polkadot Relay Chain" },
  { id: "polkadot_asset_hub", name: "polkadot_asset_hub", description: "Polkadot Asset Hub" },
  { id: "ksmcc3", name: "ksmcc3", description: "Kusama Relay Chain" },
  { id: "ksmcc3_asset_hub", name: "ksmcc3_asset_hub", description: "Kusama Asset Hub" }
];

/** Create interactive command line interface */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ensure .papi/descriptors directory exists
 */
function setupPapiDirectory() {
  try {
    fs.mkdirSync(path.resolve(process.cwd(), './.papi/descriptors'), { recursive: true });
    console.log('✅ The .papi/descriptors directory has been created or already exists');
    return true;
  } catch (error) {
    console.error('❌ Error creating directory:', error);
    return false;
  }
}

/**
 * Save chain configuration
 */
function saveConfig(chains, configPath) {
  try {
    const config = { chains };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved to ${configPath}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving configuration:', error);
    return false;
  }
}

/**
 * Load chain configuration
 */
function loadConfig(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.chains || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Error reading configuration:', error);
    return [];
  }
}

/**
 * Install a chain
 */
function installChain(chain) {
  try {
    console.log(`🔄 Installing chain ${chain.id} with name ${chain.name}...`);
    const command = `npx papi add ${chain.id} -n ${chain.name}`;
    console.log(`$ ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Successfully installed chain ${chain.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Error installing chain ${chain.id}:`, error.message);
    return false;
  }
}

/**
 * Main function to set up chains
 */
async function setupChains() {
  /** Check for command line arguments */
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node setup-chains.js [options]

Options:
  --help, -h               Show help
  --config <path>          Path to configuration file
  --list                   List common chains
  --install <chain-ids>    Install specified chains (comma-separated)
  --non-interactive        Run in non-interactive mode (requires --config or --install)

Examples:
  node setup-chains.js --list
  node setup-chains.js --install west,west_asset_hub
  node setup-chains.js --config ./my-chains.json
    `);
    rl.close();
    return;
  }

  if (args.includes('--list')) {
    console.log('\nList of common chains:');
    COMMON_CHAINS.forEach((chain, index) => {
      console.log(`  ${index + 1}. ${chain.id} (${chain.name}): ${chain.description}`);
    });
    console.log('');
    rl.close();
    return;
  }

  /** Ensure .papi/descriptors directory exists */
  if (!setupPapiDirectory()) {
    rl.close();
    return;
  }

  /** Handle direct installation from command line */
  const installIndex = args.indexOf('--install');
  if (installIndex !== -1 && args.length > installIndex + 1) {
    const chainIds = args[installIndex + 1].split(',');
    const chains = chainIds.map(id => {
      const chain = COMMON_CHAINS.find(c => c.id === id);
      return chain || { id, name: id };
    });
    
    for (const chain of chains) {
      installChain(chain);
    }
    
    /** Save installed configuration */
    saveConfig(chains, path.resolve(process.cwd(), './chains.config.json'));
    rl.close();
    return;
  }

  /** Handle installation from configuration file */
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args.length > configIndex + 1) {
    const configPath = args[configIndex + 1];
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Configuration file ${configPath} does not exist`);
      rl.close();
      return;
    }
    
    const chains = loadConfig(configPath);
    if (chains.length === 0) {
      console.error('❌ No valid chain configuration found!');
      rl.close();
      return;
    }
    
    for (const chain of chains) {
      installChain(chain);
    }
    
    rl.close();
    return;
  }

  /** Non-interactive mode */
  if (args.includes('--non-interactive')) {
    console.error('❌ Non-interactive mode requires --config or --install');
    rl.close();
    return;
  }

  /** Interactive mode */
  console.log('\n🔧 Welcome to the Polkadot chain setup tool!\n');
  
  /** Show main menu */
  function showMainMenu() {
    console.log('\nChoose an option:');
    console.log('1. Install common chains');
    console.log('2. Add custom chain');
    console.log('3. Install from configuration file');
    console.log('4. Exit');
    
    rl.question('\nEnter your choice (1-4): ', async (choice) => {
      switch (choice) {
        case '1':
          await showCommonChainsMenu();
          break;
        case '2':
          await addCustomChain();
          break;
        case '3':
          await installFromConfig();
          break;
        case '4':
          console.log('\n👋 Thank you for using the Polkadot chain setup tool!');
          rl.close();
          break;
        default:
          console.log('❌ Invalid choice, please try again.');
          showMainMenu();
      }
    });
  }

  /** Show common chains menu */
  async function showCommonChainsMenu() {
    console.log('\nList of common chains:');
    COMMON_CHAINS.forEach((chain, index) => {
      console.log(`${index + 1}. ${chain.id} (${chain.name}): ${chain.description}`);
    });
    console.log('0. Go back');
    
    rl.question('\nEnter the numbers of the chains you want to install (comma-separated, or enter "all" to install all): ', async (input) => {
      if (input === '0') {
        showMainMenu();
        return;
      }
      
      let selectedChains = [];
      
      if (input.toLowerCase() === 'all') {
        selectedChains = [...COMMON_CHAINS];
      } else {
        const indexes = input.split(',').map(i => parseInt(i.trim()) - 1);
        selectedChains = indexes
          .filter(i => i >= 0 && i < COMMON_CHAINS.length)
          .map(i => COMMON_CHAINS[i]);
      }
      
      if (selectedChains.length === 0) {
        console.log('❌ No chains selected.');
        showCommonChainsMenu();
        return;
      }
      
      console.log('\nYou have selected the following chains:');
      selectedChains.forEach(chain => {
        console.log(`- ${chain.id} (${chain.name}): ${chain.description}`);
      });
      
      rl.question('\nDo you want to proceed with the installation? (y/n): ', async (confirm) => {
        if (confirm.toLowerCase() === 'y') {
          for (const chain of selectedChains) {
            installChain(chain);
          }
          
          /** Save installed configuration */
          saveConfig(selectedChains, path.resolve(process.cwd(), './chains.config.json'));
          
          rl.question('\nDo you want to return to the main menu? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              showMainMenu();
            } else {
              console.log('\n👋 Thank you for using the Polkadot chain setup tool!');
              rl.close();
            }
          });
        } else {
          showMainMenu();
        }
      });
    });
  }

  /** Add custom chain */
  async function addCustomChain() {
    const customChains = [];
    
    function promptForChain() {
      rl.question('\nEnter the chain ID (or press Enter to finish): ', (id) => {
        if (!id) {
          if (customChains.length === 0) {
            console.log('❌ No chains added.');
            showMainMenu();
            return;
          }
          
          console.log('\nYour custom chain list:');
          customChains.forEach(chain => {
            console.log(`- ${chain.id} (${chain.name})${chain.description ? ': ' + chain.description : ''}`);
          });
          
          rl.question('\nDo you want to proceed with the installation? (y/n): ', async (confirm) => {
            if (confirm.toLowerCase() === 'y') {
              for (const chain of customChains) {
                installChain(chain);
              }
              
              /** Save installed configuration */
              saveConfig(customChains, path.resolve(process.cwd(), './chains.config.json'));
              
              rl.question('\nDo you want to return to the main menu? (y/n): ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                  showMainMenu();
                } else {
                  console.log('\n👋 Thank you for using the Polkadot chain setup tool!');
                  rl.close();
                }
              });
            } else {
              showMainMenu();
            }
          });
          return;
        }
        
        rl.question(`Enter the name for chain ${id}: `, (name) => {
          if (!name) name = id;
          
          rl.question(`Enter a description for chain ${id} (optional): `, (description) => {
            customChains.push({ id, name, description });
            console.log(`✅ Added chain ${id} (${name})`);
            promptForChain();
          });
        });
      });
    }
    
    promptForChain();
  }

  /** Install from configuration file */
  async function installFromConfig() {
    rl.question('Enter the path to the configuration file: ', (configPath) => {
      if (!fs.existsSync(configPath)) {
        console.error(`❌ Configuration file ${configPath} does not exist`);
        showMainMenu();
        return;
      }
      
      const chains = loadConfig(configPath);
      if (chains.length === 0) {
        console.error('❌ No valid chain configuration found!');
        showMainMenu();
        return;
      }
      
      console.log('\nList of chains from configuration file:');
      chains.forEach(chain => {
        console.log(`- ${chain.id} (${chain.name})${chain.description ? ': ' + chain.description : ''}`);
      });
      
      rl.question('\nDo you want to proceed with the installation? (y/n): ', async (confirm) => {
        if (confirm.toLowerCase() === 'y') {
          for (const chain of chains) {
            installChain(chain);
          }
          
          rl.question('\nDo you want to return to the main menu? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              showMainMenu();
            } else {
              console.log('\n👋 Thank you for using the Polkadot chain setup tool!');
              rl.close();
            }
          });
        } else {
          showMainMenu();
        }
      });
    });
  }

  /** Start with the main menu */
  showMainMenu();
}

/** Check if the script is executed directly */
if (require.main === module) {
  setupChains().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
} 