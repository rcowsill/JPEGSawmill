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

#include "jpeg_inspector.h"

#include <algorithm>
#include <climits>

#ifdef __EMSCRIPTEN__

#include "emscripten.h"

#ifndef NDEBUG
#define EMSCRIPTEN_DEBUG
#define DEBUG_LOG(...) emscripten_log(EM_LOG_CONSOLE | EM_LOG_DEBUG, __VA_ARGS__)
#endif // NDEBUG

#else // __EMSCRIPTEN__

#define EMSCRIPTEN_KEEPALIVE

#endif // __EMSCRIPTEN__

#ifndef DEBUG_LOG
#define DEBUG_LOG(...)
#endif // DEBUG_LOG


// Markers start with this value, which can be repeated for padding purposes
static const uint8_t MARKER_PREFIX = 0xFF;

// Image start/end markers
static const uint16_t MARKER_SOI = 0xFFD8;
static const uint16_t MARKER_EOI = 0xFFD9;

// Scan start marker
static const uint16_t MARKER_SOS = 0xFFDA;

// Start of Frame marker containing image dimensions
static const uint16_t MARKER_SOF0 = 0xFFC0;
static const uint16_t MASK_SOF = 0xFFF0;

// Markers to ignore when matching Start of Frame
static const uint16_t MARKER_DHT = 0xFFC4;
static const uint16_t MARKER_JPG = 0xFFC8;
static const uint16_t MARKER_DAC = 0xFFCC;

// Zero-stuffed "marker" used to escape real 0xFF values in the coded scan data
static const uint16_t MARKER_IGNORE = 0xFF00;

// Define number of lines marker (may follow the first scan, needs to be retained with it)
static const uint16_t MARKER_DNL = 0xFFDC;

// Restart marker for resynchronization after error or parallel decode
static const uint16_t MARKER_RESTART0 = 0xFFD0;
static const uint16_t MASK_RESTART_MODULUS = 0x0007;


// Prototypes
static bool areInputsValid(int32_t startOffset, const uint8_t* buffer, int32_t length);
static bool isStartOfImagePresent(const uint8_t* buffer, int32_t length);
static bool isStartOfFramePresent(int32_t startOfFrameOffset, const uint8_t* buffer, int32_t length);
static bool canGetByte(int32_t offset, int32_t length);
static uint8_t getByte(int32_t offset, const uint8_t* buffer, int32_t length);
static bool canGetWord(int32_t offset, int32_t length);
static uint16_t getWord(int32_t offset, const uint8_t* buffer, int32_t length);
static int32_t findNextMarker(int32_t offset, const uint8_t* buffer, int32_t length);
static int32_t skipMarkerSegment(int32_t offset, const uint8_t* buffer, int32_t length);
static bool isStartOfFrameMarker(uint16_t marker);
static bool isRestartMarker(uint16_t marker);


extern "C" {

int32_t EMSCRIPTEN_KEEPALIVE getStartOfFrameOffset(const uint8_t* buffer, int32_t length)
{
    // Start immediately after the SOI marker
    int32_t offset = 2;

    if (!areInputsValid(offset, buffer, length) || !isStartOfImagePresent(buffer, length))
    {
        // If all else fails, skip to the end of the buffer
        return length;
    }

    // Find Start of Frame segment
    while(offset < length)
    {
        offset = findNextMarker(offset, buffer, length);
        if (!canGetWord(offset, length))
        {
            offset = length;
            break;
        }

        uint16_t marker = getWord(offset, buffer, length);
        if (isStartOfFrameMarker(marker))
        {
            DEBUG_LOG("Start of Frame @ %d", offset);

            break;
        }

        offset += 2;
        offset = skipMarkerSegment(offset, buffer, length);

        DEBUG_LOG("  Skipping non-SOF marker %04x @ %d", marker, offset);
    }

    // Return end offset clamped to length
    return std::min(offset, length);
}

uint16_t EMSCRIPTEN_KEEPALIVE getImageWidth(int32_t startOfFrameOffset, const uint8_t* buffer, int32_t length)
{
    if (!areInputsValid(startOfFrameOffset, buffer, length) ||
        !isStartOfImagePresent(buffer, length) ||
        !isStartOfFramePresent(startOfFrameOffset, buffer, length))
    {
        // If all else fails, say the image width is 0
        return 0;
    }

    // Check the Start of Frame segment is well-formed
    const int32_t widthOffset = 5;
    int32_t offset = startOfFrameOffset + 2;
    if (!canGetWord(offset, length) || getWord(offset, buffer, length) < 2 + widthOffset)
    {
        return 0;
    }

    offset += widthOffset;
    if (!canGetWord(offset, length))
    {
        return 0;
    }

    return getWord(offset, buffer, length);
}

uint16_t EMSCRIPTEN_KEEPALIVE getImageHeight(int32_t startOfFrameOffset, const uint8_t* buffer, int32_t length)
{
    if (!areInputsValid(startOfFrameOffset, buffer, length) ||
        !isStartOfImagePresent(buffer, length) ||
        !isStartOfFramePresent(startOfFrameOffset, buffer, length))
    {
        // If all else fails, say the image height is 0
        return 0;
    }

    // Check the Start of Frame segment is well-formed
    const int32_t heightOffset = 3;
    int32_t offset = startOfFrameOffset + 2;
    if (!canGetWord(offset, length) || getWord(offset, buffer, length) < 2 + heightOffset)
    {
        return 0;
    }

    offset += heightOffset;
    if (!canGetWord(offset, length))
    {
        return 0;
    }

    return getWord(offset, buffer, length);
}

int32_t EMSCRIPTEN_KEEPALIVE getScanEndOffset(int32_t startOffset, const uint8_t* buffer, int32_t length)
{
    if (!areInputsValid(startOffset, buffer, length) || !isStartOfImagePresent(buffer, length))
    {
        // If all else fails, say the current scan occupies the whole buffer
        return length;
    }

    // Continue from the previous offset or immediately after the SOI marker
    int32_t offset = std::max(2, startOffset);

    // Find start of next scan
    while(offset < length)
    {
        offset = findNextMarker(offset, buffer, length);
        if (!canGetWord(offset, length))
        {
            offset = length;
            break;
        }

        uint16_t marker = getWord(offset, buffer, length);
        offset += 2;

        offset = skipMarkerSegment(offset, buffer, length);

        if (marker == MARKER_SOS)
        {
            DEBUG_LOG("Next scan starts @ %d", offset);

            break;
        }

        DEBUG_LOG("  Skipping non-SOS marker %04x @ %d", marker, offset);
    }

    // Find next real marker after the scan
    while(offset < length)
    {
        offset = findNextMarker(offset, buffer, length);
        if (!canGetWord(offset, length))
        {
            offset = length;
            break;
        }

        uint16_t marker = getWord(offset, buffer, length);

        // Keep looking if we find any of these markers
        if (marker == MARKER_IGNORE || marker == MARKER_DNL || isRestartMarker(marker))
        {
            DEBUG_LOG("  Skipping marker %04x @ %d", marker, offset);

            offset += 2;
            continue;
        }

        // Any other marker signifies the end of the scan, so exit the loop
        DEBUG_LOG("Next scan ends with marker %04x @ %d", marker, offset);
        break;
    }

    // Return end offset clamped to length
    return std::min(offset, length);
}

}

static bool areInputsValid(int32_t startOffset, const uint8_t* buffer, int32_t length)
{
    DEBUG_LOG("Inputs: startOffset=%d, buffer=%p, length=%d", startOffset, buffer, length);

    // Validate inputs
    if (buffer == nullptr || length <= 0 || !canGetByte(startOffset, length))
    {
        DEBUG_LOG("Invalid inputs, exiting...");

        return false;
    }

    return true;
}

static bool isStartOfImagePresent(const uint8_t* buffer, int32_t length)
{
    // Check for the JPEG SOI marker at the start of the buffer
    if (!canGetWord(0, length) || getWord(0, buffer, length) != MARKER_SOI)
    {
#ifdef EMSCRIPTEN_DEBUG
        DEBUG_LOG("Invalid image: No SOI marker");
        DEBUG_LOG("  canGetWord(0, %d) = %d", length, canGetWord(0, length));

        if (canGetWord(0, length))
        {
            DEBUG_LOG("  getWord(0, %p, %d) = %04x", buffer, length, getWord(0, buffer, length));
        }
#endif // EMSCRIPTEN_DEBUG

        return false;
    }

    return true;
}

static bool isStartOfFramePresent(int32_t startOfFrameOffset, const uint8_t* buffer, int32_t length)
{
    // Check for the JPEG SOF marker
    if (!canGetWord(startOfFrameOffset, length) ||
        !isStartOfFrameMarker(getWord(startOfFrameOffset, buffer, length)))
    {
#ifdef EMSCRIPTEN_DEBUG
        DEBUG_LOG("Invalid image: No SOF marker");
        DEBUG_LOG("  canGetWord(%d, %d) = %d", startOfFrameOffset, length, canGetWord(startOfFrameOffset, length));

        if (canGetWord(0, length))
        {
            DEBUG_LOG("  getWord(%d, %p, %d) = %04x", startOfFrameOffset, buffer, length, getWord(startOfFrameOffset, buffer, length));
        }
#endif // EMSCRIPTEN_DEBUG

        return false;
    }

    return true;
}

static bool canGetByte(int32_t offset, int32_t length)
{
    return offset >= 0 && offset < length;
}

static uint8_t getByte(int32_t offset, const uint8_t* buffer, int32_t length)
{
    return buffer[offset];
}

static bool canGetWord(int32_t offset, int32_t length)
{
    return offset >= 0 && (offset + 1) < length;
}

static uint16_t getWord(int32_t offset, const uint8_t* buffer, int32_t length)
{
    return (static_cast<uint16_t>(buffer[offset]) << CHAR_BIT) | buffer[offset + 1];
}

static int32_t findNextMarker(int32_t offset, const uint8_t* buffer, int32_t length)
{
    // Advance past non-marker bytes
    while (canGetByte(offset, length) && getByte(offset, buffer, length) != MARKER_PREFIX)
    {
        offset++;
    }

    // Advance to last marker prefix byte
    while (canGetByte(offset + 1, length) && getByte(offset + 1, buffer, length) == MARKER_PREFIX)
    {
        offset++;
    }

    return offset;
}

static int32_t skipMarkerSegment(int32_t offset, const uint8_t* buffer, int32_t length)
{
    if (!canGetWord(offset, length))
    {
        // If all else fails, say the current scan occupies the whole buffer
        return length;
    }

    return offset + getWord(offset, buffer, length);
}

static bool isStartOfFrameMarker(uint16_t marker)
{
    const bool isInSOFMarkerRange = ((marker & MASK_SOF) == MARKER_SOF0);
    return isInSOFMarkerRange && !(marker == MARKER_DHT || marker == MARKER_JPG || marker == MARKER_DAC);
}

static bool isRestartMarker(uint16_t marker)
{
    return (marker & ~MASK_RESTART_MODULUS) == MARKER_RESTART0;
}
