import type { FC, ReactNode } from 'react'

/*
 * The Nom Nom Gacha food icon library.
 * One shared style: 64×64 viewBox, warm brown outline, soft rounded shapes,
 * two-tone cel shading and a little sparkle highlight on every dish.
 */

const O = '#5b4a32' // warm outline
const stroke = { stroke: O, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const thin = { ...stroke, strokeWidth: 1.8 } as const

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M ${x} ${y - 3 * s} Q ${x + 0.8 * s} ${y - 0.8 * s} ${x + 3 * s} ${y} Q ${x + 0.8 * s} ${y + 0.8 * s} ${x} ${y + 3 * s} Q ${x - 0.8 * s} ${y + 0.8 * s} ${x - 3 * s} ${y} Q ${x - 0.8 * s} ${y - 0.8 * s} ${x} ${y - 3 * s} Z`}
      fill="#fffdf5"
      opacity={0.95}
    />
  )
}

function Plate({ cy = 46, rx = 24, ry = 9 }: { cy?: number; rx?: number; ry?: number }) {
  return (
    <>
      <ellipse cx={32} cy={cy} rx={rx} ry={ry} fill="#dfeaf5" {...stroke} />
      <ellipse cx={32} cy={cy - 1.5} rx={rx - 6} ry={ry - 4} fill="#f2f7fc" stroke="none" />
    </>
  )
}

function Steam({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" {...thin} opacity={0.75}>
      <path d={`M ${x - 6} ${y} q -2.5 -4 0 -7 q 2.5 -3 0 -7`} />
      <path d={`M ${x + 4} ${y + 1} q -2.5 -4 0 -7 q 2.5 -3 0 -7`} />
    </g>
  )
}

const Pasta: FC = () => (
  <g>
    <Plate />
    <path
      d="M 12 44 Q 12 28 32 28 Q 52 28 52 44 Q 42 50 32 50 Q 22 50 12 44 Z"
      fill="#f7cf74"
      {...stroke}
    />
    <g fill="none" {...thin} opacity={0.9}>
      <path d="M 16 40 Q 24 33 33 38 Q 42 43 48 37" stroke="#c98f2e" />
      <path d="M 18 44 Q 28 37 36 42 Q 44 47 50 41" stroke="#c98f2e" />
      <path d="M 20 35 Q 28 30 38 33" stroke="#c98f2e" />
    </g>
    <circle cx={26} cy={33} r={3.2} fill="#e2574c" {...thin} />
    <circle cx={40} cy={31} r={3.2} fill="#e2574c" {...thin} />
    <Sparkle x={47} y={26} />
  </g>
)

const Rice: FC = () => (
  <g>
    <Steam x={32} y={18} />
    <path d="M 22 28 Q 32 20 42 28 Q 46 31 45 34 L 19 34 Q 18 31 22 28 Z" fill="#fdfaf1" {...stroke} />
    <path d="M 12 34 L 52 34 Q 52 48 32 50 Q 12 48 12 34 Z" fill="#7fb3d9" {...stroke} />
    <path d="M 14 38 Q 32 42 50 38" fill="none" {...thin} stroke="#4a80ab" />
    <g fill="none" {...thin} stroke="#d8cfae" opacity={0.9}>
      <path d="M 26 26 q 2 -1.5 4 0" />
      <path d="M 33 29 q 2 -1.5 4 0" />
    </g>
    <Sparkle x={45} y={22} />
  </g>
)

const Porridge: FC = () => (
  <g>
    <Steam x={30} y={16} />
    <path d="M 10 28 L 54 28 Q 54 46 32 48 Q 10 46 10 28 Z" fill="#e2574c" {...stroke} />
    <ellipse cx={32} cy={28} rx={22} ry={6} fill="#f6ead6" {...stroke} />
    <path d="M 20 27 Q 26 24 32 27 Q 38 30 44 27" fill="none" {...thin} stroke="#d9b98a" />
    <circle cx={32} cy={28} r={2.6} fill="#c9822e" stroke="none" />
    <path d="M 48 20 L 56 12" fill="none" {...stroke} />
    <ellipse cx={57.5} cy={10.5} rx={3.5} ry={2.5} fill="#d8cfae" {...thin} transform="rotate(-45 57.5 10.5)" />
    <Sparkle x={14} y={20} />
  </g>
)

const Oatmeal: FC = () => (
  <g>
    <Steam x={32} y={16} />
    <path d="M 10 28 L 54 28 Q 54 46 32 48 Q 10 46 10 28 Z" fill="#7fa65a" {...stroke} />
    <ellipse cx={32} cy={28} rx={22} ry={6} fill="#f0e3c8" {...stroke} />
    <g stroke="none" fill="#c9a35e">
      <ellipse cx={24} cy={27} rx={2.2} ry={1.3} />
      <ellipse cx={32} cy={29} rx={2.2} ry={1.3} />
      <ellipse cx={40} cy={27} rx={2.2} ry={1.3} />
    </g>
    <circle cx={36} cy={26} r={2.4} fill="#5d8fc2" {...thin} />
    <circle cx={28} cy={25} r={2.4} fill="#5d8fc2" {...thin} />
    <Sparkle x={50} y={20} />
  </g>
)

const Soup: FC = () => (
  <g>
    <Steam x={32} y={14} />
    <path d="M 8 26 L 56 26 Q 56 46 32 48 Q 8 46 8 26 Z" fill="#f0a13c" {...stroke} />
    <ellipse cx={32} cy={26} rx={24} ry={6.5} fill="#f7c96e" {...stroke} />
    <g stroke="none">
      <circle cx={24} cy={25} r={2.8} fill="#e2574c" />
      <circle cx={38} cy={27} r={2.5} fill="#7fa65a" />
      <circle cx={32} cy={24} r={2} fill="#f6ead6" />
      <circle cx={44} cy={25} r={1.8} fill="#e2574c" />
    </g>
    <path d="M 8 30 q -4 0 -3 4" fill="none" {...stroke} />
    <path d="M 56 30 q 4 0 3 4" fill="none" {...stroke} />
    <Sparkle x={52} y={16} />
  </g>
)

const Tortilla: FC = () => (
  <g>
    <path d="M 14 46 Q 10 24 30 16 Q 52 10 52 22 L 50 46 Q 48 52 32 52 Q 16 52 14 46 Z" fill="#f2dcae" {...stroke} />
    <path d="M 30 16 Q 52 10 52 22 Q 42 26 30 24 Q 24 21 30 16 Z" fill="#e8c98a" {...stroke} />
    <g stroke="none">
      <circle cx={34} cy={20} r={2.4} fill="#7fa65a" />
      <circle cx={42} cy={19} r={2.2} fill="#e2574c" />
      <circle cx={47} cy={21} r={1.8} fill="#f7cf74" />
    </g>
    <path d="M 20 34 Q 32 38 46 34" fill="none" {...thin} stroke="#cfa964" />
    <Sparkle x={16} y={22} />
  </g>
)

const Pizza: FC = () => (
  <g>
    <path d="M 32 54 L 12 16 Q 32 6 52 16 Z" fill="#f7cf74" {...stroke} />
    <path d="M 12 16 Q 32 6 52 16 L 49.5 21 Q 32 12.5 14.5 21 Z" fill="#e2574c" {...stroke} />
    <circle cx={28} cy={28} r={4} fill="#e2574c" {...thin} />
    <circle cx={38} cy={32} r={3.4} fill="#e2574c" {...thin} />
    <circle cx={31} cy={42} r={2.8} fill="#e2574c" {...thin} />
    <path d="M 22 27 q 3 3 0 6 M 40 24 q -3 2 -6 0" fill="none" {...thin} stroke="#d9a83c" />
    <Sparkle x={47} y={27} />
  </g>
)

const Pancakes: FC = () => (
  <g>
    <Plate cy={50} rx={25} ry={7} />
    <ellipse cx={32} cy={44} rx={21} ry={6} fill="#e8b45a" {...stroke} />
    <ellipse cx={32} cy={38} rx={20} ry={6} fill="#f0c46e" {...stroke} />
    <ellipse cx={32} cy={32} rx={19} ry={6} fill="#e8b45a" {...stroke} />
    <path d="M 20 30 Q 20 36 26 37 L 24 30 M 44 29 Q 45 35 40 37" fill="none" {...thin} stroke="#a3691f" opacity={0.7} />
    <path d="M 13 32 Q 20 26 32 26 Q 44 26 51 32 Q 44 36 32 36 Q 20 36 13 32 Z" fill="#c97b3d" {...stroke} opacity={0.95} />
    <rect x={27} y={20} width={10} height={7} rx={2} fill="#faf3d9" {...stroke} />
    <Sparkle x={49} y={20} />
  </g>
)

const FishFingers: FC = () => (
  <g>
    <Plate cy={49} rx={25} ry={7} />
    <g transform="rotate(-8 32 32)">
      <rect x={12} y={20} width={40} height={9} rx={4.5} fill="#e8a54a" {...stroke} />
      <rect x={12} y={31} width={40} height={9} rx={4.5} fill="#f0b45c" {...stroke} />
      <g stroke="none" fill="#c9822e" opacity={0.85}>
        <circle cx={20} cy={24.5} r={1.1} />
        <circle cx={30} cy={23.5} r={1.1} />
        <circle cx={41} cy={25} r={1.1} />
        <circle cx={24} cy={36} r={1.1} />
        <circle cx={36} cy={34.5} r={1.1} />
        <circle cx={45} cy={36} r={1.1} />
      </g>
    </g>
    <Sparkle x={51} y={17} />
  </g>
)

const Meatballs: FC = () => (
  <g>
    <Plate cy={47} rx={25} ry={8} />
    <circle cx={22} cy={34} r={8.5} fill="#9c6b3f" {...stroke} />
    <circle cx={40} cy={32} r={9.5} fill="#8a5c34" {...stroke} />
    <circle cx={31} cy={42} r={8} fill="#9c6b3f" {...stroke} />
    <g stroke="none" fill="#7a4e2a" opacity={0.8}>
      <circle cx={20} cy={31} r={1.2} />
      <circle cx={25} cy={36} r={1.2} />
      <circle cx={38} cy={29} r={1.2} />
      <circle cx={43} cy={34} r={1.2} />
      <circle cx={30} cy={44} r={1.2} />
    </g>
    <path d="M 34 26 q -2.5 -4 0 -7 q 2.5 -3 0 -7" fill="none" {...thin} opacity={0.7} />
    <Sparkle x={14} y={22} />
  </g>
)

const Sausage: FC = () => (
  <g>
    <Plate cy={48} rx={25} ry={7} />
    <path d="M 14 30 Q 14 20 24 20 L 44 20 Q 52 20 52 28 Q 52 36 44 36 L 24 36 Q 14 36 14 30 Z" fill="#c9724a" {...stroke} transform="rotate(-6 32 28)" />
    <path d="M 18 40 Q 18 34 26 34 L 46 33 Q 54 33 54 40 Q 54 46 46 46 L 26 46 Q 18 46 18 40 Z" fill="#b8613c" {...stroke} transform="rotate(4 36 40)" />
    <g fill="none" {...thin} stroke="#8f4527" opacity={0.8}>
      <path d="M 22 24 l 3 3 M 30 22.5 l 3 3 M 38 22 l 3 3" />
    </g>
    <Sparkle x={50} y={16} />
  </g>
)

const Burger: FC = () => (
  <g>
    <path d="M 12 26 Q 12 10 32 10 Q 52 10 52 26 Z" fill="#e8a54a" {...stroke} />
    <g stroke="none" fill="#faf3d9">
      <ellipse cx={24} cy={17} rx={1.6} ry={1.1} />
      <ellipse cx={33} cy={14} rx={1.6} ry={1.1} />
      <ellipse cx={41} cy={18} rx={1.6} ry={1.1} />
    </g>
    <path d="M 10 30 Q 14 24 20 30 Q 26 36 32 30 Q 38 24 44 30 Q 50 36 54 30 L 54 32 L 10 32 Z" fill="#7fa65a" {...stroke} />
    <rect x={12} y={32} width={40} height={6} rx={3} fill="#f7cf74" {...stroke} />
    <rect x={10} y={38} width={44} height={8} rx={4} fill="#8a5c34" {...stroke} />
    <path d="M 12 46 L 52 46 Q 52 54 32 54 Q 12 54 12 46 Z" fill="#e8a54a" {...stroke} />
    <Sparkle x={51} y={12} />
  </g>
)

const Bread: FC = () => (
  <g>
    <path d="M 12 24 Q 12 12 32 12 Q 52 12 52 24 L 52 48 Q 52 52 48 52 L 16 52 Q 12 52 12 48 Z" fill="#e8b45a" {...stroke} />
    <path d="M 17 27 Q 17 18 32 18 Q 47 18 47 27 L 47 45 Q 47 47 45 47 L 19 47 Q 17 47 17 45 Z" fill="#f6e6bd" {...stroke} />
    <g fill="none" {...thin} stroke="#d9a83c" opacity={0.8}>
      <path d="M 25 28 q 2 2 0 4 M 38 26 q -2 2 0 4 M 31 36 q 2 2 0 4" />
    </g>
    <Sparkle x={47} y={15} />
  </g>
)

const Yogurt: FC = () => (
  <g>
    <path d="M 18 20 L 46 20 L 43 50 Q 43 54 32 54 Q 21 54 21 50 Z" fill="#eef4fa" {...stroke} />
    <rect x={16} y={14} width={32} height={7} rx={3} fill="#5d8fc2" {...stroke} />
    <path d="M 22 30 Q 32 34 42 30" fill="none" {...thin} stroke="#b8cede" />
    <circle cx={32} cy={41} r={4.5} fill="#c25b7a" {...thin} />
    <circle cx={26} cy={44} r={2.6} fill="#e2574c" {...thin} />
    <path d="M 50 24 L 56 16" fill="none" {...stroke} />
    <ellipse cx={57} cy={14.5} rx={3.2} ry={2.4} transform="rotate(-45 57 14.5)" fill="#d8cfae" {...thin} />
    <Sparkle x={14} y={28} />
  </g>
)

const Toast: FC = () => (
  <g>
    <path d="M 14 26 Q 14 16 32 16 Q 50 16 50 26 L 50 46 Q 50 50 46 50 L 18 50 Q 14 50 14 46 Z" fill="#e8a54a" {...stroke} />
    <path d="M 18 28 Q 18 21 32 21 Q 46 21 46 28 L 46 43 Q 46 45 44 45 L 20 45 Q 18 45 18 43 Z" fill="#f0c46e" stroke="none" />
    <rect x={25} y={28} width={14} height={11} rx={2.5} fill="#faf3d9" {...stroke} />
    <path d="M 25 33 h 14" fill="none" {...thin} stroke="#d9a83c" />
    <Sparkle x={45} y={19} />
  </g>
)

const Taco: FC = () => (
  <g>
    <path d="M 10 46 Q 10 20 32 20 Q 54 20 54 46 Z" fill="#f0c46e" {...stroke} />
    <path d="M 16 46 Q 16 26 32 26 Q 48 26 48 46 Z" fill="#e8b45a" stroke="none" />
    <path d="M 14 40 Q 18 32 24 38 Q 30 44 36 37 Q 42 30 48 38 Q 50 41 50 46 L 14 46 Z" fill="#7fa65a" {...stroke} />
    <g stroke="none">
      <circle cx={22} cy={44} r={2.2} fill="#e2574c" />
      <circle cx={34} cy={43} r={2.2} fill="#e2574c" />
      <circle cx={44} cy={44} r={2} fill="#f6ead6" />
    </g>
    <Sparkle x={51} y={22} />
  </g>
)

const Chicken: FC = () => (
  <g>
    <path d="M 16 20 Q 8 32 18 42 Q 28 52 40 44 Q 52 36 44 22 Q 36 10 24 14 Q 18 16 16 20 Z" fill="#e8a54a" {...stroke} />
    <path d="M 22 22 Q 18 30 24 36" fill="none" {...thin} stroke="#c9822e" />
    <path d="M 40 44 L 50 52" fill="none" {...stroke} />
    <circle cx={52} cy={54} r={4} fill="#faf3d9" {...stroke} />
    <circle cx={56} cy={50} r={3.2} fill="#faf3d9" {...stroke} />
    <Sparkle x={14} y={14} />
  </g>
)

const Fish: FC = () => (
  <g>
    <path d="M 10 32 Q 22 18 38 22 Q 52 26 54 32 Q 52 38 38 42 Q 22 46 10 32 Z" fill="#7fb3d9" {...stroke} />
    <path d="M 54 32 L 62 24 Q 60 32 62 40 Z" fill="#5d8fc2" {...stroke} />
    <path d="M 30 22 Q 36 28 30 36" fill="none" {...thin} stroke="#4a80ab" />
    <path d="M 38 24 Q 44 30 38 38" fill="none" {...thin} stroke="#4a80ab" />
    <circle cx={20} cy={30} r={2.2} fill={O} stroke="none" />
    <path d="M 16 36 q 3 2 6 0" fill="none" {...thin} />
    <Sparkle x={50} y={18} />
  </g>
)

const Egg: FC = () => (
  <g>
    <path d="M 14 34 Q 10 22 22 18 Q 30 15 36 18 Q 42 21 48 20 Q 56 20 54 32 Q 52 44 40 47 Q 24 51 16 44 Q 12 40 14 34 Z" fill="#fdfaf1" {...stroke} />
    <circle cx={32} cy={33} r={8} fill="#f7c243" {...stroke} />
    <circle cx={29.5} cy={30.5} r={2.4} fill="#fbe08a" stroke="none" />
    <Sparkle x={49} y={13} />
  </g>
)

const Cheese: FC = () => (
  <g>
    <path d="M 8 40 L 32 16 Q 56 24 56 44 L 56 46 Q 56 48 54 48 L 10 48 Q 8 48 8 46 Z" fill="#f7cf74" {...stroke} />
    <path d="M 8 40 L 32 16 Q 38 18 43 21 L 14 46 L 10 48 Q 8 48 8 46 Z" fill="#fbe08a" {...stroke} />
    <circle cx={38} cy={38} r={3.6} fill="#e8b45a" {...thin} />
    <circle cx={48} cy={42} r={2.6} fill="#e8b45a" {...thin} />
    <circle cx={28} cy={42} r={2.2} fill="#e8b45a" {...thin} />
    <Sparkle x={50} y={20} />
  </g>
)

const Apple: FC = () => (
  <g>
    <path d="M 32 22 Q 30 14 24 12" fill="none" {...stroke} />
    <path d="M 32 20 Q 40 10 48 16 Q 42 22 32 20 Z" fill="#7fa65a" {...stroke} />
    <path d="M 32 24 Q 24 16 16 22 Q 8 30 14 42 Q 20 54 30 52 Q 31 51.5 32 51 Q 33 51.5 34 52 Q 44 54 50 42 Q 56 30 48 22 Q 40 16 32 24 Z" fill="#d9534a" {...stroke} />
    <path d="M 20 26 Q 15 31 17 38" fill="none" {...thin} stroke="#f2938c" />
    <Sparkle x={46} y={30} />
  </g>
)

const Banana: FC = () => (
  <g>
    <path d="M 14 18 Q 12 40 28 48 Q 44 56 54 44 Q 55 42 53 41 Q 38 46 28 36 Q 19 27 20 18 Q 20 15 17 15 Q 14 15 14 18 Z" fill="#f7cf74" {...stroke} />
    <path d="M 14 18 L 14 14 Q 14 12 17 12 L 19 12 Q 21 13 20 16" fill="#9c6b3f" {...stroke} />
    <path d="M 53 41 Q 56 42 56 45 L 54 47" fill="#9c6b3f" {...thin} />
    <path d="M 22 22 Q 24 34 34 41" fill="none" {...thin} stroke="#d9a83c" />
    <Sparkle x={44} y={22} />
  </g>
)

const Carrot: FC = () => (
  <g>
    <path d="M 40 14 Q 44 6 48 8 Q 50 12 44 16 Q 52 14 54 20 Q 52 24 44 22 Q 48 26 44 30 Q 40 30 38 24 Q 36 18 40 14 Z" fill="#7fa65a" {...stroke} />
    <path d="M 38 24 Q 44 30 36 40 Q 26 52 16 54 Q 10 55 11 49 Q 13 38 24 28 Q 32 21 38 24 Z" fill="#ec8b3f" {...stroke} />
    <g fill="none" {...thin} stroke="#c96b23">
      <path d="M 28 32 l 5 5 M 21 40 l 5 5" />
    </g>
    <Sparkle x={16} y={20} />
  </g>
)

const Broccoli: FC = () => (
  <g>
    <path d="M 28 36 L 28 48 Q 28 52 32 52 Q 36 52 36 48 L 36 36 Z" fill="#b5cf8e" {...stroke} />
    <circle cx={20} cy={26} r={9} fill="#6c9648" {...stroke} />
    <circle cx={34} cy={18} r={10} fill="#7fa65a" {...stroke} />
    <circle cx={45} cy={28} r={8} fill="#6c9648" {...stroke} />
    <circle cx={31} cy={30} r={8} fill="#7fa65a" {...stroke} />
    <g stroke="none" fill="#8fb86a" opacity={0.7}>
      <circle cx={17} cy={23} r={2} />
      <circle cx={33} cy={15} r={2} />
      <circle cx={46} cy={25} r={1.8} />
      <circle cx={29} cy={28} r={1.8} />
    </g>
    <Sparkle x={52} y={14} />
  </g>
)

const Potato: FC = () => (
  <g>
    <path d="M 12 34 Q 10 20 26 16 Q 44 12 52 24 Q 58 34 48 44 Q 36 54 22 48 Q 12 44 12 34 Z" fill="#d9b072" {...stroke} />
    <g stroke="none" fill="#b58e4f">
      <ellipse cx={24} cy={28} rx={2} ry={1.4} />
      <ellipse cx={40} cy={24} rx={2} ry={1.4} />
      <ellipse cx={34} cy={40} rx={2} ry={1.4} />
      <ellipse cx={20} cy={40} rx={1.6} ry={1.2} />
    </g>
    <Sparkle x={48} y={16} />
  </g>
)

const Fries: FC = () => (
  <g>
    <g {...stroke}>
      <rect x={20} y={10} width={6} height={22} rx={3} fill="#f7cf74" transform="rotate(-8 23 21)" />
      <rect x={29} y={8} width={6} height={24} rx={3} fill="#fbe08a" />
      <rect x={38} y={10} width={6} height={22} rx={3} fill="#f7cf74" transform="rotate(8 41 21)" />
    </g>
    <path d="M 14 28 L 50 28 L 46 50 Q 46 54 40 54 L 24 54 Q 18 54 18 50 Z" fill="#d9534a" {...stroke} />
    <path d="M 20 34 L 44 34" fill="none" {...thin} stroke="#a83c35" />
    <Sparkle x={51} y={18} />
  </g>
)

const Salad: FC = () => (
  <g>
    <path d="M 10 30 L 54 30 Q 54 48 32 50 Q 10 48 10 30 Z" fill="#e8dfc8" {...stroke} />
    <path d="M 14 30 Q 12 20 22 22 Q 20 14 30 18 Q 32 10 38 17 Q 46 12 46 21 Q 54 20 50 30 Z" fill="#7fa65a" {...stroke} />
    <circle cx={24} cy={26} r={3} fill="#e2574c" {...thin} />
    <circle cx={40} cy={25} r={3} fill="#e2574c" {...thin} />
    <path d="M 30 24 q 3 3 6 0" fill="none" {...thin} stroke="#5c7f3c" />
    <Sparkle x={52} y={14} />
  </g>
)

const Sandwich: FC = () => (
  <g>
    <path d="M 10 22 L 54 22 L 32 50 Z" fill="#f6e6bd" {...stroke} />
    <path d="M 10 18 L 54 18 L 54 22 L 10 22 Z" fill="#e8b45a" {...stroke} />
    <path d="M 13 22 Q 20 28 27 22 Q 34 16 41 22 Q 48 28 52 23 L 51 26 L 33 47 L 14 24 Z" fill="#7fa65a" stroke="none" />
    <path d="M 16 26 L 48 26 L 32 46 Z" fill="#f7cf74" {...thin} />
    <Sparkle x={50} y={12} />
  </g>
)

const Cereal: FC = () => (
  <g>
    <path d="M 34 12 L 50 8 L 51 14 L 36 17 Z" fill="#d9b072" {...stroke} />
    <path d="M 10 28 L 54 28 Q 54 46 32 48 Q 10 46 10 28 Z" fill="#5d8fc2" {...stroke} />
    <ellipse cx={32} cy={28} rx={22} ry={6} fill="#f6f1e4" {...stroke} />
    <g {...thin} fill="#f0c46e">
      <circle cx={22} cy={27} r={2.6} />
      <circle cx={31} cy={29} r={2.6} />
      <circle cx={40} cy={26.5} r={2.6} />
      <circle cx={47} cy={28} r={2.2} />
    </g>
    <Sparkle x={14} y={18} />
  </g>
)

const Smoothie: FC = () => (
  <g>
    <path d="M 20 18 L 44 18 L 40 50 Q 40 54 32 54 Q 24 54 24 50 Z" fill="#e88bb0" {...stroke} />
    <path d="M 21 26 L 43 26" fill="none" {...thin} stroke="#c25b7a" />
    <path d="M 22 18 L 34 8 L 38 10 L 28 18" fill="#f7cf74" {...stroke} />
    <circle cx={29} cy={36} r={2} fill="#fbd9e6" stroke="none" />
    <circle cx={35} cy={42} r={1.6} fill="#fbd9e6" stroke="none" />
    <Sparkle x={48} y={22} />
  </g>
)

const Waffle: FC = () => (
  <g>
    <path d="M 32 14 Q 44 14 50 24 Q 56 34 48 44 Q 40 54 32 54 Q 24 54 16 44 Q 8 34 14 24 Q 20 14 32 14 Z" fill="#e8b45a" {...stroke} />
    <g fill="none" {...thin} stroke="#c9822e">
      <path d="M 22 18 L 22 50 M 32 14 L 32 54 M 42 18 L 42 50" />
      <path d="M 12 28 L 52 28 M 12 40 L 52 40" />
    </g>
    <circle cx={37} cy={33} r={3.4} fill="#d9534a" {...thin} />
    <Sparkle x={50} y={16} />
  </g>
)

const Noodles: FC = () => (
  <g>
    <path d="M 16 10 L 58 22" fill="none" {...stroke} />
    <path d="M 14 16 L 56 28" fill="none" {...stroke} />
    <path d="M 10 30 L 54 30 Q 54 48 32 50 Q 10 48 10 30 Z" fill="#e2574c" {...stroke} />
    <path d="M 12 30 Q 18 22 26 27 Q 34 32 42 26 Q 48 22 52 30 Z" fill="#f7cf74" {...stroke} />
    <g fill="none" {...thin} stroke="#d9a83c">
      <path d="M 20 27 Q 26 24 30 28 M 34 28 Q 40 24 46 27" />
    </g>
    <Sparkle x={14} y={22} />
  </g>
)

const IceCream: FC = () => (
  <g>
    <path d="M 24 30 L 32 56 L 40 30 Z" fill="#e8b45a" {...stroke} />
    <g fill="none" {...thin} stroke="#c9822e">
      <path d="M 26 34 L 38 34 M 28 40 L 36 40 M 30 46 L 34 46" />
    </g>
    <circle cx={25} cy={22} r={8} fill="#f2b8cd" {...stroke} />
    <circle cx={39} cy={22} r={8} fill="#f6ead6" {...stroke} />
    <circle cx={32} cy={15} r={8} fill="#9c6b3f" {...stroke} />
    <Sparkle x={49} y={12} />
  </g>
)

const Plain: FC = () => (
  <g>
    <ellipse cx={32} cy={36} rx={25} ry={13} fill="#dfeaf5" {...stroke} />
    <ellipse cx={32} cy={34} rx={17} ry={8} fill="#f2f7fc" {...stroke} />
    <path d="M 26 32 q 3 4 12 1" fill="none" {...thin} stroke="#b8cede" />
    <Sparkle x={47} y={20} />
    <Sparkle x={16} y={24} s={0.7} />
  </g>
)

export interface FoodIconDef {
  id: string
  Component: FC
}

export const FOOD_ICONS: Record<string, FC> = {
  pasta: Pasta,
  rice: Rice,
  porridge: Porridge,
  oatmeal: Oatmeal,
  soup: Soup,
  tortilla: Tortilla,
  pizza: Pizza,
  pancakes: Pancakes,
  'fish-fingers': FishFingers,
  meatballs: Meatballs,
  sausage: Sausage,
  burger: Burger,
  bread: Bread,
  yogurt: Yogurt,
  toast: Toast,
  taco: Taco,
  chicken: Chicken,
  fish: Fish,
  egg: Egg,
  cheese: Cheese,
  apple: Apple,
  banana: Banana,
  carrot: Carrot,
  broccoli: Broccoli,
  potato: Potato,
  fries: Fries,
  salad: Salad,
  sandwich: Sandwich,
  cereal: Cereal,
  smoothie: Smoothie,
  waffle: Waffle,
  noodles: Noodles,
  'ice-cream': IceCream,
  plate: Plain,
}

export const ICON_IDS = Object.keys(FOOD_ICONS)

export function iconOrFallback(iconId: string): FC {
  return FOOD_ICONS[iconId] ?? FOOD_ICONS.plate
}

export function FoodIconSvg({ iconId, size, label }: { iconId: string; size?: number | string; label?: string }): ReactNode {
  const Icon = iconOrFallback(iconId)
  return (
    <svg
      viewBox="0 0 64 64"
      width={size ?? '100%'}
      height={size ?? '100%'}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon />
    </svg>
  )
}
