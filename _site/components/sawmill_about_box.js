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


const repositoryUrl = "https://github.com/rcowsill/JPEGSawmill";

function SawmillAboutBox(){
  return html`
    <div class="sawmill-about-box">
      <h1>JPEG Sawmill</h1>
      <h2><a href=${repositoryUrl}>${repositoryUrl}</a></h2>
      <p>Load a JPEG file using the "Browse..." button in the toolbar</p>
    </div>
  `;
}

export default SawmillAboutBox;
