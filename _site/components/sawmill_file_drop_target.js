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
import FileDropTarget from "./file_drop_target.js";


function SawmillFileDropTarget({ onFileDrop }) {
  return html`
    <div class="sawmill-file-drop-target">
      <${FileDropTarget} onFileDrop=${onFileDrop}>
        <div class="sawmill-file-drop-overlay">
          <div class=drop-filter />
          <div class=drop-background />
          <div class=drop-vignette />
          <div class=drop-outline />
          <h1 class=drop-active-label>Drop a JPEG file here to open it</h1>
          <h1 class=drop-dragover-label>Open file...</h1>
        </div>
      <//>
    </div>
  `;
}

export default SawmillFileDropTarget;
