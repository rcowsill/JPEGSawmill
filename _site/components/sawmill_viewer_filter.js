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
import SawmillAboutBox from "/components/sawmill_about_box.js";


function getFilterClasses(diffView) {
  const classes = ["filter"];

  if (diffView) { classes.push("difference"); }

  return classes.join(" ");
}

function getFilterStyles(brightness, duration, diffView, scanData) {
  const lastScan = scanData[scanData.length - 1];
  const styles = {
    "--anim-byte-duration": `${duration / lastScan.endOffset}s`
  };

  if (diffView) {
    styles.filter = `brightness(${2 ** brightness})`;
  }

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

function renderScan(selected, imageDimensions, zoomLevel, scan, index) {
  const scanIndex = index + 1;

  const imgProps = {
    alt: `Scan ${scanIndex}`,
    src: scan.objectUrl
  };

  if (zoomLevel !== 1) {
    imgProps.width = `${zoomLevel * imageDimensions.width}px`;
    imgProps.height = `${zoomLevel * imageDimensions.height}px`;
    if (zoomLevel < 1) {
      imgProps.style = { "image-rendering": "revert" };
    }
  }

  return html`
    <li class=${getScanClasses(scanIndex, selected)} style=${getScanStyles(scan)} data-scan-index=${scanIndex}>
      <img ...${imgProps} />
    </li>
  `;
}


function SawmillViewerFilter({ scanData, selected, imageDimensions, settings }) {
  const { brightness, duration, diffView } = settings;
  const { zoomLevel } = settings.zoom;

  const total = scanData.length;
  if (total === 0) {
    return html`<${SawmillAboutBox} />`;
  }

  const filterStyles = getFilterStyles(brightness, duration, diffView, scanData);

  return html`
    <ol class=${getFilterClasses(diffView)} style=${filterStyles}>
      <li class=${getScanClasses(0, selected)} style="background-color: black;"></li>
      ${scanData.map(renderScan.bind(null, selected, imageDimensions, zoomLevel))}
    </ol>
  `;
}

export default SawmillViewerFilter;
