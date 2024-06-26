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

#ifndef JPEG_INSPECTOR_H
#define JPEG_INSPECTOR_H

#include <cstdint>


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

extern int32_t getScanEndOffset(int32_t startOffset, const uint8_t* buffer, int32_t length);

#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JPEG_INSPECTOR_H
