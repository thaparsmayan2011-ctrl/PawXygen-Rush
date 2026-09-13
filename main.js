const canvas = document.getElementById("gc");
const ctx = canvas.getContext("2d");
const TILE = 56;

const bgm = new Audio("bgmusic.mp3");
bgm.loop =true;
bgm.volume= 0.25; 



function canvassize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", canvassize);
canvassize();


let player = { x: 1, y: 1 };
let level = 0;
let oxygenno = 0;
let state= "MENU"; 
const baseoxy = [30, 12, 16, 19, 22, 20, 16, 21];
let maxoxy = baseoxy[0];
let hasKey = false;
let unlocked =0; //levels unlocked

const characters =[
    {name: "Laika", type: "dog", color: "#d97706", suit: "#e2e8f0", accent: "#b45309", desc: "The space dog!"},
    {name: "Rocket", type: "raccoon", color: "#475569", suit: "#f1f5f9", accent: "#ea580c", desc: "A Guardian of The Galaxy!"},
    {name: "Mort", type: "monkey", color: "#a16207", suit: "#fed7aa", accent: "#713f12", desc: "Cosmic primate crusader!"},
    {name: "Larry", type: "cat", color: "#9333ea", suit: "#f3e8ff", accent: "#581c87", desc: "Larry"},
    {name: "Michelangelo", type: "turtle", color: "#15803d", suit: "#dcfce7", accent: "#ea580c", desc: "Teenage mutant?"}
];

let charIndex =0;
let levelIndex = 0;
let selectedChar= characters[0];

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
        startLevel(level);
        return;
    } else if (target === "d") {
        if (hasKey) {
            playt(1046.5, "sine", 0.25); // Sect clear
            if (level >= unlocked && unlocked < levels.length -1){
                unlocked++;
            }
            level++;
            if (level < levels.length) {
                startLevel(level);
            } else {            
                state = "LEVELS";
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
        startLevel(level);
    }
}

function showlevels(){
    let choice = prompt("Mission Complete! Choose a Level to Play Again! (1-5):", "1");
    if (choice !== null) {
        let levelNum = parseInt(choice) - 1;
        if (!isNaN(levelNum) && levelNum >= 0 && levelNum <levels.length) {
            level = levelNum;
            startLevel(level);
        } else {
            alert("Invalid level! Restarting from Level 1.");
            level = 0;
            startLevel(0);
        }
    }
}

window.addEventListener("keydown", (e) => {
    BGM(); //play da music
    if (e.key ==="m" || e.key=== "M"){
        bgm.muted = !bgm.muted;
    }
    if (state ==="MENU") {
        if (e.code === "Space" || e.code=== "Enter"){
          state = "SELECT"; 
        }
        return;
    }
    if (state=== "SELECT"){
        if (e.key=== "ArrowLeft"){
            charIndex= (charIndex-1 + characters.length) % characters.length;
        } else if (e.key === "ArrowRight") {
            charIndex= (charIndex+1)%characters.length;
        } else if (e.code=== "Enter"|| e.code ==="Space"){
            selectedChar = characters[charIndex];
            state= "LEVELS";
        }
        return;
    }

    if (state === "LEVELS"){
        if (e.key=== "ArrowUp"){
            levelIndex =(levelIndex-1 + levels.length) % levels.length;            
        } else if (e.key === "ArrowDown"){
            levelIndex =(levelIndex +1) % levels.length;
        } else if (e.code === "Enter" || e.code== "Space"){
            if (levelIndex <= unlocked){
                level = levelIndex;
                state= "PLAYING";
                startLevel(level);
            }else{
                playt(150, "sawtooth", 0.1);
            }
        }
        return;
    }

    if (state ==="PLAYING"){
        if (e.key === "w" || e.key==="ArrowUp") move(0, -1);
        if (e.key === "s" || e.key === "ArrowDown") move(0, 1);
        if (e.key === "a" || e.key === "ArrowLeft") move(-1, 0);
        if (e.key === "d" || e.key ==="ArrowRight") move(1, 0);
    }    

});

let droids =[]; //Active patrol droids

const levels = [
    // Level 1 
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
    // Level 2 Laser
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
    //Level 3 Lasers and Firewall
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
    //Level 4 Droids 
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
    //Level 5 more droids 
    [
        "wwwwwwwwwwww",
        "w.p..x.o...w",
        "w.ww.w.www.w",
        "w.wL..D..o.w",
        "w.xxxx.w.x.w",
        "w.o..V.D.k.w",
        "w.wwww.www.d",
        "wwwwwwwwwwww"
    ],
    //Level 6 
    [
        "wwwwwwwwwwww",
        "w.p...w....w",
        "w.www.w.ww.w",
        "w.o.H.V.H.kw",
        "w.www.w.ww.w",
        "w.L...w....w",
        "w.wwwwwwww.d",
        "wwwwwwwwwwww"
    ],
    //lvel 7
    [
        "wwwwwwwwwwww",
        "w.p.o.w....w",
        "w.www.w.ww.w",
        "w...D...D.kw",
        "w.ww.ww.ww.w",
        "w.L..o.V...w",
        "w.wwwwwwww.d",
        "wwwwwwwwwwww"
    ],
    [
    // level 8 final
        "wwwwwwwwwwww",
        "w.p.x.o.x..w",
        "w.w.w.w.w.ww",
        "w.L.D.V.D.kw",
        "w.o.x.H.x..w",
        "w.wwwwwwww.d",
        "wwwwwwwwwwww"
    ]

];
// levels

let laseron = false;
let platep = { x: 3, y: 3 };
let lasers = [];

const audio = new (window.AudioContext || window.webkitAudioContext)();

function BGM() {
    if (audio.state=== 'suspended'){
        audio.resume();
    }
    if (bgm.paused) {
        bgm.play().catch(e => console.log("Autoplay waiting for user input", e));
    }
}

function playt(freq, type = "square", duration = 0.08) {
    if (audio.state === 'suspended') audio.resume();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + duration);
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
//Check traps laser, droid, firewall
function check() {
    if (player.x === platep.x && player.y === platep.y){
        laseron = !laseron;
        playt(523.25, "sine", 0.1);
    }
    if (laseron){
        for (let l of lasers) {
            if (player.x === l.x && player.y === l.y) {
                playt(110, "sawtooth", 0.3);
                alert("Vaporized by Security Laser ");
                startLevel(level);
                return;
            }
        }
    } 
    for (let d of droids){
        if (player.x === d.x && player.y ===d.y){
            playt(120, "sawtooth", 0.3);
            alert("Intercepted by Patrol Droid!");
            startLevel(level);
            return;
        }
    }   
}

let grid = [];
let particles = [];

function Particlez(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: (Math.floor(Math.max(20, (canvas.width- ((grid[0] ? grid[0].length: 12) *TILE + 180))/2)) + x*TILE) + 16,
            y: (Math.floor(Math.max(60, (canvas.height - ((grid.length || 8) * TILE))/2)) +y * TILE) + 16,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 10,
            color: color
        });
    }
}

function startLevel(levelNum) {
    grid = levels[levelNum].map(row => row.split(""));    
    canvassize()
    oxygenno = 0;
    maxoxy = baseoxy[levelNum];
    hasKey = false;
    laseron = true; // Reset laser 
    particles = []; 
    platep = { x: -1, y: -1 };
    lasers = [];
    droids= []; 

    const offsetx =Math.floor(Math.max(20, (canvas.width- ((grid[0] ? grid[0].length : 12) *TILE +180))/2));
    const offsety= Math.floor(Math.max(60, (canvas.height - ((grid.length || 8)*TILE))/2));
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === "p") {
                player = { x: c, y: r };
                grid[r][c] = ".";
            } else if (grid[r][c] === "L") {
                platep = { x: c, y: r };
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


// draw stuff
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign ="center";

    if (state=== "MENU"){
        ctx.fillStyle= "#0f172a";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 36px monospace";
        ctx.fillText("PAWXYGEN RUSH", canvas.width/ 2, canvas.height / 2-40);

        ctx.fillStyle = "#38bdf8";
        ctx.font= "16px monospace";
        ctx.fillText("Press Space or Arrow Keys to Start", canvas.width / 2, canvas.height/ 2+ 10);
        return;
    }

    if (state ==="SELECT"){
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 28px monospace";
        ctx.textAlign = "center";
        ctx.fillText("CHOOSE YOUR CHARACTER", canvas.width/2, canvas.height/2 - 80);

        let c = characters[charIndex];
        ctx.fillStyle =c.color;
        ctx.font = "bold 22px monospace";
        ctx.fillText(`> ${c.name} <`, canvas.width/2, canvas.height/2 -20);
        chardraw(canvas.width / 2-24, canvas.height / 2-10, 1.5, c);

        ctx.fillStyle = "#94a38b";
        ctx.font = "14px monospace";
        ctx.fillText("Use LEFT/RIGHT arrows to switch, ENTER to select", canvas.width/2, canvas.height/2 +80);
        return;
    }

    if (state === "LEVELS"){
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        ctx.fillStyle ="#f8fafc";
        ctx.font = "bold 28px monospace";
        ctx.textAlign= "center";
        ctx.fillText("SELECT MISSION", canvas.width/2, canvas.height/2 -140);
    
        for (let i =0; i< levels.length; i++ ) {
            let isUnlocked =i<= unlocked;
            ctx.fillStyle = isUnlocked ? (i=== levelIndex ? "#38bdf8" : "#f8fafc") : "#475569"; 
            let statusText = isUnlocked ? `Level ${i+1}`: `Level ${i+ 1} [LOCKED]`;
            if (i=== levelIndex) statusText = `> ${statusText}<`;
            ctx.font ="16px monospace";
            ctx.fillText(statusText, canvas.width/2, canvas.height/2-90 + (i*24));
        }   
        
        ctx.fillStyle="#38bdf8";
        ctx.font= "14px monospace";
        ctx.fillText("Use UP/DOWN arrows to choose, ENTER to launch", canvas.width/2, canvas.height/2 +130); 
        return;   
    }

    ctx.textAlign = "left";
    const gridcols = grid[0] ? grid[0].length : 12;
    const gridrows = grid.length || 8;
    const gridwidth = gridcols *TILE;
    const gridheight = gridrows* TILE;

    const totalwidth = gridwidth +180;
    const offsetx = Math.floor(Math.max(20, (canvas.width -totalwidth)/2));
    const offsety =Math.floor(Math.max(60, (canvas.height - gridheight)/2));
    const s = TILE/32;

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const tile = grid[r][c];
            const gx = offsetx + c*TILE;
            const gy = offsety+ r* TILE;
        
            ctx.fillStyle = "#0f172a"; // Default bg color
            
            
            
            if (tile === "w") { 
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(offsetx + c* TILE, offsety+ r * TILE, TILE, TILE);
                ctx.strokeStyle = "#334155";
                const pad =Math.round(2*s);
                ctx.strokeRect(gx+pad, gy+ pad, TILE -pad*2, TILE -pad*2);
            }    
            else if (tile === "o") { 
                //Oxygen tanks
                const ox = gx;
                const oy = gy;
                ctx.fillStyle ="#06b6d4";//body
                ctx.fillRect(ox + 10 *s, oy+ 10 *s,12* s, 16 * s);
                ctx.fillStyle ="#94a3b8"; //Cap
                ctx.fillRect(ox + 12 *s, oy +6* s, 8 *s,4*s);
                ctx.fillStyle = "#67e8f9"; //Glass
                ctx.fillRect(ox + 13*s, oy+13 *s,6 * s, 6* s);
                //oxygen tube/pipe
                ctx.strokeStyle = "#a5f3fc";
                ctx.lineWidth=2*s;
                ctx.beginPath();
                ctx.moveTo(ox +18 * s, oy + 8 *s);
                ctx.bezierCurveTo(ox + 26 * s, oy +8 *s, ox+26 * s, oy+ 22 * s, ox + 22 * s, oy +24 * s);
                ctx.stroke();
            }    
                
                
            else if (tile === "k") { 
                //Key
                const kx = gx;
                const ky = gy;
                ctx.fillStyle = "#eab308";
                ctx.beginPath();
                ctx.arc(kx + 12 *s, ky +14*s, 5 *s,0, Math.PI*2);//Ring part thing
                ctx.fill();
                ctx.fillRect(kx +16 *s, ky + 13*s,10 * s,3 * s);//Main shaft
                //key gaps
                ctx.fillRect(kx+22 * s, ky + 16 * s, 3 * s,4*s);
                ctx.fillRect(kx +19*s, ky + 16*s,2 * s,3* s);
             }
            else if (tile === "d") {
                //door
                const dx = gx;
                const dy = gy;
                //Metl Frame
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(dx +2 *s, dy+2 *s, 28 *s, 28*s);

                //Inner part
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(dx +5*s, dy + 5*s,22*s, 22 *s);
                
                //Shiutter opening vertically
                ctx.fillStyle = "#334155";
                ctx.fillRect(dx + 6 *s, dy +6*s, 9 *s, 20* s); //Left
                ctx.fillRect(dx + 17* s, dy +6* s, 9*s, 20*s); //Right

                //Highlights
                ctx.fillStyle = "#475569";
                ctx.fillRect(dx +7 * s, dy + 8*s,7*s, 16*s);
                ctx.fillRect(dx +18*s, dy + 8 *s,7 *s, 16*s);
                
                //Warning stripes
                ctx.fillStyle = "#eab308";
                ctx.fillRect(dx +4 *s, dy +2 *s,4*s,3*s);
                ctx.fillRect(dx + 24* s, dy + 2 *s, 4 * s,3*s);
                ctx.fillRect(dx +4*s, dy +27*s, 4*s,3*s);
                ctx.fillRect(dx +24*s, dy + 27*s, 4 * s,3 * s);

                //Indicator green if player has the key
                ctx.fillStyle = hasKey ? "#10b981": "#ef4444";
                ctx.fillRect(dx + 12 *s, dy +3*s, 8*s, 3*s);
            


            }    
            else if (tile === "x") { 
                ctx.fillStyle ="#ef4444";
                ctx.fillRect(gx +4*s, gy +4 *s, 24 *s, 24*s);
                ctx.fillStyle = "#fca5a5";
                ctx.fillRect(gx + 8* s, gy+8 * s, 16 * s, 16*s);
            }
        }    
    }
    
    //PrPlate
    if (platep.x !== -1) {
        const gx= offsetx +platep.x *TILE;
        const gy = offsety +platep.y * TILE;
        ctx.fillStyle ="#475569";
        ctx.fillRect(gx +4 * s, gy+ 4*s, 24*s, 24*s);
        ctx.fillStyle = laseron ? "#c084fc" : "#6b21a8";
        ctx.fillRect(gx +8*s, gy+8*s, 16*s, 16*s);        
    }
    
    //Laser
   for (let l of lasers) {
    const lx = offsetx +l.x * TILE;
    const ly = offsety + l.y * TILE;
    const color = laseron ? "#ff0055" : "#475569";
    const core = laseron ? "#ffffff": "#64748b";
    
    if (l.type == "V") {
        //Vert Beam
        ctx.fillStyle = color;
        ctx.fillRect(lx + 10 *s, ly + 2*s, 12*s, 28* s);
        ctx.fillStyle =core;
        ctx.fillRect(lx + 14*s, ly + 2* s, 4* s, 28* s);
    } else{
        //Horizontal Beam
        ctx.fillStyle = color;
        ctx.fillRect(lx + 2 * s, ly + 10 * s, 28* s, 12*s);
        ctx.fillStyle = core;
        ctx.fillRect(lx + 2 * s, ly + 14* s, 28*s, 4*s);
    }
   }

   const px= offsetx+ player.x*TILE;
   const py= offsety+ player.y*TILE;
   chardraw(px, py, s, selectedChar);
   
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
        const dx = offsetx +d.x *TILE;
        const dy= offsety+ d.y* TILE;
        ctx.fillStyle = "#64748b"
        ctx.fillRect(dx + 6 * s, dy +6 * s, 20*s, 20* s); //Metal Chassis
        ctx.fillStyle ="#ef4444";
        ctx.fillRect(dx +10 *s, dy +12 *s, 12*s, 4*s)//Red visor
        ctx.fillStyle = "#0284c7"
        ctx.fillRect(dx+14* s, dy+ 2 *s, 4*s, 4* s); //Beacon
    }

    legend(offsetx + gridwidth + 30, offsety);
}

function chardraw(px, py, s, c){
    if (c.type=== "raccoon"){
        drawrocket(px, py, s);
        return;
    }
    //Suit nd tail
    ctx.strokeStyle =c.color;
    ctx.lineWidth = 3*s;
    ctx.beginPath();
    ctx.arc(px +6*s, py +20 * s, 6* s, Math.PI * 0.5, Math.PI *1.5, false);
    ctx.stroke();

    //suit body
    ctx.fillStyle = c.suit;
    ctx.beginPath();
    ctx.ellipse(px +16 *s, py +26*s, 9*s, 6*s, 0,0, Math.PI *2, false);
    ctx.fill();

    

    //head
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(px+16*s, py +15 * s, 8*s, 0, Math.PI *2);
    ctx.fill();

    // main specific parts
    if (c.type === "dog"){
        //Laika
        ctx.fillStyle = c.accent;
        ctx.fillRect(px + 6 *s, py +10*s, 4*s, 7*s);
        ctx.fillRect(px+22*s, py +10*s, 4*s, 7*s);
        ctx.fillStyle= "#0f172a";
        ctx.fillRect(px+11*s, py+ 13* s, 2 *s, 3* s);
        ctx.fillRect(px + 19*s, py+13*s, 2*s, 3 * s);
        ctx.fillRect(px+14*s, py + 16*s, 4*s, 2*s);
    }
    else if (c.type ==="monkey"){
        //Mort
        ctx.fillStyle =c.accent;
        ctx.beginPath();
        ctx.arc(px+6*s, py +14*s, 4*s, 0, Math.PI*2);
        ctx.arc(px +26*s, py+14*s, 4*s, 0, Math.PI*2);
        ctx.fill();
        //biggie eyes
        ctx.fillStyle= "#fef08a";
        ctx.fillRect(px +10*s, py+12*s, 5*s, 5*s);
        ctx.fillRect(px +17*s, py +12*s, 5*s, 5 *s);

        //pupils
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px+ 12*s, py+13 *s, 2*s, 3*s);
        ctx.fillRect(px+18*s, py+13 * s, 2*s, 3*s);

    }
    else if(c.type=== "cat") {
        //Larry
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.moveTo(px +8*s, py +14*s);
        ctx.lineTo(px+ 6 *s, py +6*s);
        ctx.lineTo(px +13 *s, py +10*s);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px +24*s, py+14*s);
        ctx.lineTo(px+26*s, py+6 *s);
        ctx.lineTo(px+19*s, py+10* s);
        ctx.fill();
        ctx.fillStyle="#a7f3d0";
        ctx.fillRect(px+11*s, py + 13 *s, 3*s, 3*s);
        ctx.fillRect(px+ 18*s, py+ 13*s, 3*s, 3*s);
        ctx.fillStyle= "#0f172a";
        ctx.fillRect(px + 12*s, py+ 13*s, 1*s, 3*s);
        ctx.fillRect(px+19 *s, py+ 13 * s, 1*s, 3*s);
        ctx.fillStyle= "#f472b6";
        ctx.fillRect(px+15*s, py+17*s, 2*s, 1*s);
    } 
    else if (c.type=== "turtle"){
        //Michelangelo w bandana
        ctx.fillStyle= c.accent; // Orange
        ctx.fillRect(px+8*s, py+12* s, 16*s, 4*s);
        //bndana
        ctx.fillRect(px+23*s, py+14 * s, 5*s, 2*s);
        ctx.fillRect(px+24*s, py +16*s, 5*s, 2*s);
        
        //eyes
        ctx.fillStyle ="#ffff";
        ctx.fillRect(px+10*s, py+13*s, 3*s, 2*s);
        ctx.fillRect(px+ 19*s, py+13*s, 3*s, 2*s);
        ctx.fillStyle ="#0f172a";
        ctx.fillRect(px+11*s, py+ 13*s, 1*s, 2*s);
        ctx.fillRect(px+20* s, py+13 * s, 1*s, 2*s);
    } 
    
    //Collar
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(px +8*s, py+20* s, 16*s, 2*s);

    //Bubble
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.beginPath();
    ctx.arc(px +16*s, py +13*s, 11*s, 0, Math.PI *2);
    ctx.fill();
    

}

function drawrocket(px,py,s){
    //tail
    ctx.strokeStyle="#475569";
    ctx.lineWidth= 5*s;
    ctx.beginPath();
    ctx.arc(px +4*s, py+22 *s, 7*s, Math.PI* 0.4, Math.PI *1.4, false);
    ctx.stroke();
    //stripe
    ctx.strokeStyle= "#0f172a";
    ctx.lineWidth= 3*s;
    ctx.strokeRect(px+1*s, py+ 18* s, 4*s, 3*s);

    //orange suit
    ctx.fillStyle= "#ea580c";
    ctx.beginPath();
    ctx.ellipse(px+16 *s, py+26*s, 9*s, 6*s, 0, 0, Math.PI*2, false);
    ctx.fill();

    //collar nd straps
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(px+8* s, py+20* s, 16*s, 3*s);
    ctx.fillStyle = "#fbbf24"; //brass thingy
    ctx.fillRect(px+14 *s, py +20*s, 4*s,3*s);

    

    //ears
    //left
    ctx.fillStyle= "#475569";
    ctx.beginPath();
    ctx.moveTo(px+7* s, py+13*s);
    ctx.lineTo(px+5*s, py+4*s);
    ctx.lineTo(px+12 * s, py+8* s);
    ctx.fill();
    ctx.fillStyle= "#fca5a5";
    ctx.fillRect(px+ 7* s, py+7 * s, 2*s, 3*s);

    //right
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(px+25 * s, py+12*s);
    ctx.lineTo(px+27*s, py+4*s);
    ctx.lineTo(px +20*s, py+8*s);
    ctx.fill();
    ctx.fillStyle= "#fca5a5";
    ctx.fillRect(px+ 23*s, py+7*s, 2*s, 3*s);
    

    //head
    ctx.fillStyle="#475569";
    ctx.beginPath();
    ctx.arc(px+16*s, py+ 15*s, 8*s,0, Math.PI*2);
    ctx.fill();

    //cheeks
    ctx.fillStyle ="#f8fafc";
    ctx.fillRect(px+ 10*s, py+ 16*s, 12*s, 5*s);


    // dark patches
    ctx.fillStyle ="#0f172a";
    ctx.beginPath();
    ctx.ellipse(px+12*s, py +14*s, 4*s, 3*s, -0.2, 0, Math.PI*2);
    ctx.ellipse(px+20* s, py+14 * s, 4*s, 3*s, 0.2, 0, Math.PI*2);
    ctx.fill();

    //eye and nose
    ctx.fillStyle = "#fbbf24";//eyes
    ctx.fillRect(px +11*s, py +13* s, 2*s, 2*s);
    ctx.fillRect(px+19*s, py +13 * s, 2*s, 2*s);

    ctx.fillStyle="#000000"; //nose
    ctx.fillRect(px+14 * s, py + 17*s, 4*s, 3*s);

    //bubble
    ctx.fillStyle= "rgba(56, 189, 248, 0.35)";
    ctx.beginPath();
    ctx.arc(px+ 16*s, py+13*s, 12*s, 0, Math.PI*2);
    ctx.fill();


}

function legend(lx, ly){
    

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

gameloop();
