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

import { Component, html } from "https://unpkg.com/htm@3.1.1/preact/standalone.module.js";


const durations = [2, 5, 10, 30, 60, 180];

class ProgressiveJpeg extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: 0 };
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
    const lastIndex = this.props.jpegScanUrls.length;
    this.setState({ selected: Math.min(selected + 1, lastIndex) });
  }

  static getDerivedStateFromProps({ jpegScanUrls }, { selected }) {
    const lastIndex = jpegScanUrls.length;
    return { selected: Math.min(selected, lastIndex) };
  }

  componentDidUpdate({ jpegScanUrls }) {
    const newJpegScanUrls = this.props.jpegScanUrls;
    const urlsToRevoke = jpegScanUrls.filter((e) => !newJpegScanUrls.includes(e));

    // Revoke old object URLs to avoid memory leak
    for(const objectUrl of urlsToRevoke) {
      URL.revokeObjectURL(objectUrl);
    }
  }

  render({ jpegScanUrls = [] }, { selected }) {
    return html`
      <h2>Progressive Scans:</h2>
      <p>Scan ${selected} of ${jpegScanUrls.length}</p>
      <div class=viewer>
        <div class=controls>
          <button id="prev" onClick=${this.prevClicked.bind(this)}>${"<<"}</button>
          <select id="duration" onInput=${this.durationSet.bind(this)}>
            ${durations.map(ProgressiveJpeg.renderDuration)}
          </select>
          <button id="play" onClick=${this.playClicked.bind(this)}>${">"}</button>
          <button id="next" onClick=${this.nextClicked.bind(this)}>${">>"}</button>
        </div>
        <progress id="elapsed" min="0" max="100" value="56"></progress>
        <div class=${ProgressiveJpeg.getScanClasses(selected, 0)}></div>
        ${jpegScanUrls.map(ProgressiveJpeg.renderScan.bind(null, selected))}
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
