const $ = function (e) {
  return document.querySelector(e);
};
const $$ = function (e) {
  return document.querySelectorAll(e);
};


function getMsgs() {
  return JSON.parse(localStorage.getItem('todo-list'));
}

function getDdl(ddl) {
  if (!ddl) return '';
  const ddlTime = new Date(ddl);
  const nowTime = new Date();
  if (ddlTime < nowTime) return '⏰ Expired'
  return `⏰ ${Math.ceil((ddlTime - nowTime) / (86400 * 1000))} days`
}

function renderlist() {
  const todoList = $('.todo-list');
  todoList.innerHTML = '';
  const filter = $('.filters li a.selected').innerHTML;
  const searchText = $('.search-todo').value;
  let msgs = getMsgs();
  let count = 0;
  let found = 0;

  for (let i = 0; msgs && i < msgs.length; ++i) {
    const msg = msgs[i].msg;
    const status = msgs[i].status;
    const ddl = msgs[i].ddl;
    if (status == 'Active') count++;
    if ((filter == 'All' || filter == status) && msg.includes(searchText)) {
      found++;
      const item = document.createElement('li');
      item.innerHTML =
        `<div class="view">
        <input class="toggle" type="checkbox" id="item${i}">
        <label class="mark" for="item${i}"></label>
          <div class="msg">

            <label class="todo-label">${msg}</label>
            <label class="todo-ddl">${status != 'Completed' ? getDdl(ddl) : ''}</label>
          </div>
          <button class="top">⬆️</button>
          <button class="edit">✏️</button>
          <button class="destroy">🗑</button>
        </div>`

      if (status == 'Completed') {
        item.classList.add('completed');
        item.querySelector('.toggle').checked = true;
      }
      //update item status
      item.querySelector('.toggle').addEventListener('change', function () {
        if (status == 'Active') {
          msgs[i].status = 'Completed';
        } else {
          msgs[i].status = 'Active';
        }
        localStorage.setItem('todo-list', JSON.stringify(msgs));
        renderlist();
      });
      //top item
      item.querySelector('.top').addEventListener('click', function () {
        select_msgs = msgs.splice(i, 1);
        msgs = msgs.concat(select_msgs);
        localStorage.setItem('todo-list', JSON.stringify(msgs));
        renderlist();
      });
      //edit item
      item.querySelector('.edit').addEventListener('click', function () {
        $('#editModal').classList.toggle('show');
        $('#modal-edit-todo').value = msgs[i].msg;
        $('#modal-edit-ddl').value = msgs[i].ddl;
        $('.modal-button').onclick = function () {
          if (!$('#modal-edit-todo').value) {
            alert('Empty TODO!');
            return;
          }
          msgs[i].msg = $('#modal-edit-todo').value;
          msgs[i].ddl = $('#modal-edit-ddl').value;
          localStorage.setItem('todo-list', JSON.stringify(msgs));
          $('#editModal').classList.remove('show');
          renderlist();
        }
      });
      //remove item
      item.querySelector('.destroy').addEventListener('click', function () {
        $('#deleteModal').classList.toggle('show');
        $('.modal-button-warn').onclick = function () {
          msgs.splice(i, 1);
          localStorage.setItem('todo-list', JSON.stringify(msgs));
          $('#deleteModal').classList.remove('show');
          renderlist();
        }
      });

      todoList.insertBefore(item, todoList.firstChild);
    }
  }
  if (filter != 'All' || searchText) {
    updateItemFound(found);
  } else {
    updateItemLeft(count);
  }

}

function updateItemLeft(leftNum) {
  const count = $('.todo-count');
  count.innerHTML = (leftNum || 'No') + (leftNum > 1 ? ' items' : ' item') + ' left';
}

function updateItemFound(foundNum) {
  const count = $('.todo-count');
  count.innerHTML = (foundNum || 'No') + (foundNum > 1 ? ' items' : ' item') + ' found';
}

// add item
function addTodo(msg, ddl) {
  let msgs = getMsgs() || [];
  msgs.push({ msg, status: 'Active', ddl });
  localStorage.setItem('todo-list', JSON.stringify(msgs));
  renderlist();
}

function completeAllTodoList() {
  let msgs = getMsgs() || [];
  msgs.forEach(x => x.status = 'Completed');
  localStorage.setItem('todo-list', JSON.stringify(msgs));
  renderlist();
}

function cancelAllTodoList() {
  let msgs = getMsgs() || [];
  msgs.forEach(x => x.status = 'Active');
  localStorage.setItem('todo-list', JSON.stringify(msgs));
  renderlist();
}

function clearCompletedTodoList() {
  const msgs = getMsgs();
  const activeMsgs = [];
  for (item of msgs) {
    const status = item.status;
    if (status == 'Active') activeMsgs.push(item);
  }
  localStorage.setItem('todo-list', JSON.stringify(activeMsgs));
  renderlist();
}

function sortTodoListByDDL() {
  const msgs = getMsgs();
  const sorted = msgs.sort((a, b) => {
    if (a.ddl == '' && b.status == 'Completed') return 1;
    if (b.ddl == '' && a.status == 'Completed') return -1;
    if (a.ddl == '' || a.status == 'Completed') return -1;
    if (b.ddl == '' || b.status == 'Completed') return 1;
    const aDate = new Date(a.ddl);
    const bDate = new Date(b.ddl);
    return bDate - aDate;
  })
  console.log(sorted)
  localStorage.setItem('todo-list', JSON.stringify(sorted));
  renderlist();
}


function switchNavbarDropdown() {
  $('.navbar .dropdown').classList.toggle('show');
}

window.onclick = window.ontouchend = function (e) {
  if (!e.target.matches('.navbar .icon')) {
    $('.navbar .dropdown').classList.remove('show');
  }
  if (e.target.matches('.modal')) {
    $$('.modal').forEach(x => x.classList.remove('show'));
  }
}


window.onload = function init() {
  $('.navbar .icon').addEventListener('click', switchNavbarDropdown);
  $('.complete-all').addEventListener('touchend', completeAllTodoList);
  $('.cancel-all').addEventListener('touchend', cancelAllTodoList);
  $('.clear-completed').addEventListener('touchend', clearCompletedTodoList);
  $('.sort-by-ddl').addEventListener('touchend', sortTodoListByDDL);

  $('.button-add').addEventListener('click', function () {
    $('#editModal').classList.toggle('show');
    $('#modal-edit-todo').value = '';
    $('#modal-edit-ddl').value = undefined;
    $('.modal-button').onclick = function () {
      if (!$('#modal-edit-todo').value) {
        alert('Empty TODO!');
        return;
      }
      addTodo($('#modal-edit-todo').value, $('#modal-edit-ddl').value);
      $('#editModal').classList.remove('show');
      renderlist();
    }
  });

  const searchTodo = $('.search-todo');
  searchTodo.addEventListener('input', function () {
    renderlist();
  });

  const filters = $$('.filters li a');
  for (let i = 0; i < filters.length; ++i) {
    (function (filter) {
      filter.addEventListener('click', function () {
        for (let j = 0; j < filters.length; ++j) {
          filters[j].classList.remove('selected');
        }
        filter.classList.add('selected');
        renderlist();
      }, false);
    })(filters[i])
  }
  renderlist();
}

