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

const wasmPageSize = 65536;
const extraPageCount = 2;


async function loadJPEG(files, callback) {
  if (files.length > 0) {
    const file = files[0];
    console.log(`Opening: ${file.name}...`);

    const arrayBuffer = await file.arrayBuffer();
    const bufferLength = arrayBuffer.byteLength;
    if (bufferLength > 0) {
      // Make memory large enough to hold the stack and input image data
      const imagePageCount = bufferLength / wasmPageSize;
      const totalPageCount = Math.ceil(imagePageCount) + extraPageCount;
      const memory = new WebAssembly.Memory({
        initial: totalPageCount,
        maximum: totalPageCount
      });

      const memoryByteCount = totalPageCount * wasmPageSize;
      console.log(`Allocating ${memoryByteCount} bytes for WASM`);

      console.log("Compiling and instantiating WASM...");
      let inspector = await createJPEGInspector({ wasmMemory: memory });

      // Allocate space in WASM memory for the file buffer contents
      const address = inspector._malloc(bufferLength);
      if (address !== 0) {
        const uint8Array = new Uint8Array(arrayBuffer);
        inspector.HEAPU8.set(uint8Array, address);

        console.log(`Inspecting ${file.name}`);
        const rawBuffer = [address, bufferLength];
        let nextOffset = inspector._getStartOfFrameOffset(...rawBuffer);
        const imageWidth = inspector._getImageWidth(nextOffset, ...rawBuffer);
        const imageHeight = inspector._getImageHeight(nextOffset, ...rawBuffer);

        const scanEndOffsets = [];
        for (;;) {
          nextOffset = inspector._getScanEndOffset(nextOffset, ...rawBuffer);

          if (nextOffset >= bufferLength) {
            break;
          }

          scanEndOffsets.push(nextOffset);
        }

        console.log(`Scan end offsets for ${file.name}:`);
        console.log(scanEndOffsets);

        callback({ uint8Array, imageWidth, imageHeight, scanEndOffsets });

        // Free the raw buffer and release the WASM instance
        // TODO: Cache the compiled WASM and reuse
        inspector._free(address);
        inspector = null;

        console.log("Done!");
      }
    }
  }
}

export default loadJPEG;
