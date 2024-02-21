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

function makeRenderLabel(value, max, { prefix="", separator="/", suffix="" }) {
  return function renderLabel() {
    const valueText = formatValue(value);
    const maxText = formatValue(max);
    const labelText = `${prefix}${valueText}${separator}${maxText}${suffix}`;

    return html`<div class=graduated-meter-text>${labelText}</div>`;
  };
}

function GraduatedMeter({ value=0, min=0, max=1, textSettings={} }) {
  const range = max - min;
  if (range <= 0) {
    return null;
  }

  const renderLabel = makeRenderLabel(value, max, textSettings);

  const barPercent = 100 * (value - min) / range;
  const barStyles = {
    "clip-path": `inset(0 ${100 - barPercent}% 0 0)`
  };

  return html`
    <div class=graduated-meter>
      <${renderLabel} />
      <div class=graduated-meter-bar style=${barStyles}>
        <${renderLabel} />
      </div>
    </div>
  `;
}

export default GraduatedMeter;
