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


function getFilterClasses(diffView) {
  const classes = ["filter"];

  if (diffView) { classes.push("difference"); }

  return classes.join(" ");
}

function getFilterStyles(brightness, diffView) {
  if (!diffView) {
    return {};
  }

  const styles = {
    filter: `brightness(${2 ** brightness})`
  };

  return styles;
}

function getScanClasses(index, selected) {
  const classes = ["scan"];

  if (index === 0) { classes.push("background"); }
  if ((index + 1) === selected) { classes.push("previous"); }
  if (index === selected) { classes.push("selected"); }

  return classes.join(" ");
}

function getScanStyles(scan) {
  const styles = {
    "--scan-start": scan.endOffset - scan.duration,
    "--scan-length": scan.duration,
  };

  return styles;
}

function renderScan(selected, zoomLevel, scan, index) {
  const scanIndex = index + 1;

  const styles = { zoom: zoomLevel };
  if (zoomLevel < 1) {
    styles["image-rendering"] = "revert";
  }

  return html`
    <li class=${getScanClasses(scanIndex, selected)} style=${getScanStyles(scan)} data-scan-index=${scanIndex}>
      <img style=${styles} alt=${`Scan ${scanIndex}`} src=${scan.objectUrl} />
    </li>
  `;
}


function SawmillViewerFilter({ scanData, selected, settings }) {
  const { brightness, diffView, zoomLevel } = settings;
  const total = scanData.length;
  if (total === 0) {
    return null;
  }

  return html`
  <ol class=${getFilterClasses(diffView)} style=${getFilterStyles(brightness, diffView)}>
    <li class=${getScanClasses(0, selected)}></li>
    ${scanData.map(renderScan.bind(null, selected, zoomLevel))}
  </ol>
  `;
}

export default SawmillViewerFilter;
