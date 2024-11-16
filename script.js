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
    const content = document.getElementById(contentId);
    navigator.clipboard.writeText(content.value)
        .then(() => {
            alert('Nội dung đã được sao chép!');
        })
        .catch(err => {
            console.error('Không thể sao chép:', err);
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
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="title">${note.title}</span>
                    <button class="copy-button" onclick="copyContent('content-${index + 1}')">Sao chép</button>
                </div>
                <textarea class="content" id="content-${index + 1}">${note.content}</textarea>
                <div class="note-footer">
                    <button class="move-button" onclick="moveUp('note-${index + 1}')">Lên</button>
                    <button class="move-button" onclick="moveDown('note-${index + 1}')">Xuống</button>
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

    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const notes = JSON.parse(e.target.result);

                if (Array.isArray(notes)) {
                    const container = document.querySelector('.note-container-scrollable');
                    container.innerHTML = '';  // Xóa các ghi chú hiện tại

                    notes.forEach((note, index) => {
                        const noteElement = document.createElement('div');
                        noteElement.classList.add('note');
                        noteElement.innerHTML = `
                            <div class="note-header">
                                <span class="title">${note.title}</span>
                                <button class="copy-button" onclick="copyContent('content-${index + 1}')">Sao chép</button>
                            </div>
                            <textarea class="content" id="content-${index + 1}">${note.content}</textarea>
                            <div class="note-footer">
                                <button class="move-button" onclick="moveUp('note-${index + 1}')">Lên</button>
                                <button class="move-button" onclick="moveDown('note-${index + 1}')">Xuống</button>
                            </div>
                        `;
                        container.appendChild(noteElement);
                    });

                    // Cập nhật localStorage với dữ liệu từ file
                    localStorage.setItem('notes', JSON.stringify(notes));
                } else {
                    alert('Dữ liệu không hợp lệ!');
                }
            } catch (err) {
                console.error('Lỗi khi tải file:', err);
                alert('Không thể đọc tệp JSON!');
            }
        };

        reader.readAsText(file);
    } else {
        alert('Vui lòng chọn một tệp JSON hợp lệ!');
    }
}

// Lưu ghi chú ra file JSON
function saveNotesToFile() {
    const notes = [];
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach((note, index) => {
        const title = note.querySelector('.title').textContent;
        const content = note.querySelector('.content').value;
        notes.push({ title, content, position: index + 1 }); // Chỉ lưu số thứ tự
    });

    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.json';
    a.click();
    URL.revokeObjectURL(url);
}
