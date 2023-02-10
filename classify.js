//--------------------------------------------------------------------
// classify(String polygon) --> void
// Takes a string polygon representation and
// writes the final classification to the html window
//--------------------------------------------------------------------
function hint(){
  if(C.cut){
    writeMessage("Cannot show next step while cut");
  }else{
    if(P.edges.length === 2){
      writeMessage("Hint: Classify as Rp2 of S2");
    }else if(hasAdjInv(P.edges)){
      writeMessage("Hint: Adjacent inverses to be cancelled");
    }else if(makeEqClasses(buildVertices(P.edges)).eqClass !== 1){
      writeMessage("Hint: Collect vertex equivalence classes");
    }else if(hasNonAdjLikeOriented(P.edges)){
      writeMessage("Hint: Collect like oriented edges");
    }else if(hasNonAdjCrossedPair(P.edges)){
      writeMessage("Hint: Collect crossed pair");
    }else {
      var c = countRP2(P.edges);
      if(c === 0){
        writeMessage("Hint: Classify as connected sum of tori");
      }else if(c*2 !== P.edges.length){
        writeMessage("Hint: Normalize tori in presence of Rp2");
      }else{
        writeMessage("Hint: Classify as connected sum of Rp2");
      }
    }
  }
}


function classify(polygon){
  if(!validPolygon(polygon)){
    writeMessage("Invalid polygon " + polygon);
    return;
  }
  var edges = buildEdges(polygon);
  if(C.animate){P.steps.push(edges);}
  //------------------------------
  writeMessage("polygon: " + edges.string() +"\n --------------------");

  //cancel inverses & length 2 check
  edges = simplify(edges);
  if(edges === null){return;}
  if(C.animate){P.steps.push(edges);}
  writeMessage(edges.string() +" \n --------------------");

  //collect vertices
  writeMessage("collecting vertices... ");
  edges = collectVertices(edges);
  if(C.animate){P.steps.push(edges);}
  writeMessage(edges.string() +"\n --------------------");

  //cancel inverses & length 2 check
  edges = simplify(edges);
  if(edges === null){return;}
  if(C.animate){P.steps.push(edges);}
  writeMessage(edges.string() +"\n --------------------");

  //collect like oriented
  writeMessage("collecting like oriented... ");
  edges = collectLikeOriented(edges);
  if(C.animate){P.steps.push(edges);}
  writeMessage(edges.string() +"\n --------------------");

  //cancel inverses & length 2 check
  edges = simplify(edges);
  if(edges === null){return;}
  if(C.animate){P.steps.push(edges);}
  writeMessage(edges.string() + "\n --------------------");

  //collect crossed pairs
  writeMessage("collecting crossed pairs... ");
  edges = collectCrossedPair(edges);
  if(C.animate){P.steps.push(edges);}
  writeMessage(edges.string()+"\n --------------------");

  //Final classification.
  writeMessage("final classification: ..." );
  var numrp2 = countRP2(edges);

  //connected sum of RP2
  if (numrp2 > 0){
    var numtori = (edges.length - (2*numrp2))/4;
    numrp2 += (numtori * 2);
    writeMessage(edges.string() + ": " + numrp2 + " rp2");

  }else{
    //connected sum of tori.
    var numtori = edges.length/4;
    if(numtori === 1){
      writeMessage(edges.string() + ": torus");
      return;
    }else{
      writeMessage(edges.string() + ": " + numtori + " tori");
      return;
    }
  }
}

function simplify(edges){
  writeMessage("checking length 2 & canceling inverses... ");
  edges = cancelAdjInvs(edges);
  if(edges.length === 2){
    writeMessage("final classification: ..." );
    writeMessage(edges.string() + ": " + lengthTwo(edges));
    return;
  }
  return edges;
}

//--------------------------------------------------------------------
// lengthTwo(circList edges) --> String classification
// Takes a polygon of length two and classifies as S2 or RP2
//--------------------------------------------------------------------
function lengthTwo(edges){
    if(inverses(edges.head, edges.head.next)){
      return "S2";
    }else{
      return "RP2";
    }
}
//--------------------------------------------------------------------
// cancelAdjInvs(circList edges) --> circList edges
// Removes all edges of the form ...aA... recursively
// Ex: eabcdDCBAe --> ee
//--------------------------------------------------------------------
function cancelAdjInvs(edges){
    var labelList = Array.from(edges.labels);
    var i = 0;
    var label;
    while(i < labelList.length){
      label = labelList[i];
      if(areAdjInv(edges, label) && edges.length > 2){
        edges = pasteAdjInv(edges, label)
        return cancelAdjInvs(edges);
      }
      i++;
    }
  return edges;
}

function hasAdjInv(edges){
  var labelList = Array.from(edges.labels);
  var i = 0;
  var label;
  while(i < labelList.length){
    label = labelList[i];
    if(areAdjInv(edges, label) && edges.length > 2){
      return true;
    }
    i++;
  }
return false;
}
//--------------------------------------------------------------------
// areAdjInv(circList edges, string label) --> boolean
// reports whether edges with 'label' are adjacent and inverses
// Exs: abaB, 'b' --> false          aabB, 'a' --> false
//      abBa, 'b' --> true           abbA, 'a' --> true
//--------------------------------------------------------------------

function areAdjInv(edges, label){
  var temp = edges.head;
  while(temp.label !== label){
    temp = temp.next;
  }
  if(temp.next.label === label && inverses(temp, temp.next)){
    return true;
  }else{ //handles case a....A
    temp = temp.next;
    while(temp.label !== label){
      temp = temp.next;
    }
    return (temp.next.label === label && inverses(temp, temp.next));
  }
}

//----------------------------------------------------------------------------
// makeEqClasses(array vertices) --> dictionary(int eqClasses, array vertices)
// Marks all vertices with their appropriate equivalence class
// and reports the number of equivalence classes
//---------------------------------------------------------------------------
function makeEqClasses(vertices){
  var eqClass = 0;
  var index = 0;
  do{
    vertices = mark(vertices, index, eqClass);
    eqClass++;
    index = nextToMark(vertices);
  }while(index !== -1);

  return {eqClass: eqClass, vertices: vertices};
}

function nextToMark(vertices){
  for(var i = 0; i < vertices.length; i++){
    if (vertices[i].eqClass === null){
      return i;
    }
  }
  return -1;
}


//----------------------------------------------------------------------------
// mark(array vertices, int index, int eqClass) --> array vertices
// Marks the vertex at the given index as the given eqClass
// then recurses to marks the vertices who have an incident edge of the
// same label and direction and are thus in the same equivalence class
//---------------------------------------------------------------------------
function mark(vertices, index, eqClass){
  var v = vertices[index];
  v.eqClass = eqClass;

  //mark its left's label partner
  if(v.left.inverse){
  //if left is inverse --> we marked the left tail.
  //mark vertices where l0.label is non-inverse on the left
  //                                inverse on the right
    for(var i = 0; i < vertices.length; i++){
      var u = vertices[i];
      if(u.eqClass === null){
        if(u.left.label === v.left.label && u.left.inverse){
          vertices = mark(vertices, i, eqClass)
        }else if(u.right.label === v.left.label && !u.right.inverse){
          vertices = mark(vertices, i, eqClass)
        }
      }
    }

  }else{
      //if left is not inverse --> we marked the left head.
      //mark vertices where l0.label is inverse on the left
      //                                non-inverse on the right
      for(var i = 0; i < vertices.length; i++){
        var u = vertices[i];
        if(u.eqClass === null){
          if(u.left.label === v.left.label && !u.left.inverse){
            vertices = mark(vertices, i, eqClass);
          }else if(u.right.label === v.left.label && u.right.inverse){
            vertices = mark(vertices, i, eqClass);
          }
        }
      }
  }

  //mark its right's label partner
  if(v.right.inverse){
    //if right is inverse --> we marked the right head
    //mark vertices where r0.label is inverse on the left
    //                                non-inverse on the right

    for(var i = 0; i < vertices.length; i++){
      var u = vertices[i];
      if(u.eqClass === null){
        if(u.right.label === v.right.label && u.right.inverse){
          vertices = mark(vertices, i, eqClass);
        }else if(u.left.label === v.right.label && !u.left.inverse){
          vertices = mark(vertices, i, eqClass);
        }
      }
    }

  }else{
    //if right is not inverse --> we marked the right tail
    //mark vertices where r0.label is inverse on the left
    //                                non-inverse on the right
    for(var i = 0; i < vertices.length; i++){
      var u = vertices[i];
      if(u.eqClass === null){
        if(u.right.label === v.right.label && !u.right.inverse){
          vertices = mark(vertices, i, eqClass);
        }else if(u.left.label === v.right.label && u.left.inverse){
          vertices = mark(vertices, i, eqClass);
        }
      }
    }
  }
  return vertices;
}

//----------------------------------------------------------------------------
// collectVertices(circList edges) --> circList edges
// builds vertex eqClasses and performs appropriate cut and paste ops until
// only one eqClass remains.
//---------------------------------------------------------------------------
function collectVertices (edges){
  var vertStuff = makeEqClasses(buildVertices(edges));
  var eqClasses = vertStuff.eqClass;
  var vertices = vertStuff.vertices;

  if(eqClasses === 1){
      writeMessage("1 vertex equivalence class")
    return edges;

  }else{
    writeMessage(eqClasses + " vertex equivalence classes")
    var len = vertices.length;
    var vClass = biggestEqClass(vertices);

    //find first vertex in eqClass 0
    for(var j = 0; j < len; j++){
      if (vertices[j%len].eqClass === vClass){
        var index0 = j%len;
        break;
      }
    }
    //find first vertex not eqClass 0
    for(var j = index0; j < len; j++){
      if (vertices[j%len].eqClass !== vClass){
        var index1 = j%len;
        var eq = vertices[j%len].eqClass;
        break;
      }
    }
    //find second vertex eqClass 0
    for(var j = index1; j < len; j++){
      if (vertices[j%len].eqClass === vClass){
        var index2 = j%len;
        break;
      }
    }
    var cutBits = cut(edges, index0, index2);

    //find edge in bad vertices that is also in good vertices
    var pasteLabel = findPasteLabel(cutBits[0], cutBits[1], vertices, eq);

    cutBits = prePaste(cutBits[0], cutBits[1], pasteLabel);
    edges = paste(cutBits[0], cutBits[1], pasteLabel);

    //go again
    edges = cancelAdjInvs(edges);
    return collectVertices(edges);
   }
}


function biggestEqClass(verts){
  var eqClasses = [];
  for(var i = 0; i < verts.length; i++){
    var n = verts[i].eqClass
    if(eqClasses[n] == null){
      eqClasses[n] = 1;
    }else{
      eqClasses[n]++;
    }
  }
  var max = 0;
  var max_index = 0;
  for (var j = 0; j < eqClasses.length; j++){
    if (eqClasses[j] > max){
      max_index = j;
      max = eqClasses[j];
    }
  }
  return max_index;
}
//----------------------------------------------------------------------------
// findPasteLabel(circList edges, circList edges, array verrtices, int eq) --> string label
// Given two cut segments we wish to paste together such that the vertex of eqClass 'eq'
// is buried interior to the polygon, finds the appropriate edge label to paste along.
//---------------------------------------------------------------------------

function findPasteLabel(e0, e1, vertices, eq){
  //what are edge labels touching eq
  var eq_edges = new Set();
  for(var i = 0; i < vertices.length; i++){
      var v = vertices[i];
      if(v.eqClass === eq){
        eq_edges.add(v.left.label);
        eq_edges.add(v.right.label);

      }
  }

  var temp0 = e0.head.next; //we never want the head because this is the cut edge.
  var temp1;
  while(temp0 !== e0.head){
    temp1 = e1.head.next;
    while(temp1 !== e1.head){
      //find edge in both segments with label in
      if(temp0.label === temp1.label && eq_edges.has(temp0.label)){
        return temp0.label;
      }
      temp1 = temp1.next;
    }
    temp0 = temp0.next;
  }
}


//----------------------------------------------------------------------------
// collectLikeOriented(circList edges) --> circList edges
// Turns all occurances of ...a...a... into ...bb... where b is a label not
// originally present.
//---------------------------------------------------------------------------
function collectLikeOriented(edges){
  var left = edges.head;
  var i = 0;
  var right;
  var j;

  do{
    right = left.next;
    j = i + 1;

    while(right.label !== left.label){
      right = right.next;
      j++;
    }

    if(right.inverse === left.inverse &&
       right.next !== left && left.next !== right){

      var [e0, e1] = cut(edges, i, j);
      e1 = invert(e1);
      edges = paste(e0, e1, left.label);
      return collectLikeOriented(edges);
    }

    left = left.next;
    i++;

  }while(left !== edges.head);

  return edges;
}

function hasNonAdjLikeOriented(edges){
  var left = edges.head;
  var i = 0;
  var right;
  var j;

  do{
    right = left.next;
    j = i + 1;

    while(right.label !== left.label){
      right = right.next;
      j++;
    }

    if(right.inverse === left.inverse &&
       right.next !== left && left.next !== right){
         return true;
    }

    left = left.next;
    i++;

  }while(left !== edges.head);

  return false;
}

//----------------------------------------------------------------------------
// collectCrossedPair(circList edges) --> circList edges
// Turns all occurances of ...a...b...A...B... into ...cdCD... where c and d
// are labels not originally present
//---------------------------------------------------------------------------

function collectCrossedPair(edges){

  var pair = findCrossPair(edges, 0);

  var n = 0;
  while(pair.length > 0){ //while pairs left;

    //find a indices
    var temp = edges.head;
    var i = 0;
    while(temp.label !== pair[0] || temp.inverse){
      temp = temp.next;
      i = (i + 1) % edges.length;
    }
    var a_index1 = i;

    temp = temp.next;
    while(temp.label !== pair[0] || !temp.inverse){
      temp = temp.next;
      i = (i + 1) % edges.length;
    }
    var a_index2 = (i + 2) % edges.length;

    var cutA = cut(edges, a_index1, a_index2);
    var pasteB = paste(cutA[0], cutA[1], pair[1]);

    var labelC = cutA[0].head.label;
    temp = pasteB.head;

    var i = 0;
    while(temp.label !== labelC || temp.inverse){
      temp = temp.next;
      i = (i + 1) % pasteB.length;
    }
    var c_index1 = i;

    temp = temp.next;
    while(temp.label !== labelC || !temp.inverse){
      temp = temp.next;
      i = (i + 1) % pasteB.length;
    }
    var c_index2 = (i + 2) % pasteB.length;

    var cutC = cut(pasteB, c_index1, c_index2);
    var pasteA = paste(cutC[0], cutC[1], pair[0]);


    edges = pasteA;
    n++;
    pair = findCrossPair(edges, 2*n);
  }
  return edges;
}

//----------------------------------------------------------------------------
// findCrossedPair(circList edges, int n) --> (string label1, string label2)
// Finds two labels that make up a crossed pair and are not already collected.
//---------------------------------------------------------------------------

function findCrossPair(edges, n){

  var labelList = Array.from(edges.labels);
  var invs = []
  for(var i = 0; i < labelList.length; i++){
    var label = labelList[i];
    var temp = edges.head;

    while(temp.label !== label){
      temp = temp.next;
    }

    var inv1 = temp.inverse;
    temp = temp.next;
    while(temp.label !== label){
      temp = temp.next;
    }
    var inv2 = temp.inverse;
    if(inv1 !== inv2){
      invs.push(label);
    }
  }

  invs = invs.slice(n);

  if (invs.length === 0){
    return [];
  }

  temp = edges.head;
  var left = [];
  var right = [];

  while(temp.label !== invs[0]){
    temp = temp.next;
  }
  left.push(temp);
  temp = temp.next;
  while(temp.label !== invs[0]){

    left.push(temp);
    temp = temp.next;
  }
  right.push(temp);
  temp = temp.next;
  while(temp.label !== invs[0]){
    right.push(temp);
    temp = temp.next;
  }

  for(var j = 1; j < invs.length; j++){
    var inLeft = false;
    var inRight = false;
    for(var k = 1; k < left.length; k++){
      if (left[k].label === invs[j]){
        inLeft = true;
      }
    }
    for(var k = 1; k < right.length; k++){
      if (right[k].label === invs[j]){
        inRight = true;
      }
    }
    if (inRight && inLeft){
      return [invs[0], invs[j]];
    }
  }
}

function hasNonAdjCrossedPair(edges){
  var temp = edges.head;

  do{
    if(temp.next.label !== temp.label && temp.next.next.label !== temp.label){
      //check if second occurance
      var temp2 = temp;
      do{
        temp2 = temp2.next;
      }while(temp2.label != temp.label);

        if(temp2.next.label !== temp.label && temp2.next.next.label !== temp.label){
          return true;
        }
    }
    temp = temp.next;
  }while(temp != edges.head);
  return false;
}

//----------------------------------------------------------------------------
// countRP2(circList edges) --> int numRp2
// Counts the number of projective planes, namely occurances of ...aa...
//---------------------------------------------------------------------------
function countRP2(edges){
  var temp = edges.head;
  var countRp2 = 0;
  do{                                 //Shouldnt need to check inverse but just in case
    if (temp.next.label === temp.label && !inverses(temp.next, temp)){
      countRp2 ++;
    }
    temp = temp.next;
  }while(temp.next != edges.head.next);
  return countRp2;
}
