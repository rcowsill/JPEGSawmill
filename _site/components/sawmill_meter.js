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
import { useEffect, useRef, useState } from "/external/hooks.module.js";
import GraduatedMeter from "/components/graduated_meter.js";


const valueUpdateHz = 10;

function getDisplaySize(size) {
  return size / 1024;
}

function SawmillMeter({ value, max, graduations, playback }) {
  const [animValue, setAnimValue] = useState(0);

  const meterProps = {
    value: getDisplaySize(playback ? animValue : value),
    max: getDisplaySize(max),
    graduations: graduations.map(getDisplaySize),
    textSettings: { suffix: "KiB" }
  };

  const wrapperRef = useRef();
  useEffect(() => {
    let intervalId;

    if (playback && wrapperRef.current) {
      const animations = wrapperRef.current.getAnimations({ subtree: true });
      if (animations.length > 0) {
        const meterAnimationEffect = animations[0].effect;

        // During playback, update the meter text to match the bar animation progress
        intervalId = setInterval(() => {
          const timing = meterAnimationEffect.getComputedTiming();
          setAnimValue(timing.progress * max);
        }, (1000 / valueUpdateHz));
      }
    }

    return () => {
      clearInterval(intervalId);
      setAnimValue(0);
    };
  }, [playback, max]);

  return html`
    <div ref=${wrapperRef}>
      <${GraduatedMeter} ...${meterProps} />
    </div>
  `;
}

export default SawmillMeter;
