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

import loadJPEG from "/load_jpeg.js";
import SawmillUI from "./components/sawmill_ui.js";
import { html, render } from "/external/preact-htm-3.1.1.js";

const elementInputFile = document.querySelector("#input-file");
const elementResults = document.querySelector("#results");

(function main() {
  elementInputFile.addEventListener("change", onFileInputChange);
  elementInputFile.hidden = false;
})();

function onFileInputChange(e) {
  loadJPEG(e.target.files, createImgTags);
}

let fileKey = 0;
function createImgTags(uint8Array, imageWidth, imageHeight, scanEndOffsets) {
  const props = {
    key: fileKey++,
    uint8Array,
    width: imageWidth,
    height: imageHeight,
    scanEndOffsets
  };

  render(html`<${SawmillUI} ...${props} />`, elementResults);
  elementResults.hidden = false;
}
