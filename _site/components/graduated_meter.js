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

function formatValue(value) {
  return value.toFixed(1);
}

function GraduatedMeter({ value=0, min=0, max=1, textSettings={} }) {
  const {prefix="", separator="/", suffix=""} = textSettings;
  const range = max - min;
  if (range <= 0) {
    return null;
  }

  const barStyles = { width: `${100 * (value - min) / range}%` };
  const valueText = formatValue(value);
  const maxText = formatValue(max);
  const labelText = `${prefix}${valueText}${separator}${maxText}${suffix}`;
  return html`
    <div class=graduated-meter>
      <span class=graduated-meter-text>${labelText}</span>
      <div class=graduated-meter-bar style=${barStyles}>
        <span class=graduated-meter-text>${labelText}</span>
      </div>
    </div>
  `;
}

export default GraduatedMeter;
