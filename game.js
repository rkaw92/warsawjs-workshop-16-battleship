const gameElement = document.getElementById('game');
const row = document.createElement('tr');
const cell1 = document.createElement('td');
const cell2 = document.createElement('td');
row.appendChild(cell1);
row.appendChild(cell2);
gameElement.appendChild(row);

const cells = [ cell1, cell2 ];
//TODO: Add handlers for the "click" event to both elements in a loop.

for (let i = 0; i < cells.length; i += 1) {
  const currentCell = cells[i];
  currentCell.addEventListener('click', function(event) {
    currentCell.classList.add('clicked');
  });
}
