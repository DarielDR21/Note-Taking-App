const sideBar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const addNote = document.getElementById('add-notes-button');
const noteForm = document.getElementById('note-form');
const submitBtn = document.getElementById('submit-button');
const cardsContainer = document.querySelector('.cards');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const id = crypto.randomUUID();


sidebarToggle.addEventListener('click', () => {
    sideBar.classList.toggle('sidebar-hide');

    if (sideBar.classList.contains('sidebar-hide')) {
        sidebarToggle.textContent = '>';
        sidebarToggle.classList.add('sidebar-toggle-hidden'); 
    } else { 
        sidebarToggle.textContent = '<'
        sidebarToggle.classList.remove('sidebar-toggle-hidden');

    }
});

addNote.addEventListener('click', () => {
    const isHidden = window.getComputedStyle(noteForm).display === 'none';
    noteForm.style.display = isHidden ? 'block':'none';
    submitBtn.textContent = 'Add Note';
})

const key = 'my-notes';

let notes = [];
let editingNoteId = null;

//Load existing notes from storage 
window.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem(key);

    if (stored) {
        notes = JSON.parse(stored);
        renderNotes()
    }
});

submitBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
       alert('Please fill all the values.');
       return;
    }

    if (editingNoteId) {

        notes = notes.map(note => {
            if (note.id === editingNoteId) {
                return {... note, title, content};
            }
            return note;
        });
        editingNoteId = null;
    } else {
        const newNote = {
            id: crypto.randomUUID(),
            title,
            content,
            date: new Date().toLocaleDateString()
        };

        notes.push(newNote);
    }

    saveNotes();
    renderNotes();

    titleInput.value = '';
    contentInput.value = '';
    submitBtn.textContent = 'Add Note';
    noteform.style.display = 'none';
})

function renderNotes() {
    cardsContainer.innerHTML = '';
    
    notes.forEach((note) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span style="font-size: 12px; color: #7a5cff;">Note</span>
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <div class="card-footer">
                <span>📓</span>
                <span>${note.date}</span>
            </div>
            <button class="delete-btn" data-id="${note.id}" style="margin-top: 10px;">Delete</button>
            <button class="edit-btn" data-id="${note.id}" style=margin-top: 10px;">Edit</button>
        `;

        cardsContainer.append(card);

        card.querySelector('.delete-btn').addEventListener('click', () => {
            notes = notes.filter(n => n.id !== note.id)
            saveNotes();
            renderNotes();
        });

        card.querySelector('.edit-btn').addEventListener('click', () => {
            editingNoteId = note.id;
            titleInput.value = note.title;
            contentInput.value = note.content;
            noteForm.style.display = 'block';
            submitBtn.textContent = editingNoteId ? 'Update Now':'Add Note'

        });
    })
};

function saveNotes () {
    localStorage.setItem(key, JSON.stringify(notes));
}