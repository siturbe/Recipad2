

//Pull the data from the API

let vegeterian;
let vegan;
let exclusions;
let exclusionList;
let cuisine;
let cuisineList;
let searchInput;
let phoneNumber;
let searchResults={};
let recipeID;
let recipeIDs=[];
let savedRecipes=[];
let ingredientList=[];
let recipeIDsFB=[];
let IDsToDelete = [];
let uniqueSavedRecipes = [];
let uniqueRecipeIDsFB = [];
let FBlistsToDelete = [];
let gListIDsToDelete = [];
let gListID = [];
let listToSend;
const quickLists2 = document.querySelector('.shopplingList');



function getSearchResults(){
    $('#recipe-list').empty();
    let vegetarianTrue = document.getElementById('restriction1').checked;
    if( vegetarianTrue == true){vegetarian='vegetarian'} else {vegetarian='not vegetarian'};
    console.log(vegetarian);

    let veganTrue = document.getElementById('restriction2').checked;
    if( veganTrue == true){vegan='vegan'} else {vegan='not vegan'};
    console.log(vegan);

    if(veganTrue== true){diet='vegan'} else if(vegetarianTrue ==true) { diet = 'vegetarian'} else {diet = ""};
    console.log(diet);

    exclusions = $('#ingredientExclusion').val();
    let exclusions2 = exclusions.replace(/ /g,'');
    exclusionList = exclusions2.replace(/,/g,'%2C%20')
    console.log(exclusionList);
    
    cuisine = $('#cuisine-input').val();
    let cuisine2 = cuisine.replace(/ /g,'');
    cuisineList = cuisine2.replace(/,/g,'%2C%20')
    console.log(cuisineList);

    searchInput = $('#searchBar').val();
    console.log(searchInput);

    var queryURL = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?diet=" + diet + "&excludeIngredients=" + exclusionList + "&cuisine=" + cuisineList + "&intolerances&number=10&offset=0&type=main%20course&query=" + searchInput;

    console.log(queryURL);

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": queryURL,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
            "x-rapidapi-key": "e4bd1d4763mshbadb182061cbec8p14ada1jsna099cc6dbfa1"
        }
    }
    
    $.ajax(settings).then(function (response) {
        console.log(response);
        let searchResults = response.results;

        console.log(searchResults[1].title);
        for(let i=0; i<9; i++){
            let recipeDiv = $("<div class='recipeDiv'>")
            let recipeID = searchResults[i].id;
            let recipeTitle = searchResults[i].title;
            let prepTime = searchResults[i].readyInMinutes;
            let servings = searchResults[i].servings;
            let imageURL = "https://spoonacular.com/recipeImages/" + searchResults[i].image;
            let recipeImage = $("<img class='thumbnail'>");
            recipeImage.attr({
                'src': imageURL,
            })

            let p = $('<p>').text(recipeTitle + ', ' + prepTime + ' min of prep time, serves ' + servings);

            let addButton = $("<button class='btn waves-effect waves-lighth addRecipe' type='submit' name='action' style='background-color: green' value='" + recipeID + "'>Add Recipe</button>");

            recipeDiv.append(recipeImage);
            recipeDiv.append(p);
        
            $('#recipe-list').append(recipeDiv);
            $('#recipe-list').append(addButton);
        }
        
    });
}


function addItem(){
    let recipeNumber = $(this).val();
    var usersRef = db.collection("users");
    var recipesCollection = Promise.all([
        usersRef.doc(currentUser).collection('recipesCollection').doc().set({
            name: recipeNumber,
            type: 'recipe',
        })
    ]);
    recipeIDs.push(recipeNumber);
    console.log(recipeIDs);

    var recipesInFirestore = db.collectionGroup('recipesCollection').where('type', '==', 'recipe');
    recipesInFirestore.get().then(function (querySnapshot) {
        let item;
        let FBid;
        querySnapshot.forEach(function (doc) {
            item = doc.data();
            recipeIDsFB.push(item.name);
            let FBid = doc.id;
            IDsToDelete.push(FBid);
        });
        uniqueRecipeIDsFB = [...new Set(recipeIDsFB)];
        console.log(uniqueRecipeIDsFB);
    });
};


function addRecipesToSavedList(){
    savedRecipes = [];
    console.log(uniqueRecipeIDsFB);
    for(let i=0; i<uniqueRecipeIDsFB.length; i++){
        let recipeURL = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/" + uniqueRecipeIDsFB[i] + "/information"
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": recipeURL,
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
                "x-rapidapi-key": "e4bd1d4763mshbadb182061cbec8p14ada1jsna099cc6dbfa1"
            }
        }
        
        $.ajax(settings).then(function (response) {
            savedRecipes.push(response);      
        });
    }
   
    console.log(savedRecipes);
}


function clearSavedRecipes(){
    savedRecipes = [];
    recipeIDs = [];
    ingredientArray = [];
    subIngredientArray = [];
    ingredientList = [];
    $('#recipe-list').empty();
    // delete recipes in firebase:
    for(let i=0; i<IDsToDelete.length; i++){
        db.collection('users').doc(currentUser).collection('recipesCollection').doc(IDsToDelete[i]).delete();
    };
    recipeIDsFB=[];
    uniqueRecipeIDsFB=[];
    savedUniqueRecipeIDsFB=[];

    //to delete collections of grocery lists
    var groceryListsInFirestore = db.collectionGroup('groceryListCollection').where('type', '==', 'groceryList');
    groceryListsInFirestore.get().then(function (querySnapshot) {
        let item;
        let FBid;
        querySnapshot.forEach(function (doc) {
            // item = doc.data();
            // gListID.push(item.name);
            let FBid = doc.id;
            gListIDsToDelete.push(FBid);
        });
        console.log(gListIDsToDelete);
    });

    for(let j=0; j<gListIDsToDelete.length; j++){
        db.collection('users').doc(currentUser).collection('groceryListCollection').doc(gListIDsToDelete[j]).delete();
    };
    gListID=[];
    $('#shoppingList').empty();
}


function showSavedRecipes(){
    $('#recipe-list').empty();
    for(let i=0; i<savedRecipes.length; i++){
        let recipeSavedDiv = $("<div class='recipeSavedDiv'>");
        let titleSaved = savedRecipes[i].title;
        let instructionsSaved = savedRecipes[i].instructions;
        let recipeImageSaved = $("<img class='thumbnail'>");

        let pTitleSaved = $('<h4>').text(titleSaved);
        let pSaved = $('<p>').text(instructionsSaved);
        recipeImageSaved.attr({'src': savedRecipes[i].image,})
        
        let ingredientArray = savedRecipes[i].extendedIngredients;
        let subIngredientArray =[ ];

        for(let j=0; j<ingredientArray.length; j++){
            subIngredientArray.push(ingredientArray[j].originalString);
        }

        let rList = $('<ul>')
        $.each(subIngredientArray,function(i){
            let li = $('<li/>').addClass('ui-ingredient').text(subIngredientArray[i]).appendTo(rList);
        });

        recipeSavedDiv.append(pTitleSaved);
        recipeSavedDiv.append(recipeImageSaved);
        recipeSavedDiv.append(pSaved);
        recipeSavedDiv.append(rList);

        $('#recipe-list').append(recipeSavedDiv);
        ingredientList.push(...subIngredientArray);
    }

    uniqueIngredientList = [...new Set(ingredientList)];
    console.log(uniqueIngredientList);
    
    //Add To MyList Quick Call
    $('#shoppingList').empty();
    let myListDiv2 = $('<div class="myListDiv">');

    let gList2= $('<ul>')
    $.each(uniqueIngredientList, function(i){
        let li = $('<li/>').text(uniqueIngredientList[i]).appendTo(gList2);
        // console.log(i);
    });

    myListDiv2.append(gList2);
    $('#shoppingList').append(myListDiv2);

}

function generateGroceryList(){
    $('#recipe-list').empty();
    let groceryMessage = $('<h5>Here are all the ingredients you need for your saved recipes: </h5>');
    let groceryListDiv = $("<div class='groceryListDiv'>");

    let gList= $('<ul>')
    $.each(uniqueIngredientList, function(i){
        let li = $('<li/>').text(uniqueIngredientList[i]).appendTo(gList);
        // console.log(i);
    });

    groceryListDiv.append(groceryMessage);
    groceryListDiv.append(gList);
    $('#recipe-list').append(groceryListDiv);

    var date = new Date();
    var timestamp = date.getTime();
    var usersRef = db.collection("users");
    var groceryListCollection = Promise.all([
        usersRef.doc(currentUser).collection('groceryListCollection').doc().set({
            name: uniqueIngredientList,
            time: timestamp,
            type: 'groceryList'
        })
    ])


}


$(document).on('click','#searchButton',getSearchResults);
$(document).on('click','.addRecipe',addItem);
$(document).on('click','#saveRecipesButton', addRecipesToSavedList);
$(document).on('click','#clearButton', clearSavedRecipes);
$(document).on('click','#showSavedRecipesButton', showSavedRecipes);
$(document).on('click','#showShoppingList', generateGroceryList);
$(document).on('click','#sendListToPhone', sendListToPhone);
$(document).on('click','.sendList', sendMessage);


// $(document).on('click','#generateListButton', getRecipeInformation);

const quickLists = document.querySelector('.shoppingList');

const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');

const setupUI = (user) => {
    if (user) {
        loggedInLinks.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none');
    } else {
        loggedInLinks.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block');
    }
 
}
// make quick additions to non-ingredient list
const extraAdds = (data) => {

    if (data.length) {
        let html = '';
            data.forEach(doc => {
                const extras = doc.data();
                console.log(extras);
                const li = `
                <ol><div class="color white"> ${extras.extraItem}</div></ol> 
                `;
                html += li
            })
        quickLists.innerHTML = html; 
    } 

}

// materialize components
document.addEventListener('DOMContentLoaded', function() {
    let modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    let items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);

  });

  //initialize the side nav
  $(document).ready(function(){
    $('.sidenav').sidenav();
  });

// const quickLists = document.querySelector('.shopplingList');

function addListToMyList(){
    var groceryListsInFirestore = db.collectionGroup('groceryListCollection').where('type', '==', 'groceryList').orderBy('time','desc').limit(1);
    groceryListsInFirestore.get().then(function (querySnapshot){
        let item;
        let FBid;
        querySnapshot.forEach(function (doc) {
            item = doc.data();
            gListID=item.name;
            // let FBid = doc.id;
            // gListIDsToDelete.push(FBid);
        });
        console.log(gListID.length);
        let myListDiv = $("<div class='myListDiv'>");

        let fbList= $('<ul>')
        gListID.forEach (function(element){
        let li = $('<li>').text(element)
        fbList.append(li);
        });

        myListDiv.append(fbList);
        $('#shoppingList').append(myListDiv);

    }); 
    
}


function sendListToPhone(){
    $('#recipe-list').empty();
    let phoneInput1 = "<div class='input-field col m12'><input placeholder='+15556668888' id='phoneNumber' type='text' class='validate'>"
    let phoneInput2 = "<label id='phoneNumberLabel' for='phoneNumber'>Enter phone number to send your list:</label></div>"
    let addButton2 = $("<button class='btn waves-effect waves-lighth sendList' type='submit' name='action' style='background-color: green' value='" + phoneNumber + "'>Send</button>");

    $('#recipe-list').append(phoneInput2);
    $('#recipe-list').append(phoneInput1);
    $('#recipe-list').append(addButton2);
    let uniqueIngredientList3 = uniqueIngredientList
    if(uniqueIngredientList3 === undefined){
        listToSend = gListID;
    } else {
        listToSend = uniqueIngredientList3;
    }
    console.log(listToSend);
}



function sendMessage(){
    // import  {SSL_OP_MSIE_SSLV2_RSA_PADDING}  from "constants";
    const accountSid = 'AC2b0673c979f326e7a2ad737d4bd20d26';
    const authToken = '4119ce28cc2dde9a973b4473a36d6e0d';
    const client = require('twilio')(accountSid, authToken);
    
    
    client.messages
      .create({
         body: listToSend,
         from: '+18302660950',
         to: phoneNumber,
       })
      .then(message => console.log(message.sid));
}
