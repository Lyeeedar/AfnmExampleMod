---
layout: default
title: ComfyUI Setup & Workflows
parent: Guides
nav_order: 10
description: 'How to install ComfyUI Desktop and use the provided AI image generation workflows'
---

# ComfyUI Setup & Workflows

This guide walks through installing ComfyUI Desktop and using the workflows provided with this mod template to generate game-ready assets (character portraits, item icons, location backgrounds, etc.).

---

## Prerequisites

- A GPU with at least 6 GB VRAM (8 GB+ recommended)
- Windows 10/11 (ComfyUI Desktop is available for Windows and macOS)
- Sufficient disk space — base models alone can be 5–20 GB

---

## Step 1: Install ComfyUI Desktop

ComfyUI Desktop is the easiest way to run ComfyUI without touching the command line.

1. Go to the [ComfyUI Desktop releases page](https://github.com/Comfy-Org/desktop/releases) and download the latest installer for your platform (e.g. `ComfyUI_windows_x64_installer.exe`).

2. Run the installer and follow the on-screen prompts. The default install location is fine for most users.

3. Launch **ComfyUI Desktop** from your Start Menu or desktop shortcut.

4. On first launch, the app will run a setup wizard:
   - Select your GPU type (NVIDIA, AMD, or CPU-only).
   - Choose where to store models and outputs — pick a drive with plenty of free space.
   - Let the wizard download any required base components.

5. Once setup completes, ComfyUI will open in your browser at `http://127.0.0.1:8188`. The Desktop app manages the server process for you in the background.

---

## Step 2: Install Required Models

The base model I use is a finetune of `Illustrious` called `ChosenMix`. You can find it here [download](https://civitai.com/models/1064295?modelVersionId=2840523).

Download it and put it into the `{ComfyUI}/models/checkpoints` folder.

Then download the AFNM Lora's and put them into the `{ComfyUI}/models/loras/afnm` folder.

- [Afnm Style](https://civitai.com/models/2525262/afnm-style-il)
- [Afnm Character](https://civitai.com/models/2537568/afnm-character-il)
- [Afnm Location Icon](https://civitai.com/models/2536944/afnm-location-icon-il)
- [Afnm Location Background](https://civitai.com/models/2535109/afnm-location-il)
- [Afnm Monster](https://civitai.com/models/2525743/afnm-monster-il)
- [Afnm Technique](https://civitai.com/models/2527262/afnm-technique-il)
- [Afnm Item](https://civitai.com/models/2527275/afnm-item-il)

And finally, the controlnet model [noobaiXLControlnet_epsLineartAnime](https://civitai.com/models/929685/noobai-xl-controlnet?modelVersionId=1049196) into `{ComfyUI}/models/controlnet`.

---

## Step 3: Install Custom Nodes

ComfyUI manager should prompt you to download any node packs you are missing, but just for completeness you want these:

- ComfyUI-KJNodes
- rgthree-comfy
- ComfyUI-Easy-Use
- ComfyUI Impact Pack
- WAS Node Suite (Revised)
- ComfyUI-RMBG
- Keep Largest Blob
- comfyui_controlnet_aux

---

## Step 4: Load a Workflow

Now download the workflows zip [afnm-workflows](https://civitai.com/models/2535142/afnm-workflows). This contains the following workflows.

- `character-IL`: Used to generate character and npc images
- `item-IL`: Used to generate item images.
- `locationBg-IL`: Used to generate location and screen background images.
- `locationicon-IL`: Used to generate icons for locations and mine nodes.
- `monster-IL`: Used to generate monster images.
- `technique-IL`: Used to generate icons for techniques, crafting actions, buffs, blessings, etc.
- `poseGeneration`: Used to take a base image for character and monsters and render pose variations. This workflow requires a lot more models (the wan 2.2 range, but ComfyUI should prompt you to download them). It is also slow.

All workflows output the image in the final required resolution, with backgrounds removed and slight dropshadow added. Ready to be used by the game.
