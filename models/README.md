# 3D Assets — drop production GLBs here

Replace procedural placeholders with production assets:

- male-model.glb       -> base body (shared skeleton/scale/origin)
- white-shirt.glb      -> LOOK 01 (shirt-01)  — outfit.garment.type = 'shirt'
- black-silk-shirt.glb -> LOOK 02 (shirt-02)  — type = 'silk-shirt'
- beige-jacket.glb     -> LOOK 03 (jacket-03) — type = 'jacket'
- statement-suit.glb   -> LOOK 04 (suit-final) — type = 'suit'

Each garment in FashionScene.tsx is an independent group (gWhite/gSilk/gJacket/gSuit) with front panels, sleeves, collar, lapels. To swap:

`	sx
import { useGLTF } from '@react-three/drei'
const { scene } = useGLTF('/models/white-shirt.glb')
// Inside <group ref={gWhite}> replace procedural meshes with <primitive object={scene} />
// Keep same refs (wLeft/wRight etc.) or bind morphTargets/skeleton to OutfitController timeline.
`

Keep same origin/scale (model at y -0.95) so OutfitController translation/rotation/scale timeline stays valid.
