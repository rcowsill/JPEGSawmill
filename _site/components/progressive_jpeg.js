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
import GraduatedMeter from "/components/graduated_meter.js";

const zoomLevels = [0.125, 0.25, 0.5, 1, 2, 4, 8];
const durations = [2, 5, 10, 30, 60, 180];
const endOfImageMarker = Uint8Array.from([0xFF, 0xD9]);

class ProgressiveJpeg extends Component {
  constructor(props) {
    super(props);
    this.alreadyAutoFocused = false;
    this.ref = createRef();
    this.state = {
      duration: 30,
      scanUrls: [],
      selected: 0,
      zoomLevel: 1
    };
  }

  keyDownHandler(e) {
    if (!e.defaultPrevented && !e.repeat) {
      if (e.code === "ArrowLeft") {
        this.prevClicked();
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        this.nextClicked();
        e.preventDefault();
      }
    }
  }

  prevClicked() {
    let { selected } = this.state;
    this.setState({ selected: Math.max(0, selected - 1) });
  }

  zoomLevelSet(e) {
    this.setState({ zoomLevel: e.target.value });
  }

  durationSet(e) {
    this.setState({ duration: e.target.value });
  }

  playClicked() {
    console.log("Play clicked!");
  }

  nextClicked() {
    let { selected } = this.state;
    const lastIndex = this.state.scanUrls.length;
    this.setState({ selected: Math.min(selected + 1, lastIndex) });
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
    for(const objectUrl of this.state.scanUrls) {
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

  render(props, { duration, scanUrls, selected, zoomLevel }) {
    const total = scanUrls.length;
    if (total === 0) {
      return null;
    }

    // Omit last scan and current selection
    const graduationOffsets = this.props.scanEndOffsets
      .slice(0, -1)
      .filter((e, i) => (i + 1) !== selected);

    const meterProps = {
      value: this.getScanSize(selected),
      max: this.getScanSize(total),
      graduations: graduationOffsets.map(ProgressiveJpeg.getDisplaySize),
      textSettings: { suffix: "KiB" }
    };

    const canZoom = CSS.supports("zoom", 2);

    return html`
      <h2>Progressive Scans:</h2>
      <div class=progressive-jpeg ref=${this.ref} tabindex=-1 onkeydown=${this.keyDownHandler.bind(this)}>
        <div class=controls>
          <button id=prev onClick=${this.prevClicked.bind(this)}>${"<<"}</button>
          <label for="zoom-level">Zoom:</label>
          <select id=zoom-level disabled=${!canZoom} value=${zoomLevel} onInput=${this.zoomLevelSet.bind(this)}>
            ${zoomLevels.map(ProgressiveJpeg.renderZoomLevel)}
          </select>
          <label for="duration">Duration:</label>
          <select id=duration value=${duration} onInput=${this.durationSet.bind(this)}>
            ${durations.map(ProgressiveJpeg.renderDuration)}
          </select>
          <button id=play onClick=${this.playClicked.bind(this)}>${">"}</button>
          <button id=next onClick=${this.nextClicked.bind(this)}>${">>"}</button>
        </div>
        <div class=viewer>
          <${GraduatedMeter} ...${meterProps} />
          <div class=scans>
            <div class=filter>
              <div class=${ProgressiveJpeg.getScanClasses(selected, 0)} alt="Scan 0"></div>
              ${scanUrls.map(ProgressiveJpeg.renderScan.bind(null, selected, zoomLevel))}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getScanSize(selected) {
    const size = (selected === 0 ? 0 : this.props.scanEndOffsets[selected - 1]);
    return ProgressiveJpeg.getDisplaySize(size);
  }

  static getDisplaySize(size) {
    return size / 1024;
  }

  static getScanClasses(selected, index) {
    const isSelected = (selected === index);
    const isBackground = (selected === (index + 1));
    return "scan" + (isSelected ? " selected" : (isBackground ? " background" : ""));
  }

  static renderScan(selected, zoomLevel, url, index) {
    const classes = ProgressiveJpeg.getScanClasses(selected, index + 1);
    const styles = { zoom: `${zoomLevel}` };
    if (zoomLevel < 1) {
      styles["image-rendering"] = "revert";
    }
    return html`<img class=${classes} style=${styles} alt=${`Scan ${index}`} src=${url} />`;
  }

  static renderZoomLevel(z) {
    let zoomText = `${z}`;
    if (z < 1) {
      zoomText = `1/${1 / z}`;
    }
    return html`<option value=${z}>${`x${zoomText}`}</option>`;
  }

  static renderDuration(d) {
    return html`<option value=${d}>${`${d}s`}</option>`;
  }
}

export default ProgressiveJpeg;
