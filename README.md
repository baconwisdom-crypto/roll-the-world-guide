# Roll the World Guide

Independent English fan guide for the Roblox experience by overzeer.

Source: `I:\游戏站\roll-the-world`

Materials: `I:\游戏站\_素材\roll-the-world`

Temporary downloads: `I:\游戏站\_临时下载\roll-the-world`

Publishing workspace: `I:\游戏站\_发布工作区\roll-the-world`

## Build and release

Use Node 22.18.0 or a newer compatible 22.x version. Install with `npm ci`, then run `npm run verify`. The static output is `out`.

Use a project-owned dependency directory for local validation. Production installs independently from `package-lock.json`. Webpack is selected explicitly for reproducible static builds.

GitHub repository: https://github.com/baconwisdom-crypto/roll-the-world-guide

Cloudflare Pages project: `roll-the-world-guide`, production branch `main`, build `npm run verify`, output `out`, Node `22.18.0`.

Canonical host: `https://www.rolltheworldwiki.wiki`.

## Content and evidence

11 registered English pages. 11 unique gameplay screenshots are bound to content sections through `content/video-evidence.json`. The compact manifest and assets are included in Git so CI does not require the private research directory.

Run `npm run check:video-evidence` to validate the committed bindings. The private acceptance test also checks a clean input without research and rejects a missing manifest, mismatched source or incorrect section binding.

Sources, unpublished gaps and exact frame times are preserved in the private research and material directories. Code redemption, the actual space transition and a complete rarity formula are not personally verified.

Ads are disabled in all placements. No ad account application, advertising code or ad request is included in this release. The existing optional 160×600 rail remains available for a future configured release.
