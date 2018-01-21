'use strict';

// ### Views ###

class ViewComponent {
  constructor() {
    if (new.target === ViewComponent) {
      throw new Error('Abstract class');
    }
  }
  getElement() {
    return this._element;
  }
}

class GameCell extends ViewComponent {
  constructor(handleCellClick, row, column) {
    super();
    this._state = 'unknown';
    this._element = document.createElement('td');
    this._element.addEventListener('click', function() {
      handleCellClick(row, column);
    });
  }

  setState(state) {
    if (state !== 'unknown' && state !== 'miss' && state !== 'hit') {
      throw new Error('Invalid state');
    }
    this._state = state;
    this._element.className = 'cell_' + state;
  }
}

class GameBoard extends ViewComponent {
  constructor(handleCellClick) {
    super();
    const rowCount = 10;
    const columnCount = 10;
    // 1. Create our own element (<table>)
    // 2. Iterate over rows ("for" up to rowCount)
      // 3. Create row element (<tr>)
      // 4. Iterate over columns ("for" up to columnCount)
        // 5. Create GameCell for every column
        // 6. Append our cell to row element
      // 7. Append the row to <table>
    {
      this._element = document.createElement('table');
      this._cells = {};
      const rowCount = 10;
      const columnCount = 10;
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        const row = document.createElement('tr');
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
          const cell = new GameCell(handleCellClick, rowIndex, columnIndex);
          row.appendChild(cell.getElement());
          // Make a textual identifier from (row, column) such as: "5-7"
          const coordinatesText = rowIndex + '-' + columnIndex;
          this._cells[coordinatesText] = cell;
        }
        this._element.appendChild(row);
      }
    }
  }

  setStateAt(row, column, state) {
    const coordinatesText = row + '-' + column;
    this._cells[coordinatesText].setState(state);
  }
}

class ScoreCounter extends ViewComponent {
  constructor() {
    super();
    this._element = document.createElement('p');
    this._element.textContent = '0';
  }

  setScore(score) {
    this._element.textContent = String(score);
  }
}

// ### Controller ###

class GameController {
  constructor(boardModel) {
    this._boardModel = boardModel;
  }

  handleCellClick(row, column) {
    this._boardModel.fireAt(row, column);
  }
}

// ### Model ###

class GameModel {
  constructor() {
    // Create a map: coordinates => { hasShip: true, firedAt: false }
    this._cells = {};
    this._observers = [];
    this._score = 0;
    const rowCount = 10;
    const columnCount = 10;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
        const coordinatesText = rowIndex + '/' + columnIndex;
        const hasShip = (Math.random() >= 0.8);
        this._cells[coordinatesText] = { hasShip: hasShip, firedAt: false };
      }
    }
  }

  fireAt(row, column) {
    const coordinatesText = row + '/' + column;
    const targetCell = this._cells[coordinatesText];
    // If already firedAt, do nothing:
    if (targetCell.firedAt) {
      return;
    }
    targetCell.firedAt = true;
    const result = targetCell.hasShip ? 'hit' : 'miss';
    if (result === 'hit') {
      this._score += 1;
    }
    this._observers.forEach(function(observer) {
      observer('firedAt', { result, row, column });
    });
    if (result === 'hit') {
      this._observers.forEach(function(observer) {
        observer('scored', { score: this._score });
      }, this);
    }
  }

  addObserver(observerFunction) {
    this._observers.push(observerFunction);
  }
}

// ### App init ###

const gameElement = document.getElementById('game');
let board;
const counter = new ScoreCounter();
let controller;

function handleCellClick(row, column) {
  controller.handleCellClick(row, column);
}

board = new GameBoard(handleCellClick);
const model = new GameModel();
model.addObserver(function(eventType, params) {
  switch (eventType) {
    case 'firedAt':
      board.setStateAt(params.row, params.column, params.result);
      break;
    case 'scored':
      counter.setScore(params.score);
      break;
  }
});
controller = new GameController(model);
gameElement.appendChild(board.getElement());
gameElement.appendChild(counter.getElement());
