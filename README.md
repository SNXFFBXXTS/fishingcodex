# Fishing Rig Codex

An interactive sea fishing rig builder and bait presentation guide, made for Essex shore fishing.

**Live:** https://snxffbxxts.github.io/fishingcodex/

## Rig builder

Pick a rig (flapper, clipped-down, Pennell, pulley, running ledger), the number of hooks, hook sizes and pattern, bait, snood length, line strengths, lead and beads. You can also start from a species preset (whiting, codling, flounder, dabs, thornback, smoothhound, bass, sole).

For each setup it gives you:
- **A to-scale diagram**, redrawn live, with "for the cast" and "on the seabed" views for clipped and pulley rigs
- **Checks**, such as snoods that will tangle, clips that land on the next station, or a hook that's wrong for the bait
- **A parts list** with specs and quantities
- **Step-by-step tying instructions** for that exact rig, linked to the knot guide

## Also included
- Step-by-step bait presentation cards: black lug (without the mush), half lug + squid tip, lug & squid cocktail, ragworm, peeler crab
- An elastic guide
- A knot guide: grinner, snood knot, dropper loop, surgeon's loop, loop-to-loop, crimping

## Files
- `index.html`: the page
- `style.css`: styles
- `app.js`: rig data, SVG renderer, instructions and bait cards. There's no build step and no dependencies.
