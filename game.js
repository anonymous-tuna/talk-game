// ====== 맵 설정 ======
const width = 20;
const height = 12;
const map = [];
let player = { x: 1, y: 1, hp: 10 };

// 랜덤 적 생성 (플레이어 시작 위치와 겹치지 않도록)
let enemy;
do {
    enemy = {
        x: Math.floor(Math.random() * (width - 2)) + 1,
        y: Math.floor(Math.random() * (height - 2)) + 1,
        hp: 3
    };
} while (enemy.x === player.x && enemy.y === player.y);

// ====== 맵 생성 ======
function generateMap() {
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                map[y][x] = '#';
            } else {
                map[y][x] = '.';
            }
        }
    }
}
generateMap();

// ====== 화면 그리기 ======
function draw() {
    let output = "";
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (player.x === x && player.y === y) {
                output += "@";
            } else if (enemy.x === x && enemy.y === y && enemy.hp > 0) {
                output += "E";
            } else {
                output += map[y][x];
            }
        }
        output += "\n";
    }
    output += `\n❤️ HP: ${player.hp}  |  적 HP: ${enemy.hp > 0 ? enemy.hp : '처치됨!'}`;
    document.getElementById("game").textContent = output;
}
draw();

// ====== 키보드 입력 처리 (턴제!) ======
document.addEventListener("keydown", function (e) {
    let dx = 0, dy = 0;

    if (e.key === "ArrowUp") dy = -1;
    if (e.key === "ArrowDown") dy = 1;
    if (e.key === "ArrowLeft") dx = -1;
    if (e.key === "ArrowRight") dx = 1;

    if (dx === 0 && dy === 0) return;

    let nx = player.x + dx;
    let ny = player.y + dy;

    if (enemy.x === nx && enemy.y === ny && enemy.hp > 0) {
        enemy.hp -= 2;
        if (enemy.hp <= 0) {
            enemy.hp = 0;
        }
    }
    else if (ny >= 0 && ny < height && nx >= 0 && nx < width && map[ny][nx] === ".") {
        player.x = nx;
        player.y = ny;
    }

    if (enemy.hp > 0) {
        if (enemy.x < player.x) enemy.x++;
        else if (enemy.x > player.x) enemy.x--;
        else if (enemy.y < player.y) enemy.y++;
        else if (enemy.y > player.y) enemy.y--;

        if (enemy.x === player.x && enemy.y === player.y) {
            player.hp -= 1;
            if (player.hp <= 0) {
                draw();
                alert("💀 Game Over! 다시 도전하세요!");
                location.reload();
                return;
            }
        }
    }

    draw();
});
