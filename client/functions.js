function getResults()
{
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
    var resultsDiv = document.getElementById("results");

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
        productRating.innerHTML = resultsArray[i].star_rating;
        productDiv.appendChild(productRating);
        //button event
        var productButton = document.createElement("button");
        productButton.classList.add("productButton");
        productButton.innerText = "View Reviews";
        productButton.addEventListener("click", getProduct.bind(this, resultsArray[i].product_title), false)
        productDiv.appendChild(productButton);

        resultsDiv.appendChild(productDiv);        
    }
}

function getProduct(name)
{
    //backend stuff

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState ==4 && this.status ==200){
            console.log(this.responseText);
            if(this.responseText && this.responseText.length) {
                displayProduct(this.responseText)
            }
        }
    }
    var url = window.location.href + "api/products/" + name;
    console.log(url);
    xhttp.open("GET", url, true)
    xhttp.send();

}

function displayProduct(reviews)
{
    var reviewsArray = JSON.parse(reviews);
    var divID = reviewsArray[0].product_title;
    var divToDisplay = document.getElementById(divID);
    //loop to display reviews
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
        reviewRatings.innerHTML = "Rating: " + reviewsArray[i].star_rating + " Helpful: " + reviewsArray[i].helpful_votes;
        reviewDiv.appendChild(reviewRatings);
        //make child elements of this div
        divToDisplay.appendChild(reviewDiv);
    }
}