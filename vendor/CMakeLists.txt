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

project("JPEGSawmill-Vendor" VERSION 0.1.0 LANGUAGES CXX)

# LittleTest library
add_library(liblittletest INTERFACE EXCLUDE_FROM_ALL)
target_compile_features(liblittletest INTERFACE "cxx_std_20")
target_sources(liblittletest INTERFACE "liblittletest/src/littletest.hpp")
target_include_directories(liblittletest INTERFACE "liblittletest/src")
