let currentUser;

//listen for auth status changes
auth.onAuthStateChanged(user => {
    if (user) {
        // referance database
db.collection('recipes').get().then(snapshot => {
    // console.log(snapshot.docs);
    extraAdds(snapshot.docs);
        setupUI(user); 
 });
         // console.log('user logged in: ', user)
     } else {
         extraAdds([]);
        setupUI();
        //console.log('user logged out');
    }
})

//adding extra, non-ingredient items to database and list
const addItemForm = document.querySelector('#create-form');
addItemForm.addEventListener('submit', (e) => {
   e.preventDefault();
   
   let extraItem = addItemForm['addItem-input'].value;
   console.log(extraItem);
   $('.myListDiv').append(extraItem);
});

//  sign up
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get new user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    // console.log (email, password);

    //  sign up the user (asyncronous task that takes time to complete)
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        // console.log(cred.user)
        
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
    })

    //adding new collection for Firebase db for each new user
    db.collection("users").doc(email).set({
        email:  email,
    }).then (function(){
        console.log("Document written successfully");
    });

    var usersRef = db.collection("users");
    var recipesCollection = Promise.all([
        usersRef.doc(email).collection('recipesCollection').doc().set({
            name: '123',
            type: 'notRecipe'
        })
    ])

    var usersRef = db.collection("users");
    var groceryListCollection = Promise.all([
        usersRef.doc(email).collection('groceryListCollection').doc().set({
            name: '123',
            type: 'notGroceryList'
        })
    ])

    //check to see if working
    var docCheck = db.collection('users').doc(email);
    docCheck.get().then(function(doc){
        console.log("Document data:", doc.data());
    });

    currentUser = email;
});

// user log out
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        location.reload();
    })
})

// user log in
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        // console.log(cred.user)

        // close modal and reset form fields
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
    })

    db.collection('users').doc(email).get().then(function(doc){
        console.log("Login User Data:", doc.data());
    });

    currentUser = email;
    addListToMyList();
    
})