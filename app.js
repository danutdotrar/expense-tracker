const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
  
    movementsDates: [
      '2021-11-18T21:31:17.178Z',
      '2021-12-23T07:42:02.383Z',
      '2022-01-28T09:15:04.904Z',
      '2022-04-01T10:17:24.185Z',
      '2022-05-08T14:11:59.604Z',
      '2022-05-27T17:01:17.194Z',
      '2022-10-19T13:36:17.929Z',
      '2022-10-21T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
  };
  
  const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  
    movementsDates: [
      '2021-11-01T13:15:33.035Z',
      '2021-11-30T09:48:16.867Z',
      '2021-12-25T06:04:23.907Z',
      '2022-01-25T14:18:46.235Z',
      '2022-02-05T16:33:06.386Z',
      '2022-04-10T14:43:26.374Z',
      '2022-06-25T18:49:59.371Z',
      '2022-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  };
  
  const accounts = [account1, account2];
  
  /////////////////////////////////////////////////
  // Elements
  const labelWelcome = document.querySelector('.welcome');
  const labelDate = document.querySelector('.date');
  const labelBalance = document.querySelector('.balance__value');
  const labelSumIn = document.querySelector('.summary__value--in');
  const labelSumOut = document.querySelector('.summary__value--out');
  const labelSumInterest = document.querySelector('.summary__value--interest');
  const labelTimer = document.querySelector('.timer');
  
  const containerApp = document.querySelector('.app');
  const containerMovements = document.querySelector('.movements');
  
  const btnLogin = document.querySelector('.login__btn');
  const btnTransfer = document.querySelector('.form__btn--transfer');
  const btnLoan = document.querySelector('.form__btn--loan');
  const btnClose = document.querySelector('.form__btn--close');
  const btnSort = document.querySelector('.btn--sort');
  
  const inputLoginUsername = document.querySelector('.login__input--user');
  const inputLoginPin = document.querySelector('.login__input--pin');
  const inputTransferTo = document.querySelector('.form__input--to');
  const inputTransferAmount = document.querySelector('.form__input--amount');
  const inputLoanAmount = document.querySelector('.form__input--loan-amount');
  const inputCloseUsername = document.querySelector('.form__input--user');
  const inputClosePin = document.querySelector('.form__input--pin');
  
  // // // 147. Creating DOM Elements
  
  // Functions
  
  function formatMovementDate(date, locale) {
  
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);
  
    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    else {
      return new Intl.DateTimeFormat(locale).format(date);
    }
  };
  
  // Formating currencies
  function formatCurrency(value, locale, currency) {
        // Use Intl API to format currency 
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency
        }).format(value);
  };
  
  
  // This function should receive one array of movements and work with the data
  // Set sort parameter by default to false 
  function displayMovements(acc, sort = false) {
  
    // Empty the movements container to add the new ones
    containerMovements.innerHTML = '';
  
    // Use slice to create a copy of 'movements' array, because sort() will mutate the original array
    // If 'sort' parameter will be true, then sort the movements, else let the 'moves' be as in the array 'movements'
    const moves = sort === true ? acc.movements.slice().sort((a, b) => a - b) : acc.movements
  
  
    // forEach function will loop over the movements array and execute the function on each iteration
    moves.forEach(function(movement, i) {
  
      // Use a ternary operator to check if it's a deposit or a withdrawal and construct the classname.
      const type = movement > 0 ? 'deposit' : 'withdrawal';
  
        // Add the date of each movement
      const date = new Date(acc.movementsDates[i]);
      const displayDate = formatMovementDate(date, acc.locale);
  
      // Use function Intl API to format currency
      const formattedMovement = formatCurrency(movement, acc.locale, acc.currency)
      
      // Create a template literal to build the html with the actual data.
      const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1}: ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMovement}</div>
        </div>`
  
        // This will insert the "html" variable to the containerMovements
        // We use "afterbegin" because any new child element will appear before all the other child elements
        containerMovements.insertAdjacentHTML('afterbegin', html)
    });
  };
  
  
  // Calculate the balance of the account
  function calcDisplayBalance(acc) {
    // Sum up all the movements
    const balance = acc.movements.reduce((acc, val) => acc + val, 0);
    // Create a new property on the current account with the totalBalance
    acc.balance = balance;
    // Display the totalBalance with the function
    labelBalance.textContent = formatCurrency(acc.balance, acc.locale, acc.currency);
  };
  
  
  // Display the income and the outcome
  function calcDisplaySummary(acc) {
  
        // Income
        // Filter the movements that are > 0 and sum them
        const income = acc.movements.filter(move => move > 0)
                                .reduce((acc, val) => acc + val, 0);
        labelSumIn.innerHTML = formatCurrency(income, acc.locale, acc.currency);
  
        // Outcome
        // Filter the movements that are < 0 and sum them
        const outcome = acc.movements.filter(move => move < 0)
                                .reduce((acc, val) => acc + val, 0);
        // Display without '-'
        labelSumOut.innerHTML = formatCurrency(Math.abs(outcome), acc.locale, acc.currency);
  
        // The bank pays an interest rate(account.interestRate) each time a deposit is done to the bank account
        // Filter the move > 0
        // Find the total of deposit + interest rate
        // Only use the interest rates greater than 1
        // Sum up all of them
        // Change HTML
  
        const interest = acc.movements.filter(move => move > 0)
                                  .map(deposit => (deposit * acc.interestRate) / 100)
                                  .filter((int, i, arr) => int > 1)
                                  .reduce((acc, val) => acc + val, 0);
        labelSumInterest.innerHTML = formatCurrency(interest, acc.locale, acc.currency);
  };  
  
  
  
  // // Create username based on the initials
  function createUsername(accs) {
    
    // Compute one username for each of the accounts holders
    // Access owner from accounts objects
    // Loop over accounts
    // No need to create a new array,
    // modify the array that we get as an input
    // Use forEach for this
  
    // Make the name lowerCase
    // Make the user an array containing the items
    // Loop over the array
    // On each iteration, take the first element
    // Join the elements togheter
  
    // Loop over the accounts array
    // On each iteration, add an 'username' to it
    accs.forEach(function(acc) {
        // On the 'acc' create a new property called 'username' which will store the initials
        // Map method helped to create a new simple array which contains only the initials
        acc.username = acc.owner.toLowerCase().split(' ').map((e) => e[0]).join('')
    })
  };
  
  // // const user1 = 'Steven Thomas Williams'; // this should be stw
  // console.log(createUsername(accounts));
  createUsername(accounts);
  // console.log(accounts)
  
  
  // // Implementing Login 
  // Function to update the UI with the movements, balance and summary
  function updateUI(acc) {
        // Display movements
        displayMovements(acc);
      
        // Display balance
        calcDisplayBalance(acc);
    
        // Display summary
        calcDisplaySummary(acc);
  };
  
  function startLogOutTimer() {
    function tick() {
      const min = String(Math.trunc(time / 60)).padStart(2, 0);
      const sec = String(time % 60).padStart(2, 0);
      // In each call, print the remaining time to UI
      labelTimer.textContent = `${min}:${sec}`;
  
      // When 0 seconds, stop timer and log out user
      if (time === 0) {
        clearInterval(timer);
        labelWelcome.textContent = 'Log in to get started';
        containerApp.style.opacity = 0;
      }
  
      // Decrease 1s
      time--;
    }
    // Set time to 10 minutes
    let time = 10 * 60;
    // Call the timer every second
    tick();
    const timer = setInterval(tick, 1000);
  
  
    return timer;
  };
  
  // // Event handler
  let currentAccount, timer;
  
  // // Fake Always Looged In
  // currentAccount = account1;
  // updateUI(currentAccount);
  // containerApp.style.opacity = 100;
  
  
  btnLogin.addEventListener('click', function(e) {
    // Prevent this form from submiting
    e.preventDefault();
    // console.log('LOGIN');
  
    // Find the account that have the same name as the inputLoginUsername.value
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
    
    // The currentAccount pin must match the input pin
    // Transform the inputLoginPin.value to a number, else it will be a string
    if (currentAccount.pin === Number(inputLoginPin.value)) {
      // Display UI and welcome message
      // Take the currentAccount.owner and split by ' ', take the first name
      labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
      containerApp.style.opacity = '100';
  
      // Create current date and time
      const now = new Date();
      // Experimenting with the API
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        // weekday: 'long'
      };
  
      labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);
  
      // Clear fields
      inputLoginUsername.value = '';
      inputLoginPin.value = '';
  
      // Get rid of the focus on the PIN with blur()
      inputLoginPin.blur();
  
      // Timer
      // If timer from another logged in account exists, clear it
      if (timer) clearInterval(timer);
      timer = startLogOutTimer();
  
      // Update the UI movements, balance, summary
      updateUI(currentAccount);
    }
  });
  
  
  // // Implementing Transfer
  // Transfer money from one user to another
  
  btnTransfer.addEventListener('click', function(e) {
    // Because using forms, this will prevent from reloading the page
    e.preventDefault();
  
    // Take the transfer amount
    // Convert into number because the value will be string
    const amount = Number(inputTransferAmount.value);
  
    // Take the account to which we want to transfer
    // Use find method to find the account which has the username the same as the input value
    const receiverAccount  = accounts.find(acc => acc.username === inputTransferTo.value);
    // console.log(amount, receiverAccount);
  
       // Clear input fields
       inputTransferAmount.value = '';
       inputTransferTo.value = '';
    // Amount must be positive, receiverAccount must exist, currentBalance greater than amount and receiver != current user
    // We use optional chaining,
    // if the receiverAccount object doesn't exist, then receiverAccount.username will become undefined and the operation will fail
    if (amount > 0 && 
        receiverAccount &&
        currentAccount.balance >= amount && 
        receiverAccount?.username !== currentAccount.username) {
  
          // Making the transfer
          // We push the amount with negative to the currentAccount, to decrease the balance by 'amount'
          currentAccount.movements.push(-amount);
          // We push the amount with positive to the receiverAccount, to increase the balance by 'amount'
          receiverAccount.movements.push(amount);
  
          // Add transfer date
          currentAccount.movementsDates.push(new Date().toISOString());
          receiverAccount.movementsDates.push(new Date().toISOString());
   
          // Update the UI movements, balance, summary
          updateUI(currentAccount);
  
          // Reset timer
          clearInterval(timer);
          timer = startLogOutTimer();
    }
  });
  
  
  // Request a loan to the bank
  // The bank only grants a loan if there is at least one deposit
  // with at least 10% of the requested loan amount
  btnLoan.addEventListener('click', function(e) {
    e.preventDefault();
  
    // Convert the input to number
    // Math.floor will round any value down
    const amount = Math.floor(inputLoanAmount.value);
    
    // If there is a deposit that is at least 10% of the requested amount
    if (amount > 0 && currentAccount.movements.some(move => move >= amount * 0.1)) {
  
    setTimeout(function() {    
    // Add movement to the account
      currentAccount.movements.push(amount);
  
      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());
  
      // Update the UI
      updateUI(currentAccount);
  
      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500)
    }
      // Clear the input field
      inputLoanAmount.value = '';
  });
  
  
  // Close account
  // Remove account from the 'accounts' array
  btnClose.addEventListener('click', function(e) {
    e.preventDefault();
  
    // Check if the confirming inputs are correct, to close account
    if (inputCloseUsername.value === currentAccount.username && 
      Number(inputClosePin.value) === currentAccount.pin) {
  
        // Find the index of current account
        // With findIndex we can specify complex conditions
        // The findIndex method will return the first element(index) that matches the codition
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);
        // console.log(index)
  
        // Delete account
        // Use splice to delete the current account
        // The splice mutates the underlying array
        // We need the index of the element that we want to remove
        accounts.splice(index, 1);
  
        // Hide UI
        containerApp.style.opacity = 0;
    }
    
    // Clear input fields
    inputCloseUsername.value = '';
    inputClosePin.value = '';
  
  });
  
  
  // // // Save the below State Variable logic in Notion
  // // Use a state variable to monitor if we are currently sorting the array or not
  // 'sortedState' will be false at the begging, because our array isn't sorted by default
  // If 'sortedState' is false, then the 'sortedState' in the 'displayMovements' function should be set true
  let sortedState = false;
  
  // Sort the movements
  btnSort.addEventListener('click', function(e) {
    // Prevent from reloading
    e.preventDefault();
  
    // Use 'not' operator because we want our sortedState to be the opposite of the 'sortedState' variable
    displayMovements(currentAccount, !sortedState);
    // Flip the variable,
    // Each time the btnSort is clicked, change sortedState from true to false, or from false to true
    sortedState = !sortedState;
  
  });