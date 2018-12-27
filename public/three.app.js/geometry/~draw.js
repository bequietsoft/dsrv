function triangle() {

    var canvas = App.renderer.domElement;
    log(canvas);

    if (canvas.getContext){
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(75,50);
    ctx.lineTo(100,75);
    ctx.lineTo(100,25);
    ctx.fill();
  }
}

function rect1(angle = 0) {

    //var cv = App.renderer.domElement;
    var cv = document.getElementById('thecanvas');
    var cx = cv.getContext("2d");
    
    var rect = {
        x: 100,
        y: 100,
        w: 100,
        h: 100,
        a: 0
    };

    if(cx) {
        log(cx);
        cx.save();
        //cx.clearRect(0, 0, cv.width, cv.height);
        var c = getRectCenter(rect);
        cx.translate(c.x, c.y);
        cx.rotate(Math.PI / (180.0 / angle));
        var r = getRotatedRect(rect);
        cx.strokeRect(r.x, r.y, r.w, r.h);
        cx.restore();
    }
}

function getRectCenter (rect) {
    return {
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2
    };
}

function  getRotatedRect() {
    return {
      x: rect.w / -2,
      y: rect.h / -2,
      w: rect.w,
      h: rect.h
    };
}