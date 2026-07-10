const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\jair9\\.gemini\\antigravity-ide\\brain\\175e8c78-7225-4ffc-9aa1-a999782b2d57\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath, 'utf8');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const data = JSON.parse(line);
    if (data.tool_calls) {
      for (const call of data.tool_calls) {
        if (call.name === 'run_command' || call.function?.name === 'run_command' || JSON.stringify(call).includes('run_command')) {
          console.log(`[Step ${data.step_index}] Cwd: ${call.arguments?.Cwd || call.function?.arguments?.Cwd || ''}`);
          console.log(`  Cmd: ${call.arguments?.CommandLine || call.function?.arguments?.CommandLine || JSON.stringify(call)}`);
        }
      }
    }
  }
}

run().catch(console.error);
