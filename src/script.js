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

// Sao chép nội dung ghi chú (bao gồm cả ảnh)
function copyContent(contentId) {
    const title = document.getElementById(contentId.replace('content', 'title')).textContent;
    const content = document.getElementById(contentId);
    const noteId = contentId.replace('content-', 'note-');
    const note = document.getElementById(noteId);
    const images = note.querySelectorAll('.image-preview img');

    // Tạo nội dung HTML để copy
    let htmlContent = `<div><strong>${title}</strong></div><div>${content.value.replace(/\n/g, '<br>')}</div>`;

    // Thêm ảnh vào nội dung HTML
    if (images.length > 0) {
        htmlContent += '<div>';
        images.forEach(img => {
            htmlContent += `<img src="${img.src}" style="max-width: 300px; margin: 5px;">`;
        });
        htmlContent += '</div>';
    }

    // Tạo plain text version (không có ảnh)
    let plainText = `${title}\n${content.value}`;
    if (images.length > 0) {
        plainText += `\n\n[Ghi chú có ${images.length} ảnh]`;
    }

    const canWriteRich = !!(window.isSecureContext && navigator.clipboard && window.ClipboardItem);

    const copyPlainTextLegacy = () => {
        const temp = document.createElement('textarea');
        temp.value = plainText;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        let ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (err) {
            ok = false;
        }
        document.body.removeChild(temp);
        return ok;
    };

    if (canWriteRich) {
        const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([plainText], { type: 'text/plain' })
        });

        navigator.clipboard.write([clipboardItem])
            .then(() => {
                toastr.success('Nội dung ghi chú ' + title + ' (bao gồm ' + images.length + ' ảnh) đã được sao chép!');
            })
            .catch(() => {
                navigator.clipboard.writeText(plainText)
                    .then(() => {
                        toastr.warning('Đã sao chép nội dung text (không bao gồm ảnh)');
                    })
                    .catch(() => {
                        const ok = copyPlainTextLegacy();
                        if (ok) {
                            toastr.warning('Đã sao chép nội dung text (không bao gồm ảnh)');
                        } else {
                            toastr.error('Không thể sao chép nội dung.');
                        }
                    });
            });
    } else {
        navigator.clipboard?.writeText(plainText)
            .then(() => {
                toastr.warning('Đã sao chép nội dung text (không bao gồm ảnh)');
            })
            .catch(() => {
                const ok = copyPlainTextLegacy();
                if (ok) {
                    toastr.warning('Đã sao chép nội dung text (không bao gồm ảnh)');
                } else {
                    toastr.error('Không thể sao chép nội dung. Vui lòng chạy trên HTTPS hoặc localhost.');
                }
            });
    }
}


// Lưu ghi chú xuống localStorage (chỉ lưu số thứ tự)
function saveNotesToLocalStorage() {
    const notes = [];
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach((note, index) => {
        const title = note.querySelector('.title').textContent;
        const content = note.querySelector('.content').value;
        const images = [];
        const imageElements = note.querySelectorAll('.image-preview img');
        imageElements.forEach(img => {
            images.push(img.src);
        });
        notes.push({ title, content, images, position: index + 1 }); // Lưu cả ảnh
    });

    if (notes.length >= 1 && notes[0].title == "") {
        notes[0].title = "Ghi chú lúc " + create_time_string();
    }

    // Lưu vào localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Tải ghi chú từ localStorage
function loadNotesFromLocalStorage(editFirstNote = false) {
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
                <div class="image-container">
                    <input type="file" id="image-input-${index + 1}" accept="image/*" multiple style="display: none;" onchange="handleImageUpload(event, 'note-${index + 1}')">
                    <button class="add-image-btn" onclick="document.getElementById('image-input-${index + 1}').click()">
                        <i class="fas fa-image"></i> Thêm ảnh
                    </button>
                    <div class="image-preview" id="image-preview-${index + 1}"></div>
                </div>
                <div class="note-footer">
                    <div class = "up-down">
                        <i class="fas fa-arrow-up" title="Di chuyển lên" onclick="moveUp('note-${index + 1}')"></i>
                        <i class="fas fa-arrow-down" title="Di chuyển xuống" onclick="moveDown('note-${index + 1}')"></i>
                    </div>
                    <i class="fas fa-trash-alt delete-icon" title="Xoá ghi chú ${note.title}" onclick="deleteNote('note-${index + 1}')"></i>
                </div>
            `;
            container.appendChild(noteElement);
            
            // Tải ảnh nếu có
            if (note.images && note.images.length > 0) {
                const imagePreview = document.getElementById(`image-preview-${index + 1}`);
                note.images.forEach(imageSrc => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.classList.add('image-wrapper');
                    imgWrapper.innerHTML = `
                        <img src="${imageSrc}" alt="Note image">
                        <button class="delete-image-btn" onclick="deleteImage(this)"><i class="fas fa-times"></i></button>
                    `;
                    imagePreview.appendChild(imgWrapper);
                });
            }
        });
        if (editFirstNote)
            editNote('note-1', false); // Chỉnh sửa ghi chú đầu tiên
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

function create_time_string() {
    const day = new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate();
    const year = new Date().getFullYear() < 10 ? '0' + new Date().getFullYear() : new Date().getFullYear();
    const month = new Date().getMonth() < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1;
    const hour = new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours();
    const minute = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes();
    const second = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds();
    const name_time = `${year}-${month}-${day}_${hour}-${minute}-${second}`;
    return name_time;
}

// Lưu ghi chú vào file JSON
function saveNotesToFile() {
    const notes = [];
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach((note, index) => {
        const title = note.querySelector('.title').textContent;
        const content = note.querySelector('.content').value;
        const images = [];
        const imageElements = note.querySelectorAll('.image-preview img');
        imageElements.forEach(img => {
            images.push(img.src);
        });
        notes.push({ title, content, images });
    });

    const jsonData = JSON.stringify(notes, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    name_time = create_time_string();
    a.download = `HaiZukaNote_${name_time}.json`;
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
    loadNotesFromLocalStorage(true);  // Tải lại ghi chú từ localStorage
    toastr.success('Ghi chú mới đã được tạo!');


    // Lướt nhẹ lên đầu trang trong 200ms
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);

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
function editNote(noteId, notification = true) {
    const note = document.getElementById(noteId);
    const titleField = note.querySelector('.title');
    const contentField = note.querySelector('.content');

    titleField.contentEditable = true; // Cho phép chỉnh sửa tiêu đề
    contentField.readOnly = false; // Cho phép chỉnh sửa nội dung
    contentField.style.backgroundColor = '#333'; // Thay đổi màu nền khi chỉnh sửa

    contentField.focus(); // Focus vào nội dung

    if (notification)
        toastr.info('Chỉnh sửa ghi chú ' + titleField.textContent);
}

// Xử lý upload ảnh
function handleImageUpload(event, noteId) {
    const files = event.target.files;
    const note = document.getElementById(noteId);
    const noteIndex = noteId.split('-')[1];
    const imagePreview = document.getElementById(`image-preview-${noteIndex}`);
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgWrapper = document.createElement('div');
                imgWrapper.classList.add('image-wrapper');
                imgWrapper.innerHTML = `
                    <img src="${e.target.result}" alt="Note image">
                    <button class="delete-image-btn" onclick="deleteImage(this)"><i class="fas fa-times"></i></button>
                `;
                imagePreview.appendChild(imgWrapper);
                saveNotesToLocalStorage();
                toastr.success('Đã thêm ảnh vào ghi chú!');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Xóa ảnh
function deleteImage(button) {
    const imgWrapper = button.parentElement;
    imgWrapper.remove();
    saveNotesToLocalStorage();
    toastr.info('Đã xóa ảnh!');
}
