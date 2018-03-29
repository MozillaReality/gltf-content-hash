# gltf-component-data

Small library and command line utility for adding content hashes to images/bin chunks in glTF files.

## Library Usage

```js
import path from "path";
import fs from "fs";
import contentHashUrls from "gltf-content-hash";

const gltfPath = path.join(__dirname, "mygltf.gltf");
const imagesOutputDirectory = path.join(__dirname, "out");
const inGltf = JSON.parse(fs.readFileSync());

// Modifies uris in gltf and writes images to the output directory.
const { gltf, fileName } = await contentHashUrls(gltfPath, inGltf, imagesOutputDirectory);
```

## CLI Usage

```
npm install -g gltf-content-hash
```

```
Usage: gltf-content-hash <gltfPath> [options]

  Options:

    -V, --version    output the version number
    -o, --out <out>  The directory to output the modified glTF file and images. Defaults to the existing glTF path.
    -h, --help       output usage information
```
