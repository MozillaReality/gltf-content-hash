const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");

async function contentHashUrls(gltfPath, gltf, options) {
  const gltfDir = path.dirname(gltfPath);

  const opts = Object.assign({
    rename: false,
    out: gltfDir
  }, options);

  const outputPath = opts.out;

  if (gltf.images) {
    for (const image  of gltf.images) {
      if (image.uri) {
        const imagePath = path.join(gltfDir, image.uri);
        image.uri = await contentHashAndCopy(imagePath, outputPath, opts.rename);
      }
    }
  }

  if (gltf.buffers) {
    for (const buffer  of gltf.buffers) {
      if (buffer.uri) {
        const bufferPath = path.join(gltfDir, buffer.uri);
        buffer.uri = await contentHashAndCopy(bufferPath, outputPath, opts.rename);
      }
    }
  }

  const content = JSON.stringify(gltf);
  const fileName = makeFileName(gltfPath, content);

  return {
    gltf,
    fileName
  };
}

async function contentHashAndCopy(resourcePath, outputPath, move) {
  const content = await fs.readFile(resourcePath);
  const fileName = makeFileName(resourcePath, content);

  if (move) {
    await fs.move(resourcePath, path.join(outputPath, fileName));
  } else {
    await fs.copy(resourcePath, path.join(outputPath, fileName));
  }

  return fileName;
}

function makeFileName(resourcePath, content) {
  const { name, ext } = path.parse(resourcePath);
  const hash = crypto.createHash("md5");
  const digest = hash.update(content).digest('hex').substr(0, 10);
  return name + "-" + digest + ext;
}

module.exports = contentHashUrls;
