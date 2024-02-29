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
    this.ref = createRef();
    this.state = {
      diffView: false,
      duration: 30,
      scanUrls: [],
      selected: 0,
      zoomLevel: 1
    };
  }


  keyDownHandler(e) {
    if (!e.defaultPrevented && !e.repeat) {
      if (e.code === "ArrowLeft") {
        this.onSelectPrev();
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        this.onSelectNext();
        e.preventDefault();
      }
    }
  }

  onSelectPrev() {
    let { selected } = this.state;
    this.setState({ selected: Math.max(0, selected - 1) });
  }

  onSelectNext() {
    let { selected } = this.state;
    const lastIndex = this.state.scanUrls.length;
    this.setState({ selected: Math.min(selected + 1, lastIndex) });
  }

  onDurationSet(e) {
    this.setState({ duration: e.target.value });
  }

  onStartPlayback() {
    console.log("Play clicked!");
  }

  onZoomLevelSet(e) {
    this.setState({ zoomLevel: e.target.value });
  }

  onDiffViewSet(e) {
    this.setState({ diffView: e.target.checked });
  }


  componentDidMount() {
    const {uint8Array, scanEndOffsets} = this.props;
    const scanUrls = [];

    if (uint8Array) {
      console.log(`Creating ${scanEndOffsets.length} object URLs`);
      for (const scanEndOffset of scanEndOffsets) {
        const truncatedData = uint8Array.subarray(0, scanEndOffset);
        const partialBlob = new Blob(
            [truncatedData, endOfImageMarker],
            { "type": "image/jpg" });

        scanUrls.push(URL.createObjectURL(partialBlob));
      }
      this.setState({ scanUrls: scanUrls });
    }
  }

  componentWillUnmount() {
    // Revoke old object URLs to avoid memory leak
    console.log(`Revoking ${this.state.scanUrls.length} object URLs`);
    for (const objectUrl of this.state.scanUrls) {
      URL.revokeObjectURL(objectUrl);
    }
  }

  componentDidUpdate() {
    if (this.ref.current && this.alreadyAutoFocused === false && this.state.scanUrls.length > 0) {
      this.ref.current.focus();
      setTimeout(() => this.ref.current.scrollIntoView(true), 0);
      this.alreadyAutoFocused = true;
    }
  }


  render({ scanEndOffsets }, { diffView, duration, scanUrls, selected, zoomLevel }) {
    if (scanUrls.length === 0) {
      return null;
    }

    const toolbarEvents = {
      onSelectPrev: this.onSelectPrev.bind(this),
      onSelectNext: this.onSelectNext.bind(this),
      onDurationSet: this.onDurationSet.bind(this),
      onStartPlayback: this.onStartPlayback.bind(this),
      onZoomLevelSet: this.onZoomLevelSet.bind(this),
      onDiffViewSet: this.onDiffViewSet.bind(this),
    };

    return html`
      <h2>Progressive Scans:</h2>
      <div class=progressive-jpeg ref=${this.ref} tabindex=-1 onkeydown=${this.keyDownHandler.bind(this)}>
        <${SawmillToolbar} ...${{ diffView, duration, zoomLevel, ...toolbarEvents }} />
        <${SawmillViewer} ...${{ diffView, scanEndOffsets, scanUrls, selected, zoomLevel }} />
      </div>
    `;
  }
}

export default ProgressiveJpeg;
