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
import useTargetedZoom from "/hooks/targeted_zoom.js";
import SawmillMeter from "/components/sawmill_meter.js";
import SawmillViewerFilter from "/components/sawmill_viewer_filter.js";


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


function SawmillViewer({ playback, scanData=[], selected=0, imageDimensions, settings, viewerEvents }) {
  const { duration, scanlines, zoom } = settings;

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

  const scrollRef = useTargetedZoom(zoom);

  return html`
    <div ...${viewerProps}>
      <${SawmillMeter} ...${meterProps} />
      <div class=scroll-box ref=${scrollRef} onwheel=${viewerEvents.onWheel}>
        <${SawmillViewerFilter} ...${{ scanData, selected, imageDimensions, settings }}/>
      </div>
    </div>
  `;
}

export default SawmillViewer;
