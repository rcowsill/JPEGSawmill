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


function valueToPercent(min, max, value) {
  return 100 * (value - min) / (max - min);
}

function formatValue(value) {
  return value.toFixed(1);
}

function renderGraduation(valuePercent) {
  return html`
    <line x1=${valuePercent}% y1="-10%" x2=${valuePercent}% y2=110%></line>
  `;
}

function makeRenderGraduations(percentGraduations) {
  return function renderGraduations() {
    return html`
      <svg class=graduated-meter-graduations xmlns="http://www.w3.org/2000/svg">
        ${percentGraduations.map(renderGraduation)}
      </svg>
    `;
  };
}

function makeRenderLabel(value, max, { prefix="", separator="/", suffix="" }) {
  return function renderLabel() {
    const valueText = formatValue(value);
    const maxText = formatValue(max);
    const labelText = `${prefix}${valueText}${separator}${maxText}${suffix}`;

    return html`
      <div class=graduated-meter-text>${labelText}</div>
    `;
  };
}

function GraduatedMeter({ value=0, min=0, max=1, graduations=[], textSettings={} }) {
  if (max - min <= 0) {
    return null;
  }

  const percentGraduations = graduations.map(valueToPercent.bind(null, min, max));
  const meterGraduations = makeRenderGraduations(percentGraduations);

  const renderLabel = makeRenderLabel(value, max, textSettings);

  const barPercent = valueToPercent(min, max, value);
  const barStyles = {
    "clip-path": `inset(0 ${100 - barPercent}% 0 0)`
  };

  return html`
    <div class=graduated-meter>
      <${meterGraduations} />
      <${renderLabel} />
      <div class=graduated-meter-bar style=${(barPercent < 100) ? barStyles : ""}>
        <${meterGraduations} />
        <${renderLabel} />
      </div>
    </div>
  `;
}

export default GraduatedMeter;
