const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Body = Matter.Body,
    Vector = Matter.Vector;

const engine = Engine.create();
engine.world.gravity.y = 0;

const render = Render.create({
    element: document.getElementById('canvas-container'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: { visible: false }
    }
});
Composite.add(engine.world, mouseConstraint);
render.mouse = mouse;

const wallThickness = 50;
const wallOptions = { isStatic: true, render: { visible: false } };
const walls = [
    Bodies.rectangle(window.innerWidth / 2, -wallThickness / 2, window.innerWidth, wallThickness, wallOptions),
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight + wallThickness / 2, window.innerWidth, wallThickness, wallOptions),
    Bodies.rectangle(window.innerWidth + wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions),
    Bodies.rectangle(-wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions)
];
Composite.add(engine.world, walls);


let state = 'initial';
const envelope = document.getElementById('envelope');
const initialUI = document.getElementById('initial-ui');
const questionUI = document.getElementById('question-ui');
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const loaderUI = document.getElementById('loader-ui');
const bgMusic = document.getElementById('bg-music');
const startBtn = document.getElementById('start-btn');

startBtn.addEventListener('click', function () {
    bgMusic.play().then(() => {
        loaderUI.style.opacity = '0';
        setTimeout(() => {
            loaderUI.style.display = 'none';
            initialUI.style.display = 'flex';
            void initialUI.offsetWidth;
            initialUI.style.opacity = '1';
        }, 1000);
    }).catch(error => {
        console.log("Audio play failed:", error);
        loaderUI.style.opacity = '0';
        setTimeout(() => {
            loaderUI.style.display = 'none';
            initialUI.style.display = 'flex';
            void initialUI.offsetWidth;
            initialUI.style.opacity = '1';
        }, 1000);
    });
});


const quizSteps = [
    { id: 'quiz-q1', correct: ['9/9/23'] },
    { id: 'quiz-q2', correct: ['green'] },
    { id: 'quiz-q3', correct: ['cat'] },
    { id: 'quiz-q4', correct: ['nikolette', 'nicole'] }
];
let currentQuizIndex = 0;


envelope.addEventListener('click', function () {
    state = 'quiz';
    transitionUI(initialUI, document.getElementById(quizSteps[0].id));
    createExplosion();
});

document.querySelectorAll('.quiz-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const answer = this.getAttribute('data-answer').toLowerCase();
        const currentStep = quizSteps[currentQuizIndex];

        if (currentStep.correct.includes(answer)) {
            const currentUI = document.getElementById(currentStep.id);
            currentQuizIndex++;

            if (currentQuizIndex < quizSteps.length) {
                const nextUI = document.getElementById(quizSteps[currentQuizIndex].id);
                transitionUI(currentUI, nextUI);
            } else {
                state = 'question';
                transitionUI(currentUI, questionUI);
            }
        } else {
            this.classList.add('shake');
            setTimeout(() => this.classList.remove('shake'), 500);
        }
    });
});

function moveNoButton() {
    const maxX = window.innerWidth - noBtn.offsetWidth - 20;
    const maxY = window.innerHeight - noBtn.offsetHeight - 20;
    const padding = 20;

    const randomX = Math.max(padding, Math.random() * maxX);
    const randomY = Math.max(padding, Math.random() * maxY);

    noBtn.style.position = 'fixed';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
}
noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });

yesBtn.addEventListener('click', function () {
    state = 'final';

    questionUI.style.opacity = '0';
    setTimeout(() => {
        questionUI.style.display = 'none';

    }, 500);

    Composite.clear(engine.world);
    Engine.clear(engine);
    Render.stop(render);
    Runner.stop(runner);
    document.getElementById('canvas-container').style.display = 'none';

    startTreeAnimation();
});

function transitionUI(current, next) {
    current.style.opacity = '0';
    setTimeout(() => {
        current.style.display = 'none';
        next.style.display = 'flex';
        void next.offsetWidth;
        next.style.opacity = '1';
    }, 500);
}

window.addEventListener('resize', function () {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    resizeTreeCanvas();
});


function getLilyTexture(color) {
    const svgString = `
    <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g fill="${color}" stroke="none">
             <path d="M50 50 Q30 5 50 0 Q70 5 50 50 z" />
             <path d="M50 50 Q30 5 50 0 Q70 5 50 50 z" transform="rotate(60, 50, 50)" />
             <path d="M50 50 Q30 5 50 0 Q70 5 50 50 z" transform="rotate(120, 50, 50)" />
             <path d="M50 50 Q30 5 50 0 Q70 5 50 50 z" transform="rotate(180, 50, 50)" />
             <path d="M50 50 Q30 5 50 0 Q70 5 50 50 z" transform="rotate(240, 50, 50)" />
             <path d="M50 50 Q30 5 50 0 Q70 5 50 50 z" transform="rotate(300, 50, 50)" />
             <circle cx="50" cy="50" r="8" fill="#FFFACD" />
        </g>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svgString);
}

function createExplosion() {
    const bodies = [];
    const colors = ['#FFB7C5', '#FFD1DC', '#FFF0F5', '#E6E6FA', '#FF69B4', '#FFD700'];

    for (let i = 0; i < 60; i++) {
        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 50;
        const y = window.innerHeight / 2 + (Math.random() - 0.5) * 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const scale = 0.5 + Math.random() * 0.8;

        const flower = Bodies.circle(x, y, 15 * scale, {
            render: {
                sprite: {
                    texture: getLilyTexture(color),
                    xScale: scale,
                    yScale: scale
                }
            },
            restitution: 0.9,
            frictionAir: 0.005,
            friction: 0
        });
        bodies.push(flower);

        if (i % 3 === 0) {
            const pollen = Bodies.circle(x, y, 3 + Math.random() * 3, {
                render: { fillStyle: '#FFD700' },
                restitution: 0.6,
                frictionAir: 0.02
            });
            bodies.push(pollen);
        }
    }

    Composite.add(engine.world, bodies);

    bodies.forEach(body => {
        const forceMagnitude = 0.04 * body.mass;
        Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * forceMagnitude,
            y: (Math.random() - 0.5) * forceMagnitude
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
    });
}


const treeCanvas = document.getElementById('tree-canvas');
const treeCtx = treeCanvas.getContext('2d');

function resizeTreeCanvas() {
    treeCanvas.width = window.innerWidth;
    treeCanvas.height = window.innerHeight;
}
resizeTreeCanvas();

function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -10, -20, 5, 0, 20);
    ctx.bezierCurveTo(20, 5, 10, -10, 0, 0);
    ctx.fill();
    ctx.restore();
}

function startTreeAnimation() {
    const startX = treeCanvas.width / 2;
    const startY = treeCanvas.height;

    const isMobile = window.innerWidth < 768;
    const trunkLen = isMobile ? window.innerHeight * 0.2 : 160;
    const trunkWidth = isMobile ? 10 : 14;

    growBranch(startX, startY, trunkLen, -Math.PI / 2, trunkWidth, isMobile ? 8 : 10);
}

function growBranch(x, y, len, angle, width, depth) {
    const endX = x + Math.cos(angle) * len;
    const endY = y + Math.sin(angle) * len;

    let currentLen = 0;
    const speed = 2;

    function animateBranch() {
        if (currentLen < len) {
            currentLen += speed;
            const currentX = x + Math.cos(angle) * currentLen;
            const currentY = y + Math.sin(angle) * currentLen;

            treeCtx.beginPath();
            treeCtx.moveTo(x, y);
            treeCtx.lineTo(currentX, currentY);
            treeCtx.strokeStyle = '#5d4037';
            treeCtx.lineWidth = width;
            treeCtx.lineCap = 'round';
            treeCtx.stroke();

            requestAnimationFrame(animateBranch);
        } else {
            if (depth > 0) {
                const subBranches = 2;
                for (let i = 0; i < subBranches; i++) {
                    const newAngle = angle + (Math.random() - 0.5) * 1.5;
                    const newLen = len * (0.7 + Math.random() * 0.2);
                    const newWidth = width * 0.7;

                    setTimeout(() => {
                        growBranch(endX, endY, newLen, newAngle, newWidth, depth - 1);
                    }, Math.random() * 200);
                }
            } else {
                spawnLeaves(endX, endY);
            }
        }
    }
    animateBranch();
}

function spawnLeaves(x, y) {
    const leafCount = 3 + Math.floor(Math.random() * 3);
    const colors = ['#ff4d6d', '#ff9a9e', '#ffc0cb', '#e0115f'];

    const isMobile = window.innerWidth < 768;
    const baseSize = isMobile ? 0.3 : 0.5;

    for (let i = 0; i < leafCount; i++) {
        const size = baseSize + Math.random() * (isMobile ? 0.4 : 0.6);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const spread = isMobile ? 25 : 40;
        const offsetX = (Math.random() - 0.5) * spread;
        const offsetY = (Math.random() - 0.5) * spread;

        let s = 0;
        function popLeaf() {
            if (s < size) {
                s += 0.05;
                drawHeart(treeCtx, x + offsetX, y + offsetY, s, color);
                requestAnimationFrame(popLeaf);
            }
        }
        setTimeout(popLeaf, Math.random() * 500);
    }
}
