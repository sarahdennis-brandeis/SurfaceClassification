function cut(edges, frm, to){
  writeMessage("cutting " + edges.string() + " from index " + frm + " to index " + to);
  if(to < frm){
    var hold = frm;
    frm = to;
    to = hold;
  }
  e1 = new CircList();
  e2 = new CircList();
  var new_label = newLabel(edges.labels);

  var temp = edges.head
  var i  = 0;

  while(i < frm){
    temp = temp.next;
    i++;
  }

  e1.push(new Edge(new_label, false));
  while (i < to){
    e1.push(new Edge(temp.label, temp.inverse));
    temp = temp.next;
    i ++;
  }

  e2.push(new Edge(new_label, true));
  while(i < edges.length){
    e2.push(new Edge(temp.label, temp.inverse));
    temp = temp.next;
    i++;
  }

  i = 0
  while(i < frm){
    e2.push(new Edge(temp.label, temp.inverse));
    temp = temp.next;
    i++;
  }
  if(C.animate){P.steps.push([e1, e2]);}
  writeMessage("result: " + e1.string() + " and " + e2.string());
  return [e1, e2];
}

function paste(e1, e2, label){ //two edge lists, one label name
  writeMessage("pasting " + e1.string() + " to " + e2.string()+ " along " + label);

  var e = new CircList();

  var temp1 = e1.head;
  while(temp1.label !== label){
    e.push(new Edge(temp1.label, temp1.inverse));
    temp1 = temp1.next;
  }
  temp1 = temp1.next

  var temp2 = e2.head;
  while(temp2.label !== label){
    temp2 = temp2.next;
  }
  temp2 = temp2.next;

  while(temp2.label !== label){
    e.push(new Edge(temp2.label, temp2.inverse));
    temp2 = temp2.next;
  }

  while(temp1.label !== e1.head.label){
    e.push(new Edge(temp1.label, temp1.inverse));
    temp1 = temp1.next;
  }
  if(C.animate){P.steps.push(e);}
  writeMessage("result: " + e.string());
  return e;
}

function invert(edges){ //edges is a circular list
  writeMessage("inverting " + edges.string());
  var inv = new CircList();
  var temp = edges.head;
  inv.prePend(new Edge(temp.label, !temp.inverse));
  while (temp.next != edges.head){
    temp = temp.next;
    inv.prePend(new Edge(temp.label, !temp.inverse));
  }
  if(C.animate){P.steps.push(inv);}
  writeMessage("result: " + inv.string());
  return inv;
}

function newLabel(labels){
  alphabet = "abcdefghijklmnopqrstuvwxyz";
  for(i = 0; i < alphabet.length; i++){
    letter = alphabet[i];
    if (!labels.has(letter)){
      return letter;
    }
  }
  console.Error("All labels have been used");
}

 //no checking for "if possible" or for length 2!!
function pasteAdjInv(edges, label){
  var e = new CircList();

  var temp = edges.head;
  do{
    if(temp.label !== label){
      e.push(new Edge(temp.label, temp.inverse));
    }
    temp = temp.next;
  }while(temp !== edges.head);
  if(C.animate){P.steps.push(e);}
  return e;
}

function inverses(e1, e2){
  return e1.label === e2.label && e1.inverse !== e2.inverse
}

function prePaste(e1, e2, label){ //checks label is inversed, inverts e2 if necessary.
  var e1_inv, e2_inv;
  var temp = e1.head;
  do{
    if(temp.label === label){
      e1_inv = temp.inverse;
      break;
    }
    temp = temp.next
  }while (temp != e1.head);

  temp = e2.head;
  do{
    if(temp.label === label){
      e2_inv = temp.inverse;
      break;
    }
    temp = temp.next
  }while (temp != e2.head);
  if (e2_inv === e1_inv){
    e2 = invert(e2);
    if(C.animate){P.steps.push([e1, e2]);}
    return [e1, e2]
  }else{
    return [e1, e2];
  }

}
