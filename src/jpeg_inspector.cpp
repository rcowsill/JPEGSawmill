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

// Zero-stuffed "marker" used to escape real 0xFF values in the coded scan data
static const uint16_t MARKER_IGNORE = 0xFF00;

// Define number of lines marker (may follow the first scan, needs to be retained with it)
static const uint16_t MARKER_DNL = 0xFFDC;

// Restart marker for resynchronization after error or parallel decode
static const uint16_t MARKER_RESTART0 = 0xFFD0;
static const uint16_t MASK_RESTART_MODULUS = 0x0007;


// Prototypes
static bool canGetByte(int32_t offset, int32_t length);
static uint8_t getByte(int32_t offset, const uint8_t* buffer, int32_t length);
static bool canGetWord(int32_t offset, int32_t length);
static uint16_t getWord(int32_t offset, const uint8_t* buffer, int32_t length);
static int32_t findNextMarker(int32_t offset, const uint8_t* buffer, int32_t length);
static int32_t skipMarkerSegment(int32_t offset, const uint8_t* buffer, int32_t length);
static bool isRestartMarker(uint16_t marker);


extern "C" {

int32_t EMSCRIPTEN_KEEPALIVE getScanEndOffset(int32_t startOffset, const uint8_t* buffer, int32_t length)
{
    DEBUG_LOG("Inputs: startOffset=%d, buffer=%p, length=%d", startOffset, buffer, length);

    // Validate inputs
    if (buffer == nullptr || length <= 0 || !canGetByte(startOffset, length))
    {
        DEBUG_LOG("Invalid inputs, exiting...");

        // If all else fails, say the current scan occupies the whole buffer
        return length;
    }

    // Check for the JPEG SOI marker
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

        return length;
    }

    // Continue from the previous offset or immediately after the SOI marker
    int32_t offset = std::max(2, startOffset);

    // Find start of next scan
    while(offset < length)
    {
        offset = findNextMarker(offset, buffer, length);
        if (canGetWord(offset, length))
        {
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
    }

    // Find next real marker after the scan
    while(offset < length)
    {
        offset = findNextMarker(offset, buffer, length);
        if (canGetWord(offset, length))
        {
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
    }

    // Return end offset clamped to length
    return std::min(offset, length);
}

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

static bool isRestartMarker(uint16_t marker)
{
    return (marker & ~MASK_RESTART_MODULUS) == MARKER_RESTART0;
}
