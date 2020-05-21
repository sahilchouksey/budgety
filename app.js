// BUDGET CONTROLLER
var budgetController = (function() {

  // Data model for expenses and incomes
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentages = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Data structure

  // var allExpenses = [];
  // var allIncomes = [];
  // var totalExpenses = [];
  // var totalIncomes = [];
  // it's always better to have one data structure, where all of our data go instead of having a lot of variables flowing around!
  //
  // var data {
  // var allExpenses = [];
  // var allIncomes = [];
  // }

  var calculateTotal = function(type) {
    var sum = 0;

    // forEach method

    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    /*
    [200, 1000, 400]
    sum = 0 + 200;
    sum = 200 + 1000;
    sum = 1200 + 400 = 1600
    */

    data.totals[type] = sum;

  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // [1, 2, 3, 4, 5] , nextID = 6
      // [1, 3, 5, 6, 9] , nextID = 10
      // ID = last ID + 1
      // create the new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on  'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // push new item into the data structure
      data.allItems[type].push(newItem);

      // return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      // data.allItems[type][id]
      // ids = [1, 3, 5, 6, 9]
      // id = 6
      // index = 3

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);


      if (index !== -1) {

        data.allItems[type].splice(index, 1);

      }

    },

    calculateBudget: function() {
      // Calculate total incomes and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      //  income =  500 & expenses = 250, spent 50% = 250 / 500 = 0.5 * 100
    },

    totalPercentages: function() {
      /*
    a=10
    b=20
    c=60
    inc = 100
    a=10/100=10%
    b=20/100=20%
    c=60/100=60%
     */

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentages(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allpercentages = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allpercentages;
    },

    getBudget: function() {

      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }

    },

    testing: function() {
      console.log(data);
    }
  }
})();





// UI CONTROLLER
var UIController = (function() {

  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, inc, des, type;

    /*
    1. + or - before numbers
    2. Exactly 2 decimal points
    3. comma separating the thousands
    exp:
    2345.2173 -> 2,345.22
    5000 -> 5,000.00
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // substring method
    }

    des = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + des;

  };

  var nodeListForEach = function(list, callBack) {
    for (var i = 0; i < list.length; i++) { // nodeList doesn't have all of these fancy methods that array have, but it has the length property, so we can use that here.
      callBack(list[i], i);
    };
  };


  return {

    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      }

    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      if (type === 'inc') {
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-&id&"><div class="item__description">&description&</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMStrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-&id&"><div class="item__description">&description&</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      };

      newHtml = html.replace('&id&', obj.id);
      newHtml = newHtml.replace('&description&', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectedID) {
      var el = document.getElementById(selectedID);
      // document.getElementById(selectedID).parentNode.removeChild(document.getElementById(selectedID))

      el.parentNode.removeChild(el);

    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(currentValue, indexNum, array) {
        currentValue.value = "";
      });

      fieldsArr[0].focus();


    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0 && obj.budget > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';

      }

    },

    displayPercentages: function(percentage) {
      var fields = document.querySelectorAll(DOMStrings.expPercentageLabel);


      nodeListForEach(fields, function(current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + '%';
        } else {
          current.textContent = '---';
        }
      });


    },

    displayMonth: function() {
      var now, year, month, months, date;
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      date = now.getDate();
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      document.querySelector(DOMStrings.dateLabel).textContent = date + ' ' + months[month] + ' ' + year;

    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    getDOMStrings: function() {
      return DOMStrings;
    }

  }

})();





// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListensers = function() {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

  };


  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display thr budget to the UL
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {

    // 1. calculate percentages
    budgetCtrl.totalPercentages();

    // 2. read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };


  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UL
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the input fields
      UICtrl.clearFields();
    }

    // 5. Calculate and update budget
    updateBudget();

    // 6. calculate and update percentages
    updatePercentages();
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID)

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. update and show the new budget
      updateBudget();

      // 4. calculate and update percentages
      updatePercentages();
    }

  };

  return {
    init: function() {
      console.log('Application has started.')
      UICtrl.displayMonth();
      setupEventListensers();
      UICtrl.displayBudget({
        // So this func simply set values[budeget, percentage, inc, exp] to UI, if we set these to 0 zero as soon as our page reload everything set to be 0 ['coz init func called as soon as someone refresh/reload the page ]
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

    }
  }

})(budgetController, UIController);

controller.init();
