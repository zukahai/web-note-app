// Hoán đổi vị trí ghi chú
function moveUp(noteId) {
    const note = document.getElementById(noteId);
    const previousNote = note.previousElementSibling;

    if (previousNote && previousNote.classList.contains('note')) {
        note.parentNode.insertBefore(note, previousNote);
    }
    saveNotesToLocalStorage();  // Lưu lại sau khi di chuyển
}

function moveDown(noteId) {
    const note = document.getElementById(noteId);
    const nextNote = note.nextElementSibling;

    if (nextNote && nextNote.classList.contains('note')) {
        note.parentNode.insertBefore(nextNote, note);
    }
    saveNotesToLocalStorage();  // Lưu lại sau khi di chuyển
}

// Sao chép nội dung ghi chú
function copyContent(contentId) {
    const title = document.getElementById(contentId.replace('content', 'title')).textContent;
    const content = document.getElementById(contentId);
    navigator.clipboard.writeText(content.value)
        .then(() => {
            toastr.success('Nội dung ghi chú ' + title + ' đã được sao chép!');
        })
        .catch(err => {
            console.error('Không thể sao chép:', err);
            toastr.error('Không thể sao chép nội dung.');
        });
}


// Lưu ghi chú xuống localStorage (chỉ lưu số thứ tự)
function saveNotesToLocalStorage() {
    const notes = [];
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach((note, index) => {
        const title = note.querySelector('.title').textContent;
        const content = note.querySelector('.content').value;
        notes.push({ title, content, position: index + 1 }); // Chỉ lưu số thứ tự
    });

    if (notes.length >= 1 && notes[0].title == "") {
        notes[0].title = "Ghi chú mới";
    }

    // Lưu vào localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Tải ghi chú từ localStorage
function loadNotesFromLocalStorage() {
    const notesJSON = localStorage.getItem('notes');

    if (notesJSON) {
        const notes = JSON.parse(notesJSON);
        const container = document.querySelector('.note-container-scrollable');
        container.innerHTML = '';  // Xóa các ghi chú hiện tại

        // Sắp xếp ghi chú theo số thứ tự
        notes.sort((a, b) => a.position - b.position);

        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.id = `note-${index + 1}`;
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="title" id="title-${index + 1}" contenteditable="false">${note.title}</span>
                    <i class="fas fa-edit" title="Chỉnh sửa nội dung ${note.title}" onclick="editNote('note-${index + 1}')"></i>
                    <i class="fas fa-copy"  title="Sao chép nội dung ${note.title}" onclick="copyContent('content-${index + 1}')"></i>
                </div>
                <textarea class="content" id="content-${index + 1}" readonly>${note.content}</textarea>
                <div class="note-footer">
                    <div class = "up-down">
                        <i class="fas fa-arrow-up" title="Di chuyển lên" onclick="moveUp('note-${index + 1}')"></i>
                        <i class="fas fa-arrow-down" title="Di chuyển xuống" onclick="moveDown('note-${index + 1}')"></i>
                    </div>
                    <i class="fas fa-trash-alt delete-icon" title="Xoá ghi chú ${note.title}" onclick="deleteNote('note-${index + 1}')"></i>
                </div>
            `;
            container.appendChild(noteElement);
        });
    }
}

// Khi trang được tải lại, ưu tiên tải ghi chú từ localStorage
window.onload = function() {
    loadNotesFromLocalStorage();
};

// Lắng nghe sự thay đổi của các ghi chú và lưu vào localStorage
document.querySelector('.note-container-scrollable').addEventListener('input', function() {
    saveNotesToLocalStorage();
});

// Tải ghi chú từ file JSON và cập nhật localStorage
function loadNotesFromFile(event) {
    const file = event.target.files[0];
    const file_name = file.name;

    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const notes = JSON.parse(e.target.result);

                if (Array.isArray(notes)) {
                    localStorage.setItem('notes', JSON.stringify(notes));

                    loadNotesFromLocalStorage();  // Tải lại ghi chú từ localStorage
                    toastr.success('Ghi chú đã được tải từ file ' + file_name);
                }
            } catch (e) {
                toastr.error('Không thể tải ghi chú từ file ' + file_name);
            }
        };

        reader.readAsText(file);
    } else {
        toastr.error('Vui lòng chọn một file JSON!');
    }
    loadNotesFromLocalStorage();  // Tải lại ghi chú từ localStorage
}

// Lưu ghi chú vào file JSON
function saveNotesToFile() {
    const notes = [];
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach((note, index) => {
        const title = note.querySelector('.title').textContent;
        const content = note.querySelector('.content').value;
        notes.push({ title, content });
    });

    const jsonData = JSON.stringify(notes, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name_time = new Date().toLocaleString().replace(/:/g, '-').replace(/ /g, '_');
    a.download = `notes_${name_time}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Thêm ghi chú mới
function addNewNote() {
    const container = document.querySelector('.note-container-scrollable');
    const noteCount = container.querySelectorAll('.note').length;
    const newNoteId = `note-${noteCount + 1}`;

    const newNote = document.createElement('div');
    newNote.classList.add('note');
    newNote.id = newNoteId;
    newNote.innerHTML = `
        <div class="note-header">
            <input type="text" class="title" placeholder="Tiêu đề ghi chú">
            <i class="fas fa-copy" onclick="copyContent('content-${noteCount + 1}')"></i>
            <i class="fas fa-edit" onclick="editNote('${newNoteId}')"></i>
        </div>
        <textarea class="content" id="content-${noteCount + 1}" placeholder="Nội dung ghi chú"></textarea>
        <div class="note-footer">
            <i class="fas fa-arrow-up" onclick="moveUp('${newNoteId}')"></i>
            <i class="fas fa-arrow-down" onclick="moveDown('${newNoteId}')"></i>
            <i class="fas fa-trash-alt delete-icon" onclick="deleteNote('${newNoteId}')"></i>
        </div>
    `;
    // Thêm vào đàu container
    container.insertBefore(newNote, container.firstChild);
    saveNotesToLocalStorage();  // Lưu lại khi thêm ghi chú mới
    loadNotesFromLocalStorage();  // Tải lại ghi chú từ localStorage

    toastr.success('Ghi chú mới đã được tạo!');

}

// Xoá ghi chú
function deleteNote(noteId) {
    const note = document.getElementById(noteId);
    title = note.querySelector('.title').textContent;
    let text = Math.floor((Math.random() * 1000000)) % 90 + 10;
    text = text.toString();

    // cofirm xoá ghi chú bằng cách nhập "delete"
    const confirmDelete = prompt('Nhập \'' + text + '\' để xác nhận xoá ghi chú ' + title);
    if (confirmDelete != text) {
        toastr.error('Xác nhận xoá không hợp lệ!');
        return;
    }
    
    if (note) {
        
        note.remove();
        toastr.error('Ghi chú ' + title + ' đã bị xoá!');
    }
    saveNotesToLocalStorage();  // Lưu lại sau khi xóa ghi chú
}

// Chỉnh sửa ghi chú
function editNote(noteId) {
    const note = document.getElementById(noteId);
    const titleField = note.querySelector('.title');
    const contentField = note.querySelector('.content');

    titleField.contentEditable = true; // Cho phép chỉnh sửa tiêu đề
    contentField.readOnly = false; // Cho phép chỉnh sửa nội dung
    contentField.style.backgroundColor = '#333'; // Thay đổi màu nền khi chỉnh sửa

    titleField.focus(); // Focus vào tiêu đề

    toastr.info('Chỉnh sửa ghi chú ' + titleField.textContent);
}
