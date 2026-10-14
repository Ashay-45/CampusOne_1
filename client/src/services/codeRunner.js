// CampusOne Sandboxed Code Execution Engine
// Uses Web Workers with strict execution timeout (2000ms) to isolate user JavaScript,
// prevent browser UI freezing from infinite loops, and block DOM/cookie access.

const EXECUTION_TIMEOUT_MS = 2000;

export const executeInSandbox = (code, fnName, testCases) => {
  return new Promise((resolve, reject) => {
    // Worker script content
    const workerScript = `
      self.onmessage = function(e) {
        const { code, fnName, testCases } = e.data;
        const startTime = performance.now();

        try {
          // Block network access and external resource loading inside worker sandbox
          self.fetch = undefined;
          self.XMLHttpRequest = undefined;
          self.importScripts = undefined;
          self.WebSocket = undefined;

          // Compile user code in isolated worker context
          const compiled = new Function(code + '; return ' + fnName + ';')();
          if (typeof compiled !== 'function') {
            self.postMessage({ error: 'Function ' + fnName + ' was not defined in the code.' });
            return;
          }

          const results = [];
          for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            let actual;
            try {
              // Execute test case with arguments
              actual = compiled.apply(null, tc.args);
            } catch (err) {
              self.postMessage({ error: 'Runtime error in test case #' + (i + 1) + ': ' + err.message });
              return;
            }

            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(tc.expected);
            const passed = actualStr === expectedStr;

            results.push({
              input: tc.inputDisplay,
              expected: expectedStr,
              actual: actualStr,
              passed: passed
            });
          }

          const executionTime = (performance.now() - startTime).toFixed(1);
          self.postMessage({
            success: true,
            results: results,
            runtime: executionTime + ' ms'
          });
        } catch (err) {
          self.postMessage({ error: 'Compilation / Syntax error: ' + err.message });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    let worker;

    try {
      worker = new Worker(workerUrl);
    } catch (e) {
      URL.revokeObjectURL(workerUrl);
      reject(new Error('Web Worker creation failed: ' + e.message));
      return;
    }

    // Execution timeout guard (kills worker if execution exceeds timeout)
    const timeoutId = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        error: `Execution timed out (${EXECUTION_TIMEOUT_MS}ms limit). Possible infinite loop or excessive recursion detected.`,
        passed: false
      });
    }, EXECUTION_TIMEOUT_MS);

    worker.onmessage = (event) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);

      const data = event.data;
      if (data.error) {
        resolve({
          error: data.error,
          passed: false
        });
      } else {
        const allPassed = data.results.every(r => r.passed);
        resolve({
          passed: allPassed,
          cases: data.results,
          runtime: data.runtime,
          memory: (typeof performance !== 'undefined' && performance.memory?.usedJSHeapSize) 
            ? `${(performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)} MB` 
            : 'Isolated (Worker Sandbox)'
        });
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        error: 'Execution runtime exception: ' + (err.message || 'Unknown worker error'),
        passed: false
      });
    };

    worker.postMessage({ code, fnName, testCases });
  });
};
