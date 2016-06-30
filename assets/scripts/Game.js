cc.Class({
    extends: cc.Component,

    properties: {
        block: cc.Prefab,
        bg: cc.Sprite,
        currentScoreLabel: cc.Label,
        bestScoreLabel: cc.Label,
        currentScore:0,
        bestScore:0,
        gameOverMenu: cc.Node,
        moving: false
    },    

    // use this for initialization
    onLoad: function () {
        this.creatBgBlocks();
        this.addTouchEvents();
        this.initColor();
    },

    start: function() {
        this.initData();
        this.gameOverMenu.getComponent('GameOverMenu').init(this);
        this.bestScore = cc.sys.localStorage.getItem('bestScore');
        if (!this.bestScore) {
            this.bestScore = 0;
        }
        this.bestScoreLabel.getComponent(cc.Label).string = "最高分数: " + this.bestScore;
    },

    restart: function() {
        this.initData();
        this.currentScore = 0;
        this.updateSocreLabel();
    },

    creatBgBlocks: function() {
        var betweenWidth = 20;
        var size = (cc.winSize.width - betweenWidth * 5) / 4;
        this.blockSize = size;
        var x = betweenWidth + size/2;
        var y = size;
        var s = 0;
        // 用来存储坐标点位置
        this.positions = [];
        for (var i = 0; i < 4; i++) {
            this.positions.push([]);
            for (var j = 0; j < 4; j++) {
                var b = cc.instantiate(this.block);
                b.getChildByName('label').active = false;
                b.attr({
                    x: x,
                    y: y,
                    width: size,
                    height: size
                });
                this.positions[i].push(cc.p(x, y));
                // b.setPosition(cc.p(x, y));
                x += (size + betweenWidth);
                this.bg.node.addChild(b);
            }
            y += (size + betweenWidth);
            x = betweenWidth + size/2;
            
        }
    },

    /// 初始化数据
    initData: function() {
        if (this.blocks) {
            for (var i = 0; i < this.blocks.length; i++) {
                for (var j = 0; j < this.blocks[i].length; j++) {
                    if (this.blocks[i][j]) {
                        this.blocks[i][j].destroy();
                    }
                }
            }
        }
        this.data = [];
        this.blocks = [];
        for (var i = 0; i < 4; i++) {
            this.data.push([0,0,0,0]);
            this.blocks.push([null, null, null, null]);
        }

        this.addBlock(1, 1, 0);
        this.addBlock(1, 2, 0);
        this.addBlock(1, 3, 1);
        cc.log(this.data);
    },

    /// 颜色数据
    initColor: function() {
        this.colors = [];
        this.colors[2] = cc.color(237,241,21,255);
        this.colors[4] = cc.color(241,180,21,255);
        this.colors[8] = cc.color(171,241,21,255);
        this.colors[16] = cc.color(149,160,216,255);
        this.colors[32] = cc.color(187,149,216,255);
        this.colors[64] = cc.color(216,149,209,255);
        this.colors[128] = cc.color(28,118,156,255);
        this.colors[256] = cc.color(16,74,99,255);
        this.colors[512] = cc.color(168,85,25,255);
        this.colors[1024] = cc.color(236,122,38,255);
        this.colors[2048] = cc.color(236,86,33,255);
    },

    getEmptyLocations: function() {
        // 空闲的位置
        var emptyLocations = [];
        for (var i = 0; i < this.data.length; i++){
            for (var j = 0; j < this.data[i].length; j++) {
                if (this.data[i][j] == 0) {
                    emptyLocations.push(i * 4 + j);
                }
            }
        }
        return emptyLocations;
    },

    addBlock: function(x1, y1, num) {
        // 空闲的位置
        var emptyLocations = this.getEmptyLocations();
        cc.log(emptyLocations);
        /// 没有空位了
        if (emptyLocations.length == 0) {
            return false;
        }
        var p1 = Math.floor(cc.random0To1() * emptyLocations.length);
        p1 = emptyLocations[p1];
        var x = Math.floor(p1/4);
        var y = Math.floor(p1%4);
        x = x1 || x;
        y = y1 || y;
        cc.log("x: " + x + " y: " + y);

        var numbers = [2,4];
        var n = Math.floor(cc.random0To1() * numbers.length);
        if (num != undefined) {
            n = num;
        }

        var b = cc.instantiate(this.block);
        b.attr({
            width: this.blockSize,
            height: this.blockSize,
        });
        b.setColor(this.colors[numbers[n]]);
        b.setPosition(this.positions[x][y]);
        b.getChildByName('label').getComponent(cc.Label).string = numbers[n];
        this.bg.node.addChild(b);
        this.blocks[x][y] = b;
        b.scaleX = 0;
        b.scaleY = 0;
        var show = cc.scaleTo(0.1, 1, 1);
        b.runAction(show);

        this.data[x][y] = numbers[n];

        return true;
    },

    /**
     * 完成移动后的操作
     */
    afterMove: function(moved) {
        cc.log('afterMove');        
        if (moved) {
            this.currentScore += 1;
            this.updateSocreLabel();
            this.addBlock();
        }
        if (this.isGameOver()) {
            gameOver();
        }
        this.moving = false;
    },

    isGameOver: function() {
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                var n = this.data[x][y];
                if (x - 1 >= 0){
                    if (this.data[x-1][y] == n) {
                        return false;
                    }
                }
                if (x + 1 < 4) {
                    if (this.data[x+1][y] == n){
                        return false;
                    }
                }
                if (y - 1 >= 0){
                    if (this.data[x][y-1] == n) {
                        return false;
                    }
                }
                if (y + 1 < 4){
                    if (this.data[x][y+1] == n) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    gameOver: function() {
        this.gameOverMenu.getComponent('GameOverMenu').show();
        this.updateBestScore();
    },

    /**
     * 更新最高分数
     */
    updateBestScore: function() {
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            this.bestScoreLabel.getComponent(cc.Label).string = "最高分数: " + this.bestScore;
            cc.sys.localStorage.setItem('bestScore', this.bestScore);
        }
    },

    /// 添加手势控制
    addTouchEvents: function() {
        var self = this;
        this.node.on('touchstart', function(event) {
            this.touchStartTime = Date.now();
            this.touchStartPoint = event.getLocation();
            return true;
        });

        this.node.on('touchmove', function(event) {
        });

        this.node.on('touchend', function(event) {            
            this.touchEndTime = Date.now();
            this.touchEndPoint = event.getLocation();
            var vec = cc.p(this.touchEndPoint.x - this.touchStartPoint.x, this.touchEndPoint.y - this.touchStartPoint.y);            
            var duration = this.touchEndTime - this.touchStartTime;
            /// 少于200ms才判断上下左右滑动
            if (duration < 400) {
                if (this.moving) {
                    return;
                }
                // x比y大，左右滑动
                var startMoveDis = 50;
                if (Math.abs(vec.x) > Math.abs(vec.y)) {
                    if (vec.x > startMoveDis){
                        cc.log("右滑");
                        self.moving = true;
                        self.moveRight();                        
                    } else if (vec.x < -startMoveDis){
                        cc.log("左滑");
                        self.moving = true;
                        self.moveLeft();
                    }
                } else { // 上下滑动
                    if(vec.y > startMoveDis){
                        cc.log("上滑");
                        self.moving = true;
                        self.moveUp();
                    } else if (vec.y < -startMoveDis){
                        cc.log("下滑");
                        self.moving = true;
                        self.moveDown();
                    }
                }
            }
            
        });
    },

    /**
     * 移动操作
     */
    moveAction: function(block, pos, callback) {
        var m = cc.moveTo(0.08, pos);
        var finished = cc.callFunc(function() {
            callback();
        });
        block.runAction(cc.sequence(m, finished));
    },

    /**
     * 合并操作
     */
    mergeAction: function(b1, b2, num, callback) {
        var self = this;
        b1.destroy(); // 合并后销毁
        var scale1 = cc.scaleTo(0.1,1.1);
        var scale2 = cc.scaleTo(0.1, 1);
        var mid = cc.callFunc(function() {
            b2.setColor(self.colors[num]);
            b2.getChildByName('label').getComponent(cc.Label).string = num;
        });
        var finished = cc.callFunc(function() {
            callback();
        });
        b2.runAction(cc.sequence(scale1, mid, scale2, finished));
    },

    moveLeft: function() {
        var self = this;
        // 递归移动操作
        var isMoved = false;
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0,0,0,0]);
        }
        var move = function(x, y, callback) {
            if (y == 0) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x][y-1] != 0 && self.data[x][y-1] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x][y-1] == self.data[x][y] && !merged[x][y-1]) {
                merged[x][y-1] = 1;
                self.data[x][y-1] *= 2;
                self.data[x][y] = 0;
                var b2 = self.blocks[x][y-1];
                var b1 = self.blocks[x][y];
                var p = self.positions[x][y-1];
                self.blocks[x][y] = null;
                self.moveAction(b1, p, function() {
                    self.mergeAction(b1, b2, self.data[x][y-1], callback);
                });
                isMoved = true;
            }
            else if (self.data[x][y-1] == 0) {
                self.data[x][y-1] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x][y-1];
                self.blocks[x][y-1] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function(){
                    move(x, y-1, callback);
                });
                isMoved = true;
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var y = 1; y < 4; y++) {
            for (var x = 0; x < 4; x++){
                var n = this.data[x][y];
                if (n != 0){
                    total += 1;
                    willMove.push({x: x, y: y});
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function() {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },

    moveRight: function() {
        var self = this;
        // 递归移动操作
        var isMoved = false;
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0,0,0,0]);
        }
        var move = function(x, y, callback) {
            if (y == 3) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x][y+1] != 0 && self.data[x][y+1] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x][y+1] == self.data[x][y] && !merged[x][y+1]) {
                merged[x][y+1] = 1;
                self.data[x][y+1] *= 2;
                self.data[x][y] = 0;
                var b1 = self.blocks[x][y+1];
                var b = self.blocks[x][y];
                var p = self.positions[x][y+1];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function() {
                    self.mergeAction(b, b1, self.data[x][y+1], callback);
                });
                isMoved = true;
            }
            else if (self.data[x][y+1] == 0) {
                self.data[x][y+1] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x][y+1];
                self.blocks[x][y+1] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function(){
                    move(x, y+1, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var y = 2; y >=0; y--) {
            for (var x = 0; x < 4; x++){
                var n = this.data[x][y];
                if (n != 0){
                    total += 1;
                    willMove.push({x: x, y: y});
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function() {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },

    moveUp: function() {
        var self = this;
        // 递归移动操作
        var isMoved = false;
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0,0,0,0]);
        }
        var move = function(x, y, callback) {
            if (x == 3) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x+1][y] != 0 && self.data[x+1][y] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x+1][y] == self.data[x][y] && !merged[x+1][y]) {
                merged[x+1][y] = 1;
                self.data[x+1][y] *= 2;
                self.data[x][y] = 0;
                var b1 = self.blocks[x+1][y];
                var b = self.blocks[x][y];
                var p = self.positions[x+1][y];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function() {
                    self.mergeAction(b, b1, self.data[x+1][y], callback);
                });
                isMoved = true;
            }
            else if (self.data[x+1][y] == 0) {
                self.data[x+1][y] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x+1][y];
                self.blocks[x+1][y] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function(){
                    move(x+1, y, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var x = 2; x >= 0; x--) {
            for (var y = 0; y < 4; y++){
                var n = this.data[x][y];
                if (n != 0){
                    total += 1;
                    willMove.push({x: x, y: y});
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function() {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },

    moveDown: function() {
        var self = this;
        // 递归移动操作
        var isMoved = true;
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0,0,0,0]);
        }
        var move = function(x, y, callback) {
            if (x == 0) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x-1][y] != 0 && self.data[x-1][y] != self.data[x][y]) {
                if (callback) {
                    callback();
                }
                return;
            }
            else if (self.data[x-1][y] == self.data[x][y] && !merged[x-1][y]) {
                merged[x-1][y] = 1;
                self.data[x-1][y] *= 2;
                self.data[x][y] = 0;
                var b1 = self.blocks[x-1][y];
                var b = self.blocks[x][y];
                var p = self.positions[x-1][y];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function() {
                    self.mergeAction(b, b1, self.data[x-1][y], callback);
                });
                isMoved = true;
            }
            else if (self.data[x-1][y] == 0) {
                self.data[x-1][y] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x-1][y];
                self.blocks[x-1][y] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function(){
                    move(x-1, y, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var x = 1; x < 4; x++) {
            for (var y = 0; y < 4; y++){
                var n = this.data[x][y];
                if (n != 0){
                    total += 1;
                    willMove.push({x: x, y: y});
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function() {
                counter += 1;
                if (counter == total) {
                    cc.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },


    updateSocreLabel: function() {
        this.currentScoreLabel.getComponent(cc.Label).string = "分数: " + this.currentScore;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
