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
import SawmillPlayButton from "/components/sawmill_play_button.js";


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


function SawmillToolbar({ diffView, duration, playback, scanlines, zoomLevel, toolbarEvents }) {
  const canZoom = CSS.supports("zoom", 2);

  return html`
    <div class=sawmill-toolbar>
      <button title="Previous scan" disabled=${playback} onClick=${toolbarEvents.onSelectPrev}>${"<<"}</button>
      <label title="Show differences between current and previous scans">Diff view:
        <input type="checkbox" checked=${diffView} onInput=${toolbarEvents.onDiffViewSet} />
      </label>
      <label for="zoom-level">Zoom:</label>
      <select id=zoom-level disabled=${!canZoom} value=${zoomLevel} onInput=${toolbarEvents.onZoomLevelSet}>
        ${zoomLevels.map(renderZoomLevel)}
      </select>
      <label for="duration">Duration:</label>
      <select id=duration disabled=${playback} value=${duration} onInput=${toolbarEvents.onDurationSet}>
        ${durations.map(renderDuration)}
      </select>
      <label title="Reveal next scan line-by-line during playback">Scanlines:
        <input type="checkbox" disabled=${playback} checked=${scanlines} onInput=${toolbarEvents.onScanlinesSet} />
      </label>
      <${SawmillPlayButton} playback=${playback} onPlaybackSet=${toolbarEvents.onPlaybackSet} />
      <button title="Next scan" disabled=${playback} onClick=${toolbarEvents.onSelectNext}>${">>"}</button>
    </div>
  `;
}

export default SawmillToolbar;