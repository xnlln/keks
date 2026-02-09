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
    document.body.classList.add('dark-theme');
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
    <svg width="80" height="80" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.9" />
                <stop offset="80%" style="stop-color:${color};stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
            </radialGradient>
        </defs>
        <g stroke="none" transform="translate(80, 80)">
             <path fill="url(#grad)" d="M0 0 C-15 -15 -15 -80 0 -80 C15 -80 15 -15 0 0" transform="rotate(0)" />
             <path fill="url(#grad)" d="M0 0 C-15 -15 -15 -80 0 -80 C15 -80 15 -15 0 0" transform="rotate(60)" />
             <path fill="url(#grad)" d="M0 0 C-15 -15 -15 -80 0 -80 C15 -80 15 -15 0 0" transform="rotate(120)" />
             <path fill="url(#grad)" d="M0 0 C-15 -15 -15 -80 0 -80 C15 -80 15 -15 0 0" transform="rotate(180)" />
             <path fill="url(#grad)" d="M0 0 C-15 -15 -15 -80 0 -80 C15 -80 15 -15 0 0" transform="rotate(240)" />
             <path fill="url(#grad)" d="M0 0 C-15 -15 -15 -80 0 -80 C15 -80 15 -15 0 0" transform="rotate(300)" />
             
             <circle cx="0" cy="0" r="6" fill="#f1f8e9" />
             <rect x="-1" y="-15" width="2" height="15" fill="#f1f8e9" transform="rotate(45)" />
             <rect x="-1" y="-15" width="2" height="15" fill="#f1f8e9" transform="rotate(135)" />
             <circle cx="10" cy="-10" r="2" fill="#5d4037" transform="rotate(45)" />
             <circle cx="10" cy="-10" r="2" fill="#5d4037" transform="rotate(135)" />
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

    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

    const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        const length = i % 2 === 0 ? 100 : 85;

        ctx.save();
        ctx.rotate(angle);

        const gradient = ctx.createLinearGradient(0, 0, 0, -length);
        gradient.addColorStop(0, '#f1f8e9');
        gradient.addColorStop(0.2, color);
        gradient.addColorStop(0.8, color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-18, -15, -18, -length, 0, -length);
        ctx.bezierCurveTo(18, -length, 18, -15, 0, 0);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -length * 0.8);
        ctx.stroke();

        ctx.restore();
    }

    const stamenCount = 5;
    for (let i = 0; i < stamenCount; i++) {
        const sAngle = (i * Math.PI * 2) / stamenCount - Math.PI / 2;
        const sLen = 30;

        ctx.save();
        ctx.rotate(sAngle + Math.sin(Date.now() * 0.002 + i) * 0.1);

        ctx.strokeStyle = '#fffde7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(5, -sLen / 2, 2, -sLen);
        ctx.stroke();

        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.ellipse(2, -sLen, 5, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    ctx.fillStyle = '#dcedc8';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawLeaf(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size, size);

    const gradient = ctx.createLinearGradient(0, 0, 45, 0);
    gradient.addColorStop(0, 'rgba(0, 120, 150, 0.9)');
    gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.3)';

    ctx.beginPath();
    ctx.moveTo(0, 0);
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

        this.leaves = [];
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
        const sway = Math.sin(time * 0.001 + this.index * 0.5) * 0.05;
        const currentAngle = this.targetAngle + sway;

        const endX = this.startX + Math.cos(currentAngle) * this.currentLen;
        const endY = this.startY + Math.sin(currentAngle) * this.currentLen;

        ctx.save();
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#81c784';
        ctx.lineWidth = this.isMobile ? 1.5 : 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.strokeStyle = '#f1f8e9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();

        this.leaves.forEach(leaf => {
            const lx = this.startX + Math.cos(currentAngle) * leaf.len;
            const ly = this.startY + Math.sin(currentAngle) * leaf.len;
            drawLeaf(ctx, lx, ly, (this.isMobile ? 0.6 : 1) * leaf.size, currentAngle + leaf.offset);
        });

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

    const yPos = window.innerHeight * 0.25;
    const xPos = window.innerWidth / 2;

    treeCtx.shadowBlur = 15;
    treeCtx.shadowColor = '#fff59d';
    treeCtx.fillStyle = '#fff9c4';
    treeCtx.font = 'normal 4rem "Great Vibes", cursive';

    const floatY = Math.sin(Date.now() * 0.002) * 10;

    treeCtx.fillText('I miss you', xPos, yPos + floatY);

    treeCtx.shadowBlur = 5;
    treeCtx.fillStyle = '#fffde7';
    treeCtx.fillText('I miss you', xPos, yPos + floatY);

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
                color: Math.random() > 0.5 ? '#fff9c4' : '#b2ff59'
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
