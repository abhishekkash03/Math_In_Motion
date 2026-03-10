import { generateAizawa, generateBatman, generateButterfly, generateCircle, generateHeart, generateLorenzCustom, generateMultiLemniscate, generateRose, generateSpiral } from "./generators/generator";


export const POINT_COUNT = 800;

export interface Formula {
  id: string;
  name: string;
  pattern: string;
  category: "2D Curves" | "3D Chaos";
  speed: number;
  startDelay:number
  endDelay:number
  duration: number 
  color: string;
  description: string;
  history: string;
  applications: string;
  latex: string;
  generatorFunction: (count: number) => { x: number; y: number; z: number }[];
}

export const formulas: Formula[] = [

{
id: "heart",
name: "Heart Curve",
pattern: "heart",
category: "2D Curves",
speed: 2,
startDelay:4.5,
duration:10,
endDelay:3,
color: "#ff2a6d",
description: "A math equation that secretly draws a perfect heart using elegant sine and cosine waves.",
history: "",
applications: "",
latex: `
\\begin{aligned}
x &= 16\\sin^3(t) \\\\
y &= 13\\cos(t) - 5\\cos(2t) \\\\
&\\quad -2\\cos(3t)-\\cos(4t)
\\end{aligned}
`,
generatorFunction: generateHeart
},

{
id: "infinity_multi",
name: "Multi Lemniscate",
pattern: "infinity_multi",
category: "2D Curves",
speed: 2,
startDelay:1,
duration:37,
endDelay:1,
color: "#01ffc3",
description: "Multiple infinity loops dancing together, weaving beautiful figure-eight patterns.",
history: "",
applications: "",
latex: `
\\begin{aligned}
x &= a \\cos(t) \\\\
y &= a \\sin(t)\\cos(t)
\\end{aligned}
`,
generatorFunction: generateMultiLemniscate
},
{
id: "butterfly",
name: "Butterfly Curve",
pattern: "butterfly",
category: "2D Curves",
speed: 2,
startDelay:3.5,
duration:21,
endDelay:1,
color: "#d1f7ff",
description: "A famous equation whose flowing lines unfold into the delicate shape of butterfly wings.",
history: "",
applications: "",
latex: `
x = sin(t)e(t) \\\\
y = cos(t)e(t)
`,
generatorFunction: generateButterfly
},

{
id: "batman",
name: "Batman Curve",
pattern: "batman",
category: "2D Curves",
speed: 2,
startDelay:7,
duration:14,
endDelay:2,
color: "#fdfd96",
description: "Yes, math can literally draw the Batman logo using a clever mix of equations.",
history: "",
applications: "",
latex: `
\\begin{aligned}
\\text{Top:} \\quad
y &= 3\\sqrt{1 - \\left(\\frac{x}{7}\\right)^2} \\\\
\\text{Bottom :} \\quad
y &= -3\\sqrt{1 - \\left(\\frac{x}{7}\\right)^2} \\\\
\\text{Cape:} \\quad
y &= \\tfrac{1}{2}\\left(w + p + \\left|\\tfrac{x}{2}\\right| - c x^2 - 3\\right) - w
\\end{aligned}
`,
generatorFunction: generateBatman
},

{
id: "spiral",
name: "Archimedean Spiral",
pattern: "spiral",
category: "2D Curves",
speed: 2,
startDelay:3.8,
duration:13,
endDelay:4,
color: "#ff007f",
description: "A spiral that grows evenly as it spins outward, appearing everywhere from shells to galaxies.",
history: "",
applications: "",
latex: `
x = t cos(t) \\\\
y = t sin(t)
`,
generatorFunction: generateSpiral
},


{
id: "lorenz_s15r15",
name: "Lorenz Attractor",
pattern: "lorenz_s15r15",
category: "3D Chaos",
speed: 2,
startDelay:6.1,
duration:33,
endDelay:2,
color:"#00bfff",
description:"Weather chaos forming a strange butterfly in space. σ=15, ρ=15, β=8/3",
history:"",
applications:"",
latex:`
\\begin{aligned}
\\frac{dx}{dt} &= \\sigma(y-x) \\\\
\\frac{dy}{dt} &= x(\\rho-z)-y \\\\
\\frac{dz}{dt} &= xy-\\beta z
\\end{aligned}
`,
generatorFunction: generateLorenzCustom
},

{
id: "aizawa",
name: "Aizawa Attractor",
pattern: "aizawa",
category: "3D Chaos",
speed: 2,
startDelay:0.8,
duration:20,
endDelay:1,
color: "#00ff00",
description: "A mesmerizing chaotic swirl where the path never repeats but always stays bounded.",
history: "",
applications: "",
latex: `
\\frac{dx}{dt}=(z-b)x-dy
`,
generatorFunction: generateAizawa
},
{
id: "rose",
name: "Rose Curve",
pattern: "rose",
category: "2D Curves",
speed: 2,
startDelay:0.8,
duration:45,
endDelay:6,
color: "#ff7b00",
description: "A simple equation that blossoms into a perfectly symmetrical five-petal mathematical flower.",
history: "",
applications: "",
latex: `
r = cos(5t)
`,
generatorFunction: generateRose
},

]
