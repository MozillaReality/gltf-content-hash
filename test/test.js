const path = require("path");
const fs = require("fs-extra");
const assert = require('assert');
const contentHashUrls = require("../src/index");
const { execFile } = require('child_process');

const gltfDir = path.join(__dirname, "assets");
const gltfPath = path.join(gltfDir, "Avocado.gltf");
const tmpDir = path.join(__dirname, "tmp");
const tempGltfPath = path.join(tmpDir, "Avocado.gltf");

describe('gltf-content-hash', () => {
  const binPath = path.join(__dirname, "..", "bin", "gltf-content-hash");
  let childProcess;

  function execAsync(command, args) {
    return new Promise((resolve, reject) => {
      childProcess = execFile(command, args, (err, stdout, stderr) => {
        if (err) {
          console.error("STDERR:", stderr);
          console.log("STDOUT:", stdout);
          reject(err);
        }
        childProcess = null;
        resolve(stdout);
      });
    });
  }

  async function findFile(path, regexp) {
    const dir = await fs.readdir(path);
    return dir.find((fileName) => regexp.test(fileName));
  }

  beforeEach(async () => {
    await fs.remove(tmpDir);
    await fs.copy(gltfDir, tmpDir);
  });

  it('should save to the same directory when the output dir is not specified', async () => {
    await execAsync(binPath, [tempGltfPath]);

    const outGltfFilename = await findFile(tmpDir, /Avocado-.*\.gltf$/);

    assert.ok(outGltfFilename);

    const gltf = await fs.readJson(path.join(tmpDir, outGltfFilename));
    assert.equal(gltf.images[0].uri, "Avocado_baseColor-4e5d4d4009.png");
  });

  it('should save to a new gltf file when the -o parameter is specified', async () => {
    const outputGltfPath = path.join(tmpDir, "out");
    await execAsync(binPath, [tempGltfPath, "-o", outputGltfPath]);
    
    const outGltfFilename = await findFile(outputGltfPath, /Avocado-.*\.gltf$/);

    assert.ok(outGltfFilename);

    const gltf = await fs.readJson(path.join(outputGltfPath, outGltfFilename));
    assert.equal(gltf.images[0].uri, "Avocado_baseColor-4e5d4d4009.png");
  });

  afterEach(async () => {
    await fs.remove(tmpDir);

    if (childProcess) {
      childProcess.kill();
    }
  });
});

describe('addComponentData', () => {

  beforeEach(async () => {
    await fs.remove(tmpDir);
    await fs.copy(gltfDir, tmpDir);
  });

  it('should add components to scenes and nodes', async () => {
    const inGltf = await fs.readJson(tempGltfPath);
    
    const { gltf, fileName } = await contentHashUrls(tempGltfPath, inGltf);

    assert.equal(gltf.images[0].uri, "Avocado_baseColor-4e5d4d4009.png");
  });

  afterEach(async () => {
    // TODO: Investigate fs.remove.
    console.warn("fs.remove is throwing exceptions. Please ignore.");
    await fs.remove(tmpDir);
  });
});


