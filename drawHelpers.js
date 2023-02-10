function onLine(click, ptA, ptB){
  var l2 = (ptB.x - ptA.x) ** 2  + (ptB.y - ptA.y) ** 2 ;
  var r = ( ((click.x - ptA.x) * (ptB.x - ptA.x)) + ((click.y - ptA.y) * (ptB.y - ptA.y)) ) / l2;
  if(r < 0) {
      return (Math.sqrt(( (ptA.x - click.x) **2 ) + ( (ptA.y - click.y) **2 )) < LINE_CLICK_RADIUS);
  } else if((0 <= r) && (r <= 1)) {
      var s = (((ptA.y - click.y) * (ptB.x - ptA.x)) - ((ptA.x - click.x) * (ptB.y - ptA.y))) / l2;
      return (Math.abs(s) * Math.sqrt(l2) < LINE_CLICK_RADIUS);
  } else {
      return (Math.sqrt( (ptB.x - click.x) **2 + (ptB.y - click.y) **2 ) < LINE_CLICK_RADIUS);
  }
}

function drawPoint(point, color = "black", radius = VERTEX_RADIUS) {
    C.context.beginPath();
    C.context.arc(point.x,point.y, radius, 0, 2*Math.PI);
    C.context.fillStyle = color;
    C.context.fill();
}

function drawLine(a, b,color = "black"){
  C.context.beginPath();
  C.context.moveTo(a.x, a.y);
  C.context.lineTo(b.x, b.y);
  C.context.strokeStyle = color;
  C.context.lineWidth = 2;
  C.context.stroke();
}

function drawCircle(center, radius, color = "black"){
  C.context.beginPath();
  C.context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  C.context.strokeStyle = color;
  C.context.lineWidth = 2;
  C.context.stroke();
  drawCircleArrows(center, radius);
  drawCircleText(center, radius);
}

function drawCircleArrows(center, radius, color = "black"){
  var x1 = center.x + 3.5;
  var x2 = center.x - 3.5;
  var y_top = center.y + radius;
  var y_bottom = center.y - radius;
  if(P.edges.head.inverse){
    drawArrow(x2, y_top, x1, y_top);
  }else{
    drawArrow(x1, y_top, x2, y_top);
  }if(P.edges.head.next.inverse){
    drawArrow(x2, y_bottom, x1, y_bottom);
  }else{
    drawArrow(x1, y_bottom, x2, y_bottom);
  }
}

function drawCircleText(center, radius){
  var top = {x: center.x, y: center.y + radius + 20};
  var bottom = {x: center.x, y: center.y - radius - 20};
  C.context.fillText(P.edges.head.label, top.x, top.y);
  C.context.fillText(P.edges.head.next.label, bottom.x, bottom.y);
}

function shiftPoint(point, dirX, dirY){
  var x = point.x + dirX;
  var y = point.y + dirY;
  return {x: x, y: y};
}

function midPoint(a, b){
  return {x: a.x + (b.x - a.x)/2, y: a.y + (b.y - a.y)/2}
}


function drawArrow(fx,fy,tx,ty, colour = "black"){
    var angle=Math.atan2(ty-fy,tx-fx);
    C.context.moveTo(fx,fy);
    C.context.lineTo(tx,ty);
    var w=3.5; //width of arrow to one side. 7 pixels wide arrow is pretty
    C.context.strokeStyle= colour;
    C.context.fillStyle= colour;
    angle=angle+Math.PI/2;
    tx=tx+w*Math.cos(angle);
    ty=ty+w*Math.sin(angle);
    C.context.lineTo(tx,ty);
  //Drawing an isosceles triangle of sides proportional to 2:7:2
    angle=angle-1.849096;
    tx=tx+w*3.5*Math.cos(angle);
    ty=ty+w*3.5*Math.sin(angle);
    C.context.lineTo(tx,ty);
    angle=angle-2.584993;
    tx=tx+w*3.5*Math.cos(angle);
    ty=ty+w*3.5*Math.sin(angle);
    C.context.lineTo(tx,ty);
    angle=angle-1.849096;
    tx=tx+w*Math.cos(angle);
    ty=ty+w*Math.sin(angle);
    C.context.lineTo(tx,ty);
    C.context.stroke();
    //C.context.fill();
}

function insidePoly(click, vs) {
    // adapted from ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = click.x, y = click.y;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;

        var intersect = ((yi > y) != (yj > y))
                      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect){
          inside = !inside;
        }
    }

    return inside;
}

function center(verts){
    var minX, maxX, minY, maxY;
    for (var i = 0; i < verts.length; i++){
        minX = (verts[i].x < minX || minX == null) ? verts[i].x : minX;
        maxX = (verts[i].x > maxX || maxX == null) ? verts[i].x : maxX;
        minY = (verts[i].y < minY || minY == null) ? verts[i].y : minY;
        maxY = (verts[i].y > maxY || maxY == null) ? verts[i].y : maxY;
    }
    return {x: (minX + maxX) / 2, y: (minY + maxY) / 2};
}
