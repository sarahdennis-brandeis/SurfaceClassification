class Stack{

  constructor(){
    this.size = 0;
    this.top = null;
    this.stack = [];
  }

  //{verts: , edges: , cut: }
  push(x){
    this.stack.push(x);
    this.size++;
  }

  pop(){
    if(this.size > 0){
      this.size--;
      return this.stack.pop();
    }else{
      console.error("Cannot pop... stack empty");
    }
  }

  peek(){
    if(this.size <= 0){
      console.error("Cannot peek... stack empty");
    }else{
      return this.stack[this.size-1];
    }
  }

}
