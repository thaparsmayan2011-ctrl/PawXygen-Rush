const canvas = document.getElementById("gc");
const ctx = canvas.getContext("2d");
const TILE = 32;

let player = { x: 1, y: 1 };
let currentLevel = 0;
let oxygenno = 0;
const baseoxy = [30, 12, 16, 19, 22];
let maxoxy = baseoxy[0];
let hasKey = false;

function update() {
   document.getElementById("o2").innerText = maxoxy - oxygenno;
   document.getElementById("key").innerText = hasKey ? "YES" : "NO";
}

function move(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;
    const target =  grid[ny][nx];

    if (target === "w") return; // Wall
    player.x = nx;
    player.y = ny;
    oxygenno++;
    
    droidmove();
    check();

    if (target === "o") {
        oxygenno = Math.max(0, oxygenno - 10); // Refill oxygen
        grid[ny][nx] = "."; 
        playt(659.25, "square", 0.15); //o2 pick up
        Particlez(nx, ny, "#06b6d4"); //Cyan burst
    } else if (target === "k") {
        hasKey = true;
        grid[ny][nx] = ".";
        playt(880, "triangle", 0.2); //key pick
        Particlez(nx, ny, "#eab308"); //gold burst key
    } else if (target === "x") {
        alert("Hull Overheat!");
        startLevel(currentLevel);
        return;
    } else if (target === "d") {
        if (hasKey) {
            playt(1046.5, "sine", 0.25); // Sect clear
            currentLevel++;
            if (currentLevel < levels.length) {
                startLevel(currentLevel);
            } else {            
                showlevels();
            }
            return;
        } else {
            alert("Need Key");       
            playt(150, "sawtooth", 0.1); 
        }
    }
    
    playt(300, "sine", 0.03); // Movement sound
    update();
    draw();

    if (oxygenno >= maxoxy) {
        alert("O2 Depleted! Restarting....."); 
        startLevel(currentLevel);
    }
}

function showlevels(){
    let choice = prompt("Mission Complete! Choose a Level to Play Again! (1-5):", "1");
    if (choice !== null) {
        let levelNum = parseInt(choice) - 1;
        if (!isNaN(levelNum) && levelNum >= 0 && levelNum <levels.length) {
            currentLevel = levelNum;
            startLevel(currentLevel);
        } else {
            alert("Invalid level! Restarting from Level 1.");
            currentLevel = 0;
            startLevel(0);
        }
    }
}

window.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key==="ArrowUp") move(0, -1);
    if (e.key === "s" || e.key === "ArrowDown") move(0, 1);
    if (e.key === "a" || e.key === "ArrowLeft") move(-1, 0);
    if (e.key === "d" || e.key ==="ArrowRight") move(1, 0);
});

let droids =[]; //Active patrol droids

const levels = [
    // Sect:1 Intro
    [
       "wwwwwwwwwwww",
       "w.p........w",
       "w.wwww.www.w",
       "w.w.L..w.o.w",
       "w.w.ww.w.k.w",
       "w.w....wwwHw",
       "w.wwww...V.d",
       "wwwwwwwwwwww"


    ],
    // Sect:2 Laser
    [
        "wwwwwwwwwwww",
        "w.p........w",
        "w.ww.wwwww.w",
        "w.wL...o.w.w",
        "w.w.xxxx.wHw",
        "w...w.V..w.w",
        "ww.ww.wwww.w",
        "w...o.V...kd",
        "wwwwwwwwwwww"
    ],   
    //Sect:3 Lasers and Firewall
    [
        "wwwwwwwwwwww",
        "w.p.o...w..w",
        "w.wwww.w.w.w",
        "w...L..ow..w",
        "w.wwwwww.w.w",
        "w.w.o.V..w.w",
        "w.w.wwww.x.w",
        "w........Vkd",
        "wwwwwwwwwwww"
    ],
    //Sect 4 Droids added
    [
        "wwwwwwwwwwww",
        "w.p........w",
        "w.wwww.www.w",
        "w.w...D..o.w",
        "w.w.ww.www.w",
        "w.w.L....Vkw",
        "w.wwww...V.d",
        "wwwwwwwwwwww"
    ],
    //Sect:5 Final escape
    [
        "wwwwwwwwwwww",
        "w.p..x.o...w",
        "w.ww.w.www.w",
        "w.wL..D..o.w",
        "w.xxxx.w.x.w",
        "w.o..V.D.k.w",
        "w.wwww.www.d",
        "wwwwwwwwwwww"
    ] 

];
// Defining levels

let laserActive = false;
let platePos = { x: 3, y: 3 };
let lasers = [];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playt(freq, type = "square", duration = 0.08) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function droidmove(){
    for (let d of droids) {
        let nx = d.x + d.dx;
        let ny = d.y + d.dy;
        // Turn around if path is not available
        if (grid[ny][nx] ==="w") {
            d.dx *= -1;
            d.dy *= -1;
            nx =d.x+ d.dx;
            ny= d.y +d.dy;
        }
        if (grid[ny][nx] !== "w") {
            d.x = nx;
            d.y =ny;
        }
       
        
    }
}
//Check for traps laser, droid, firewall
function check() {
    if (player.x === platePos.x && player.y === platePos.y){
        laserActive = !laserActive;
        playt(523.25, "sine", 0.1);
    }
    if (laserActive){
        for (let l of lasers) {
            if (player.x === l.x && player.y === l.y) {
                playt(110, "sawtooth", 0.3);
                alert("Vaporized by Security Laser ");
                startLevel(currentLevel);
                return;
            }
        }
    } 
    for (let d of droids){
        if (player.x === d.x && player.y ===d.y){
            playt(120, "sawtooth", 0.3);
            alert("Intercepted by Patrol Droid!");
            startLevel(currentLevel);
            return;
        }
    }   
}

let grid = [];
let particles = [];

function Particlez(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x * TILE + 16,
            y: y * TILE + 16,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 10,
            color: color
        });
    }
}

function startLevel(levelNum) {
    grid = levels[levelNum].map(row => row.split(""));    
    canvas.height = grid.length*TILE;
    oxygenno = 0;
    maxoxy = baseoxy[levelNum];
    hasKey = false;
    laserActive = true; // Reset laser 
    particles = []; 
    platePos = { x: -1, y: -1 };
    lasers = [];
    droids= []; 


    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === "p") {
                player = { x: c, y: r };
                grid[r][c] = ".";
            } else if (grid[r][c] === "L") {
                platePos = { x: c, y: r };
                grid[r][c] = ".";
            } else if (grid[r][c] === "V") {
                lasers.push({ x: c, y: r, type: "V" });
                grid[r][c] = ".";
            } else if (grid[r][c] === "H") {
                lasers.push({ x: c, y: r, type: "H"});
                grid[r][c] = ".";
            } else if (grid[r][c] ==="D") {
                droids.push({x:c, y: r, dx: 1, dy:0});
                grid[r][c] = ".";
            }
        }
    }
    
    update();
    draw();
}


// draw all ofthegraphics
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const tile = grid[r][c];
        
            ctx.fillStyle = "#0f172a"; // Default background color
            ctx.fillRect(c * TILE, r * TILE, TILE, TILE);

            if (tile === "w") { 
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
                ctx.strokeStyle = "#334155";
                ctx.strokeRect(c * TILE + 2, r * TILE + 2, TILE - 4, TILE - 4);
            }    
            else if (tile === "o") { 
                //Oxygen tanks
                const ox = c*TILE;
                const oy = r* TILE;
                ctx.fillStyle ="#06b6d4";//body
                ctx.fillRect(ox + 10, oy+ 10,12, 16);
                ctx.fillStyle ="#94a3b8"; //Cap
                ctx.fillRect(ox + 12, oy +6, 8,4);
                ctx.fillStyle = "#67e8f9"; //Glass
                ctx.fillRect(ox + 13, oy+13,6, 6);
                //oxygen tube/pipe
                ctx.strokeStyle = "#a5f3fc";
                ctx.lineWidth=2;
                ctx.beginPath();
                ctx.moveTo(ox +18, oy + 8);
                ctx.bezierCurveTo(ox + 26, oy +8, ox+26, oy+ 22, ox + 22, oy +24);
                ctx.stroke();
            }    
                
                
            else if (tile === "k") { 
                //Key
                const kx = c*TILE;
                const ky = r*TILE;
                ctx.fillStyle = "#eab308";
                ctx.beginPath();
                ctx.arc(kx + 12, ky +14, 5,0, Math.PI*2);//Ring part thing
                ctx.fill();
                ctx.fillRect(kx +16, ky + 13,10,3);//Main shaft
                //key gaps
                ctx.fillRect(kx+22, ky + 16, 3,4);
                ctx.fillRect(kx +19, ky + 16,2,3);
             }
            else if (tile === "d") {
                //door
                const dx =c*TILE;
                const dy = r*TILE;
                //Metl Frame
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(dx +2, dy+2, 28, 28);

                //Inner part
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(dx +5, dy + 5,22, 22);
                
                //Shiutter opening vertically
                ctx.fillStyle = "#334155";
                ctx.fillRect(dx + 6, dy +6, 9, 20); //Left
                ctx.fillRect(dx + 17, dy +6, 9, 20); //Right

                //Highlights
                ctx.fillStyle = "#475569";
                ctx.fillRect(dx +7, dy + 8,7, 16);
                ctx.fillRect(dx +18, dy + 8,7, 16);
                
                //Warning stripes
                ctx.fillStyle = "#eab308";
                ctx.fillRect(dx +4, dy +2,4,3);
                ctx.fillRect(dx + 24, dy + 2, 4,3);
                ctx.fillRect(dx +4, dy +27, 4,3);
                ctx.fillRect(dx +24, dy + 27, 4,3);

                //Indicator green if player has the key
                ctx.fillStyle = hasKey ? "#10b981": "#ef4444";
                ctx.fillRect(dx + 12, dy +3, 8, 3);
            


            }    
            else if (tile === "x") { 
                ctx.fillStyle ="#ef4444";
                ctx.fillRect(c* TILE +4, r* TILE +4, 24, 24);
                ctx.fillStyle = "#fca5a5";
                ctx.fillRect(c* TILE + 8, r* TILE+8, 16, 16);
            }
        }    
    }
    
    //PrPlate
    if (platePos.x !== -1) {
        const gx= platePos.x *TILE;
        const gy = platePos.y * TILE;
        ctx.fillStyle ="#475569";
        ctx.fillRect(gx +4, gy+ 4, 24, 24);
        ctx.fillStyle = laserActive ? "#c084fc" : "#6b21a8";
        ctx.fillRect(gx +8, gy+8, 16, 16);        
    }
    
    //Laser
   for (let l of lasers) {
    const lx = l.x * TILE;
    const ly = l.y * TILE;
    const color = laserActive ? "#ff0055" : "#475569";
    const corecolor = laserActive ? "#ffffff": "#64748b";
    
    if (l.type == "V") {
        //Vert Beam
        ctx.fillStyle = color;
        ctx.fillRect(lx + 10, ly + 2, 12, 28);
        ctx.fillStyle =corecolor;
        ctx.fillRect(lx + 14, ly + 2, 4, 28);
    } else{
        //Horizontal Beam
        ctx.fillStyle = color;
        ctx.fillRect(lx + 2, ly + 10, 28, 12);
        ctx.fillStyle = corecolor;
        ctx.fillRect(lx + 2, ly + 14, 28, 4);
    }
   }

   
    //Particle 
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) particles.splice(i, 1);
    }

    // Patrol Droids design
    for (let d of droids){
        const dx =d.x *TILE;
        const dy= d.y* TILE;
        ctx.fillStyle = "#64748b"
        ctx.fillRect(dx + 6, dy +6, 20, 20); //Metal Chassis
        ctx.fillStyle ="#ef4444";
        ctx.fillRect(dx +10, dy +12, 12, 4)//Red visor
        ctx.fillStyle = "#0284c7"
        ctx.fillRect(dx+14, dy+ 2, 4, 4); //Beacon
    }
    //Laika Upgrded design, final
    const px = player.x * TILE;
    const py = player.y * TILE;
    //Additions and spacesuit
    //Tail
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth =3;
    ctx.beginPath();
    ctx.arc(px+ 6, py+ 20, 6, Math.PI *0.5, Math.PI* 1.5, false);
    ctx.stroke();

    //Oval space suit
    ctx.fillStyle="#e2e8f0";
    ctx.beginPath();
    ctx.ellipse(px +16, py + 26,9,6, 0, 0, Math.PI*2, false)
    ctx.fill();

    //Collar
    ctx.fillStyle = "#0284c7"
    ctx.fillRect(px + 8, py +20, 16,2);


    // Bubble 
    ctx.fillStyle ="rgba(56, 189, 248, 0.35)";
    ctx.beginPath();
    ctx.arc(px +16, py +13, 11, 0, Math.PI *2);
    ctx.fill();
    //Dog Head
    ctx.fillStyle = "#d97706"; //fur
    ctx.beginPath();
    ctx.arc(px +16, py+15, 8, 0, Math.PI * 2);
    ctx.fill();
    //Ears
    ctx.fillStyle = "#b45309";
    ctx.fillRect(px +6, py+ 10, 4, 7);
    ctx.fillRect(px + 22, py +10, 4, 7);
    
    //Nose and Eyes
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(px +12, py + 14, 3, 3);//Left eye
    ctx.fillRect(px + 17, py +14, 3, 3); //Right eye
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(px + 14, py+ 18, 4, 3); //Nose


    drawlegend();
}
function drawlegend(){
    const lx =400; 
    let ly = 10;

    //Legend title
    ctx.fillStyle ="#f8fafc";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("MISSION LEGEND", lx, ly+14);

    ctx.strokeStyle ="#334155";
    ctx.beginPath();
    ctx.moveTo(lx, ly + 22);
    ctx.lineTo(lx+ 140, ly +22 );
    ctx.stroke();

    ly += 32;

    //draw the legend
    const items = [
        {label: "Laika (You)", drawitem: (x, y) => {
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(x +8, y+8, 6,0, Math.PI *2);
        ctx.fill();
        }},
        { label: "Oxygen Tank (+10)", drawitem: (x, y) => {
        ctx.fillStyle = "#06b6d4"
        ctx.fillRect(x +4, y+2, 8,12);
        }},
        {label: "Access Key", drawitem: (x, y) => {
        ctx.fillStyle = "#eab308"
        ctx.fillRect(x +2, y+6,12, 4);
        }},
        {label: "Exit", drawitem: (x, y) => {
        ctx.fillStyle ="#334155";
        ctx.fillRect(x +2, y+2, 12,22);
        ctx.fillStyle= "#10b981";
        ctx.fillRect(x +6, y + 3, 4, 2);
        }},
        {label: "Pressure Plate", drawitem: (x, y) => {
        ctx.fillStyle ="#c084fc";
        ctx.fillRect(x+3, y +3,10,10);
        }},
        {label: "Patrol Droid: AVOID!", drawitem: (x, y) => {
        ctx.fillStyle ="#64748b";
        ctx.fillRect(x+2, y+2, 12, 12);
        ctx.fillStyle= "#ef4444";
        ctx.fillRect(x+4, y+6, 8, 2);
        }},
        {label: "Laser: AVOID!", drawitem: (x,y) => {
        ctx.fillStyle = "#ff0055";
        ctx.fillRect(x+2, y+6, 12,4);
        }},
        {label: "Firewall: AVOID!", drawitem: (x,y) => {
        ctx.fillStyle = "#ef4444"
        ctx.fillRect(x+2, y+2, 12,12);
        }}
    ];
    ctx.font = "11px sans-serif";
    for(let item of items){
        //Preview of items
        ctx.fillStyle= "#1e293b";
        ctx.fillRect(lx, ly, 16,16);
        item.drawitem(lx, ly);

        //Final text
        ctx.fillStyle = item.label.includes("AVOID") ? "#f87171" : "#cbd5e1";
        ctx.fillText(item.label, lx+24, ly +12);

        ly += 20; //go down a line
    }


    }





function gameloop(){
    draw();
    requestAnimationFrame(gameloop);
}
startLevel(currentLevel);
gameloop();
