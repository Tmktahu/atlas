![](https://i.imgur.com/apTDwvA.png)

[![GPLv3 License](https://img.shields.io/static/v1?label=Licence&message=GPL%20v3&color=green)](https://opensource.org/licenses/) [![GitHub Release](https://img.shields.io/static/v1?label=Version&message=2.1.0&color=blue)]() [![Discord](https://img.shields.io/static/v1?label=Discord&message=Click%20to%20Join&color=purple)](https://discord.gg/Vafdx5JWBh)

This is the repository for Atlas, coded by Fryke#0746 on Discord. Come check out the [Discord Server](https://discord.gg/Vafdx5JWBh).
<br>
_(Note this is not affiliated with the "Atlas Project" found [here](https://discord.gg/TURc9vNu))_

Atlas is an interactive 3D mapping tool for the game Starbase. This README will be updated with current features as the project is upgraded and added to.

## Features

- Interactive 3D scene to visualize locations in the game world.
- 3D objects for every celestial object in the game.
- Create waypoints with custom colors and icons.
- Delete, hide, or view waypoints easily.
- Locally stored information - no backend server. Leverages JSON files and LocalStorage for persistance.
- Import and export current waypoint set via JSON files.
- Website version or compiled executable version.

## How to use Atlas

You have 2 options.

1. Use the online website version found at <https://tmktahu.github.io/atlas/>. Uses LocalStorage to persist waypoint information in combination with uploading/exporting JSON files for sharing data.
2. Download the standalone application built on Electron from the [releases section](https://github.com/Tmktahu/atlas/releases) and run it wherever you want. It is a portable application, so it requires no installation. Operates on locally stored JSON files.

For information on how the coordinate grid is set up, check out the [Independant Positioning System](https://github.com/Tmktahu/IPS) repository and the wiki page I've written about [The Sacred Grid](https://github.com/Tmktahu/IPS/wiki/The-Sacred-Grid).

## Locally Stored Information

All waypoint information is stored locally on your computer in the form of JSON files. By default, Atlas functions off a `waypoint_data.json` file that is created in the directory where you run `Atlas.exe`. Atlas also allows you to save your current waypoint information or import waypoints from any JSON file of your choice.

For the website version, it loads default waypoint data on initial load and saves information to the [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) of your web browser. You can upload a custom JSON file to import waypoints and then download the current set of waypoints as a JSON file whenever you wish.

## Demo Video (Youtube)

<https://youtu.be/slYclXJ__5U>
<br>
<a href="https://youtu.be/slYclXJ__5U" target="_blank"><img src="https://i.imgur.com/odpcdZ0.png" width="50%"></a>

## Submitting Custom Icons

Atlas allows users to select icons for their custom waypoints. If you are interested, I would love to add your company logo to the options. Check out the wiki page [Submitting an Icon](https://github.com/Tmktahu/atlas/wiki/Submitting-an-Icon) for more information.

## Is this a virus?

No. You can read through the code yourself and [build it yourself](https://github.com/Tmktahu/atlas/wiki/How-To-Build) if you want. If you aren't familiar with coding shenanigans, then grab the EXE and run it through any virus scanning tool online or offline that you see fit. The executable won't do anything unless you run it, so it is 100% safe to download and analyze as you wish.
I've also taken the liberty to upload the current Atlas version executable to several different online virus scanning utilities:

- Virus Total: <https://www.virustotal.com/gui/file/75171d2a6bb0db461a222bc2dbfd55a923d4dbdecfe65fb0e150fd14cfe9bcee>
- Jotti: <https://virusscan.jotti.org/en-US/filescanjob/7vga5rrbh3>
- Kaspersky: <https://opentip.kaspersky.com/75171D2A6BB0DB461A222BC2DBFD55A923D4DBDECFE65FB0E150FD14CFE9BCEE/>

If this still doesn't convince you, feel free to try out the website version found at <https://tmktahu.github.io/atlas/>

## Want to help?

If you are interested in contributing to this project, feel free to look through the [Issues](https://github.com/Tmktahu/atlas/issues) to see what is currently being worked on. Any thoughts, comments, or PRs are much appreciated. If you have any questions or ideas, feel free to join the [IPS/Atlas Discord](https://discord.gg/Vafdx5JWBh).

## Special Thanks

- LoopHule#9398 for Elysium measurements.
- Rabir#7523 and EPIC Corp for their brilliant solar system map and moon distance measurements.
- Arch#6267 for his infograpbics and measurement information.
- Cycle_Of_Insanity#3074 for helping with company logo collection.
- Strikeeaglechase#0001 and [Starmap](https://github.com/Collective-SB/Starmap) for inspiration.
