// ----------------------------------------
// INITIALIZATION FUNCTIONS
// ----------------------------------------

function buildEdges(p){
  var edges = new CircList();

  for(i = 0; i < p.length; i++){
    inverse = (p[i].charCodeAt(0) < 97);
    edges.push(new Edge(p[i].toLowerCase(), inverse));
  }
  return edges
}

function buildVertices(edges){
  var vertices = [];
  var right = edges.head;
  var left;

  do{
    vertices.push(new Vertex(left, right));
    left = right;
    right = right.next;
  }while(right != edges.head);

  vertices[0].left = left;
  return vertices;
 }

 function validPolygon(p){
   if(p.length % 2 === 1 || p.length === 0){
     return false;
   }
   var r = new RegExp('^[a-zA-Z]+$');
   if(!r.test(p)){
     return false;
   }
   //is every letter there twice?
   var letters = {};
   for(var i = 0; i < p.length; i++){
     var chr = p[i].toLowerCase();
     chr in letters ? letters[chr]++ : letters[chr] = 1;
   }
   for (var chr in letters){
     if (letters[chr] !== 2){
       return false;
     }
   }
   return true;
 }
