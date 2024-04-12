# JPEG Sawmill

## Overview

JPEG Sawmill is a web application that splits up progressive JPEGs into their individual scans.
The image resulting from each scan can be viewed, as well as the differences between adjacent
images in the series. Progressive display can also be simulated in slow motion, as if the
image is being downloaded over a slow connection.


## Background

The JPEG image standard supports both sequential and progressive encoding modes. Sequential
JPEGs are encoded in a single "scan" from top left to bottom right. Progressive JPEGs
reconstruct the image in a series of scans, where each subsequent scan improves image quality. 

Progressive mode is useful for websites, as the initial scans quickly provide an acceptable
placeholder while the rest is downloaded. Also, progressive JPEGs usually reduce file size
because the rearranged image data is more compressible.

JPEG progressive mode is highly customisable[^1]; the settings can be tuned for specific use
cases or even optimised per-image.


## Implementation Details

Images are split into their constituent scans using the same general approach as "[JPEG Scan Killer](#user-content-jsk)".
First, the markers at the end of each scan are located using the jpeg_inspector library. Then new
images are created, containing all the data before each marker with an "End of Image" marker
appended.

The jpeg_inspector library was designed for use as a WebAssembly module. It avoids using file IO,
so emscripten's virtual file system isn't needed. Instead the API just lets the calling JavaScript
get the offset of the end of the next scan. This cuts the resulting .wasm size down to 8kB for a
release build [^2].

On the JavaScript side, the new images for each scan are made using subarrays of the full JPEG
buffer. These are views onto the same underlying data. To display the images, `createObjectUrl`
is used to allow them to be referenced from the DOM. This means the scan images don't need
encoding as base64 data URLs.

This design means the memory required for processing is roughly twice the file size[^3][^4].


## Thanks to:

* Frederic Kayser for showing how to split a progressive JPEG into individual scans.
  * <a id="user-content-jsk"></a>[JSK -JPEG Scan Killer- progressive JPEG explained in slowmo](https://web.archive.org/web/20160830024109/http://encode.ru/threads/1800-JSK-JPEG-Scan-Killer-progressive-JPEG-explained-in-slowmo)
  * [Source code (jsk.c)](https://gist.github.com/rcowsill/3fc903c92faaed7a9da745cde9f83799)

* Karl Thibault for showing how to use Emscripten to embed JSK in a web app
  * https://github.com/Notuom/progressive-jpeg-scans

* The Emscripten authors for [Emscripten](https://emscripten.org)
  * https://github.com/emscripten-core/emscripten

* Sebastiano Merlino for liblittletest
  * https://github.com/etr/liblittletest


[^1]: Unfortunately JPEG encoders often hide this complexity behind a simple checkbox which activates progressive encoding with preset parameters.
[^2]: Plus a 3kB JavaScript wrapper module from Emscripten
[^3]: One copy of the file for JavaScript and another in WebAssembly linear memory
[^4]: This is in addition to the memory the browser needs to decode and display each scan
