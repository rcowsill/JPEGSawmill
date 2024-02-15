# JPEG Sawmill - A viewer for JPEG progressive scans
# Copyright (C) 2024  Rob Cowsill
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

# Set the map's sourceRoot to make source lookup relative to the install destination
# "../../../src/[...]" becomes "1/2/3/../../../src/[...]", resolving to "src/[...]"
#
# TODO: This should get the target path of jpeg_inspector and apply s/.js/.wasm.map/
#       (And possibly also calculate the appropriate number of path segments to add)

install(
    CODE
    [=[
        file(READ "jpeg_inspector.wasm.map" WASM_MAP_JSON)
        string(JSON WASM_MAP_JSON SET "${WASM_MAP_JSON}" "sourceRoot" "\"1/2/3\"")
        file(WRITE "dist/jpeg_inspector.wasm.map" "${WASM_MAP_JSON}")
    ]=])
