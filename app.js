//BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalInc) {

        if(totalInc > 0) {
            this.percentage = Math.round( (this.value / totalInc) * 100 );
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

    var caluculateTotal = function(type) {

        var sum = 0;

        data.allItems[type].forEach(function(item) {
            sum += item.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, desc, val) {

            var newItem, ID;

            //Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, desc, val);                
            }

            //Push item into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {

            var index, ids;
            ids = data.allItems[type].map(function(item) {
                return item.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // Calculate total income and total expenses
            caluculateTotal('exp');
            caluculateTotal('inc');

            // Calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate expense percentage
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(item) {
                item.calculatePercentage(data.totals.inc);
            });

        },
        
        getBudget: function() {

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        getPercentages: function() {

            var percentages;
            percentages = data.allItems.exp.map(function(item) {
                return item.getPercentage();
            });

            return percentages;
        },

        testing: function() {

            console.log(data);

        }
    };
})();

//UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDesciption: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--date'
    };

    var formatNumber = function(num, type) {

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;

    };

    return {
        getInput: function() {

            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDesciption).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(item, type) {
            
            var html, element;

            //Create HTML string
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-${item.id}">
                            <div class="item__description">${item.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(item.value, type)}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            } else if(type === 'exp') {
                element = DOMStrings.expensesContainer;                
                html = `<div class="item clearfix" id="exp-${item.id}">
                            <div class="item__description">${item.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(item.value, type)}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            }

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        displayBudget: function(obj) {

            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";                
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            fields.forEach(function(field, index) {
                if(percentages[index] > 0) {
                    field.textContent = percentages[index] + '%';
                } else {
                    field.textContent = '---';                    
                }
            });

        },

        displayDate: function() {

            var date, months, month, year;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            date = new Date();

            month = date.getMonth();
            year = date.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
        },

        clearFields: function() {

            var fields = document.querySelectorAll(DOMStrings.inputDesciption + ',' + DOMStrings.inputValue);
            
            fields.forEach(function(field) {
                field.value = ""
            });

            fields[0].focus();

        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDesciption + ',' +
                DOMStrings.inputValue
            );

            fields.forEach(function(field) {
                field.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function() {

            return DOMStrings;
        }
    };
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function() {

        var budget;

        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Get the budget
        budget = budgetCtrl.getBudget();

        // 3. Display budget on UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Get the percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the percentages to UI
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {

        var input, newItem;

        // 1. Get Input field data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            // 2. Add Item to controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add Item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and display budget
            updateBudget();
            
            // 6. Calculate and display percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        splitID = itemID.split('-');

        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. Delete ID from data structure
        budgetCtrl.deleteItem(type, ID);

        // 2. Remove Item from UI
        UICtrl.deleteListItem(itemID);

        // 3. Update and show the new budget
        updateBudget();

        // 4. Calculate and display percentages
        updatePercentages();

    };

    return {
        init: function() {

            console.log("Application has started.");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();

        }
    };

})(budgetController, UIController);

controller.init();