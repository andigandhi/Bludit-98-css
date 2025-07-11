var mousePosition;
var isDown = false;

var div;
var titleBar;
var offset = [0, 0];
var zMax = 1;

// Adds the listener to the title bar of a window
function addMoveListeners(div1, titleBar1) {
  div = div1;
  titleBar = titleBar1;

  titleBar.addEventListener(
    'mousedown',
    function (event) {
      mousedown(event);
    },
    true,
  );
  titleBar.addEventListener(
    'touchstart',
    function (event) {
      mousedown(event);
    },
    true,
  );

  inForground(div);
}

// Starts the mouse tracking
function addDocumentTracker() {
  document.addEventListener('mousemove', mouseMove, true);
  document.addEventListener('touchmove', touchMove, true);
}

// Calculates initial cursor offset for mouse movement
function mousedown(e) {
  div = e.target.parentElement;

  if (div === null) {
    return;
  }

  if (typeof e === 'undefined') {
    return;
  }

  offset = [div.offsetLeft, div.offsetTop];
  isDown = true;
  offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];

  if (isNaN(offset[0])) {
    offset = [div.offsetLeft - e.touches[0].clientX, div.offsetTop - e.touches[0].clientY];
  }

  addDocumentTracker();

  inForground(div);
}

// Stops the mouse tracking
function documentMouseTrackStart() {
  document.addEventListener(
    'mouseup',
    function () {
      isDown = false;
      remDocumentTracker();
    },
    true,
  );
  document.addEventListener(
    'touchend',
    function () {
      isDown = false;
      remDocumentTracker();
    },
    true,
  );
}
function remDocumentTracker() {
  document.removeEventListener('mousemove', mouseMove, true);
  document.removeEventListener('touchmove', touchMove, true);
}

// Move window to the front
function inForground(div) {
  div.style.zIndex = zMax;
  //document.getElementById(div.id+'t').active = true;
  zMax++;
}

// Movement listener for mobile phones
function touchMove(e) {
  event.preventDefault();

  if (isDown) {
    touchPosition = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    var new_x = touchPosition.x + offset[0];
    if (new_x + div.clientWidth - 15 > document.body.clientWidth) {
      new_x = document.body.clientWidth + 15 - div.clientWidth;
    }
    div.style.left = new_x + 'px';

    div.style.top = touchPosition.y + offset[1] + 'px';
  }
}

// Movement listener for PCs
function mouseMove(e) {
  event.preventDefault();

  if (isDown) {
    mousePosition = { x: event.clientX, y: event.clientY };

    div.style.left = mousePosition.x + offset[0] + 'px';
    div.style.top = mousePosition.y + offset[1] + 'px';
  }
}

documentMouseTrackStart();
