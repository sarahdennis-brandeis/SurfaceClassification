var C = {}; //canvas, context, center, addEventListener, selectedLines, selectedVerts, cut
var P = {}; //polygon, edges, verts, cutEdges, cutVerts

var VERTEX_RADIUS = 4.5;
var POLYGON_RADIUS = 180;
var VERTEX_CLICK_RADIUS = 10;
var LINE_CLICK_RADIUS = 6;
var VERTEX_SELECT_COLOUR = "darkMagenta";
var LINE_SELECT_COLOUR = "LimeGreen";
var SHIFT_AMT = 20;
var GRID_SIZE = 25;

function initialise(){
  P = {};
  C = {};
  C.canvas = get("canvas");
  C.context = C.canvas.getContext("2d");
  C.center = {x: C.canvas.width/2, y: C.canvas.height/2};
  C.context.font = "20px Times";
  C.canvas.addEventListener("mousedown", function(e){canvasClickHandler(e)});
  C.selectedPoints = [];
  C.selectedLines = [];
  C.cut = false;
  C.annotate = false;
  C.memory = new Stack();
  C.future = new Stack();
}

function reset(){
  clearCanvas();
  clearMessages();
  clearInput();
  P = {};
  C.selectedPoints = [];
  C.selectedLines = [];
  C.selectedPoly = null;
  C.cut = false;
  C.annotate = false;
  C.memory = new Stack();
  C.future = new Stack();
}

function submit(){
  C.selectedPoints = [];
  C.selectedLines = [];
  C.selectedPoly = null;
  C.cut = false;

  P = {};
  P.polygon = get("polygon").value;

  if(!validPolygon(P.polygon)){
    writeMessage("invalid polygon: " + P.polygon);
    clearCanvas();

  }else{
    P.edges = buildEdges(P.polygon); //circList
    P.verts = buildVertices(P.edges); //list
    drawRegPoly();
  }
}

//-------------------------------------------------------------------------
function drawRegPoly(edges = P.edges, verts = P.verts, radius = POLYGON_RADIUS){
  clearCanvas();
  var n = edges.length;
  var angle = (2*Math.PI)/n;
  var j = 0;
  for(var i = 0; i < n; i++){
    var x = (Math.cos(j) * radius) + C.center.x;
    var y = (Math.sin(j) * radius) + C.center.y;
    verts[i].setCoords(x,y);
    drawPoint({x: x, y: y});
    j+= angle;
  }
  if(verts.length === 2){ //
    drawCircle(C.center, radius);
  }else{
    drawEdges(verts, edges);
  }
}

function drawSegments(cut_0, cut_1){ //used to draw after a cut
  clearCanvas();
  //get the cut indices the right way around for slicing.
  if(cut_0 > cut_1){
    [cut_1, cut_0] = [cut_0, cut_1];
  }

  //get new vertices.
  P.cutVerts = []; //for labels
  P.cutVerts[0] = buildVertices(P.cutEdges[0]);
  P.cutVerts[1] = buildVertices(P.cutEdges[1]);

  //get old vertices
  var vertPos_0 = unshiftPop(P.verts.slice(cut_0, cut_1 + 1));
  var vertPos_1 = unshiftPop(P.verts.slice(cut_1).concat(P.verts.slice(0, cut_0 + 1)));

  //set move directions
  var center0 = center(vertPos_0);
  var center1 = center(vertPos_1);
  var dx = 0;
  var dy = 0;
  if(Math.abs(center0.x - center1.x) > Math.abs(center0.y - center1.y)){
    dx = (center0.x <= center1.x) ? - SHIFT_AMT : SHIFT_AMT;
  }else{
    dy = (center0.y <= center1.y) ? - SHIFT_AMT : SHIFT_AMT;
  }

  //set coords of new verts to shifted coords of old vertices.
  for(var i = 0; i < P.cutVerts[0].length; i++){
    var newCoords = shiftPoint(vertPos_0[i], dx, dy);
    P.cutVerts[0][i].setCoords(newCoords.x, newCoords.y);
    drawPoint(P.cutVerts[0][i]);
  }
  for(var i = 0; i < P.cutVerts[1].length; i++){
    var newCoords = shiftPoint(vertPos_1[i], -dx, -dy);
    P.cutVerts[1][i].setCoords(newCoords.x, newCoords.y);
    drawPoint(P.cutVerts[1][i])
  }

  //draw the new edges -- we are not allowing adjacent cuts i.e. no arcs needed.
  drawEdges(P.cutVerts[0], P.cutEdges[0]);
  drawEdges(P.cutVerts[1], P.cutEdges[1]);

  C.selectedPoints = [];
  C.selectedLines = [];
}

function minXY(verts){
  var minsum = verts[0].x + verts[0].y;
  for(var i = 0; i < verts.length; i++){
    var v = verts[i];
    if(v.x + v.y < minsum){
      minsum = v.x + v.y
    }
  }
  return minsum;
}

function unshiftPop(a){
  a.unshift(a[a.length - 1]);
  a.pop(a.length-1);
  return a
}

function drawEdges(verts, edges){
  var edge = edges.head;
  for(var j = 0; j < verts.length; j++){
    var a = verts[j];
    var b = verts[(j + 1) % verts.length];
    var mid = midPoint(a, b);
    drawLine(a, b);
    if(!edge.inverse){
      drawArrow(a.x, a.y, mid.x, mid.y);
    }else{
      drawArrow(b.x, b.y, mid.x, mid.y);
    }
    var text = mid;
    mid.x < C.center.x ? text.x -= 15 : text.x += 15;
    mid.y < C.center.y ? text.y -= 15 : text.y += 15;

    C.context.fillText(edge.label, text.x, text.y);
    edge = edge.next;

  }
}

function drawVerts(verts){
  for(var i = 0; i < verts.length; i++){
    drawPoint(verts[i]);
  }
}

function invertSelectedPoly(n){

  P.cutEdges[n] = invert(P.cutEdges[n]);

  var temp = P.cutEdges[n].head;
  while(temp.next !== P.cutEdges[n].head){
    temp = temp.next;
  }
  P.cutEdges[n].head = temp;


  var newVerts = buildVertices(P.cutEdges[n]);
  for(var i = 0; i < P.cutVerts[n].length; i++){
    newVerts[i].x = P.cutVerts[n][i].x;
    newVerts[i].y = P.cutVerts[n][i].y
  }
  P.cutVerts[n] = newVerts;

  clearCanvas();
  drawEdges(P.cutVerts[0], P.cutEdges[0]);
  drawEdges(P.cutVerts[1], P.cutEdges[1]);
  drawVerts(P.cutVerts[0]);
  drawVerts(P.cutVerts[1]);
  C.selectedPoly = null;
  C.selectedPoints = [];
  C.selectedLines = [];
}

//-------------------------------------------------------------------------
function cutButton(){
  if(C.selectedPoints.length !== 2){
    writeMessage("Select two vertices");
  }else if(C.cut){
    writeMessage("Paste before cutting again");
  }else if(C.selectedPoints[0].right === C.selectedPoints[1].left
          || C.selectedPoints[0].left === C.selectedPoints[1].right){
    writeMessage("Can't cut adjacent vertices");
  }else{
    C.memory.push({verts: P.verts, edges: P.edges, cut: false});

    var [v0, v1] = C.selectedPoints;
    for(var i = 0; i < P.verts.length; i++){
      var v = P.verts[i];
      if(v0.x === v.x && v0.y === v.y){
        var cutIndex0 = i;
      }else if(v1.x === v.x && v1.y === v.y){
        var cutIndex1 = i;
      }
    }

    P.cutEdges = cut(P.edges, cutIndex0, cutIndex1);
    C.cut = true;
    drawSegments(cutIndex0, cutIndex1);
  }
}

function pasteButton(){
  if(C.selectedLines.length !== 2){
      writeMessage("Select two edges");
  }else if(!C.cut){
    var l1 = findEdge(P.verts, C.selectedLines[0]);
    var l2 = findEdge(P.verts, C.selectedLines[1]);
    if(l1.label !== l2.label){
      writeMessage("can only paste edges with the same label");
    }else if(l1.next !== l2 && l2.next !== l1){
      writeMessage("can only paste adjacent edges without cutting");
    }else if(l1.inverse === l2.inverse){
      writeMessage("can only paste inverse edges without cutting");
    }else if(P.edges.length === 2){
      writeMessage("cannot paste with only 2 edges");
    }else{
      C.memory.push({verts: P.verts, edges: P.edges, cut: false});
      P.edges = pasteAdjInv(P.edges, l1.label);
      P.verts = buildVertices(P.edges); //list
      drawRegPoly();

      C.selectedPoints = [];
      C.selectedLines = [];

    }

  }else{
    //look for either selected edge in left half... and then in right half.
    var l1 = findEdge_cut(P.cutVerts[0]);
    var l2 = findEdge_cut(P.cutVerts[1]);

    if(l1 === null || l2 === null){
          writeMessage("choose one edge from each segment");
    }else if(l1.label !== l2.label){
          writeMessage("can only paste edges with the same label");
    }else if(l1.inverse === l2.inverse){
          writeMessage("can only paste inverse edges. Flip one before pasting.")
    }else{
          C.memory.push({verts: [P.cutVerts[0],P.cutVerts[1]], edges: [P.cutEdges[0], P.cutEdges[1]], cut: true});

          P.edges = paste(P.cutEdges[0], P.cutEdges[1], l1.label);
          P.verts = buildVertices(P.edges);

          drawRegPoly();
          C.cut = false;
          C.selectedPoints = [];
          C.selectedLines = [];
    }
  }
}

function flipButton(){
  if(!C.cut){
    C.memory.push({verts: P.verts, edges: P.edges, cut: false});

    P.edges = invert(P.edges);
    P.verts = buildVertices(P.edges);
    drawRegPoly();
    C.selectedPoints = [];
    C.selectedLines = [];
  }else{
    if(C.selectedPoly === null){
      writeMessage("select a polygon to flip");
    }else{
      C.memory.push({verts: [P.cutVerts[0],P.cutVerts[1]], edges: [P.cutEdges[0], P.cutEdges[1]], cut: true});
      var n = C.selectedPoly.poly;
      invertSelectedPoly(n); //clears canvas too
      C.inv = !C.inv;
    }
  }
}

function noteButton(){
  C.annotate = !C.annotate;
  var button = get("note_button");
  button.style.borderStyle = (button.style.borderStyle!=='inset' ? 'inset' : 'outset');
  if(!C.annotate){
    get("note").value = "";
  }
}

function annotate(click){
  var text = get("note").value;
  C.context.fillStyle = "gray";
  C.context.fillText(text, click.x, click.y);
}

function undoButton(){
  if(C.memory.size > 0){
    if(C.cut){
      C.future.push({verts: [P.cutVerts[0],P.cutVerts[1]], edges: [P.cutEdges[0], P.cutEdges[1]], cut: true});
    }else{
      C.future.push({verts: P.verts, edges: P.edges, cut: false});
    }
    clearCanvas();
    C.selectedPoints = [];
    C.selectedLines = [];

    var oldState = C.memory.pop();
    if(oldState.cut){
      P.cutVerts = oldState.verts;
      P.cutEdges = oldState.edges;
      C.cut = true;
      drawEdges(oldState.verts[0], oldState.edges[0]);
      drawEdges(oldState.verts[1], oldState.edges[1]);
      drawVerts(oldState.verts[0]);
      drawVerts(oldState.verts[1]);
    }else{
      P.verts = oldState.verts;
      P.edges = oldState.edges;
      C.cut = false;
      drawEdges(oldState.verts, oldState.edges);
      drawVerts(oldState.verts);
    }

  }else{
    writeMessage("Nothing to undo");
  }
}

function redoButton(){
  if(C.future.size > 0){
    if(C.cut){
      C.memory.push({verts: [P.cutVerts[0],P.cutVerts[1]], edges: [P.cutEdges[0], P.cutEdges[1]], cut: true});
    }else{
      C.memory.push({verts: P.verts, edges: P.edges, cut: false});
    }
    clearCanvas();
    C.selectedPoints = [];
    C.selectedLines = [];

    var newState = C.future.pop();
    if(newState.cut){
      P.cutVerts = newState.verts;
      P.cutEdges = newState.edges;
      C.cut = true;
      drawEdges(newState.verts[0], newState.edges[0]);
      drawEdges(newState.verts[1], newState.edges[1]);
      drawVerts(newState.verts[0]);
      drawVerts(newState.verts[1]);
    }else{
      P.verts = newState.verts;
      P.edges = newState.edges;
      C.cut = false;
      drawEdges(newState.verts, newState.edges);
      drawVerts(newState.verts);
    }

  }else{
    writeMessage("Nothing to redo");
  }
}


//-------------------------------------------------------------------------
function canvasClickHandler(e){
  var click = getMousePosition(e);
  //vertices
  var v = getClickedVertex(click);
  if (v !== null && !C.cut){
    return vertexClickHandle(v);
  }
  //lines
  var l = getClickedLine(click);
  if(l !== null){
    return lineClickHandle(l);
  }
  if(C.annotate){
    return annotate(click);
  }
  //interior polygon
  if(C.cut){ //need to erase old clicks
    var oldClick = C.selectedPoly;
    if (insidePoly(click, P.cutVerts[0])){
      C.selectedPoly = {poly:0, point:click};
      erase = true
      drawPoint(click, "purple");
    }else if(insidePoly(click, P.cutVerts[1])){
      C.selectedPoly = {poly:1, point:click};
      erase = true;
      drawPoint(click, "purple");
    }else{
      C.selectedPoly = null;
    }
    if(oldClick !== null && erase){
      drawPoint(oldClick.point, "white", VERTEX_RADIUS + 1);
    }
    return
  }
  writeMessage("click not registered");
}

function vertexClickHandle(v){ //v = {x:, y: }
  for(var i = 0; i < C.selectedPoints.length; i++){
    var s = C.selectedPoints[i];
    if(s.x === v.x && s.y === v.y){ //deselect;
      C.selectedPoints.splice(i, 1);
      return drawPoint(v, "black");
    }
  }
  if(C.selectedPoints.length < 2){
    drawPoint(v, VERTEX_SELECT_COLOUR);
    C.selectedPoints.push(v);
  }
}

function lineClickHandle(l){ //l = {a: {x:, y: }, b: {x:, y: }}
  for(var i = 0; i < C.selectedLines.length; i++){ //if we have already clicked
    var s = C.selectedLines[i];
    if(  s.a.x === l.a.x && s.b.x === l.b.x
      && s.a.y === l.a.y && s.b.y === l.b.y ){ //deselect;
      C.selectedLines.splice(i, 1);
      drawLine(l.a, l.b, "black");
      return;
    }
  }
  if(C.selectedLines.length < 2){
    drawLine(l.a, l.b, LINE_SELECT_COLOUR);
    C.selectedLines.push(l);
  }
}

function getClickedVertex(click){
  if(!C.cut){
    for(var i = 0; i < P.verts.length; i++){
      var point = P.verts[i];
      if ( (click.x < point.x + VERTEX_CLICK_RADIUS && click.x > point.x - VERTEX_CLICK_RADIUS) &&
           (click.y < point.y + VERTEX_CLICK_RADIUS  && click.y > point.y - VERTEX_CLICK_RADIUS )){
             return point;
      }
    }
  }
  return null;
}

function getClickedLine(click) {
  if(!C.cut){
    for(var i = 0; i < P.verts.length; i++){
      var ptA = P.verts[i];
      var ptB = P.verts[(i + 1) % P.verts.length]
      if (onLine(click, ptA, ptB)){
        return {a: ptA, b: ptB};
      }
    }
  }else{
    for(var j = 0; j < P.cutVerts.length; j++){
      for(var i = 0; i < P.cutVerts[j].length; i++){
        var ptA = P.cutVerts[j][i];
        var ptB = P.cutVerts[j][(i + 1) % P.cutVerts[j].length]
        if (onLine(click, ptA, ptB)){
          return {a: ptA, b: ptB};
        }
      }
    }
  }
  return null;
}

function findEdge_cut(verts){
  var [l1,l2] = C.selectedLines;
  for(var i = 0; i < verts.length; i++){
      var v = verts[i];
      var v2 = verts[(i + 1) % verts.length];
      if(v.x === l1.a.x && v.y === l1.a.y && v2.x === l1.b.x && v2.y === l1.b.y
      || v.x === l2.a.x && v.y === l2.a.y && v2.x === l2.b.x && v2.y === l2.b.y){
         return v.right;
      }
  }
  console.error("selected edge not found");
}

function findEdge(verts, l){
  for(var i = 0; i < verts.length; i++){
      var v = verts[i];
      var v2 = verts[(i + 1) % verts.length];
      if(v.x === l.a.x && v.y === l.a.y && v2.x === l.b.x && v2.y === l.b.y){
         return v.right;
      }
  }
  console.error("selected edge not found");
}



//-------------------------------------------------------------------------
