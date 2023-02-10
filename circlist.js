class Edge{
  constructor(label, inverse = false){ //inverse defaults to false
    this.label = label;
    this.inverse = inverse;
    this.next = null;
  }

  string(){
    if (this.inverse){
      return this.label.toUpperCase();
    }else{
      return this.label;
    }
  }

}

class Vertex{
  constructor(left, right, eqClass = null){
    this.left = left;
    this.right = right;
    this.eqClass = eqClass;
  }

  setCoords(x,y){
    this.x = x;
    this.y = y;
  }

}

class CircList{ //of Edges!!
  constructor(){
    this.length = 0;
    this.head = null;
    this.labels = new Set();
  }

  string(){
    var s = '';
    if(this.length !== 0){
      var temp = this.head;
      do{
        s += temp.string();
        temp = temp.next;
      }while(temp != this.head);

    }
    return s;
  }


//adds node at the END of the list
  push(node){
    var temp = this.head;
    if (this.head !== null){
      while(temp.next !== this.head){
        temp = temp.next;
      }
      temp.next = node;
      node.next = this.head;
    }else{
      this.head = node;
      node.next = this.head;
    }
    this.length++;
    this.labels.add(node.label);
  }

  //adds node at the FRONT of the list
  //used for inverting
    prePend(node){
      if(this.head === null){
        this.head = node;
        node.next = this.head;
      }else{
        node.next = this.head

        var temp = this.head;
        while(temp.next !== this.head){
          temp = temp.next;
        }
        temp.next = node;
        node.next = this.head;
        this.head = node

      }

      this.length++;
      this.labels.add(node.label);
    }
}
