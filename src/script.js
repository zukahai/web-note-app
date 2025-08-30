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
            noteElement.draggable = true; // Cho phép kéo thả
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="title" id="title-${index + 1}" contenteditable="false">${note.title}</span>
                    <div class="note-actions">
                        <i class="fas fa-grip-vertical drag-handle" title="Kéo để sắp xếp" style="color: rgba(255,255,255,0.5); cursor: grab; margin-right: 8px;"></i>
                        <i class="fas fa-edit" title="Chỉnh sửa nội dung ${note.title}" onclick="editNote('note-${index + 1}')"></i>
                        <i class="fas fa-copy"  title="Sao chép nội dung ${note.title}" onclick="copyContent('content-${index + 1}')"></i>
                    </div>
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
            
            // Add drag and drop event listeners
            setupDragAndDrop(noteElement);
            
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
        notes.push({ title, content });
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
    newNote.draggable = true;
    newNote.innerHTML = `
        <div class="note-header">
            <span class="title" contenteditable="false">Ghi chú mới</span>
            <div class="note-actions">
                <i class="fas fa-grip-vertical drag-handle" title="Kéo để sắp xếp" style="color: rgba(255,255,255,0.5); cursor: grab; margin-right: 8px;"></i>
                <i class="fas fa-edit" title="Chỉnh sửa nội dung" onclick="editNote('${newNoteId}')"></i>
                <i class="fas fa-copy" title="Sao chép nội dung" onclick="copyContent('content-${noteCount + 1}')"></i>
            </div>
        </div>
        <textarea class="content" id="content-${noteCount + 1}" placeholder="Nhập nội dung ghi chú..." readonly></textarea>
        <div class="note-footer">
            <div class="up-down">
                <i class="fas fa-arrow-up" title="Di chuyển lên" onclick="moveUp('${newNoteId}')"></i>
                <i class="fas fa-arrow-down" title="Di chuyển xuống" onclick="moveDown('${newNoteId}')"></i>
            </div>
            <i class="fas fa-trash-alt delete-icon" title="Xoá ghi chú" onclick="deleteNote('${newNoteId}')"></i>
        </div>
    `;
    
    // Add to container
    container.insertBefore(newNote, container.firstChild);
    
    // Setup drag and drop for new note
    setupDragAndDrop(newNote);
    
    // Save and reload
    saveNotesToLocalStorage();
    loadNotesFromLocalStorage(true);  // Edit first note
    toastr.success('Ghi chú mới đã được tạo!');

    // Scroll to top smoothly
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
}

// Xoá ghi chú với popup xác nhận hiện đại
function deleteNote(noteId) {
    const note = document.getElementById(noteId);
    const title = note.querySelector('.title').textContent || 'Ghi chú không có tiêu đề';
    
    showDeleteConfirmation(title, () => {
        if (note) {
            note.remove();
            toastr.error('Ghi chú "' + title + '" đã bị xoá!');
            saveNotesToLocalStorage();  // Lưu lại sau khi xóa ghi chú
        }
    });
}

// Hiển thị popup xác nhận xóa hiện đại
function showDeleteConfirmation(noteTitle, onConfirm) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'delete-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'delete-dialog';
    dialog.style.cssText = `
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        transform: scale(0.8);
        transition: transform 0.3s ease;
        color: #e8eaed;
    `;

    dialog.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; color: #f44336; margin-bottom: 16px;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Xác nhận xóa</h3>
            <p style="margin: 0 0 24px 0; color: rgba(232, 234, 237, 0.8); line-height: 1.5;">
                Bạn có chắc chắn muốn xóa ghi chú "<strong>${noteTitle}</strong>"?<br>
                <span style="font-size: 14px; color: rgba(232, 234, 237, 0.6);">Hành động này không thể hoàn tác.</span>
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="cancel-delete-btn" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: #e8eaed;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">Hủy</button>
                <button class="confirm-delete-btn" style="
                    background: linear-gradient(135deg, #f44336, #d32f2f);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s ease;
                ">Xóa</button>
            </div>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => {
        overlay.style.opacity = '1';
        dialog.style.transform = 'scale(1)';
    }, 10);

    // Add button event listeners
    const cancelBtn = dialog.querySelector('.cancel-delete-btn');
    const confirmBtn = dialog.querySelector('.confirm-delete-btn');

    const closeDialog = () => {
        overlay.style.opacity = '0';
        dialog.style.transform = 'scale(0.8)';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    };

    cancelBtn.onclick = closeDialog;
    confirmBtn.onclick = () => {
        onConfirm();
        closeDialog();
    };

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeDialog();
        }
    };

    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Add hover effects
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        cancelBtn.style.transform = 'translateY(-1px)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        cancelBtn.style.transform = 'translateY(0)';
    });

    confirmBtn.addEventListener('mouseenter', () => {
        confirmBtn.style.background = 'linear-gradient(135deg, #f55555, #e53935)';
        confirmBtn.style.transform = 'translateY(-1px)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
        confirmBtn.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
        confirmBtn.style.transform = 'translateY(0)';
    });
}

// Chỉnh sửa ghi chú
function editNote(noteId, notification = true) {
    const note = document.getElementById(noteId);
    const titleField = note.querySelector('.title');
    const contentField = note.querySelector('.content');
    const editIcon = note.querySelector('.fa-edit');
    
    // Store original values for cancel functionality
    note.dataset.originalTitle = titleField.textContent || titleField.value;
    note.dataset.originalContent = contentField.value;

    titleField.contentEditable = true; // Cho phép chỉnh sửa tiêu đề
    contentField.readOnly = false; // Cho phép chỉnh sửa nội dung
    contentField.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // Thay đổi màu nền khi chỉnh sửa
    contentField.style.border = '2px solid rgba(102, 126, 234, 0.6)';
    titleField.style.background = 'rgba(0, 0, 0, 0.3)';
    titleField.style.padding = '4px 8px';
    titleField.style.borderRadius = '4px';
    titleField.style.border = '1px solid rgba(255, 255, 255, 0.2)';

    // Replace edit icon with save/cancel buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'edit-buttons';
    buttonContainer.style.cssText = 'display: flex; gap: 8px; align-items: center;';
    
    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.className = 'save-btn';
    saveBtn.title = 'Lưu thay đổi';
    saveBtn.style.cssText = `
        background: linear-gradient(135deg, #4caf50, #45a049);
        border: none;
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
    `;
    saveBtn.onclick = () => saveNote(noteId);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.title = 'Hủy thay đổi';
    cancelBtn.style.cssText = `
        background: linear-gradient(135deg, #f44336, #d32f2f);
        border: none;
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
    `;
    cancelBtn.onclick = () => cancelEdit(noteId);
    
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    
    // Hide edit icon and show save/cancel buttons
    editIcon.style.display = 'none';
    editIcon.parentNode.insertBefore(buttonContainer, editIcon.nextSibling);

    contentField.focus(); // Focus vào nội dung

    if (notification)
        toastr.info('Chỉnh sửa ghi chú ' + titleField.textContent);
}

// Lưu ghi chú
function saveNote(noteId) {
    const note = document.getElementById(noteId);
    const titleField = note.querySelector('.title');
    const contentField = note.querySelector('.content');
    const editIcon = note.querySelector('.fa-edit');
    const buttonContainer = note.querySelector('.edit-buttons');

    // Disable editing
    titleField.contentEditable = false;
    contentField.readOnly = true;
    contentField.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    contentField.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    titleField.style.background = 'transparent';
    titleField.style.padding = '0';
    titleField.style.border = 'none';

    // Remove save/cancel buttons and show edit icon
    if (buttonContainer) {
        buttonContainer.remove();
    }
    editIcon.style.display = '';

    // Clear stored original values
    delete note.dataset.originalTitle;
    delete note.dataset.originalContent;

    // Save to localStorage
    saveNotesToLocalStorage();
    toastr.success('Ghi chú đã được lưu!');
}

// Hủy chỉnh sửa
function cancelEdit(noteId) {
    const note = document.getElementById(noteId);
    const titleField = note.querySelector('.title');
    const contentField = note.querySelector('.content');
    const editIcon = note.querySelector('.fa-edit');
    const buttonContainer = note.querySelector('.edit-buttons');

    // Restore original values
    if (note.dataset.originalTitle !== undefined) {
        titleField.textContent = note.dataset.originalTitle;
    }
    if (note.dataset.originalContent !== undefined) {
        contentField.value = note.dataset.originalContent;
    }

    // Disable editing
    titleField.contentEditable = false;
    contentField.readOnly = true;
    contentField.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    contentField.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    titleField.style.background = 'transparent';
    titleField.style.padding = '0';
    titleField.style.border = 'none';

    // Remove save/cancel buttons and show edit icon
    if (buttonContainer) {
        buttonContainer.remove();
    }
    editIcon.style.display = '';

    // Clear stored original values
    delete note.dataset.originalTitle;
    delete note.dataset.originalContent;

    toastr.info('Thay đổi đã được hủy');
}

// Drag and Drop functionality
let draggedElement = null;
let dropZone = null;

function setupDragAndDrop(noteElement) {
    // Add touch support variables
    let touchStartY = 0;
    let touchStartX = 0;
    let touchEndY = 0;
    let touchEndX = 0;
    let isDragging = false;

    // Drag start
    noteElement.addEventListener('dragstart', (e) => {
        draggedElement = noteElement;
        noteElement.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', noteElement.outerHTML);
    });

    // Drag end
    noteElement.addEventListener('dragend', (e) => {
        noteElement.style.opacity = '1';
        draggedElement = null;
        removeDropZones();
    });

    // Drag over
    noteElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        showDropZone(noteElement);
    });

    // Drop
    noteElement.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement && draggedElement !== noteElement) {
            const container = noteElement.parentNode;
            const draggedIndex = Array.from(container.children).indexOf(draggedElement);
            const targetIndex = Array.from(container.children).indexOf(noteElement);

            if (draggedIndex < targetIndex) {
                container.insertBefore(draggedElement, noteElement.nextSibling);
            } else {
                container.insertBefore(draggedElement, noteElement);
            }

            saveNotesToLocalStorage();
            toastr.success('Ghi chú đã được sắp xếp lại!');
        }
        removeDropZones();
    });

    // Touch events for mobile swipe gestures
    noteElement.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isDragging = false;
    }, { passive: true });

    noteElement.addEventListener('touchmove', (e) => {
        if (!isDragging) {
            const touchY = e.touches[0].clientY;
            const touchX = e.touches[0].clientX;
            const deltaY = touchY - touchStartY;
            const deltaX = touchX - touchStartX;

            // Check if it's a significant movement
            if (Math.abs(deltaY) > 30 || Math.abs(deltaX) > 30) {
                isDragging = true;
                
                // Visual feedback for swipe
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    noteElement.style.transform = `translateX(${deltaX * 0.3}px)`;
                    if (deltaX < -50) {
                        noteElement.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
                    } else {
                        noteElement.style.backgroundColor = '';
                    }
                } else if (deltaY < -30) {
                    // Upward swipe
                    noteElement.style.transform = `translateY(${deltaY * 0.3}px)`;
                    noteElement.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                }
            }
        }
    }, { passive: true });

    noteElement.addEventListener('touchend', (e) => {
        if (isDragging) {
            touchEndY = e.changedTouches[0].clientY;
            touchEndX = e.changedTouches[0].clientX;
            
            const deltaY = touchEndY - touchStartY;
            const deltaX = touchEndX - touchStartX;

            // Reset visual state
            noteElement.style.transform = '';
            noteElement.style.backgroundColor = '';

            // Handle swipe gestures
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX < -100) {
                    // Swipe left - show delete confirmation
                    deleteNote(noteElement.id);
                }
            } else if (deltaY < -100) {
                // Swipe up - move note up
                moveUp(noteElement.id);
                toastr.info('Ghi chú đã được di chuyển lên!');
            } else if (deltaY > 100) {
                // Swipe down - move note down
                moveDown(noteElement.id);
                toastr.info('Ghi chú đã được di chuyển xuống!');
            }
        }
        isDragging = false;
    }, { passive: true });
}

function showDropZone(targetElement) {
    removeDropZones();
    
    dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.style.cssText = `
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        margin: 8px 0;
        border-radius: 2px;
        opacity: 0.8;
        transition: all 0.2s ease;
    `;
    
    targetElement.parentNode.insertBefore(dropZone, targetElement);
}

function removeDropZones() {
    const zones = document.querySelectorAll('.drop-zone');
    zones.forEach(zone => zone.remove());
}
