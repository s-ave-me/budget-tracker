// ==========================
// DOM Element References
// ==========================

// ✅ get references to html elements
const transactionForm = document.getElementById("transactionForm")

const descriptionInput = document.getElementById("descriptionInput")
const descriptionError = document.getElementById("descriptionError");

const amountInput = document.getElementById("amountInput")
const amountError = document.getElementById("amountError");

const typeInput = document.getElementById("typeInput") // 💔 new: income/expense selector

const balanceDisplay = document.getElementById("balanceDisplay")

const transactionList = document.getElementById("transactionList")


descriptionInput.addEventListener("input", () => descriptionError.textContent = "");
amountInput.addEventListener("input", () => amountError.textContent = "");
// 📝 when user type character in input run function and make errors dissapear w/ ""
typeInput.addEventListener("change", () => {}); // 💔 placeholder for future validation if needed
// runs when value changed


// ==========================
// State / Variables
// ==========================

// ✅ create an empty array to store all transactions
let transactions = []

let editingId = null  // track if we're editing a transaction

let previousBalance = 0; // 💫




// ✅ check if there is saved data in localStorage
if (localStorage.getItem("transactions") !== null) {
    transactions = JSON.parse(localStorage.getItem("transactions"))
}
// 📝 If the key "transactions" is strictly not null 
// (meaning localStorage has some saved data):
// Reassign the variable `transactions` to 
// the array converted back from the saved string

// ==========================
// Main Functions / Event Handlers
// ==========================

// ✅ updates Balance in U.I
function updateBalance() {

    // 💔 changed: include type for correct total
    const total = transactions.reduce((sum, transaction) => 
        transaction.type === "income" ? sum + transaction.amount : sum - transaction.amount, 0
    );

    // 💔 updated: using the new total calculation
    balanceDisplay.textContent = `Balance: $${total.toLocaleString("en-US", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })}`

    // 💫 Add flash class instead of inline styles
    if (total > previousBalance) {
        flashBalance("flash-green");
    } else if (total < previousBalance) {
        flashBalance("flash-red");
    }

    previousBalance = total;
}


// ✅ refreshes the transaction list on the page and updates the balance.
function showTransactions() {

    // 1️⃣ Clear the current list so we don’t duplicate
    transactionList.innerHTML = ""
    // 📝 .innerHTML = everything inside that element
    // Setting it to "" replaces everything inside transactionList with nothing

    // 2️⃣ Loop through all transactions and create <li> for each
    transactions.forEach(transaction => {
        const li = document.createElement("li")

        // 💔 changed: display "+"" or "-"" and color based on type
        const sign = transaction.type === "income" ? "+" : "-"; // 💔
        const color = transaction.type === "income" ? "green" : "red"; // 💔
        // 📝 ? if value true
        //    - if value false
        
        li.innerHTML = `<span class="description">${transaction.description}</span>: <span class="expense" style="color:${color}">${sign}$${transaction.amount.toLocaleString("en-US", { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}</span>`;
        // inner HTML lets us use span class (for styling) both number and descrition separately


        // 3️⃣ Create delete buttonthis works
        const deleteBtn = document.createElement("button")
        deleteBtn.textContent = "🗑️"
        // 📝 put this icon in U.I for deleteBtn
        deleteBtn.addEventListener("click", () => deleteTransaction(transaction.id))
        // 📝 when delBtn is clicked delete id
        li.appendChild(deleteBtn)

        // 4️⃣ Create edit button
        const editBtn = document.createElement("button")
        editBtn.textContent = "Edit"
        editBtn.addEventListener("click", () => editTransaction(transaction.id))
        // when edit button clicked edit id
        li.appendChild(editBtn) 

        transactionList.append(li)
        // 📝 put li in transactionList ul
    })

    // 3️⃣ Update the balance after rendering
    updateBalance()
}


// ✅ Delete a transaction by id
function deleteTransaction(id) {

    // 1️⃣ Make a new array from transactions that doesn’t include the clicked id
    transactions = transactions.filter(transaction => transaction.id !== id)
    // 📝 from transactions create a new array that keeps only the transactions
    // whose id is NOT the id we want to delete
    // the id parameter comes from the delete button we clicked

    // 2️⃣ Update localStorage so the deleted transaction stays gone even after reload
    localStorage.setItem("transactions", JSON.stringify(transactions))
    // 📝 transactions (new shit we made without that excludes the clicked id) 
    //  turn to string and saved in local storage

    showTransactions()
}


// ✅ Edit a transaction by finding its id
function editTransaction(id) {
    const transaction = transactions.find(transaction => transaction.id === id)
    // 📝 find the first object that has the same id as our clicked id in transactions
    //    then return that object
    //    t = representation of the current object
    if (!transaction) return 
    // 📝 if no match will return undefined so we end here with "return" (safety check)


    // Track which one we're editing
    editingId = id

    // Populate the form fields with the transaction data
    descriptionInput.value = transaction.description
    amountInput.value = transaction.amount
    typeInput.value = transaction.type

    // Optional: change button text while editing
    transactionForm.querySelector("button[type='submit']").textContent = "Save Edit"
    // querySelector lets us grab button and change its textContent
}

function clearForm() {
    // Clear inputs
    descriptionInput.value = ""
    amountInput.value = ""
    typeInput.value = "expense" // 💔 reset type to default
}
// 💫
function flashBalance(flashClass) {
    balanceDisplay.classList.add(flashClass);
    setTimeout(() => balanceDisplay.classList.remove(flashClass), 300);
}


// ==========================
// Event Listeners
// ==========================

// ✅ adds new transaction to array
transactionForm.addEventListener("submit", function(event){
    // 📝 This function runs when the user submits the form (clicks add on UI)

    // 1️⃣ prevent from reloading
    event.preventDefault()
    // 📝 normally when submit is clicked, by default it reloads the browser
    // so we have this line to stop doing that default

    // ✅ Clear previous errors here
    descriptionError.textContent = "";
    amountError.textContent = "";

    // 2️⃣ grabs descrition and amount value
    const description = descriptionInput.value.trim()
    // 📝 grabs whatever the user put in the descrition (always a string) and removes white spaces
    const amount = Number(amountInput.value)
    // 📝 grabs whatever the user type in amount field. But form inputs are always string
    // so we wrap it in Number() to convert it to a number.
    const type = typeInput.value // 💔 new: grab income/expense

    // 3️⃣ Validation logic comes after
    let hasError = false;
    if (description === "") {
        descriptionError.textContent = "Description cannot be empty";
        hasError = true;
    }

    if (amountInput.value === "") {
        amountError.textContent = "Amount cannot be empty";
        hasError = true;
    } else if (amount <= 0) {
        amountError.textContent = "Amount must be a positive number";
        hasError = true;
    }

    if (hasError) return; // flag


 // 4️⃣ Check if we're editing an existing transaction
    if (editingId !== null) {

        const index = transactions.findIndex(transaction => transaction.id === editingId)
        // 📝 find the first object that has the same id as our clicked id in transactions
        //    then return index number
        //    t = representation for the current object

        // make an index that has the 
        if (index !== -1) { // safety check if no match

            // Update the existing transaction
            transactions[index].description = description
            transactions[index].amount = amount
            transactions[index].type = type // 💔 update type on edit
        }

        // Save changes and reset edit mode
        localStorage.setItem("transactions", JSON.stringify(transactions))
        showTransactions()
        editingId = null
        // 📝 turn back to null cuz we track the current id of transac
        transactionForm.querySelector("button[type='submit']").textContent = "Add"
        clearForm()
        return  // stop so we don’t add a new transaction (skip newTransaction)
    }
    
    // 5️⃣ create a new transaction object with a unique id
    const newTransaction = {
        id: Date.now(),            // unique id (timestamp since 1970 in millisecond)
        description: description,  // taken from the input above
        amount: amount,            // already converted to Number above
        type: type                 // 💔 new: store transaction type
    }
    // adds newTransaction object to transactions array
    transactions.push(newTransaction)
    // save the updated transactions array to localStorage
    localStorage.setItem("transactions", JSON.stringify(transactions))
    // Show the updated transactions on the page
    showTransactions()

    clearForm()
})

// ==========================
// Initialization / Bootstrapping
// ==========================
showTransactions()
