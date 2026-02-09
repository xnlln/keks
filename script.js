var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Body = Matter.Body,
    Vector = Matter.Vector;

var engine = Engine.create();
engine.world.gravity.y = 0;

var render = Render.create({
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

var runner = Runner.create();
Runner.run(runner, engine);

let state = 'initial';

var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

Composite.add(engine.world, mouseConstraint);

render.mouse = mouse;

const wallThickness = 50;
const wallOptions = {
    isStatic: true,
    render: { visible: false }
};

const walls = [
    Bodies.rectangle(window.innerWidth / 2, -wallThickness / 2, window.innerWidth, wallThickness, wallOptions),
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight + wallThickness / 2, window.innerWidth, wallThickness, wallOptions),
    Bodies.rectangle(window.innerWidth + wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions),
    Bodies.rectangle(-wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions)
];

Composite.add(engine.world, walls);

const envelope = document.getElementById('envelope');
const initialUI = document.getElementById('initial-ui');
const questionUI = document.getElementById('question-ui');
const finalUI = document.getElementById('final-ui');
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');

// Quiz State
const quizSteps = [
    { id: 'quiz-q1', correct: ['9/9/23'] },
    { id: 'quiz-q2', correct: ['green'] },
    { id: 'quiz-q3', correct: ['cat'] },
    { id: 'quiz-q4', correct: ['nikolette', 'nicole'] } // Both valid
];
let currentQuizIndex = 0;

envelope.addEventListener('click', function () {
    state = 'quiz';
    transitionUI(initialUI, document.getElementById(quizSteps[0].id));
    createExplosion();
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
            setTimeout(() => {
                this.classList.remove('shake');
            }, 500);
        }
    });
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
    const colors = ['#FFB7C5', '#FFD1DC', '#FFF0F5', '#E6E6FA'];

    for (let i = 0; i < 60; i++) {
        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 50;
        const y = window.innerHeight / 2 + (Math.random() - 0.5) * 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const texture = getLilyTexture(color);
        const scale = 0.5 + Math.random() * 0.8;

        const flower = Bodies.circle(x, y, 15 * scale, {
            render: {
                sprite: {
                    texture: texture,
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
noBtn.addEventListener('touchstart', function (e) {
    e.preventDefault();
    moveNoButton();
});

yesBtn.addEventListener('click', function () {
    state = 'final';

    questionUI.style.opacity = '0';
    setTimeout(() => {
        questionUI.style.display = 'none';
        finalUI.style.display = 'flex';
        void finalUI.offsetWidth;
        finalUI.style.opacity = '1';
    }, 500);

    formHeart();
});

function formHeart() {
    const bodies = Composite.allBodies(engine.world);
    const mobileBodies = bodies.filter(b => !b.isStatic);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 50;
    const scale = Math.min(window.innerWidth, window.innerHeight) / 40;

    mobileBodies.forEach((body, index) => {
        const t = (index / mobileBodies.length) * 2 * Math.PI;

        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        const targetX = centerX + x * scale;
        const targetY = centerY + y * scale;

        body.targetPos = { x: targetX, y: targetY };

        body.frictionAir = 0.05;
        body.restitution = 0.2;
    });

    Events.on(engine, 'beforeUpdate', function () {
        if (state !== 'final') return;

        mobileBodies.forEach(body => {
            if (!body.targetPos) return;

            const dx = body.targetPos.x - body.position.x;
            const dy = body.targetPos.y - body.position.y;

            const forceX = dx * 0.0001 * body.mass;
            const forceY = dy * 0.0001 * body.mass;

            Body.applyForce(body, body.position, { x: forceX, y: forceY });
        });
    });
}

window.addEventListener('resize', function () {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
});
