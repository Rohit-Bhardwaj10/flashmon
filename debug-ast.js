const { parse } = require('@swc/core');
const fs = require('fs');

async function testAST() {
  const code = `
const fs = require('fs');
const path = require('path');
console.log('test');
`;

  try {
    const ast = await parse(code, {
      syntax: 'ecmascript',
      jsx: false,
    });
    
    console.log('AST body:');
    console.log(JSON.stringify(ast.body, null, 2));
  } catch (error) {
    console.error('Parse error:', error);
  }
}

testAST();