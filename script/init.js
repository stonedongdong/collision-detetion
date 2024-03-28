function readyInit(opt) {
    return () => {
        initResize();
        check(opt)
    }
}
function initResize() {
    resize()
    window.addEventListener('resize', () => {
        resize()
    })
}
function check(opt) {
    const ctx = utils.getCtx();
    const canvas = ctx.canvas;
    const zoom = opt.zoom || 1;
    const width = canvas.width / zoom;
    const height = canvas.height / zoom;
    const cp = { x: Math.round(width / 2), y: Math.round(height / 2) }
    ctx.scale(zoom, zoom)
    const radius = opt.radius || 10;
    const baseShape = opt.baseShape || 'circle'
    let drawOpt = opt.drawOpt;;
    if (baseShape === 'circle') {
        drawOpt = {...cp, r:radius}
    } else if (baseShape === 'rect') {
        const w = opt.w || 400;
        const h = opt.h || 200;
        drawOpt = {x:(width - w) / 2, y:(height - h) / 2, w, h}
    }
    function render(colliding) {
        utils.cleanCanvas(ctx)
        ctx.fillStyle = '#0095d9E0';
        ctx.strokeStyle = '#0095d9E0';
        if (colliding) {
            if (opt.fillRectColliding) {
                ctx.save()
                ctx.fillStyle = "#f6ad49";
                ctx.fillRect(0, 0, width, height);
                ctx.restore()
            } else {
                ctx.fillStyle = "#f6ad49E0";
                ctx.strokeStyle = "#f6ad49E0";
            }
        }
        const hitPoints = hit.hitPoints;
        if (hitPoints) {
            ctx.save()
            ctx.fillStyle = "red";
            hitPoints.forEach(p => {
                drawUtils.circle(ctx, { x: p.x, y: p.y, r: 16 })
            });
            ctx.restore()
        }
        
        ctx.lineWidth = 20;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        const drawFunc = drawUtils[baseShape];
        if (drawFunc) {
            drawFunc(ctx,drawOpt)
        }
        delete hit.hitPoints;
    }
    const radius1 = opt.radius1 || 10;
    const cursorShape = opt.cursorShape || 'circle'
    canvas.addEventListener('mousemove', (e) => {
        const colliding = opt.hitFunc ? opt.hitFunc(e, drawOpt, opt) : false;
        render(colliding);
        ctx.fillStyle = '#6a6868E0';
        if (cursorShape === 'rect') { 
            const w = opt.cursorW || 20;
            const h = opt.cursorH || 20;
            drawUtils.rect(ctx, { x:e.x / zoom - w/2, y:e.y / zoom - h/2, w, h })
        } else if (cursorShape === 'line') {
            ctx.strokeStyle = "#6a6868E0";
            ctx.lineWidth = 20;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            drawUtils.line(ctx, [opt.cursorStartPoint,{ x:e.x, y:e.y}])
        } else if (cursorShape === 'polygon') {
            const { x, y } = e;
            const points = [
                { x: x - 20, y: y - 20 },
                { x: x + 40, y: y - 10 },
                { x: x + 60, y: y + 20 },
                { x: x - 20, y: y + 20 },
                {x: x - 40, y: y},
            ]
            drawUtils.polygon(ctx, points)
        } else {
            drawUtils.circle(ctx, { x:e.x / zoom, y:e.y / zoom, r:radius1 })
        }
        
    })
    render();
}
function resize() {
    const canvas = document.getElementById('test');
    const width = canvas.parentElement.scrollWidth;
    const height = canvas.parentElement.scrollHeight;
    canvas.width = width
    canvas.height = height
    canvas.style.width = width;
    canvas.style.height = height;
    const ctx = canvas.getContext("2d");
    ctx.width = width;
    ctx.height = height;
}
const utils = {
    getCtx() {
        const canvas = document.getElementById('test');
        return canvas.getContext("2d");
    },
    cleanCanvas(ctx) {
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    toPoint(x,y) {
        return {x,y}
    },
    toCircle(x, y, r) {
        return {x,y,r}
    },
    toRect(x, y, w,h) {
        return {x,y,w,h}
    },
    dist(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2))
    }
}

const drawUtils = {
    circle(ctx, {x, y, r}) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    },
    rect(ctx, {x, y, w, h}) {
        ctx.fillRect(x, y, w, h);
    },
    line(ctx, [p1, p2]) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    },
    polygon(ctx, points) {
        points = [...points];
        ctx.beginPath();
        const first = points.shift();
        ctx.moveTo(first.x, first.y);
        points.forEach(p => ctx.lineTo(p.x, p.y))
        // ctx.closePath();
        ctx.fill();
    }
}