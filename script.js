const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

//variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};

//event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // console.log(e.code);
});

document.addEventListener('keyup', (e)=> {
    keys[e.code] = false;
})


class Player{
    constructor(x,y,w,h,c){
        //x pos, y pos, width, height, color
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dy = 0; //direction y , dikeylik
        this.jumpForce = 15;
        this.originalHeight = h;
        this.grounded = false;
        this.jumpTimer = 0;
    }

    Animate(){
        // jump 
        if(keys['Space'] || keys['KeyW']) {
            // console.log('jump');
            this.Jump()
        } else {
            this.jumpTimer = 0;
        }
        
        if(keys['ShiftLeft'] || keys['KeyS']){
            this.h = this.originalHeight / 2;
        } else {
            this.h = this.originalHeight;
        }

        this.y += this.dy;

        //gravity
        if(this.y + this.h < canvas.height){
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }


        this.Draw();
    }

    Jump(){
        if(this.grounded && this.jumpTimer == 0){
            this.jumpTimer = 1,
            this.dy = -this.jumpForce;
        } else if(this.jumpTimer > 0 && this.jumpTimer < 15){
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }


    Draw() {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}


class Obstacle {
    constructor(x,y,w,h,c){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        
        this.dx = -gameSpeed
    }

    Update(){
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }

    Draw(){
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Text {
    constructor(t,x,y,a,c,s){
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw(){
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px sans-serif";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}


//game functions
function SpawnObstacle (){
    let size = randomIntInRange(20,70);
    // console.log(size);
    let type = randomIntInRange(0,1);
    //0 yerdeki engeller 1 havadaki engeller
    // console.log(type);
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, 'blue');

    if( type == 1){
        obstacle.y -= player.originalHeight - 10;
    }
    obstacles.push(obstacle);
}

// SpawnObstacle();

function randomIntInRange(min, max){
    return Math.round(Math.random() * (max - min) + min);
}




function Start(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.font = "20px sans-serif";

    gameSpeed = 3;
    gravity = 1;

    score = 0;
    highscore = 0;
    if(localStorage.getItem('highscore')){
        highscore = localStorage.getItem('highscore');
    }

    player = new Player(25, 0, 50, 50, 'crimson');

    scoreText = new Text("Score : " + score, 25, 25, "left", "green", "20");

    highscoreText = new Text("high score : " + highscore, canvas.width - 25, 25, "right", "orange");
    
    requestAnimationFrame(Update)
    // player.Draw();
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update(){
    requestAnimationFrame(Update);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    //canvası temizlemeliyiz ki uzayıp gitmesin kutu formu bozulmasın hareket halinde

    spawnTimer--;
    if(spawnTimer <= 0){
        SpawnObstacle();
        console.log(obstacles);
        spawnTimer = initialSpawnTimer - gameSpeed * 8;

        if(spawnTimer < 60) {
            spawnTimer = 60;
        }
    }

    //spawn enemies
    for(let i = 0; i < obstacles.length; i++){
        let o = obstacles[i];

        if(o.x + o.w < 0){
            obstacles.splice(i,1);
            //engeller ekrandan çıkınca arrayden de slinsin, performans sıkıntısına karşı
        }

        if(
            player.x < o.x +o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
            ){
                obstacles = [];
                score = 0;
                spawnTimer = initialSpawnTimer;
                gameSpeed = 3;
                window.localStorage.setItem('highscore', highscore);
        }
        
        o.Update();
    }

    player.Animate();
    // player.x++;
    // player.y++;
    score++;
    scoreText.t = "Score : " + score;
    scoreText.Draw();

    if(score > highscore){
        highscore = score;
        highscoreText.t = "highscore : " + highscore;
        // window.localStorage.setItem('highscore', highscore);
    }

    highscoreText.Draw();

    gameSpeed += 0.003;
}

Start();