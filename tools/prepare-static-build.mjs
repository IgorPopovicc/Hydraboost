import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const source = resolve(projectRoot, 'hosting/dreamweb/.htaccess');
const browserOutput = resolve(projectRoot, 'dist/Hydraboost-static/browser');
const destination = resolve(browserOutput, '.htaccess');
const deploymentOutput = resolve(projectRoot, 'deploy/public_html');

const pruneArtifacts = async (directory, removeCsrShell = false) => {
  let removed = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);
    const isConflictCopy = / \d+(?=\.|$)/.test(entry.name);
    const isUnusedCsrShell = removeCsrShell && entry.name === 'index.csr.html';

    if (isConflictCopy || isUnusedCsrShell) {
      await rm(entryPath, { recursive: entry.isDirectory(), force: true });
      removed += 1;
    } else if (entry.isDirectory()) {
      removed += await pruneArtifacts(entryPath, removeCsrShell);
    }
  }
  return removed;
};

const syncDirectory = async (sourceDirectory, targetDirectory) => {
  await mkdir(targetDirectory, { recursive: true });
  const sourceEntries = (await readdir(sourceDirectory, { withFileTypes: true }))
    .filter((entry) => !/ \d+(?=\.|$)/.test(entry.name) && entry.name !== 'index.csr.html');
  const expectedNames = new Set(sourceEntries.map((entry) => entry.name));

  for (const targetEntry of await readdir(targetDirectory, { withFileTypes: true })) {
    if (!expectedNames.has(targetEntry.name)) {
      await rm(resolve(targetDirectory, targetEntry.name), { recursive: targetEntry.isDirectory(), force: true });
    }
  }

  for (const sourceEntry of sourceEntries) {
    const sourcePath = resolve(sourceDirectory, sourceEntry.name);
    const targetPath = resolve(targetDirectory, sourceEntry.name);
    if (sourceEntry.isDirectory()) await syncDirectory(sourcePath, targetPath);
    else await copyFile(sourcePath, targetPath);
  }
};

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
const removedBuildConflicts = await pruneArtifacts(browserOutput);
await syncDirectory(browserOutput, deploymentOutput);
const removedDeploymentArtifacts = await pruneArtifacts(deploymentOutput, true);
const removedArtifacts = removedBuildConflicts + removedDeploymentArtifacts;

console.log(`DreamWeb configuration copied to ${destination}`);
console.log(`Upload-ready public_html created at ${deploymentOutput}`);
if (removedArtifacts) console.log(`Removed ${removedArtifacts} non-deployable duplicate/CSR artifacts`);
