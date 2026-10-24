import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeRoots = [path.join(projectRoot, 'App.tsx'), path.join(projectRoot, 'src')];
const bannedDependency = /(?:analytics|telemetry|sentry|firebase|amplitude|mixpanel|posthog|segment|bugsnag|datadog|axios|node-fetch|superagent|graphql-request|^got$)/i;
const bannedTransports = new Set(['fetch', 'sendBeacon', 'XMLHttpRequest', 'WebSocket', 'EventSource']);
const runtimeFiles = [];

function collectFiles(target) {
  const stats = fs.statSync(target);
  if (stats.isFile()) {
    if (/\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(target)) runtimeFiles.push(target);
    return;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes:true })) {
    if (entry.isDirectory()) collectFiles(path.join(target, entry.name));
    else if (entry.isFile() && /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) runtimeFiles.push(path.join(target, entry.name));
  }
}

for (const root of runtimeRoots) collectFiles(root);
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const appDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
const suspiciousPackages = Object.keys(appDependencies).filter((name) => bannedDependency.test(name));
assert.deepEqual(suspiciousPackages, [], `Remove or explicitly review analytics/telemetry dependencies: ${suspiciousPackages.join(', ')}`);

const findings = [];
for (const file of runtimeFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const relPath = path.relative(projectRoot, file);
  const report = (node, reason) => findings.push(`${relPath}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: ${reason}`);

  function visit(node) {
    if (ts.isIdentifier(node) && bannedTransports.has(node.text)) {
      report(node, `references network transport "${node.text}"`);
    }
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && bannedDependency.test(node.moduleSpecifier.text)) {
      report(node, `imports telemetry/network SDK "${node.moduleSpecifier.text}"`);
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const name = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : '';
      if (bannedTransports.has(name)) report(node, `uses network transport "${name}"`);
      if (name === 'require' && node.arguments[0] && ts.isStringLiteral(node.arguments[0]) && bannedDependency.test(node.arguments[0].text)) {
        report(node, `requires telemetry/network SDK "${node.arguments[0].text}"`);
      }
      if (callee.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0]) && bannedDependency.test(node.arguments[0].text)) {
        report(node, `dynamically imports telemetry/network SDK "${node.arguments[0].text}"`);
      }
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && bannedTransports.has(node.expression.text)) {
      report(node, `constructs network transport "${node.expression.text}"`);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
}

assert.deepEqual(findings, [], findings.join('\n'));
console.log(`Client privacy source check passed: scanned ${runtimeFiles.length} app-owned TypeScript/JavaScript files; no direct network transports or telemetry SDK imports found.`);
