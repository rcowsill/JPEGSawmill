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

class ProgressiveJpeg extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: 0 };
  }

  prevClicked() {
    let { selected } = this.state;
    this.setState({ selected: Math.max(0, selected - 1) });
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
        <button id="prev" onClick=${this.prevClicked.bind(this)}>${"<"}</button>
        <div class=scan data-selected=${selected === 0}></div>
        ${jpegScanUrls.map((jpegScanUrl, index) => html`
          <img class=scan src=${jpegScanUrl} data-selected=${selected === (index + 1)} />
        `)}
        <button id="next" onClick=${this.nextClicked.bind(this)}>${">"}</button>
      </div>
    `;
  }
}

export default ProgressiveJpeg;
