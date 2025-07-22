const sideBar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const addNote = document.getElementById('add-notes-button');
const noteForm = document.getElementById('note-form');
const submitBtn = document.getElementById('submit-button');
const cardsContainer = document.querySelector('.cards');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const id = crypto.randomUUID();
const searchInput = document.getElementById('search-bar');
const homeLink = document.getElementById('home-link');
const favoritesLink = document.getElementById('favorites-link');


//key to get items from Local Storage
const key = 'my-notes';

//Array to store the notes
let notes = [];

// flag to know if we are editing
let editingNoteId = null;

let currentView = {query : '', showFavorites: false};


// if the sidebar toggle is clicked, then we want to toggle the sidebar-hide class on and off to hide it or display it
sidebarToggle.addEventListener('click', () => {
    sideBar.classList.toggle('sidebar-hide');

    //checking if the sidebar class contains sidebar-hide
    if (sideBar.classList.contains('sidebar-hide')) {
        // if it does, we change the sidebar toggle symbol to > 
        sidebarToggle.textContent = '>';
        // and add the sidebar-toggle-hidden class, which just changes the background and font color of the toggle
        sidebarToggle.classList.add('sidebar-toggle-hidden'); 
    } else { 
        //otherwise, leave the symbol as is and remove the sidebar-toggle-hidden class
        sidebarToggle.textContent = '<'
        sidebarToggle.classList.remove('sidebar-toggle-hidden');
    }
});

// if the search bar is typed on, we want to get that value and send it to renderNotes to filter the notes
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    currentView.query = query;
    renderNotes(currentView.query, currentView.showFavorites);
});

// if the home link in the sidebar is clicked, we want to display all the notes
homeLink.addEventListener('click', (event) => {
    event.preventDefault();
    currentView = {query: '', showFavorites: false};
    renderNotes('', false);
});

// if the favorites link in the sidebar is clicked, we want to display the notes we have favorited
favoritesLink.addEventListener('click', (event) => {
    event.preventDefault();
    currentView = {query: '', showFavorites: true};
    renderNotes(currentView.query, currentView.showFavorites);
});

// if the add notes button is clicked, we want to display the form to get user input
addNote.addEventListener('click', () => {
    // If the display property of the class .noteForm is none, isHidden is true, otherwise, it's false.
    const isHidden = window.getComputedStyle(noteForm).display === 'none';
    // If isHidden is true, then we want to display the form with of a display property of block, otherwise, leave it hidden.
    noteForm.style.display = isHidden ? 'block':'none';
});


//Load existing notes from storage 
window.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem(key);
    
    //if there are notes then parse the notes in a JSON format and store in array, and call renderNotes to display notes
    if (stored) {
        notes = JSON.parse(stored);
        renderNotes()
    }
});

//If the submit button is clicked, then we want to get the titles of the input and the text area
submitBtn.addEventListener('click', () => {
    const title = titleInput.value.trim(); //in our HTML, the title is our input
    const content = contentInput.value.trim(); // content is out textarea

    //Data validation to make sure neither the title or content is empty
    if (!title || !content) {
        // this is like a message box in vba, not best practice in web dev though
       alert('Please fill all the values.');
       return;
    }

    // checking if we are editing
    if (editingNoteId) {
        // if we are, we want to edit the right note so we check the noteID of the note against the editingNoteID variable
        notes = notes.map(note => {
            if (note.id === editingNoteId) {
                // if the IDs are the same, we want to return the edited note to the array
                return {... note, title, content};
            }
            return note;
        });
        // we want to reset editingNoteId
        editingNoteId = null;
    } else {
        // if we are not editing, we are creating a new note
        const newNote = {
            // crypto.randomUUID creates a random ID. This is best for large projects
            id: crypto.randomUUID(),
            title,
            content,
            date: new Date().toLocaleDateString(),
            isFavorite: false
        };
        // finally, we are pushing the new note or edited note to the array
        notes.push(newNote);
    }

    // then we are calling saveNotes to save it in local storage and renderNotes to display it
    saveNotes();
    renderNotes();

    //reseting values so the form is empty
    titleInput.value = '';
    contentInput.value = '';
    submitBtn.textContent = 'Add Note';
    noteForm.style.display = 'none';
});

//renderNotes does a couple of things, 1. render notes based on criteria, 2. renders all notes, and 3. creates a note when the user creates one
function renderNotes(query = '', showFavorites = false) {

    currentView = {query, showFavorites};
    // clear the sample notes from the layout
    cardsContainer.innerHTML = '';
    // if showFavorites is true and/or whatever the user typed into the search bar matches the title and content of a note, we want to return that
    notes
        .filter(note => {
            const matchesQuery = note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
            const matchesFavorites = showFavorites ? note.isFavorite : true;
            return matchesQuery && matchesFavorites;
        })

        //here, for each note in our array, we are creating a div container for it with some styling
        .forEach((note) => {
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
                <button class="favorite-btn" data-id="${note.id}" style="margin-top: 10px; background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem;">
                    ${note.isFavorite ? '❤️' : '♡'} 
                </button>
                <button class="delete-btn" data-id="${note.id}" style="margin-top: 10px;">Delete</button>
                <button class="edit-btn" data-id="${note.id}" style="margin-top: 10px;">Edit</button>
            `;

        // after we create the note, we want to append it to our cards container, which is housing all our notes
        cardsContainer.append(card);

        // if we favorite a note, we want to call toggleFavorite and pass the ID of the note
        card.querySelector('.favorite-btn').addEventListener('click', () => {
            toggleFavorite(note.id);
        });

        // if we click the delete button, we want to return only the notes that do not match the ID of the deleted card
        card.querySelector('.delete-btn').addEventListener('click', () => {
            notes = notes.filter(n => n.id !== note.id)
            // then we want to save and display the notes without the delete one
            saveNotes();
            renderNotes();
        });

        // if the edit button is clicked, we want to override whatever the user had with what they edited
        card.querySelector('.edit-btn').addEventListener('click', () => {
            editingNoteId = note.id;
            titleInput.value = note.title;
            contentInput.value = note.content;
            noteForm.style.display = 'block';
            submitBtn.textContent = editingNoteId ? 'Update Now':'Add Note'

        });
    });
};

//this function returns the notes that we have favorited when we click the favorite link on the sidebar
function toggleFavorite (noteID) {
    notes = notes.map(note => {
        if (note.id === noteID) {
            return { ...note, isFavorite: !note.isFavorite };
        }
        return note;
    });

    // then we want to save and display our favorited notes
    saveNotes();
    renderNotes(currentView.query, currentView.showFavorites);
}

// saveNotes saves notes to local storage with the specified key
function saveNotes () {
    localStorage.setItem(key, JSON.stringify(notes));
}

/*
What is local storage?
-Local storage is part of the built in Web Storage API and stores data as key-value pair as strings.
-This data is only accessible from the same origin (same protocol, domain, and port)
-The data persists in the browser unless explicitly removed     
-Cool thing about this is I didn't have to use a back-end to store user data
*/
