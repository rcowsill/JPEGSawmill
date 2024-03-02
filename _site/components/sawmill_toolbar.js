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

import { html } from "/external/preact-htm-3.1.1.js";


const zoomLevels = [0.125, 0.25, 0.5, 1, 2, 4, 8];
const durations = [2, 5, 10, 30, 60, 180];

function renderZoomLevel(z) {
  let zoomText = `${z}`;
  if (z < 1) {
    zoomText = `1/${1 / z}`;
  }
  return html`<option value=${z}>${`x${zoomText}`}</option>`;
}

function renderDuration(d) {
  return html`<option value=${d}>${`${d}s`}</option>`;
}


function SawmillToolbar({ diffView, duration, zoomLevel, toolbarEvents }) {
  const canZoom = CSS.supports("zoom", 2);

  return html`
    <div class=sawmill-toolbar>
      <button id=prev onClick=${toolbarEvents.onSelectPrev}>${"<<"}</button>
      <label for="diff-view">Diff view:</label>
      <input type="checkbox" id="diff-view" checked=${diffView} onInput=${toolbarEvents.onDiffViewSet} />
      <label for="zoom-level">Zoom:</label>
      <select id=zoom-level disabled=${!canZoom} value=${zoomLevel} onInput=${toolbarEvents.onZoomLevelSet}>
        ${zoomLevels.map(renderZoomLevel)}
      </select>
      <label for="duration">Duration:</label>
      <select id=duration value=${duration} onInput=${toolbarEvents.onDurationSet}>
        ${durations.map(renderDuration)}
      </select>
      <button id=play onClick=${toolbarEvents.onStartPlayback}>${">"}</button>
      <button id=next onClick=${toolbarEvents.onSelectNext}>${">>"}</button>
    </div>
  `;
}

export default SawmillToolbar;
