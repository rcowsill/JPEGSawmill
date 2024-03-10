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
import { useLayoutEffect, useRef } from "/external/hooks.module.js";
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

function getCentrePos(scrollBox, { width, height }, zoomLevel) {
  // Get half extents of the visible part of the image, accounting for previous zoom level
  const halfWidth = 0.5 * Math.min(scrollBox.offsetWidth, width * zoomLevel);
  const halfHeight = 0.5 * Math.min(scrollBox.offsetHeight, height * zoomLevel);

  return [scrollBox.scrollLeft + halfWidth, scrollBox.scrollTop + halfHeight];
}

function recentreZoom(scrollBox, [centreX, centreY], zoomLevel, previousZoom) {
  const zoomFraction = zoomLevel / previousZoom;
  const halfWidth = 0.5 * scrollBox.offsetWidth;
  const halfHeight = 0.5 * scrollBox.offsetHeight;

  const scrollLeft = (zoomFraction * centreX) - halfWidth;
  const scrollTop = (zoomFraction * centreY) - halfHeight;

  scrollBox.scrollTo(scrollLeft, scrollTop);
}


function SawmillViewer({ playback, scanData=[], selected=0, imageDimensions, settings, viewerEvents }) {
  const { duration, scanlines, zoomLevel } = settings;
  const total = scanData.length;
  if (total === 0) {
    return null;
  }

  const scrollRef = useRef();
  const previousZoom = useRef(zoomLevel);
  const centrePos = useRef([0, 0]);

  // Save previous scroll position before rendering a zoom level change
  if (scrollRef.current && previousZoom.current !== zoomLevel) {
    centrePos.current = getCentrePos(scrollRef.current, imageDimensions, previousZoom.current);
  }

  // Zoom on centre of visible image
  useLayoutEffect(() => {
    if (scrollRef.current && previousZoom.current !== zoomLevel) {
      recentreZoom(scrollRef.current, centrePos.current, zoomLevel, previousZoom.current);

      previousZoom.current = zoomLevel;
    }
  }, [zoomLevel]);

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
      <div class=scroll-box ref=${scrollRef}>
        <${SawmillViewerFilter} ...${{ scanData, selected, imageDimensions, settings }}/>
      </div>
    </div>
  `;
}

export default SawmillViewer;
