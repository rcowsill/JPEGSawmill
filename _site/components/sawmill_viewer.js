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
import SawmillMeter from "/components/sawmill_meter.js";


function getScanSize(scanData, selected) {
  return (selected === 0 ? 0 : scanData[selected - 1].endOffset);
}

function getViewerClasses(playback, scanlines) {
  const classes = ["sawmill-viewer"];

  if (playback) { classes.push("playback"); }
  if (scanlines) { classes.push("scanlines"); }

  return classes.join(" ");
}

function getViewerStyles(duration, scanData) {
  const lastScan = scanData[scanData.length - 1];
  const styles = {
    "--anim-total-duration": `${duration}s`,
    "--anim-byte-duration": `${duration / lastScan.endOffset}s`
  };

  return styles;
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


function SawmillViewer({ diffView=false, duration, playback=false, scanlines=true, scanData=[], selected=0, zoomLevel=1, viewerEvents }) {
  const total = scanData.length;
  if (total === 0) {
    return null;
  }

  const viewerProps = {
    class: getViewerClasses(playback, scanlines),
    style: getViewerStyles(duration, scanData),
    onAnimationEnd: viewerEvents.onAnimationEnd
  };

  // Omit last scan, and current selection when not in playback
  const graduationOffsets = scanData
    .map((scan) => scan.endOffset)
    .slice(0, -1)
    .filter((e, i) => playback || (i + 1) !== selected);

  const meterProps = {
    value: getScanSize(scanData, selected),
    max: getScanSize(scanData, total),
    graduations: graduationOffsets,
    playback: playback
  };

  return html`
    <div ...${viewerProps}>
      <${SawmillMeter} ...${meterProps} />
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