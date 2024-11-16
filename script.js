// Hoán đổi vị trí ghi chú
function moveUp(noteId) {
    const note = document.getElementById(noteId);
    const previousNote = note.previousElementSibling;

    if (previousNote && previousNote.classList.contains('note')) {
        note.parentNode.insertBefore(note, previousNote);
    }
}

function moveDown(noteId) {
    const note = document.getElementById(noteId);
    const nextNote = note.nextElementSibling;

    if (nextNote && nextNote.classList.contains('note')) {
        note.parentNode.insertBefore(nextNote, note);
    }
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

// Lưu ghi chú xuống file note.json (chỉ lưu số thứ tự)
function saveNotesToFile() {
    const notes = [];
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach((note, index) => {
        const title = note.querySelector('.title').textContent;
        const content = note.querySelector('.content').value;
        notes.push({ title, content, position: index + 1 }); // Chỉ lưu số thứ tự
    });

    // Chuyển đổi mảng ghi chú thành chuỗi JSON
    const notesJSON = JSON.stringify(notes, null, 2);

    // Tạo Blob và tải xuống file JSON
    const blob = new Blob([notesJSON], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'notes.json';
    link.click();
}

// Tải lại ghi chú từ file JSON (chỉ sắp xếp theo số thứ tự)
function loadNotesFromFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const notes = JSON.parse(e.target.result);
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
    };

    reader.readAsText(file);
}
