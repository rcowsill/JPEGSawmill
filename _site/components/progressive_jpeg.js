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

import { Component, createRef, html } from "/external/preact-htm-3.1.1.js";
import SawmillToolbar from "/components/sawmill_toolbar.js";
import SawmillViewer from "/components/sawmill_viewer.js";


const endOfImageMarker = Uint8Array.from([0xFF, 0xD9]);

class ProgressiveJpeg extends Component {
  constructor(props) {
    super(props);
    this.alreadyAutoFocused = false;
    this.animationIndex = 0;
    this.ref = createRef();
    this.state = {
      brightness: 0,
      diffView: false,
      duration: 10,
      playback: false,
      scanlines: true,
      scanData: [],
      selected: 0,
      zoomLevel: 1
    };
  }


  keyDownHandler(e) {
    if (!e.defaultPrevented && !e.repeat) {
      if (!this.state.playback) {
        if (e.code === "ArrowLeft") {
          if (e.shiftKey) {
            this.onSelectFirst();
          } else {
            this.onSelectPrev();
          }
          e.preventDefault();
        } else if (e.code === "ArrowRight") {
          if (e.shiftKey) {
            this.onSelectLast();
          } else {
            this.onSelectNext();
          }
          e.preventDefault();
        }
      }
    }
  }

  onSelectFirst() {
    this.setState({ selected: 0 });
  }

  onSelectPrev() {
    let { selected } = this.state;
    this.setState({ selected: Math.max(0, selected - 1) });
  }

  onSelectNext() {
    const { selected, scanData } = this.state;
    const lastIndex = scanData.length;
    this.setState({ selected: Math.min(selected + 1, lastIndex) });
  }

  onSelectLast() {
    const lastIndex = this.state.scanData.length;
    this.setState({ selected: lastIndex });
  }

  onDurationSet(e) {
    this.setState({ duration: e.target.value });
  }

  onPlaybackSet(playback) {
    const stateChange = { playback };
    if (playback) {
      // Switch diff mode off for playback
      stateChange.diffView = false;

      // Select scan 0 in case the animation stops before the next scan
      this.animationIndex = 0;
    }

    stateChange.selected = this.animationIndex;

    this.setState(stateChange);
  }

  onAnimationEnd(e) {
    if (e.animationName.startsWith("scan-playback")) {
      // Remember the latest scan shown by the animation
      const scanIndex = e.target.dataset.scanIndex;
      this.animationIndex = Math.max(this.animationIndex, scanIndex);
    } else if (e.animationName === "meter-playback") {
      // Select the last scan and end playback at the end of the animation
      this.animationIndex = this.state.scanData.length;
      this.onPlaybackSet(false);
    }
  }

  onZoomLevelSet(e) {
    this.setState({ zoomLevel: e.target.value });
  }

  onDiffViewSet(e) {
    this.setState({ diffView: e.target.checked });
  }

  onBrightnessSet(e) {
    this.setState({ brightness: e.target.value });
  }

  onScanlinesSet(e) {
    this.setState({ scanlines: e.target.checked });
  }


  componentDidMount() {
    const {uint8Array, scanEndOffsets} = this.props;
    const scanData = [];

    if (uint8Array) {
      console.log(`Creating ${scanEndOffsets.length} object URLs`);
      for (const scanEndOffset of scanEndOffsets) {
        const truncatedData = uint8Array.subarray(0, scanEndOffset);
        const partialBlob = new Blob(
            [truncatedData, endOfImageMarker],
            { "type": "image/jpg" });
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

      this.setState({ scanData: scanData });
    }
  }

  componentWillUnmount() {
    const { scanData } = this.state;

    // Revoke old object URLs to avoid memory leak
    console.log(`Revoking ${scanData.length} object URLs`);
    for (const scan of scanData) {
      URL.revokeObjectURL(scan.objectUrl);
    }
  }

  componentDidUpdate() {
    if (this.ref.current && this.alreadyAutoFocused === false && this.state.scanData.length > 0) {
      this.ref.current.focus();
      setTimeout(() => this.ref.current.scrollIntoView(true), 0);
      this.alreadyAutoFocused = true;
    }
  }


  render({ width, height }, { brightness, diffView, duration, playback, scanlines, scanData, selected, zoomLevel }) {
    if (scanData.length === 0 || width === 0 || height === 0) {
      return null;
    }

    const settings = { brightness, diffView, duration, scanlines, zoomLevel };

    const toolbarEvents = {
      onSelectFirst: this.onSelectFirst.bind(this),
      onSelectPrev: this.onSelectPrev.bind(this),
      onSelectNext: this.onSelectNext.bind(this),
      onSelectLast: this.onSelectLast.bind(this),
      onDurationSet: this.onDurationSet.bind(this),
      onPlaybackSet: this.onPlaybackSet.bind(this),
      onZoomLevelSet: this.onZoomLevelSet.bind(this),
      onDiffViewSet: this.onDiffViewSet.bind(this),
      onBrightnessSet: this.onBrightnessSet.bind(this),
      onScanlinesSet: this.onScanlinesSet.bind(this)
    };

    const imageDimensions = { width, height };

    const viewerEvents = {
      onAnimationEnd: this.onAnimationEnd.bind(this)
    };

    return html`
      <h2>Progressive Scans:</h2>
      <div class=progressive-jpeg ref=${this.ref} tabindex=-1 onkeydown=${this.keyDownHandler.bind(this)}>
        <${SawmillToolbar} ...${{ playback, settings, toolbarEvents }} />
        <${SawmillViewer} ...${{ playback, scanData, selected, imageDimensions, settings, viewerEvents }} />
      </div>
    `;
  }
}

export default ProgressiveJpeg;
