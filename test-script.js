#!/usr/bin/env node

const helper = require('./helper.js');

console.log("=== PROCESS STARTED ===");
console.log("Time:", new Date().toISOString());
console.log("Helper says:", helper.getMessage());
console.log("Process ID:", process.pid);

// Keep the process running longer to test restarts
let counter = 0;
const interval = setInterval(() => {
  counter++;
  console.log(`Running... ${counter} (PID: ${process.pid})`);
  
  if (counter >= 20) {
    console.log("=== PROCESS FINISHED ===");
    clearInterval(interval);
    process.exit(0);
  }
}, 1000);