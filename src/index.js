const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");

async function contentHashUrls(gltfPath, gltf, imagesOutputPath) {
  const gltfDir = path.dirname(gltfPath);
  let outputPath = imagesOutputPath || gltfDir;

  if (gltf.images) {
    for (const image  of gltf.images) {
      if (image.uri) {
        const imagePath = path.join(gltfDir, image.uri);
        image.uri = await contentHashAndCopy(imagePath, outputPath);
      }
    }
  }

  if (gltf.buffers) {
    for (const buffer  of gltf.buffers) {
      if (buffer.uri) {
        const bufferPath = path.join(gltfDir, buffer.uri);
        buffer.uri = await contentHashAndCopy(bufferPath, outputPath);
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

async function contentHashAndCopy(resourcePath, outputPath) {
  const content = await fs.readFile(resourcePath);
  const fileName = makeFileName(resourcePath, content);
  fs.copy(resourcePath, path.join(outputPath, fileName));
  return fileName;
}

function makeFileName(resourcePath, content) {
  const { name, ext } = path.parse(resourcePath);
  const hash = crypto.createHash("md5");
  const digest = hash.update(content).digest('hex').substr(0, 10);
  return name + "-" + digest + ext;
}

module.exports = contentHashUrls;
