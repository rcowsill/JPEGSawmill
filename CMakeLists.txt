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

cmake_minimum_required(VERSION 3.20)

project("JPEGSawmill" VERSION 0.1.0 LANGUAGES CXX)

add_subdirectory(vendor)
add_subdirectory(src)

if (DEFINED EMSCRIPTEN)

    # WASM and glue .js
    add_executable(jpeg_inspector)
    target_link_libraries(jpeg_inspector PRIVATE lib_jpeg_inspector)
    target_link_options(jpeg_inspector
        PRIVATE
            "-sMODULARIZE"
            "-sEXPORT_ES6"
            "-sEXPORT_NAME=makeJPEGInspector"
            "-sEXPORTED_FUNCTIONS=_malloc,_free"
            "-sINCOMING_MODULE_JS_API=wasmMemory"
            "-sIMPORTED_MEMORY=1"
            "-sINITIAL_MEMORY=131072"
            "-sALLOW_MEMORY_GROWTH"
            "-sENVIRONMENT=web"
            "-sDYNAMIC_EXECUTION=0")

    if (CMAKE_BUILD_TYPE STREQUAL "Debug")

        # Extra linker settings for debugging
        target_link_options(jpeg_inspector
            PRIVATE
                "-sASSERTIONS=2"
                "-sABORTING_MALLOC=1")

        # Set the map's sourceRoot to make source lookup relative to the install destination
        # "../../../src/[...]" becomes "1/2/3/../../../src/[...]", resolving to "src/[...]"
        # TODO: This should get the target path of jpeg_inspector and apply s/.js/.wasm.map/
        #       (And possibly also calculate the appropriate number of path segments to add)
        install(CODE
            [=[
                file(READ "jpeg_inspector.wasm.map" WASM_MAP_JSON)
                string(JSON WASM_MAP_JSON SET "${WASM_MAP_JSON}" "sourceRoot" "\"1/2/3\"")
                file(WRITE "dist/jpeg_inspector.wasm.map" "${WASM_MAP_JSON}")
            ]=])

        # Install source-map file for source-level debugging in the browser
        install(
            FILES
                "$<TARGET_FILE_DIR:jpeg_inspector>/dist/jpeg_inspector.wasm.map"
            DESTINATION
                "_site/dist")

        # Install corresponding source files
        # TODO: Investigate how to get the files from other targets (given .cpps are PRIVATE)
        install(DIRECTORY "src" DESTINATION "_site/dist")

    endif()

    # Install the wasm binary and glue .js
    install(
        FILES
            "$<TARGET_FILE_DIR:jpeg_inspector>/jpeg_inspector.wasm"
            "$<TARGET_FILE_DIR:jpeg_inspector>/jpeg_inspector.js"
        DESTINATION
            "_site/dist")

else()

    enable_testing()
    add_subdirectory(test)

endif()
