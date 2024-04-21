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
import { useEffect, useRef, useState } from "../external/hooks.module.js";
import { useCheckedState, useValueState } from "../hooks/element_state.js";
import SawmillToolbar from "./sawmill_toolbar.js";
import SawmillViewer from "./sawmill_viewer.js";


const endOfImageMarker = Uint8Array.from([0xFF, 0xD9]);
const zoomLevels = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32];


function deriveScanData(uint8Array, scanEndOffsets) {
  const scanData = [];

  if (uint8Array) {
    console.log(`Creating ${scanEndOffsets.length} object URLs`);
    for (const scanEndOffset of scanEndOffsets) {
      const truncatedData = uint8Array.subarray(0, scanEndOffset);
      const partialBlob = new Blob(
          [truncatedData, endOfImageMarker],
          { type: "image/jpg" });
      const scan = {
        objectUrl: URL.createObjectURL(partialBlob),
        endOffset: scanEndOffset
      };
      scanData.push(scan);
    }

    let prevScanOffset = 0;
    for (const scan of scanData) {
      scan.duration = scan.endOffset - prevScanOffset;
      prevScanOffset = scan.endOffset;
    }
  }

  return scanData;
}

function releaseScanData(scanData) {
  console.log(`Revoking ${scanData.length} object URLs`);
  for (const scan of scanData) {
    URL.revokeObjectURL(scan.objectUrl);
  }
}

function handleKeyDownEvent(e, playback, selectionEvents) {
  if (!e.defaultPrevented && !e.repeat) {
    if (!playback) {
      if (e.code === "ArrowLeft") {
        if (e.shiftKey) {
          selectionEvents.onSelectFirst();
        } else {
          selectionEvents.onSelectPrev();
        }
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        if (e.shiftKey) {
          selectionEvents.onSelectLast();
        } else {
          selectionEvents.onSelectNext();
        }
        e.preventDefault();
      }
    }
  }
}

function updatePlayback(playback, animationIndex, playbackSetters) {
  const { setDiffView, setPlayback, setSelected } = playbackSetters;
  if (playback) {
    // Switch diff mode off for playback
    setDiffView(false);

    // Select scan 0 in case the animation stops before the next scan
    animationIndex.current = 0;
  }

  setSelected(animationIndex.current);
  setPlayback(playback);
}

function handleAnimationEvent(e, animationIndex, scanData, playbackSetters) {
  if (e.animationName.startsWith("scan-playback")) {
    // Remember the latest scan shown by the animation
    const scanIndex = e.target.dataset.scanIndex;
    animationIndex.current = Math.max(animationIndex.current, scanIndex);
  } else if (e.animationName === "meter-playback") {
    // Select the last scan and end playback at the end of the animation
    animationIndex.current = scanData.length;
    updatePlayback(false, animationIndex, playbackSetters);
  }
}

function handleWheelEvent(e, { zoomLevel }, setZoom) {
  if (!e.defaultPrevented) {
    if (e.ctrlKey) {
      const newLevelIndex = zoomLevels.indexOf(zoomLevel) - Math.sign(e.deltaY);
      if (newLevelIndex >= 0 && newLevelIndex < zoomLevels.length) {
        const zoom = {
          zoomLevel: zoomLevels[newLevelIndex],
          clientPos: [e.clientX, e.clientY]
        };

        setZoom(zoom);
      }

      e.preventDefault();
    }
  }
}


function SawmillUI({ onFileInputChange, uint8Array, scanEndOffsets }) {
  const [brightness, onBrightnessSet] = useValueState(0);
  const [diffView, onDiffViewSet, setDiffView] = useCheckedState(false);
  const [duration, onDurationSet] = useValueState(10);
  const [playback, setPlayback] = useState(false);
  const [scanData, setScanData] = useState([]);
  const [scanlines, onScanlinesSet] = useCheckedState(true);
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState({ zoomLevel: 1 });
  const sawmillUIRef = useRef();
  const animationIndex = useRef(0);

  useEffect(() => {
    const newScanData = deriveScanData(uint8Array, scanEndOffsets);
    setScanData(newScanData);
    setSelected(newScanData.length);
    setDiffView(false);
    setPlayback(false);
    setZoom({ zoomLevel: 1 });

    return () => {
      setSelected(0);
      setScanData((oldScanData) => {
        releaseScanData(oldScanData);
        return [];
      });
    };
  }, [uint8Array, scanEndOffsets, setDiffView]);

  useEffect(() => {
    if (sawmillUIRef.current && scanData.length > 0) {
      sawmillUIRef.current.focus();
      sawmillUIRef.current.scrollIntoView(true);
    }
  }, [scanData]);

  const settings = { brightness, diffView, duration, scanlines, zoom };

  const lastIndex = scanData.length;
  const toolbarDisabled = (lastIndex === 0);
  const selectionEvents = {
    onSelectFirst: () => setSelected(0),
    onSelectPrev: () => setSelected((current) => Math.max(0, current - 1)),
    onSelectNext: () => setSelected((current) => Math.min(current + 1, lastIndex)),
    onSelectLast: () => setSelected(lastIndex)
  };

  const keyboardEvents = {
    onkeydown: (e) => handleKeyDownEvent(e, playback, selectionEvents)
  };

  const playbackSetters = { setDiffView, setPlayback, setSelected };
  const toolbarEvents = {
    ...selectionEvents,
    onDurationSet,
    onPlaybackSet: (newPlayback) => updatePlayback(newPlayback, animationIndex, playbackSetters),
    onZoomLevelSet: (e) => setZoom({ zoomLevel: zoomLevels[e.target.value] }),
    onDiffViewSet,
    onBrightnessSet,
    onScanlinesSet,
    onFileInputChange
  };

  const viewerEvents = {
    onAnimationEnd: (e) => handleAnimationEvent(e, animationIndex, scanData, playbackSetters),
    onWheel: (e) => handleWheelEvent(e, zoom, setZoom)
  };

  return html`
    <div class=sawmill-ui ref=${sawmillUIRef} tabindex=-1 ...${keyboardEvents}>
      <${SawmillToolbar} ...${{ playback, toolbarDisabled, settings, zoomLevels, toolbarEvents }} />
      <${SawmillViewer} ...${{ playback, scanData, selected, settings, viewerEvents }} />
    </div>
  `;
}

export default SawmillUI;
