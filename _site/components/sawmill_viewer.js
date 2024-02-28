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
import GraduatedMeter from "/components/graduated_meter.js";


function getDisplaySize(size) {
  return size / 1024;
}

function getScanSize(scanEndOffsets, selected) {
  const size = (selected === 0 ? 0 : scanEndOffsets[selected - 1]);

  return getDisplaySize(size);
}

function getScanClasses(index, selected) {
  const classes = ["scan"];

  if(index === 0) { classes.push("background"); }
  if((index + 1) === selected) { classes.push("previous"); }
  if(index === selected) { classes.push("selected"); }

  return classes.join(" ");
}

function renderScan(selected, zoomLevel, url, index) {
  const scanIndex = index + 1;

  const styles = { zoom: `${zoomLevel}` };
  if (zoomLevel < 1) {
    styles["image-rendering"] = "revert";
  }

  return html`
    <li class=${getScanClasses(scanIndex, selected)}>
      <img style=${styles} alt=${`Scan ${scanIndex}`} src=${url} />
    </li>
  `;
}


function SawmillViewer({ scanEndOffsets=[], scanUrls=[], selected=0, zoomLevel=1 }) {
  const total = scanUrls.length;
  if (total === 0) {
    return null;
  }

  // Omit last scan and current selection
  const graduationOffsets = scanEndOffsets
    .slice(0, -1)
    .filter((e, i) => (i + 1) !== selected)
    .map(getDisplaySize);

  const meterProps = {
    value: getScanSize(scanEndOffsets, selected),
    max: getScanSize(scanEndOffsets, total),
    graduations: graduationOffsets,
    textSettings: { suffix: "KiB" }
  };

  return html`
    <div class=sawmill-viewer>
      <${GraduatedMeter} ...${meterProps} />
      <div class=scroll-box>
        <ol class=filter>
          <li class=${getScanClasses(0, selected)}></li>
          ${scanUrls.map(renderScan.bind(null, selected, zoomLevel))}
        </ol>
      </div>
    </div>
  `;
}

export default SawmillViewer;
