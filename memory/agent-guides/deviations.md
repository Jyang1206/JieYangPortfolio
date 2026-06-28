# Accepted Deviations

| Deviation | Location | Why accepted |
|---|---|---|
| npm is the active package manager even though the original brief mentioned pnpm examples. | `package-lock.json`, `package.json` | The repo currently has an npm lockfile and scripts work through npm. Switching package managers would add churn without improving the portfolio. |
| Real project models use available filenames rather than the originally suggested canonical names. | `data/projects.ts`, `public/models/` | The repo already contains converted assets such as `xarm5-xf1300.glb`, `amr.glb`, and `agv-forklifter.glb`; the data layer points to the assets that exist. |
| Some project scenes are polished placeholders rather than final detailed simulations. | `components/three/scenes/` | The build strategy prioritizes architecture and one strong vertical slice before perfecting every scene. Placeholders keep routes usable while assets evolve. |
| The embedded SEER simulation artifact lives under `public/seer/` instead of being rebuilt from source inside this Next app. | `public/seer/`, `components/home/MjswanSimEmbed.tsx`, `components/project/MjswanProjectEmbed.tsx` | It preserves a working external artifact and lets the portfolio frame it without taking ownership of its build system. |

Add rows for tradeoffs a future agent might otherwise reverse while trying to "clean up" the repo.
