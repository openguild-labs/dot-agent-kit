#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

console.log("Setting up chains");
interface Chain {
  id: string;
  name: string;
  description?: string;
}

/* Define common chains */
const COMMON_CHAINS: Chain[] = [
  { id: "west", name: "westend2", description: "Westend 2 Testnet" },
  { id: "west_asset_hub", name: "westend2_asset_hub", description: "Westend 2 Asset Hub" },
  { id: "polkadot", name: "polkadot", description: "Polkadot Relay Chain" },
  { id: "polkadot_asset_hub", name: "polkadot_asset_hub", description: "Polkadot Asset Hub" },
  { id: "ksmcc3", name: "ksmcc3", description: "Kusama Relay Chain" },
  { id: "ksmcc3_asset_hub", name: "ksmcc3_asset_hub", description: "Kusama Asset Hub" }
];

/* Create interactive command line interface */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/*
 * Ensure .papi/descriptors directory exists
 */
function setupPapiDirectory(): boolean {
  try {
    fs.mkdirSync(path.resolve(process.cwd(), './.papi/descriptors'), { recursive: true });
    
    return true;
  } catch (error) {
    console.error('❌ Error creating directory:', error);
    return false;
  }
}

/*
 * Save chain configuration
 */
function saveConfig(chains: Chain[], configPath: string): boolean {
  try {
    const config = { chains };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Error saving configuration:', error);
    return false;
  }
}

/*
 * Load chain configuration
 */
function loadConfig(configPath: string): Chain[] {
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

/*
 * Install a chain
 */
function installChain(chain: Chain): boolean {
  try {
    
    const command = `npx papi add ${chain.id} -n ${chain.name}`;
    
    execSync(command, { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error(`❌ Error installing chain ${chain.id}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

/*
 * Main function to set up chains
 */
async function setupChains(): Promise<void> {
  /* Check for command line arguments */
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
    
    COMMON_CHAINS.forEach((chain, index) => {
      
    });
    
    rl.close();
    return;
  }

  /* Ensure .papi/descriptors directory exists */
  if (!setupPapiDirectory()) {
    rl.close();
    return;
  }

  /* Handle direct installation from command line */
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
    
    /* Save installed configuration */
    saveConfig(chains, path.resolve(process.cwd(), './chains.config.json'));
    rl.close();
    return;
  }

  /* Handle installation from configuration file */
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

  /* Non-interactive mode */
  if (args.includes('--non-interactive')) {
    console.error('❌ Non-interactive mode requires --config or --install');
    rl.close();
    return;
  }

  /* Interactive mode */
  
  
  /* Show main menu */
  function showMainMenu(): void {
    
    
    
    
    
    
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
          
          rl.close();
          break;
        default:
          
          showMainMenu();
      }
    });
  }

  /* Show common chains menu */
  async function showCommonChainsMenu(): Promise<void> {
    
    COMMON_CHAINS.forEach((chain, index) => {
      
    });
    
    
    rl.question('\nEnter the numbers of the chains you want to install (comma-separated, or enter "all" to install all): ', async (input) => {
      if (input === '0') {
        showMainMenu();
        return;
      }
      
      let selectedChains: Chain[] = [];
      
      if (input.toLowerCase() === 'all') {
        selectedChains = [...COMMON_CHAINS];
      } else {
        const indexes = input.split(',').map(i => parseInt(i.trim()) - 1);
        selectedChains = indexes
          .filter(i => i >= 0 && i < COMMON_CHAINS.length)
          .map(i => COMMON_CHAINS[i]);
      }
      
      if (selectedChains.length === 0) {
        
        showCommonChainsMenu();
        return;
      }
      
      
      selectedChains.forEach(chain => {
        
      });
      
      rl.question('\nDo you want to proceed with the installation? (y/n): ', async (confirm) => {
        if (confirm.toLowerCase() === 'y') {
          for (const chain of selectedChains) {
            installChain(chain);
          }
          
          /* Save installed configuration */
          saveConfig(selectedChains, path.resolve(process.cwd(), './chains.config.json'));
          
          rl.question('\nDo you want to return to the main menu? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              showMainMenu();
            } else {
              
              rl.close();
            }
          });
        } else {
          showMainMenu();
        }
      });
    });
  }

  /* Add custom chain */
  async function addCustomChain(): Promise<void> {
    const customChains: Chain[] = [];
    
    function promptForChain(): void {
      rl.question('\nEnter chain ID (or press Enter to finish): ', (id) => {
        if (!id) {
          if (customChains.length === 0) {
            
            showMainMenu();
            return;
          }
          
          
          customChains.forEach(chain => {
            
          });
          
          rl.question('\nDo you want to proceed with the installation? (y/n): ', async (confirm) => {
            if (confirm.toLowerCase() === 'y') {
              for (const chain of customChains) {
                installChain(chain);
              }
              
              /* Save installed configuration */
              saveConfig(customChains, path.resolve(process.cwd(), './chains.config.json'));
              
              rl.question('\nDo you want to return to the main menu? (y/n): ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                  showMainMenu();
                } else {
                  
                  rl.close();
                }
              });
            } else {
              showMainMenu();
            }
          });
          return;
        }
        
        rl.question(`Enter name for chain ${id}: `, (name) => {
          if (!name) name = id;
          
          rl.question(`Enter description for chain ${id} (optional): `, (description) => {
            customChains.push({ id, name, description });
            
            promptForChain();
          });
        });
      });
    }
    
    promptForChain();
  }

  /* Install from configuration file */
  async function installFromConfig(): Promise<void> {
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
      
      
      chains.forEach(chain => {
        
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
              
              rl.close();
            }
          });
        } else {
          showMainMenu();
        }
      });
    });
  }

  /* Start with the main menu */
  showMainMenu();
}

setupChains();


