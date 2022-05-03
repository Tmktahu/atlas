![](https://i.imgur.com/apTDwvA.png)

[![GPLv3 License](https://img.shields.io/static/v1?label=Licence&message=GPL%20v3&color=green)](https://opensource.org/licenses/) [![GitHub Release](https://img.shields.io/static/v1?label=Version&message=2.4.0&color=blue)]() [![Discord](https://img.shields.io/static/v1?label=Discord&message=Click%20to%20Join&color=purple)](https://discord.gg/Vafdx5JWBh)

This is the repository for Atlas, coded by Fryke#0746 on Discord. Come check out the [Discord Server](https://discord.gg/Vafdx5JWBh).
<br>
_(Note this is not affiliated with the "Atlas Project" found [here](https://discord.gg/TURc9vNu))_

Atlas is an interactive 3D mapping tool for the game Starbase. This README will be updated with current features as the project is upgraded and added to.

You can find the web version at <https://sb-atlas.org>.<br>
You can find the standalone Electron version in the [releases section](https://github.com/Tmktahu/atlas/releases).

## Features

- Interactive 3D scene to visualize locations in the game world.
- 3D objects for every celestial object in the game.
- Create waypoints with custom colors and icons.
- Delete, hide, or view waypoints easily.
- Locally stored information - no backend server. Leverages JSON files and LocalStorage for persistance.
- Import and export map data via JSON files.
- Website version or compiled executable version.

## Locally Stored Information, Web vs Electron

All waypoint information is stored locally on your computer in the form of JSON data. Where and how this information is stored depends on whether you are using the Web or Electron versions of the app.

If you are using the Web version of the app, JSON data is saved to the [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) of your web browser. This allows your changes to persist through refreshes and sessions.

If you are using the Electron version of the app, JSON data is saved to a default storage `atlas_data.json` file that is created in the same directory where you run `Atlas.exe`.

Both versions of the app allow you to import and export your map data as JSON files as you see fit. This is how you would share your map data with other people.

## Submitting Custom Icons

Atlas allows users to select icons for their custom waypoints. If you are interested, I would love to add your company logo to the options. Check out the wiki page [Submitting an Icon](https://github.com/Tmktahu/atlas/wiki/Submitting-an-Icon) for more information.

## Google Analytics

Unfortunately Github Pages doesn't provide deployment traffic information, so I use Google Analytics to collect basic usage data so I can tell if people are actually using Atlas. This lets me keep an eye on site traffic and gives me a source of motivation to continue developing the app. If this doesn't sit well with you, any basic ad-blocker will successfully stop Google Analytics in its tracks.

If you do use an ad-blocker, I would greatly appreciate it if you would consider giving this repository a star or hop in the discord and let me know that you use Atlas. The more I hear about people using this tool, the more I'll want to make it better.

## Want to help?

If you are interested in contributing to this project, feel free to look through the [Issues](https://github.com/Tmktahu/atlas/issues) to see what is currently being worked on. Any thoughts, comments, or PRs are much appreciated. If you have any questions or ideas, feel free to join the [IPS/Atlas Discord](https://discord.gg/Vafdx5JWBh).

## Special Thanks

- LoopHule#9398 for Elysium measurements.
- Rabir#7523 and EPIC Corp for their brilliant solar system map and moon distance measurements.
- Arch#6267 for his infographics and measurement information.
- Cycle_Of_Insanity#3074 for helping with company logo collection.
- Critblade#6851 for information on capital ships and moon measurements.
- Strikeeaglechase#0001 and [Starmap](https://github.com/Collective-SB/Starmap) for inspiration and object coordinates.
