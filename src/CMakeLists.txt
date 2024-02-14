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

project("JPEGSawmill-Src" VERSION 0.1.0 LANGUAGES CXX)

# JPEG inspector library (using object files to avoid dead-code removal)
add_library(lib_jpeg_inspector OBJECT)
target_sources(lib_jpeg_inspector PUBLIC "jpeg_inspector.h")
target_sources(lib_jpeg_inspector PRIVATE "jpeg_inspector.cpp")
target_include_directories(lib_jpeg_inspector PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}")
