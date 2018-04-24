const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");

async function contentHashUrls(gltfPath, gltf, options) {
  const gltfDir = path.dirname(gltfPath);

  const opts = Object.assign(
    {
      rename: false,
      out: gltfDir
    },
    options
  );

  const outputPath = opts.out;

  if (gltf.images) {
    const uniqueImageUris = new Set();
    const contentHashedUriMap = {};

    for (const image of gltf.images) {
      if (image.uri) {
        uniqueImageUris.add(image.uri);
      }
    }

    for (const uniqueUri of uniqueImageUris) {
      const imagePath = path.join(gltfDir, uniqueUri);
      contentHashedUriMap[uniqueUri] = await contentHashAndCopy(
        imagePath,
        outputPath,
        opts.rename
      );
    }

    for (const image of gltf.images) {
      if (image.uri) {
        image.uri = contentHashedUriMap[image.uri];
      }
    }
  }

  if (gltf.buffers) {
    for (const buffer of gltf.buffers) {
      if (buffer.uri) {
        const bufferPath = path.join(gltfDir, buffer.uri);
        buffer.uri = await contentHashAndCopy(
          bufferPath,
          outputPath,
          opts.rename
        );
      }
    }
  }

  const content = JSON.stringify(gltf);
  const fileName = hashFileName(gltfPath, content);

  return {
    gltf,
    fileName
  };
}

async function contentHashAndCopy(resourcePath, outputPath, move) {
  const content = await fs.readFile(resourcePath);
  const fileName = hashFileName(resourcePath, content);

  if (move) {
    await fs.move(resourcePath, path.join(outputPath, fileName), {
      overwrite: true
    });
  } else {
    await fs.copy(resourcePath, path.join(outputPath, fileName), {
      overwrite: true
    });
  }

  return fileName;
}

function hashFileName(resourcePath, content) {
  const { name, ext } = path.parse(resourcePath);
  const hash = crypto.createHash("md5");
  const digest = hash
    .update(content)
    .digest("hex")
    .substr(0, 10);

  if (ext === ".gltf") {
    return name + "-" + digest + ext;
  }

  return digest + ext;
}

module.exports = {
  contentHashUrls,
  hashFileName,
  contentHashAndCopy
};
