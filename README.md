# simplat
A very simple platformer framework with a [level and texture editor](https://github.com/rokie95/simplat_editors). The web player is written completely in Javascript and bits of HTML. Levels are stored in JSON format, you can see it in the [smb11.json file](https://raw.githubusercontent.com/rokie95/simplat_web/master/smb11.json). The script is a bit of a mess but it makes enough sense to edit.

## Controls
- ``W`` or ``Up Arrow`` to jump
- ``AD`` or ``Left and Right Arrow`` to move left and right

## Screenshots
![](https://raw.githubusercontent.com/rokie95/simplat_web/docs/screenshots/simplatscreenshot1.png)
![](https://raw.githubusercontent.com/rokie95/simplat_web/docs/screenshots/simplatscreenshot2.png)

## Slideshow (EXPERIMENTAL)
![](https://raw.githubusercontent.com/rokie95/simplat_web/docs/screenshots/simplatslideshowscreenshot.png)
As soon as you start the game your movements are stored and can be played through at different speeds.

- ``P`` to enter slideshow mode
- ``O`` to exit slideshow mode
- Hold ``Left Arrow`` to play in reverse
- Hold ``Right Arrow`` to play faster
- ``Up Arrow`` to raise the game speed by a factor of 2
- ``Down Arrow`` to lower the game speed by a factor of 2

## Debug mode
Debug mode can be enabled by pressing ``\``
![](https://raw.githubusercontent.com/rokie95/simplat_web/docs/screenshots/simplatscreenshot3.png)

Debug mode has some special properties like those listed below
- you cannot die
- display the overlay
- ``Q`` and ``E`` to manually move the scroll left and right respectively
- ``Down Arrow`` to crouch but sprite does not scale currently

## Build into an executable
requires [electron-packager](https://www.npmjs.com/package/electron-packager)

To make a linux build run:
``npm run package-linux``

To make a windows build run:
``npm run package-win``

To make a mac build run:
``npm run package-mac``
(has not been tested)
