# delaunay-10k

This is my entry for the 2016 10k Apart contest. It's a simple application that lets the user
create a background filled with triangles. If JavaScript is enabled, it uses canvas to generate
the image in the browser, otherwise it behaves like a regular form and sends a request to the server.

_The server might be a bit slow, since I'm not familiar with the Azure cloud and used only pure JS
dependencies instead of native modules, including server-side canvas implementation and JPEG encoder._

I tried to keep the preview image as lightweight as possible, so that previewing without JS
also does not exceed 10 KB.

In case anyone is reading the source, the `<output>`s were supposed to be dynamic, but I ran out
of time and kilobytes :(
