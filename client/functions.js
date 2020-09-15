function getResults()
{
    //show loading
    document.getElementById("loading").style.display = "block";

    var radioBtns = document.getElementsByName('product');
    var searchTerm;
    for(var i = 0; i < radioBtns.length; i++){
    if(radioBtns[i].checked){
        searchTerm = radioBtns[i].value;
    }
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState ==4 && this.status ==200){
            console.log(this.responseText);
            displayResults(this.responseText);
        }
    }
    var url = window.location.href + "api/fetch/" + searchTerm;
    console.log(url);
    xhttp.open("GET", url, true)
    xhttp.send();
}

function displayResults(results)
{
    var resultsArray = JSON.parse(results);
    
    //show loading
    document.getElementById("loading").style.display = "none";

    //show back button
    var form = document.getElementById("attributeForm");
    form.style.display = "block";

    var resultsDiv = document.getElementById("results");
    //clear results div
    resultsDiv.innerHTML = "";

    for (var i=0; i<10; i++)
    {
        //div
        var productDiv = document.createElement("div");
        productDiv.id = resultsArray[i].product_title;
        //title
        var productTitle = document.createElement("h4");
        productTitle.innerHTML = resultsArray[i].product_title;
        productDiv.appendChild(productTitle);
        //average score
        var productRating = document.createElement("div");
        productRating.classList.add("rating");
        productRating.innerHTML = resultsArray[i].star_rating + " &#9733;";
        productDiv.appendChild(productRating);
        //button event
        var productButton = document.createElement("button");
        productButton.classList.add("productButton");
        productButton.innerText = "View Reviews";
        productButton.id = resultsArray[i].product_title + "button";
        productButton.addEventListener("click", getProduct.bind(this, resultsArray[i].product_title), false)
        productDiv.appendChild(productButton);

        resultsDiv.appendChild(productDiv);        
    }
}

function hideReviews(name)
{
    var divToHide = document.getElementById("allReviews");
    divToHide.remove();
    var hideButton = document.getElementById("hideButton");
    hideButton.remove();
    var id = name + "button";
    var viewButton = document.getElementById(id);
    viewButton.style.display = "block";
}

function getProduct(name)
{
    //get selected attribute
    var radioBtns = document.getElementsByName('attribute');
    var searchTerm;
    for(var i = 0; i < radioBtns.length; i++){
    if(radioBtns[i].checked){
        searchTerm = radioBtns[i].value;
    }
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState ==4 && this.status ==200){
            console.log(this.responseText);
            if(this.responseText && this.responseText.length) {
                displayProduct(this.responseText, name)
            }
        }
    }
    if (searchTerm == undefined) {
        var url = window.location.href + "api/products/" + name;
    }
    else {
        var url = window.location.href + "api/products/" + name + "/" + searchTerm;
    }
    console.log(url);
    xhttp.open("GET", url, true)
    xhttp.send();

}

function displayProduct(reviews, name)
{
    var reviewsArray = JSON.parse(reviews);
    var divToDisplay = document.getElementById(name);
	//hide reviews button
	var productHideButton = document.createElement("button");
	productHideButton.classList.add("productHideButton");
	productHideButton.innerText = "Hide Reviews";
	productHideButton.id = "hideButton";
	productHideButton.addEventListener("click", hideReviews.bind(this, name), false)
	divToDisplay.appendChild(productHideButton);

	//hide view review button
	var viewReviews = document.getElementById(name + "button");
	viewReviews.style.display = "none";

	//div to display reviews
	var allReviewsDiv = document.createElement("div");
	allReviewsDiv.id = "allReviews";
	divToDisplay.appendChild(allReviewsDiv);
    
    //loop to display reviews
    if (reviewsArray.length == 0)
    {
        var message = document.createElement("p");
        message.innerHTML = "No related reviews found.";
        allReviewsDiv.appendChild(message);
    }
    else
    {
        for (var i=0; i<10; i++)
        {
        //div
        var reviewDiv = document.createElement("div");
        reviewDiv.id = reviewsArray[i].review_headline;
        // review headline 
        let reviewHeadline = document.createElement("h5");
        reviewHeadline.innerHTML = reviewsArray[i].review_headline;
        reviewDiv.appendChild(reviewHeadline);
        // review body 
        let reviewBody = document.createElement("p");
        reviewBody.innerHTML = reviewsArray[i].review_body;
        reviewDiv.appendChild(reviewBody);
        // ratings
        let reviewRatings = document.createElement("p");
        reviewRatings.innerHTML = "Rating: " + reviewsArray[i].star_rating + " &#9733;" + " Helpful: " + reviewsArray[i].helpful_votes;
        reviewDiv.appendChild(reviewRatings);
        //make child elements of this div
        allReviewsDiv.appendChild(reviewDiv);
        }
    }
}