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

import { html } from "../external/preact-htm-3.1.1.js";
import { useLayoutEffect } from "../external/hooks.module.js";
import useTargetedZoom from "../hooks/targeted_zoom.js";
import SawmillFileDropTarget from "./sawmill_file_drop_target.js";
import SawmillMeter from "./sawmill_meter.js";
import SawmillViewerFilter from "./sawmill_viewer_filter.js";


function getScanSize(scanData, selected) {
  return (selected === 0 ? 0 : scanData[selected - 1].endOffset);
}

function getViewerClasses(playback) {
  const classes = ["sawmill-viewer"];

  if (playback) { classes.push("playback"); }

  return classes.join(" ");
}

function getViewerStyles(duration) {
  const styles = {
    "--anim-total-duration": `${duration}s`
  };

  return styles;
}


function SawmillViewer({ playback, scanData=[], selected=0, settings, viewerEvents }) {
  const { duration, zoom } = settings;

  const viewerProps = {
    class: getViewerClasses(playback),
    style: getViewerStyles(duration),
    onAnimationEnd: viewerEvents.onAnimationEnd
  };

  // Omit last scan, and current selection when not in playback
  const graduationOffsets = scanData
    .map((scan) => scan.endOffset)
    .slice(0, -1)
    .filter((e, i) => playback || (i + 1) !== selected);

  const meterProps = {
    value: getScanSize(scanData, selected),
    max: getScanSize(scanData, scanData.length),
    graduations: graduationOffsets,
    playback
  };

  const scrollRef = useTargetedZoom(zoom);
  useLayoutEffect(() => {
    if (scrollRef.current && scanData.length > 0) {
      // Reset scroll position when scanData changes
      scrollRef.current.scrollTo(0, 0);
    }
  }, [scanData, scrollRef]);

  return html`
    <div ...${viewerProps}>
      <${SawmillMeter} ...${meterProps} />
      <div class=scroll-box ref=${scrollRef} onwheel=${viewerEvents.onWheel}>
        <${SawmillViewerFilter} ...${{ scanData, selected, settings }}/>
      </div>
      <${SawmillFileDropTarget} onFileDrop=${viewerEvents.onFileDrop} />
    </div>
  `;
}

export default SawmillViewer;
