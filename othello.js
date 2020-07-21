$(function()
  {
      new Othello("#othello");
  });

var Othello = function(container)
{
    this.container = $(container);
    this.canvas    = this.container.find("canvas")[0];
    this.context   = this.canvas.getContext("2d");

    this.height    = this.canvas.height;
    this.width     = this.canvas.width;
    this.cellwidth = this.width / 8;
    
    this.backgroundcolor = "#00790C";
    this.linecolor       = "#FFFFFF";

    /* [black, white] */
    this.BLACK = 0;
    this.WHITE = 1;
    this.board = [[0, 0], [0, 0]];

    this.message = this.container.find("#message");

    this.ableclick = false;
    this.init();
    this.paint();
    this.ableclick = true;
    
    var self = this;
    this.container.find("canvas").on("click", function(event) {
        if(!self.ableclick) return;
        x = event.originalEvent.pageX - $(this).offset().left;
        y = event.originalEvent.pageY - $(this).offset().top;
        self.Attach(x / self.cellwidth | 0, y / self.cellwidth | 0, self.user);
    });
};

Othello.prototype.init = function()
{
    this.cell_put(this.BLACK, 3, 4);
    this.cell_put(this.BLACK, 4, 3);
    this.cell_put(this.WHITE, 3, 3);
    this.cell_put(this.WHITE, 4, 4);
};

Othello.prototype.cell_put = function(color, y, x) {
    let idx = y * 8 + x;
    if(idx < 32) this.board[color][0] |= 1 << idx;
    else this.board[color][1] |= 1 << (idx - 32);
};

/* 描画 */
Othello.prototype.paint = function()
{
    var object = this.context;

    object.fillStyle = this.backgroundcolor;
    object.fillRect(0, 0, this.width, this.width);

    object.strokeStyle = this.linecolor;
    object.beginPath();
    for(var i = 0; i < 8; i++) {
        object.moveTo(0, i * this.cellwidth);
        object.lineTo(this.width, i * this.cellwidth);
        object.moveTo(i * this.cellwidth, 0);
        object.lineTo(i * this.cellwidth, this.width);
    }
    object.closePath();
    object.stroke();

    this.board[1] = this.make_legal(this.board[1], this.board[0]);
    console.log(this.board[0]);
    
    for(var i = 0; i < 8; i++) {
        for(var j = 0; j < 8; j++) {
            let pos = i >= 4 ? 1 : 0;
            let idx = i >= 4 ? i * 8 + j - 32 : i * 8 + j;
            if((this.board[0][pos] >>> idx) & 1) {
                object.beginPath();
                object.fillStyle = "#000000";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                           this.cellwidth / 2 + i * this.cellwidth,
                           this.cellwidth * 0.45, 0, Math.PI * 2, true);
                object.fill();
            }
            if((this.board[1][pos] >>> idx) & 1) {
                object.beginPath();
                object.fillStyle = "#FFFFFF";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                           this.cellwidth / 2 + i * this.cellwidth,
                           this.cellwidth * 0.45, 0, Math.PI * 2, true);
                object.fill();
            }
        }
    }
    this.message.text("黒 " + this.pop_count(this.board[0][0], this.board[0][1]) + ", 白 " + this.pop_count(this.board[1][0], this.board[1][1]));
};

/* 有効手に 1 を立てる */
Othello.prototype.make_legal = function(p, o) {
    let p1 = p[1], p0 = p[0];
    var r1 = 0, r0 = 0;
    var t0, t1;

    // 左右
    var o1 = o[1] & 0x7e7e7e7e;
    var o0 = o[0] & 0x7e7e7e7e;
    
    // 左
    t1 =  (p1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    r1 |= (t1 >>> 1);
    t0 =  (p0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    r0 |= (t0 >>> 1);
    
    // 右
    t1 =  (p1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    r1 |= (t1 << 1);
    t0 =  (p0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    r0 |= (t0 << 1);

    // 上下
    o1 = o[1] & 0x00ffffff;
    o0 = o[0] & 0xffffff00;

    // 下
    t0 =  (p0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t1 =  ((p1 << 8) | ((t0 | p0) >>> 24)) & o1;
    t1 |= (t1 << 8) & o1;
    t1 |= (t1 << 8) & o1;
    r1 |= (t1 << 8) | (t0 >>> 24);
    r0 |= (t0 << 8);

    // 上
    t1 =  (p1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t0 =  ((p0 >>> 8) | ((t1 | p1) << 24)) & o0;
    t0 |= (t0 >>> 8) & o0;
    t0 |= (t0 >>> 8) & o0;
    r1 |= (t1 >>> 8);
    r0 |= (t0 >>> 8) | (t1 << 24);

    // 斜め
    o1 = o[1] & 0x007e7e7e;
    o0 = o[0] & 0x7e7e7e00;

    // 右下
    t0 =  (p0 << 9) & o0;
    t0 |= (t0 << 9) & o0;
    t0 |= (t0 << 9) & o0;
    t1 =  ((p1 << 9) | ((t0 | p0) >>> 23)) & o1;
    t1 |= (t1 << 9) & o1;
    t1 |= (t1 << 9) & o1;
    r1 |= (t1 << 9) | (t0 >>> 23);
    r0 |= (t0 << 9);

    // 左上
    t1 =  (p1 >>> 9) & o1;
    t1 |= (t1 >>> 9) & o1;
    t1 |= (t1 >>> 9) & o1;
    t0 =  ((p0 >>> 9) | ((t1 | p1) << 23)) & o0;
    t0 |= (t0 >>> 9) & o0;
    t0 |= (t0 >>> 9) & o0;
    r1 |= (t1 >>> 9);
    r0 |= (t0 >>> 9) | (t1 << 23);

    // 左下
    t0 =  (p0 << 7) & o0;
    t0 |= (t0 << 7) & o0;
    t0 |= (t0 << 7) & o0;
    t1 =  ((p1 << 7) | ((t0 | p0) >>> 25)) & o1;
    t1 |= (t1 << 7) & o1;
    t1 |= (t1 << 7) & o1;
    r1 |= (t1 << 7) | (t0 >>> 25);
    r0 |= (t0 << 7);

    // 右上
    t1 =  (p1 >>> 7) & o1;
    t1 |= (t1 >>> 7) & o1;
    t1 |= (t1 >>> 7) & o1;
    t0 =  ((p0 >>> 7) | ((t1 | p1) << 25)) & o0;
    t0 |= (t0 >>> 7) & o0;
    t0 |= (t0 >>> 7) & o0;
    r1 |= (t1 >>> 7);
    r0 |= (t0 >>> 7) | (t1 << 25);
    
    return [r0 & ~(p[0] | o[0]), r1 & ~(p[1] | o[1])];
};

Othello.prototype.pop_count = function(x1, x0) {
    let t0 = x1 - (x1 >>> 1 & 0x55555555);
    t0 = (t0 & 0x33333333) + ((t0 & 0xcccccccc) >>> 2);
    let t1 = x0 - (x0 >>> 1 & 0x55555555);
    t0 += (t1 & 0x33333333) + ((t1 & 0xcccccccc) >>> 2);
    t0 = (t0 & 0x0f0f0f0f) + ((t0 & 0xf0f0f0f0) >>> 4);
    return t0 * 0x01010101 >>> 24
};
