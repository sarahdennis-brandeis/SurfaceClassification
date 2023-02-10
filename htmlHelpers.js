

function get(id) { //mike's
    var element = document.getElementById(id);
    if (element === null) {
        console.error("DOM id " + id + " not found!");
    }
    return element;
}

function writeMessage(message) {
    var messageArea = get("messages");
    messageArea.value = messageArea.value + message + "\n";
    messageArea.scrollTop = messageArea.scrollHeight;
}

function clearMessages() {
    var messageArea = get("messages");
    messageArea.value = "";
}

function clearInput() {
    var inputArea = get("polygon");
    inputArea.value = "";
}

function clearCanvas() {
    C.context.clearRect(0, 0, C.canvas.width, C.canvas.height);
}

function getMousePosition(event) {
  var rect = C.canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  return {x: x,y: y};
}
