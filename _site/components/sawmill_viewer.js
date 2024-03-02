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

function getScanSize(scanData, selected) {
  const size = (selected === 0 ? 0 : scanData[selected - 1].endOffset);

  return getDisplaySize(size);
}

function getFilterClasses(diffView) {
  const classes = ["filter"];

  if (diffView) { classes.push("difference"); }

  return classes.join(" ");
}

function getScanClasses(index, selected) {
  const classes = ["scan"];

  if (index === 0) { classes.push("background"); }
  if ((index + 1) === selected) { classes.push("previous"); }
  if (index === selected) { classes.push("selected"); }

  return classes.join(" ");
}

function renderScan(selected, zoomLevel, scan, index) {
  const scanIndex = index + 1;

  const styles = { zoom: zoomLevel };
  if (zoomLevel < 1) {
    styles["image-rendering"] = "revert";
  }

  return html`
    <li class=${getScanClasses(scanIndex, selected)}>
      <img style=${styles} alt=${`Scan ${scanIndex}`} src=${scan.objectUrl} />
    </li>
  `;
}


function SawmillViewer({ diffView=false, scanData=[], selected=0, zoomLevel=1 }) {
  const total = scanData.length;
  if (total === 0) {
    return null;
  }

  // Omit last scan and current selection
  const graduationOffsets = scanData
    .slice(0, -1)
    .filter((e, i) => (i + 1) !== selected)
    .map((scan) => getDisplaySize(scan.endOffset));

  const meterProps = {
    value: getScanSize(scanData, selected),
    max: getScanSize(scanData, total),
    graduations: graduationOffsets,
    textSettings: { suffix: "KiB" }
  };

  return html`
    <div class=sawmill-viewer>
      <${GraduatedMeter} ...${meterProps} />
      <div class=scroll-box>
        <ol class=${getFilterClasses(diffView)}>
          <li class=${getScanClasses(0, selected)}></li>
          ${scanData.map(renderScan.bind(null, selected, zoomLevel))}
        </ol>
      </div>
    </div>
  `;
}

export default SawmillViewer;
