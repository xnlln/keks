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
    document.body.classList.add('dark-theme'); // Make it dark for the glow
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
    <svg width="60" height="60" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.9" />
                <stop offset="80%" style="stop-color:${color};stop-opacity:0.6" />
                <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
            </radialGradient>
        </defs>
        <g stroke="none">
             <!-- 5 smooth lily petals -->
             <path fill="url(#grad)" d="M60 60 C40 50 35 15 60 5 C85 15 80 50 60 60" transform="rotate(0, 60, 60)" />
             <path fill="url(#grad)" d="M60 60 C40 50 35 15 60 5 C85 15 80 50 60 60" transform="rotate(72, 60, 60)" />
             <path fill="url(#grad)" d="M60 60 C40 50 35 15 60 5 C85 15 80 50 60 60" transform="rotate(144, 60, 60)" />
             <path fill="url(#grad)" d="M60 60 C40 50 35 15 60 5 C85 15 80 50 60 60" transform="rotate(216, 60, 60)" />
             <path fill="url(#grad)" d="M60 60 C40 50 35 15 60 5 C85 15 80 50 60 60" transform="rotate(288, 60, 60)" />
             <circle cx="60" cy="60" r="10" fill="#FFFACD" opacity="0.9" />
        </g>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svgString);
}

function createExplosion() {
    const bodies = [];
    const colors = ['#ff9a9e', '#fecfef', '#ff758c', '#ff4d6d', '#ff1493', '#fff9c4'];

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

function drawLily(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);

    // Glow for the whole flower - pink glow
    ctx.shadowBlur = 25;
    ctx.shadowColor = color;

    // Draw petals - Soft, rounded, and pink
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount - Math.PI / 2;
        ctx.save();
        ctx.rotate(angle);

        // Petal Gradient: Solid pink to soft white/transparent edges
        const gradient = ctx.createLinearGradient(0, 0, 0, -50);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color + 'cc');
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Smoother, rounder petal shape
        ctx.bezierCurveTo(-35, -15, -40, -50, 0, -65);
        ctx.bezierCurveTo(40, -50, 35, -15, 0, 0);
        ctx.fill();

        // Edge highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    // Prominent glowing yellow/white center
    const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    centerGlow.addColorStop(0, '#ffffff');
    centerGlow.addColorStop(0.4, '#fffde7');
    centerGlow.addColorStop(0.7, '#fff59d');
    centerGlow.addColorStop(1, 'rgba(255, 245, 157, 0)');

    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawLeaf(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size, size);

    // Multilayered gradient for depth
    const gradient = ctx.createLinearGradient(0, 0, 45, 0);
    gradient.addColorStop(0, 'rgba(0, 120, 150, 0.9)');
    gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.3)';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Rounder, more organic leaf shape
    ctx.bezierCurveTo(15, -20, 45, -15, 55, 0);
    ctx.bezierCurveTo(45, 15, 15, 20, 0, 0);
    ctx.fill();

    ctx.restore();
}

const lilies = [];
let animationStarted = false;

class Lily {
    constructor(startX, startY, targetAngle, isMobile, index) {
        this.startX = startX;
        this.startY = startY;
        this.targetAngle = targetAngle;
        this.isMobile = isMobile;
        this.index = index;

        const pinks = ['#ff69b4', '#ff85a1', '#ff4d6d'];
        this.color = pinks[index % 3];

        this.stemHeight = isMobile ? window.innerHeight * 0.45 : window.innerHeight * 0.6;
        this.currentLen = 0;
        this.bloomSize = 0;
        this.finalBloomSize = isMobile ? 0.9 : 1.2;
        this.speed = 2.0;
        this.bloomSpeed = 0.01;

        this.leaves = []; // Store leaf positions relative to stem length
    }

    update() {
        if (this.currentLen < this.stemHeight) {
            this.currentLen += this.speed;
            if (Math.floor(this.currentLen) % 40 === 0) {
                const angleOffset = (Math.floor(this.currentLen / 40) % 2 === 0) ? 0.6 : -0.6;
                this.leaves.push({ len: this.currentLen, offset: angleOffset, size: 0.5 + Math.random() * 0.5 });
            }
        } else if (this.bloomSize < this.finalBloomSize) {
            this.bloomSize += this.bloomSpeed;
        }
    }

    draw(ctx, time) {
        // Calculate sway - smooth waving effect
        const sway = Math.sin(time * 0.001 + this.index * 0.5) * 0.05;
        const currentAngle = this.targetAngle + sway;

        const endX = this.startX + Math.cos(currentAngle) * this.currentLen;
        const endY = this.startY + Math.sin(currentAngle) * this.currentLen;

        // Draw Stem with Glow
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffff';
        ctx.lineWidth = this.isMobile ? 2 : 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Highlight line inside stem
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();

        // Draw Leaves
        this.leaves.forEach(leaf => {
            const lx = this.startX + Math.cos(currentAngle) * leaf.len;
            const ly = this.startY + Math.sin(currentAngle) * leaf.len;
            drawLeaf(ctx, lx, ly, (this.isMobile ? 0.6 : 1) * leaf.size, currentAngle + leaf.offset);
        });

        // Draw Flower if blooming
        if (this.currentLen >= this.stemHeight && this.bloomSize > 0) {
            drawLily(ctx, endX, endY, this.bloomSize, this.color);
        }

        ctx.restore();
    }
}

function startTreeAnimation() {
    const isMobile = window.innerWidth < 768;
    const centerX = treeCanvas.width / 2;
    const bottomY = treeCanvas.height;

    // 3 lilies clustered
    const configs = [
        { angle: -Math.PI / 2, delay: 0 },
        { angle: -Math.PI / 2 - 0.3, delay: 400 },
        { angle: -Math.PI / 2 + 0.3, delay: 800 }
    ];

    configs.forEach((conf, i) => {
        setTimeout(() => {
            lilies.push(new Lily(centerX, bottomY, conf.angle, isMobile, i));
        }, conf.delay);
    });

    if (!animationStarted) {
        animationStarted = true;
        animateBouquet();
    }
}

function animateBouquet() {
    treeCtx.clearRect(0, 0, treeCanvas.width, treeCanvas.height);

    drawFireflies();
    drawGrassStatic();

    const time = Date.now();
    let maxBloom = 0;
    lilies.forEach(lily => {
        lily.update();
        lily.draw(treeCtx, time);
        if (lily.bloomSize > maxBloom) maxBloom = lily.bloomSize;
    });

    // Draw the yellow message once flowers start blooming
    if (maxBloom > 0.1) {
        drawMessage(maxBloom);
    }

    requestAnimationFrame(animateBouquet);
}

function drawMessage(bloomFactor) {
    const opacity = Math.min(1, bloomFactor * 1.5);
    treeCtx.save();
    treeCtx.globalAlpha = opacity;
    treeCtx.textAlign = 'center';

    // Position it slightly above the tallest stem (which is ~0.6 * height)
    const yPos = window.innerHeight * 0.25;
    const xPos = window.innerWidth / 2;

    // Premium glowing yellow style
    treeCtx.shadowBlur = 15;
    treeCtx.shadowColor = '#fff59d';
    treeCtx.fillStyle = '#fff9c4'; // Soft yellow
    treeCtx.font = 'normal 4rem "Great Vibes", cursive';

    // Add a slight floating animation
    const floatY = Math.sin(Date.now() * 0.002) * 10;

    treeCtx.fillText('i love you', xPos, yPos + floatY);

    // Subtle second layer for extra glow
    treeCtx.shadowBlur = 5;
    treeCtx.fillStyle = '#fffde7';
    treeCtx.fillText('i love you', xPos, yPos + floatY);

    treeCtx.restore();
}

let fireflies = [];
function drawFireflies() {
    if (fireflies.length === 0) {
        for (let i = 0; i < 80; i++) {
            fireflies.push({
                x: Math.random() * treeCanvas.width,
                y: Math.random() * treeCanvas.height,
                size: Math.random() * 1.5 + 0.5,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                alpha: Math.random(),
                osc: Math.random() * 100,
                color: Math.random() > 0.5 ? '#fff9c4' : '#b2ff59' // mix of yellow and green glow
            });
        }
    }

    fireflies.forEach(f => {
        f.x += f.speedX;
        f.y += f.speedY;
        f.osc += 0.03;
        f.alpha = Math.abs(Math.sin(f.osc));

        if (f.x < 0) f.x = treeCanvas.width;
        if (f.x > treeCanvas.width) f.x = 0;
        if (f.y < 0) f.y = treeCanvas.height;
        if (f.y > treeCanvas.height) f.y = 0;

        treeCtx.save();
        treeCtx.globalAlpha = f.alpha;
        treeCtx.fillStyle = f.color;
        treeCtx.shadowBlur = 8;
        treeCtx.shadowColor = f.color;
        treeCtx.beginPath();
        treeCtx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        treeCtx.fill();
        treeCtx.restore();
    });
}

// Fixed grass to be redrawn in the loop
let grassParticles = [];
function drawGrassStatic() {
    if (grassParticles.length === 0) {
        const count = 40;
        for (let i = 0; i < count; i++) {
            grassParticles.push({
                x: Math.random() * treeCanvas.width,
                h: 50 + Math.random() * 100,
                waviness: Math.random() * 0.2 + 0.1
            });
        }
    }

    const time = Date.now();
    grassParticles.forEach(g => {
        treeCtx.save();
        treeCtx.translate(g.x, treeCanvas.height);

        const sway = Math.sin(time * 0.0015 + g.x) * 5;

        const grad = treeCtx.createLinearGradient(0, 0, 0, -g.h);
        grad.addColorStop(0, '#001a1a');
        grad.addColorStop(1, '#00ffcc22');

        treeCtx.strokeStyle = grad;
        treeCtx.lineWidth = 2;
        treeCtx.beginPath();
        treeCtx.moveTo(0, 0);
        treeCtx.quadraticCurveTo(10 + sway, -g.h / 2, sway, -g.h);
        treeCtx.stroke();
        treeCtx.restore();
    });
}
