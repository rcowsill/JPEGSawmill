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

import { useLayoutEffect, useRef } from "/external/hooks.module.js";


function getDefaultClientPos(element) {
  const clientRect = element.getBoundingClientRect();
  const { clientWidth, clientHeight } = element;

  return [clientRect.left + (clientWidth / 2), clientRect.top + (clientHeight / 2)];
}

function getClampedClientPos([clientX, clientY], clientRect) {
  const x = Math.max(0, Math.min(clientX - clientRect.left, clientRect.width));
  const y = Math.max(0, Math.min(clientY - clientRect.top, clientRect.height));

  return [x, y];
}

function getInnerClientRect(element) {
  const clientRect = element.getBoundingClientRect();
  const { clientWidth, clientHeight } = element;

  return new DOMRect(clientRect.left, clientRect.top, clientWidth, clientHeight);
}

function getZoomTarget(scrollBox, previousZoom, clientPos, zoomTarget) {
  const clientRect = scrollBox.firstElementChild.getBoundingClientRect();
  const targetPos = getClampedClientPos(clientPos, clientRect);

  zoomTarget.current = targetPos.map((c) => Math.round(c / previousZoom));
}

function applyZoomTarget(scrollBox, zoomLevel, clientPos, zoomTarget) {
  const clientRect = getInnerClientRect(scrollBox);
  const scrollTarget = getClampedClientPos(clientPos, clientRect);
  const scrollLeft = (zoomLevel * zoomTarget[0]) - scrollTarget[0];
  const scrollTop = (zoomLevel * zoomTarget[1]) - scrollTarget[1];

  scrollBox.scrollTo(scrollLeft, scrollTop);
}


function useTargetedZoom({ zoomLevel, clientPos }) {
  const previousZoom = useRef(zoomLevel);
  const zoomTarget = useRef([0, 0]);
  const scrollRef = useRef();

  // Save zoom target before rendering a zoom level change
  if (scrollRef.current && previousZoom.current !== zoomLevel) {
    if (clientPos === undefined) {
      clientPos = getDefaultClientPos(scrollRef.current);
    }

    getZoomTarget(scrollRef.current, previousZoom.current, clientPos, zoomTarget);
  }

  // Adjust scroll to put zoom target back where it was before zooming
  useLayoutEffect(() => {
    if (scrollRef.current && previousZoom.current !== zoomLevel) {
      applyZoomTarget(scrollRef.current, zoomLevel, clientPos, zoomTarget.current);

      previousZoom.current = zoomLevel;
    }
  }, [zoomLevel]);

  return scrollRef;
}

export default useTargetedZoom;
