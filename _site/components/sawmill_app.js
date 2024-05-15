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

import { html } from "../external/preact-htm-3.1.1.js";
import { useState } from "../external/hooks.module.js";
import loadJPEG from "../load_jpeg.js";
import SawmillUI from "./sawmill_ui.js";


function SawmillApp() {
  const [fileData, setFileData] = useState({});

  function onFileInputChange(e) {
    loadJPEG(e.target.files, setFileData);
  }

  function onFileDrop(e) {
    // Apply dropped file to file input
    const fileInput = document.querySelector(".sawmill-toolbar .input-file");
    fileInput.files = e.dataTransfer.files;

    loadJPEG(e.dataTransfer.files, setFileData);
  }

  const uiEvents = {
    onFileInputChange,
    onFileDrop
  };

  return html`
    <${SawmillUI} ...${fileData} uiEvents=${uiEvents} />
  `;
}

export default SawmillApp;
