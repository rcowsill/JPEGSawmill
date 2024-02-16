/*
 * JPEG Sawmill - A viewer for JPEG progressive scans
 * Copyright (C) 2024  Rob Cowsill
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import createJPEGInspector from "./dist/jpeg_inspector.js";
import ProgressiveJpeg from "./components/progressive_jpeg.js";
import { html, render } from "https://unpkg.com/htm@3.1.1/preact/standalone.module.js";


const endOfImageMarker = Uint8Array.from([0xFF, 0xD9]);
const wasmPageSize = 65536;
const extraPageCount = 2;

const elementInputFile = document.querySelector("#input-file");
const elementResults = document.querySelector("#results");


(function main() {
  elementInputFile.addEventListener("change", loadJPEG);
  elementInputFile.hidden = false;
})();

async function loadJPEG() {
  if (elementInputFile.files.length > 0) {
    const file = elementInputFile.files[0];
    console.log(`Opening: ${file.name}...`);

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > 0) {
      // Make memory large enough to hold the stack and input image data
      const imagePageCount = arrayBuffer.byteLength / wasmPageSize;
      const totalPageCount = Math.ceil(imagePageCount) + extraPageCount;
      const memory = new WebAssembly.Memory({
        "initial": totalPageCount,
        "maximum": totalPageCount
      });

      const memoryByteCount = totalPageCount * wasmPageSize;
      console.log(`Allocating ${memoryByteCount} bytes for WASM`);

      console.log("Compiling and instantiating WASM...");
      let inspector = await createJPEGInspector({ wasmMemory: memory });

      // Allocate space in WASM memory for the file buffer contents
      const rawBuffer = inspector._malloc(arrayBuffer.byteLength);
      if (rawBuffer !== 0) {
        const uint8Array = new Uint8Array(arrayBuffer);
        inspector.HEAPU8.set(uint8Array, rawBuffer);

        console.log(`Inspecting ${file.name}`);
        const scanEndOffsets = [];
        let scanEndOffset = 0;
        for (;;) {
          scanEndOffset = inspector._getScanEndOffset(
              scanEndOffset,
              rawBuffer,
              uint8Array.byteLength);

          if (scanEndOffset >= uint8Array.byteLength) {
            break;
          }

          scanEndOffsets.push(scanEndOffset);
        }

        console.log(`Scan end offsets for ${file.name}:`);
        console.log(scanEndOffsets);

        console.log(`Creating ${scanEndOffsets.length} img tags`);
        createImgTags(uint8Array, scanEndOffsets);
        elementResults.hidden = false;

        // Free the raw buffer and release the WASM instance
        // TODO: Cache the compiled WASM and reuse
        inspector._free(rawBuffer);
        inspector = null;

        console.log("Done!");
      }
    }
  }
}

function createImgTags(uint8Array, scanEndOffsets) {
  const scanUrls = [];
  for (const scanEndOffset of scanEndOffsets) {
    const truncatedData = uint8Array.subarray(0, scanEndOffset);
    const partialBlob = new Blob(
        [truncatedData, endOfImageMarker],
        { "type": "image/jpg" });

    scanUrls.push(URL.createObjectURL(partialBlob));
  }

  render(
      html`<${ProgressiveJpeg} jpegScanUrls=${scanUrls} />`,
      elementResults);
}
