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
            //displayResults(this.responseText);
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
    var resultsDiv = document.getElementById("results")

    for (var i=0; i<10; i++)
    {
        //if new product, create new div
        if(i = 0 || resultsArray.products[i].product_title!=resultsArray.products[i-1].product_title)
        {
            //div
            var productDiv = document.createElement("div");
            productDiv.id = resultsArray.products[i].product_title;
            //title
            var productTitle = document.createElement("h4");
            productTitle.innerHTML = resultsArray.products[i].product_title;
            productDiv.appendChild(productTitle);
            //average score
            var productRating = document.createElement("div");
            productRating.classList.add("rating");
            productRating.innerHTML = resultsArray.products[i].average_star_rating;
            productDiv.appendChild(productRating);
            //button event
            var productButton = document.createElement("button");
            productButton.classList.add("productButton");
            productButton.addEventListener("click", getProduct(resultsArray.products[i].product_title))
            productDiv.appendChild(productButton);

            resultsDiv.appendChild(productDiv);
            
        }
        
    }
}

function getProduct(name)
{
    //backend stuff
    displayProduct(reviews)
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
        reviewDiv.id = reviewsArray[i].review_title;
        //make child elements of this div
        divToDisplay.appendChild(reviewDiv);
    }
}