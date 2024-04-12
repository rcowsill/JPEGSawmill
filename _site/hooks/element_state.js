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

import { useCallback, useState } from "../external/hooks.module.js";


function useCheckedState(initialValue) {
  const [checkedState, setCheckedState] = useState(initialValue);
  const onElementCheckedSet = useCallback((e) => {
    setCheckedState(e.target.checked);
  }, [setCheckedState]);

  return [checkedState, onElementCheckedSet, setCheckedState];
}

function useValueState(initialValue) {
  const [valueState, setValueState] = useState(initialValue);
  const onElementValueSet = useCallback((e) => {
    setValueState(e.target.value);
  }, [setValueState]);

  return [valueState, onElementValueSet, setValueState];
}

export { useCheckedState, useValueState };
