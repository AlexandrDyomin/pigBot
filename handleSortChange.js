var tr1 = document.querySelector('thead > tr');
tr1.addEventListener('pointerdown', handleSortChange);

function handleSortChange(e) {
    var { target } = e;
    var rows = [...document.querySelectorAll('#boll tbody tr')];
    var currentActivCol = [...tr1.children].findIndex((item) => item === target.closest('th'));
    var tbody = document.querySelector('#boll tbody');
    
    if (target.classList.contains('sortButton')) {
        let prevActivCol = +tr1.dataset.sortByCol;
        prevActivCol && prevActivCol !== currentActivCol && tr1.children[prevActivCol].querySelector('.sortButton').classList.remove('asc', 'desc');
        tr1.dataset.sortByCol = currentActivCol;
        
        if (target.classList.contains('asc')) {
            target.classList.replace('asc', 'desc');
            sortByDesc();
            return;
        }
        if (target.classList.contains('desc')) {
            target.classList.replace('desc', 'asc');
            sortByAsc();
            return;
        }
        
        target.classList.add('asc');
        sortByAsc();
    }

    function sortByAsc() {
        rows.sort((a, b) => +a.children[currentActivCol].dataset.value - b.children[currentActivCol].dataset.value);
        tbody.replaceChildren(...rows);
    }

    function sortByDesc() {
        rows.sort((a, b) => +b.children[currentActivCol].dataset.value - a.children[currentActivCol].dataset.value);
        tbody.replaceChildren(...rows);
    }
}