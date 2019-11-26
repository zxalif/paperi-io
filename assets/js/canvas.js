const canvasX = 1240;
const canvasY = 540;
const foodSize = 10;
const poisonSize = 50;
const initialSize = 30;
const positionPerFood = 25;
const speed = 10;
const ballyConsumption = 2;
const releaseSize = 20;
let obstacles = {};

function createId() {
    _length = 12;
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');
    var str = '';
    for (var i = 0; i < _length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
   return str;
}

function checkBoundary(ctx, x, y, size){
    if(x+size > ctx.width && y+size > ctx.height && x <= 0 && y <= 0) return true;
    return false;
}

var Debugger = function () { };
Debugger.debug = true;
Debugger.log = function (message) {
    if(Debugger.debug){
        try {
            console.log(message);
        } catch (exception) {
            return;
        }
    }
}

let Colors = {};
Colors.names = {
    blue: "#0000ff",
    green: "#008000",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#ffa500",
    pink: "#ffc0cb",
    purple: "#800080",
    violet: "#800080",
    yellow: "#ffff00"
};

Colors.random = function() {
    var result;
    var count = 0;
    for (var prop in this.names)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
};

class Utils{
    createId(_length=12) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');
        var str = '';
        for (var i = 0; i < _length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
       return str + Date.now();
    }
}

let Obstacles = {};
Obstacles.counter = 1;
Obstacles.obstacles = {};
Obstacles.createObstacles = function(cvs, x, y, isHealthy){
    const ctx = cvs.getContext("2d");
    const size = isHealthy ? foodSize  : poisonSize;
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    let color = Colors.random();
    this.obstacles[createId()] = {
        x, y, size, color, isHealthy
    };
    ctx.fillStyle = isHealthy ? color : "#ff0000";
    ctx.fill();
    return ctx;
}


class Player extends Utils{

	constructor(canvas, positionX, positionY, name){
        super();
		this.id = super.createId();
		this.sizes = [];
		this._size = 100;
		this.name = name ? name.toUpperCase() : 'PaperIO';
		this.position = {x: positionX, y: positionY};
        this._cvs = canvas;
        this._player_color = Colors.random();
        this.context = this._cvs.getContext("2d");
        this._score = 0;
        this._properties = {  }; // id: size, position, other staff.
        this._properties[this.id] = {
            size: this._size,
            position: this.position,
        };
    }

    _inActionMode(releases=False){
        for(let prop in this._properties){
            console.log(this._properties[prop]);
        }
    }

    break(direction='top'){
        for(let prop in this._properties){
            if(this._properties[prop].size >= initialSize*2){
                let newNode = this.createId();
                let newSize = this._properties[prop].size/2;
                this._properties[newNode] = {
                    size: newSize,
                    position: {
                        x: this._properties[prop].position.x,
                        y: this._properties[prop].position.y,
                    }
                }

                if(direction == 'right'){
                    this._properties[newNode].position.x = this._properties[prop].position.x+newSize;
                }
                if(direction == 'left'){
                    this._properties[newNode].position.x = this._properties[prop].position.x-newSize;
                }

                if(direction == 'top'){
                    this._properties[newNode].position.y = this._properties[prop].position.y+newSize;
                }
                if(direction == 'bottom'){
                    this._properties[newNode].position.y = this._properties[prop].position.y-newSize;
                }
                this._properties[newNode].size = newSize;
                this._properties[prop].size = newSize;
            }
        }
    }

    release(){
        for(let prop in this._properties){
            if(this._properties[prop].size >= initialSize+releaseSize){
                let newSize = this._properties[prop].size-releaseSize;
                // TODO: release on selected direction and add into obstacles as healthy
                this._properties[prop].size = newSize;
                console.log(Object.keys(obstacles).length)
                obstacles[this.createId()] = [
                    this._properties[prop].position.x,
                    this._properties[prop].position.y+newSize,
                    newSize,
                    Colors.random(),
                ];
                console.log(Object.keys(obstacles).length)
            }
        }
    }

    makeTogether(){
        return True;
    }

    _check_overlap(obs){
        for(let prop in this._properties){
            if(obs.isHealthy &&
                this._properties[prop].position.x <= obs.x &&
                this._properties[prop].position.y <= obs.y &&
                (this._properties[prop].position.x+this._size) > (obs.x + obs.size) &&
                (this._properties[prop].position.y+this._size) > (obs.y + obs.size)){
                    this._properties[prop].size += ballyConsumption;
                    this._score += ballyConsumption;
                    return true;
                }
        }
    }

    _check_food_status(obstacles){
        for(let obs in obstacles){
            if(this._check_overlap(obstacles[obs])){
                    delete obstacles[obs];
                    return obstacles;
            }
        }
        return obstacles;
    }

    _draw(x, y, size, color, obs=false){
        this.context.beginPath();
		this.context.rect(x, y, size, size, true);
        this.context.fillStyle = color;
        this.context.fill();
        if(!obs){
            this.context.fillStyle = "black";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "14px Comic Sans MS";
            this.context.fillText(this.name, x+(size/2), y+(size/2));
        }
    }
    init(){
        Debugger.log('Initiate Player');
        this._draw(
            this._properties[this.id].position.x,
            this._properties[this.id].position.y,
            this._properties[this.id].size,
            this._player_color,
        );
    }

    _move(toX, toY, curX, curY, mySize){

        let speedX = (mySize)/curX;
        if(curX > toX){
            curX -= speedX;
        }
        else{
            curX += speedX;
        }

        let speedY =  (mySize)/curY;
        if(curY > toY){
            curY -= speedY;
        }
        else{
            curY += speedY;
        }
        return {curX, curY};
    }

    _direction(x, y, item){
        if(item.position.x >= x){
            if(item.position.y > y){
                return 'bottom-left';
            }
            if(item.position.y < y){
                return 'top-left';
            }
            return 'left';
        }
        if(item.position.y > y){
            if(item.position.y > y){
                return 'bottom-right';
            }
            if(item.position.y < y){
                return 'top-right';
            }
            return 'right';
        }
    }

    __render(x, y, obstacles){
        for(let obs in obstacles){
            this._draw(
                obstacles[obs].x,
                obstacles[obs].y,
                obstacles[obs].size,
                obstacles[obs].color,
                true,
            );
        }
        for(let prop in this._properties){
            let {curX, curY} = this._move(
                x, y, this._properties[prop].position.x, this._properties[prop].position.y,
                this._properties[prop].size);
            this._properties[prop].position.x = curX;
            this._properties[prop].position.y = curY;
            this._draw(
                this._properties[prop].position.x,
                this._properties[prop].position.y,
                this._properties[prop].size,
                this._player_color,
            );
        }
    }

    movement(x, y, obstacles){
        // previous data check for food
        obstacles = this._check_food_status(obstacles);
        this.context.clearRect(0, 0, this._cvs.width, this._cvs.height);
        this.__render(x, y, obstacles);
    }

}


$(document).ready(function(){

    let mouseX = 0;
    let mouseY = 0;
    let poison = 1;

	function getPositionInRange(x, y, maxNot=0){
		return {
			x: Math.random()*(x-maxNot),
			y: Math.random()*(y-maxNot)
		}
	}

	function createFood(cvs, x, y, isHealthy){
		const ctx = cvs.getContext("2d");
		const size = isHealthy ? foodSize  : poisonSize;
		ctx.beginPath();
        ctx.rect(x, y, size, size);
        let color = Colors.random();
        obstacles[createId()] = {
            x, y, size, color, isHealthy
        };
        ctx.fillStyle = isHealthy ? color : "#ff0000";
        ctx.fill();
		return ctx;
	}

    function getMousePosition(event){
        mouseX = event.pageX;
        mouseY = event.pageY;
        return {
            x: mouseX,
            y: mouseY
        }
    }

    function keyPressed(event){
        if(event.keyCode == 32){
            event.preventDefault();
            player.break();
        }
        else if(event.keyCode == 119){
            event.preventDefault();
            player.release();
        }
    }

	const body = document.getElementsByTagName("body")[0]
    body.addEventListener('mousemove', getMousePosition, false);

    const canvas = document.getElementById("canvas");


    const { x, y } =  getPositionInRange(canvasX-initialSize-10, canvasY-initialSize-10, initialSize);
    let player = new Player(canvas, x, y, 'alif');
    player.init();
    body.addEventListener('keypress', keyPressed, true);

	// create food or poison
	setInterval(function(){
		const {x, y} = getPositionInRange(canvasX, canvasY);
        poison += 1;
        let isHealthy = true;
        isHealthy = poison%positionPerFood == 0 ? false : isHealthy;
        Obstacles.createObstacles(canvas, x, y, isHealthy);
    }, 100);

    setInterval(function(){
        player.movement(mouseX, mouseY, Obstacles.obstacles);
    }, 0.1);
});
