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


const mainClass = "file-drop-target";
const activeClass = "active";
const dragoverClass = "dragover";

(function initModule() {
  const root = document;
  root.addEventListener("dragenter", handleRootDragEnter);
  root.addEventListener("dragleave", handleRootDragClear);
  root.addEventListener("dragover", handleRootDragOver);
  root.addEventListener("drop", handleRootDragClear);
})();

function handleRootDragEnter(e) {
  const root = e.currentTarget;
  for (const el of root.querySelectorAll(`.${mainClass}`)) {
    el.classList.add(activeClass);
  }

  handleRootDragOver(e);
}

function handleRootDragClear(e) {
  // Deactivate drop targets when drag leaves without entering another element
  if (e.relatedTarget === null) {
    const root = e.currentTarget;
    for (const el of root.querySelectorAll(`.${mainClass}`)) {
      el.classList.remove(activeClass);
    }
  }
}

function handleRootDragOver(e) {
  const items = e.dataTransfer.items;
  if (items.length > 0) {
    // Chrome workaround: preventDefault makes file input's button non-dropzone
    const targetIsInput = e.target instanceof HTMLInputElement;
    const targetIsFileInput = (targetIsInput && e.target.type === "file");
    if (!targetIsFileInput || items[0].kind !== "file") {
      e.preventDefault();
    }
  }
}

function handleTargetDragOver(e) {
  const items = e.dataTransfer.items;
  if (items.length === 1 && items[0].kind === "file") {
    e.currentTarget.classList.add(dragoverClass);
  } else {
    e.dataTransfer.dropEffect = "none";
  }

  e.preventDefault();
}

function handleTargetDragLeave(e) {
  e.currentTarget.classList.remove(dragoverClass);
}


function FileDropTarget({ children, onFileDrop }) {
  function handleTargetDrop(e) {
    handleTargetDragLeave(e);

    const items = e.dataTransfer.items;
    if (items.length === 1 && items[0].kind === "file") {
      onFileDrop(e);
    }

    e.preventDefault();
  }

  const targetEvents = {
    onDragOver: handleTargetDragOver,
    onDragLeave: handleTargetDragLeave,
    onDrop: handleTargetDrop
  };

  return html`
    <div class=${mainClass} ...${targetEvents}>
      ${children}
    </div>
  `;
}

export default FileDropTarget;
