const hit = {
    /**
     * 
     * @param {Object} p1 点对象{x,y}
     * @param {Object} p2 点对象{x,y}
     * @returns boolean
     */
    pointPoint(p1, p2) {
        // are the two points in the same location?
        return p1.x == p2.x && p1.y == p2.y;
    },
    /**
     * 
     * @param {Object} p 点对象{x,y}
     * @param {Object} c 圆对象{x,y,r} x/y: 圆心坐标; r:圆半径
     * @returns boolean
     */
    pointCircle(p, c) {
        // get distance between the point and circle's center
        // using the Pythagorean Theorem
        const distX = p.x - c.x;
        const distY = p.y - c.y;
        const distance = Math.sqrt((distX * distX) + (distY * distY));
        // if the distance is less than the circle's
        // radius the point is inside!
        return distance <= c.r;
    },
    /**
     * 
     * @param {Object} c1 圆对象{x,y,r} x/y: 圆心坐标; r:圆半径
     * @param {Object} c2 圆对象{x,y,r} x/y: 圆心坐标; r:圆半径
     * @returns boolean
     */
    circleCircle(c1, c2) {
        // get distance between the circle's centers
        // use the Pythagorean Theorem to compute the distance
        const distX = c1.x - c2.x;
        const distY = c1.y - c2.y;
        const distance = Math.sqrt((distX * distX) + (distY * distY));
        // if the distance is less than the sum of the circle's
        // radii, the circles are touching!
        return distance <= c1.r + c2.r;
    },
    /**
     * 
     * @param {Object} p 点对象{x,y}
     * @param {Object} r 矩形对象{x,y,w,h} x/y: 矩形左上角坐标; w:宽; h:高
     * @returns boolean
     */
    pointRectangle(p,r) {
        // is the point inside the rectangle's bounds?
        if (p.x >= r.x &&        // right of the left edge AND
            p.x <= r.x + r.w &&   // left of the right edge AND
            p.y >= r.y &&        // below the top AND
            p.y <= r.y + r.h) {   // above the bottom
            return true;
        }
        return false;
    },
    /**
     * 
     * @param {Object} r1 矩形对象{x,y,w,h} x/y: 矩形左上角坐标; w:宽; h:高
     * @param {Object} r2 矩形对象{x,y,w,h} x/y: 矩形左上角坐标; w:宽; h:高
     * @returns boolean
     */
    rectangleRectangle(r1,r2) {
        // are the sides of one rectangle touching the other?
        if (r1.x + r1.w >= r2.x &&    // r1 right edge past r2 left
            r1.x <= r2.x + r2.w &&    // r1 left edge past r2 right
            r1.y + r1.h >= r2.y &&    // r1 top edge past r2 bottom
            r1.y <= r2.y + r2.h) {    // r1 bottom edge past r2 top
                return true;
        }
        return false;
    },
    /**
     * 
     * @param {Object} c 圆对象{x,y,r} x/y: 圆心坐标; r:圆半径
     * @param {Object} r 矩形对象{x,y,w,h} x/y: 矩形左上角坐标; w:宽; h:高
     * @returns boolean
     */
    circleRect(c,r) {
        // temporary variables to set edges for testing
        let testX = c.x;
        let testY = c.y;

        // which edge is closest?
        if (c.x < r.x)         testX = r.x;      // test left edge
        else if (c.x > r.x+r.w) testX = r.x+r.w;   // right edge
        if (c.y < r.y)         testY = r.y;      // top edge
        else if (c.y > r.y + r.h) testY = r.y + r.h;   // bottom edge
        
        // get distance from closest edges
        const distX = c.x-testX;
        const distY = c.y-testY;
        const distance = Math.sqrt((distX * distX) + (distY * distY));
        // if the distance is less than the radius, collision!
        return distance <= c.radius;
    },
    /**
     * 
     * @param {Array} l line对象/线对象 结构[{x,y},{x,y}] 元素1:起始点; 元素2:结束点;
     * @param {Object} p 点对象{x,y}
     * @returns boolean
     */
    linePoint(l,p) {
        // get distance from the point to the two ends of the line
        const d1 = utils.dist(p, l[0])
        const d2 = utils.dist(p, l[1])

        // get the length of the line
        const lineLen = utils.dist(l[0], l[1]);

        // since floats are so minutely accurate, add
        // a little buffer zone that will give collision
        const buffer = 0.1;    // higher # = less accurate

        // if the two distances are equal to the line's 
        // length, the point is on the line!
        // note we use the buffer here to give a range, 
        // rather than one #
        return Math.abs(d1 + d2 - lineLen) <= buffer;
    },
    /**
     * 
     * @param {Array} l line对象/线对象 结构[{x,y},{x,y}] 元素1:起始点; 元素2:结束点;
     * @param {Object} c 圆对象{x,y,r} x/y: 圆心坐标; r:圆半径
     * @returns boolean
     */
    lineCircle(l,c) {
        const [p1, p2] = l;
        // is either end INSIDE the circle?
        // if so, return true immediately
        const inside1 = this.pointCircle(p1, c);
        const inside2 = this.pointCircle(p2, c);
        if (inside1 || inside2) return true;

        // get length of the line
        let distX = p1.x - p2.x;
        let distY = p1.y - p2.y;
        const len = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
        
        // get dot product of the line and circle
        const dot = (((c.x - p1.x) * (p2.x - p1.x)) + ((c.y - p1.y) * (p2.y - p1.y))) / Math.pow(len, 2);
        
        // find the closest point on the line
        const closestX = p1.x + (dot * (p2.x-p1.x));
        const closestY = p1.y + (dot * (p2.y - p1.y));
        
        const closePoint = { x: closestX, y: closestY };
        const hitPoints = hit.hitPoints || (hit.hitPoints = [])
        hitPoints.push(closePoint)
        // is this point actually on the line segment?
        // if so keep going, but if not, return false
        const onSegment = this.linePoint(l,closePoint);
        // if (!onSegment) return false;
        if (!onSegment) {
            hitPoints.pop();
            return false
        };

        // get distance to closest point
        distX = closestX - c.x;
        distY = closestY - c.y;
        const distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
        return distance <= c.r
    },
    /**
     * 
     * @param {Array} l1 line对象/线对象 结构[{x,y},{x,y}] 元素1:起始点; 元素2:结束点;
     * @param {Array} l2 line对象/线对象 结构[{x,y},{x,y}] 元素1:起始点; 元素2:结束点;
     * @returns boolean
     */
    lineLine([p1,p2],[p3,p4]) {
        // calculate the distance to intersection point
        const uA = ((p4.x-p3.x)*(p1.y-p3.y) - (p4.y-p3.y)*(p1.x-p3.x)) / ((p4.y-p3.y)*(p2.x-p1.x) - (p4.x-p3.x)*(p2.y-p1.y));
        const uB = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
        
        // if uA and uB are between 0-1, lines are colliding
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) { 
            // optionally, draw a circle where the lines meet
            const intersectionX = p1.x + (uA * (p2.x - p1.x));
            const intersectionY = p1.y + (uA * (p2.y - p1.y));
            const hitPoints = hit.hitPoints || (hit.hitPoints = [])
            hitPoints.push({x: intersectionX, y: intersectionY})
            return true;
        }
        return false;
    },
    /**
     * 
     * @param {Array} l line对象/线对象 结构[{x,y},{x,y}] 元素1:起始点; 元素2:结束点;
     * @param {Object} r 矩形对象{x,y,w,h} x/y: 矩形左上角坐标; w:宽; h:高
     * @returns boolean
     */
    lineRectangle(l,r) {
        // check if the line has hit any of the rectangle's sides
        // uses the Line/Line function below
        const left = this.lineLine(l, [{ x:r.x, y:r.y }, { x:r.x, y:r.y + r.h }]);
        const right = this.lineLine(l, [{ x: r.x + r.w, y: r.y }, { x:r.x + r.w, y:r.y + r.h }]);
        const top = this.lineLine(l, [{ x:r.x, y:r.y }, { x:r.x + r.w, y:r.y }]);
        const bottom = this.lineLine(l, [{ x:r.x, y:r.y + r.h }, { x:r.x + r.w, y:r.y + r.h }]);
        
        // if ANY of the above are true, the line
        // has hit the rectangle
        return left || right || top || bottom;
    },
    /**
     * 
     * @param {Array} vertices poly对象/多边形对象 结构[{x,y},{x,y},...]
     * @param {Object} p 点对象{x,y}
     * @returns boolean
     */
    polygonPoint(vertices, p) {
        let collision = false;
        // go through each of the vertices, plus
        // the next vertex in the list
        let next = 0;
        for (let current = 0; current < vertices.length; current++) { 
            // get next vertex in list
            // if we've hit the end, wrap around to 0
            next = current + 1;
            if (next == vertices.length) next = 0;

            // get the PVectors at our current position
            // this makes our if statement a little cleaner
            const vc = vertices[current];    // c for "current"
            const vn = vertices[next];       // n for "next"

            // compare position, flip 'collision' variable
            // back and forth
            if (((vc.y >= p.y && vn.y < p.y) || (vc.y < p.y && vn.y >= p.y)) &&
                (p.x < (vn.x-vc.x)*(p.y-vc.y) / (vn.y-vc.y)+vc.x)) {
                    collision = !collision;
            }
        }
        return collision;
    },
    /**
     * 
     * @param {Array} vertices poly对象/多边形对象 结构[{x,y},{x,y},...]
     * @param {Object} c 圆对象{x,y,r} x/y: 圆心坐标; r:圆半径
     * @returns boolean
     */
    polygonCirecle(vertices,c) {
        // go through each of the vertices, plus
        // the next vertex in the list
        let next = 0;
        for (let current=0; current<vertices.length; current++) {

            // get next vertex in list
            // if we've hit the end, wrap around to 0
            next = current+1;
            if (next == vertices.length) next = 0;
        
            // get the PVectors at our current position
            // this makes our if statement a little cleaner
            let vc = vertices[current];    // c for "current"
            let vn = vertices[next];       // n for "next"
        
            // check for collision between the circle and
            // a line formed between the two vertices
            let collision = this.lineCircle([vc, vn],c);
            if (collision) return true;
        }

        // the above algorithm only checks if the circle
        // is touching the edges of the polygon – in most
        // cases this is enough, but you can un-comment the
        // following code to also test if the center of the
        // circle is inside the polygon

        let centerInside = this.polygonPoint(vertices,c);
        if (centerInside) return true;

        // otherwise, after all that, return false
        return false;
    },
    /**
     * 
     * @param {Array} vertices poly对象/多边形对象 结构[{x,y},{x,y},...]
     * @param {Object} rect 矩形对象{x,y,w,h} x/y: 矩形左上角坐标; w:宽; h:高
     * @returns boolean
     */
    polygonRectangle(vertices,rect) {
        // go through each of the vertices, plus the next vertex in the list
        let next = 0;
        for (let current = 0; current < vertices.length; current++) { 
            // get next vertex in list
            // if we've hit the end, wrap around to 0
            next = current + 1;
            if (next == vertices.length) next = 0;

            // get the vectors at our current position
            // extract X/Y coordinates from each
            let vc  = vertices[current];
            let vn = vertices[next];
            
            // check against all four sides of the rectangle
            let collision = this.lineRectangle([vc,vn], rect);
            if (collision) return true;

            // optional: test if the rectangle is INSIDE the polygon
            // note that this iterates all sides of the polygon
            // again, so only use this if you need to
            let inside = this.polygonPoint(vertices,rect);
            if (inside) return true;
        }
        return false;
    },
    /**
     * 
     * @param {Array} vertices poly对象/多边形对象 结构[{x,y},{x,y},...]
     * @param {Array} l line对象/线对象 结构[{x,y},{x,y}] 元素1:起始点; 元素2:结束点;
     * @returns boolean
     */
    polygonLine(vertices,l) {
        // go through each of the vertices, plus the next vertex in the list
        let next = 0;
        for (let current = 0; current < vertices.length; current++) { 
            // get next vertex in list
            // if we've hit the end, wrap around to 0
            next = current + 1;
            if (next == vertices.length) next = 0;

            // get the vectors at our current position
            // extract X/Y coordinates from each
            let vc = vertices[current];
            let vn = vertices[next];

            // do a Line/Line comparison
            // if true, return 'true' immediately and stop testing (faster)
            let hit = this.lineLine(l, [vc,vn]);
            if (hit) {
                return true;
            }
        }
        // never got a hit
        return false;
    },
    /**
     * 
     * @param {Array} p1 poly对象/多边形对象 结构[{x,y},{x,y},...]
     * @param {Array} p2 poly对象/多边形对象 结构[{x,y},{x,y},...]
     * @returns boolean
     */
    polygonPolygon(p1, p2) {
        // go through each of the vertices, plus the next vertex in the list
        let next = 0;
        for (let current = 0; current < p1.length; current++) { 
            // get next vertex in list
            // if we've hit the end, wrap around to 0
            next = current + 1;
            if (next == p1.length) next = 0;

            // get the Vectors at our current position
            // this makes our if statement a little cleaner
            let vc = p1[current];    // c for "current"
            let vn = p1[next];       // n for "next"

            // now we can use these two points (a line) to compare
            // to the other polygon's vertices using polyLine()
            let collision = this.polygonLine(p2,[vc,vn]);
            if (collision) return true;

            // optional: check if the 2nd polygon is INSIDE the first
            collision = this.polygonPoint(p1,p2[0]);
            if (collision) return true;
        }
        return false;
    },
}