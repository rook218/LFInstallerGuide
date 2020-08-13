// function to add a new server object on clicking the button
const addServerButton = document.querySelector('button.add-server');
let formsOptions = document.querySelectorAll('input[name=forms]');
addServerButton.addEventListener('click', addNewServer);

function addNewServer() {
    // create a new server node
    let element = document.createElement('div');
    element.innerHTML = serverHTML;
    element.classList.add('server');

    // append the server node to the container
    const serverContainer = document.querySelector('div.server-container');
    serverContainer.appendChild(element);

    // add the event listener so it can delete itself
    element.querySelector('.delete-container').addEventListener('click', function() {
        this.closest('.server').remove();
    });

    // updates the forms options variable to include the new
    // server and adds an event listener
    formsOptions = document.querySelectorAll('input[name=forms]');
    formsOptions.forEach(formsOption => {
        formsOption.addEventListener('change', onFormsServerChange);
    });
}

// on selecting the form install button on anything, checks if
// there will be multiple forms servers. if yes, adds the primary
// forms option to all of them. If no, removes them
function onFormsServerChange() {
    // removes the option globally to start
    document.querySelectorAll('.primary-forms').forEach(primaryOption => {
            primaryOption.remove();
        })
        // creates the element that we'll append
    const formsPrimaryHTML =
        `<h5>Primary Forms Server?</h5>
	   <input type="radio" name="public" value="yes">
	   <label for="yes">Yes</label>
	   <input type="radio" name="public" value="no">
	   <label for="no">No</label>`;
    const formsOptionsElement = document.createElement('div');
    formsOptionsElement.classList.add('option')
    formsOptionsElement.classList.add('primary-forms');
    formsOptionsElement.innerHTML = formsPrimaryHTML;

    // if we have multiple forms servers, append the option to every one that's checked
    let checkedFormsOptions = document.querySelectorAll('input[name=forms]:checked');
    if (checkedFormsOptions.length > 1) {
        checkedFormsOptions.forEach(function(checkbox) {
            let localOption = formsOptionsElement.cloneNode();
            localOption.innerHTML = formsPrimaryHTML;
            checkbox.closest('.server').querySelector('.config-options')
                .appendChild(localOption)
        });
    }
}



// on clicking the return button, returns a ServerList object
// which contains a list of all servers as configured and their properties
const returnResultsButton = document.querySelector('.log-options');
returnResultsButton.addEventListener('click', createServerList);