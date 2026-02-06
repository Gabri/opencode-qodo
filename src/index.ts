import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, appendFileSync } from 'fs';
import { QodoPlugin } from './plugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEBUG_FILE = '/tmp/qodo-plugin-debug.log';

function debugLog(message: string, data: Record<string, unknown> = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message} ${JSON.stringify(data)}\n`;
  try {
    appendFileSync(DEBUG_FILE, logEntry);
  } catch (e) {
    console.error("Failed to write to debug log", e);
  }
}

debugLog("=== PLUGIN LOADING ===", { 
  filename: __filename, 
  dirname: __dirname, 
  cwd: process.cwd(), 
  nodePath: process.env.NODE_PATH || "not set" 
});

export { QodoPlugin };

const wrappedPlugin = async (context: Record<string, unknown>) => {
  debugLog("Plugin function called", { 
    cwd: process.cwd(),
    contextKeys: Object.keys(context)
  });
  
  try {
    const result = await QodoPlugin(context as any);
    debugLog("Plugin initialized successfully", { 
      hooks: Object.keys(result) 
    });
    return result;
  } catch (error: any) {
    debugLog("Plugin initialization FAILED", { 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
};

export default wrappedPlugin;
