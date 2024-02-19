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

import { Component, html } from "/external/preact-htm-3.1.1.js";

const durations = [2, 5, 10, 30, 60, 180];
const endOfImageMarker = Uint8Array.from([0xFF, 0xD9]);

class ProgressiveJpeg extends Component {
  constructor(props) {
    super(props);
    this.state = { scanUrls: [], selected: 0 };
  }

  prevClicked() {
    let { selected } = this.state;
    this.setState({ selected: Math.max(0, selected - 1) });
  }

  durationSet() {
    console.log("Duration set!");
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

  render(props, { scanUrls, selected }) {
    const total = scanUrls.length;
    if (total === 0) {
      return null;
    }
    console.log(`Creating ${scanUrls.length} img tags`);
    return html`
      <h2>Progressive Scans:</h2>
      <p>Scan ${selected} of ${total}</p>
      <div class=viewer>
        <div class=controls>
          <button id=prev onClick=${this.prevClicked.bind(this)}>${"<<"}</button>
          <select id=duration onInput=${this.durationSet.bind(this)}>
            ${durations.map(ProgressiveJpeg.renderDuration)}
          </select>
          <button id=play onClick=${this.playClicked.bind(this)}>${">"}</button>
          <button id=next onClick=${this.nextClicked.bind(this)}>${">>"}</button>
        </div>
        <meter id=elapsed value=${selected / total}></meter>
        <div class=${ProgressiveJpeg.getScanClasses(selected, 0)}></div>
        ${scanUrls.map(ProgressiveJpeg.renderScan.bind(null, selected))}
      </div>
    `;
  }

  static getScanClasses(selected, index) {
    return "scan" + ((selected >= index) ? " selected" : "");
  }

  static renderScan(selected, url, index) {
    const classes = ProgressiveJpeg.getScanClasses(selected, index + 1);
    return html`<img class=${classes} src=${url} />`;
  }

  static renderDuration(d) {
    return html`<option>${`${d}s`}</option>`;
  }
}

export default ProgressiveJpeg;
