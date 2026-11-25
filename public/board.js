const board = document.querySelector('.board');
const pieces = [...board.querySelectorAll('.piece')];
let drag;
let suppressClick = false;

board.classList.add('is-interactive');
document.querySelector('.explore').textContent = '拖动棋子，或点击查看 ↓';

const opening = board.closest('.opening');
opening.addEventListener('focusin', () => {
  opening.classList.add('entrance-finished');
}, { once: true });

board.addEventListener('pointerdown', (event) => {
  if (drag || !event.isPrimary || event.button !== 0) return;
  suppressClick = false;
  const piece = event.target.closest('.piece');
  if (!piece) return;
  const style = getComputedStyle(piece);
  const screenToBoard = new DOMMatrixReadOnly(getComputedStyle(board).transform).inverse();
  drag = {
    piece,
    pointerId: event.pointerId,
    screenToBoard,
    x: event.clientX,
    y: event.clientY,
    row: Number(style.gridRowStart),
    column: Number(style.gridColumnStart),
    moved: false,
  };
});

window.addEventListener('pointermove', (event) => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (!drag.moved) {
    if (Math.hypot(dx, dy) < 7) return;
    drag.moved = true;
    drag.piece.classList.add('is-dragging', 'has-moved');
    drag.piece.setPointerCapture(event.pointerId);
  }

  // Project pointer motion back onto the tilted board before snapping to cells.
  const motion = drag.screenToBoard.transformPoint({ x: dx, y: dy, w: 0 });
  const cellWidth = board.clientWidth / 4;
  const cellHeight = board.clientHeight / 4;
  const x = Math.max((1 - drag.column) * cellWidth, Math.min((4 - drag.column) * cellWidth, motion.x));
  const y = Math.max((1 - drag.row) * cellHeight, Math.min((4 - drag.row) * cellHeight, motion.y));
  drag.piece.style.setProperty('--drag-x', `${x}px`);
  drag.piece.style.setProperty('--drag-y', `${y}px`);
});

function finishDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { piece, row, column, moved } = drag;
  drag = undefined;
  if (!moved) return;

  suppressClick = true;
  if (event.type === 'pointerup') {
    const targetRow = row + Math.round(parseFloat(piece.style.getPropertyValue('--drag-y')) / (board.clientHeight / 4));
    const targetColumn = column + Math.round(parseFloat(piece.style.getPropertyValue('--drag-x')) / (board.clientWidth / 4));
    const occupied = pieces.some((other) => {
      if (other === piece) return false;
      const style = getComputedStyle(other);
      return Number(style.gridRowStart) === targetRow && Number(style.gridColumnStart) === targetColumn;
    });

    if (!occupied) {
      piece.style.gridArea = `${targetRow} / ${targetColumn}`;
    }
  }

  piece.style.removeProperty('--drag-x');
  piece.style.removeProperty('--drag-y');
  piece.classList.remove('is-dragging');
}

for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  window.addEventListener(type, finishDrag);
}

board.addEventListener('click', (event) => {
  if (suppressClick && event.detail > 0) {
    event.preventDefault();
    suppressClick = false;
  }
});
