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
import SawmillBrightnessSlider from "/components/sawmill_brightness_slider.js";
import SawmillPlayButton from "/components/sawmill_play_button.js";
import SawmillSquareButton from "/components/sawmill_square_button.js";


const durations = [2, 5, 10, 20, 30, 60];

function renderZoomLevel(z, index) {
  let zoomText = `${z}`;
  if (z < 1) {
    zoomText = `1/${1 / z}`;
  }
  return html`<option value=${index}>${`x${zoomText}`}</option>`;
}

function renderDuration(d) {
  return html`<option value=${d}>${`${d}s`}</option>`;
}


function SawmillToolbar({ playback, settings, zoomLevels, toolbarEvents }) {
  const { brightness, diffView, duration, scanlines } = settings;
  const { zoomLevel } = settings.zoom;

  return html`
    <div class=sawmill-toolbar>
      <${SawmillSquareButton} title="First scan" disabled=${playback} onClick=${toolbarEvents.onSelectFirst}>${"|<<"}<//>
      <${SawmillSquareButton} title="Previous scan" disabled=${playback} onClick=${toolbarEvents.onSelectPrev}>${"<<"}<//>
      <div class=options>
        <fieldset>
          <legend>Display options</legend>
          <label>Zoom:
            <select id=zoom-level value=${zoomLevels.indexOf(zoomLevel)} onInput=${toolbarEvents.onZoomLevelSet}>
              ${zoomLevels.map(renderZoomLevel)}
            </select>
          </label>
          <label title="Show differences between current and previous scans">Diff view:
            <input type="checkbox" disabled=${playback} checked=${diffView} onInput=${toolbarEvents.onDiffViewSet} />
          </label>
          <${SawmillBrightnessSlider} id=brightness brightness=${brightness} diffView=${diffView} onBrightnessSet=${toolbarEvents.onBrightnessSet} />
        </fieldset>
        <fieldset disabled=${playback}>
          <legend>Playback options</legend>
          <label>Duration:
            <select id=duration value=${duration} onInput=${toolbarEvents.onDurationSet}>
              ${durations.map(renderDuration)}
            </select>
          </label>
          <label title="Reveal next scan line-by-line during playback">Scanlines:
            <input type="checkbox" checked=${scanlines} onInput=${toolbarEvents.onScanlinesSet} />
          </label>
        </fieldset>
      </div>
      <${SawmillPlayButton} playback=${playback} onPlaybackSet=${toolbarEvents.onPlaybackSet} />
      <${SawmillSquareButton} disabled=${playback} onClick=${toolbarEvents.onSelectNext}>${">>"}<//>
      <${SawmillSquareButton} disabled=${playback} onClick=${toolbarEvents.onSelectLast}>${">>|"}<//>
    </div>
  `;
}

export default SawmillToolbar;
