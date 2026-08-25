# Outfits — production GLBs

Place production assets here (Draco + KTX2 + Meshopt recommended):

- white-shirt.glb      // LOOK 01: White Signature Shirt (outfit shirt-01)
- black-silk-shirt.glb // LOOK 02: Black Silk Shirt (shirt-02)
- beige-jacket.glb     // LOOK 03: Beige Structured Jacket (jacket-03)
- dark-suit.glb        // LOOK 04: Dark Luxury Suit (suit-final)
- trousers.glb         // shared trousers (lerped per outfit)
- shoes.glb            // shared shoes

Each garment is loaded via useGLTF in its component (see src/components/3d/garments/*):

`	s
// WhiteShirt.tsx
import { useGLTF } from '@react-three/drei'
export function WhiteShirt(props) {
  // const { scene } = useGLTF('/models/outfits/white-shirt.glb')
  // return <primitive object={scene.clone()} />
  return <>{/* procedural fallback */}</>
}
`

Fallback procedural meshes remain for dev until assets arrive. OutfitController timeline (GarmentTransition) stays valid regardless — it drives group position/rotation/scale/panel separation via refs, so GLB just replaces inner meshes.

