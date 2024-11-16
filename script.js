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
