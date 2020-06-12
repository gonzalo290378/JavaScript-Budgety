////////////////////////////////////////////////////////////////////////////////////////////////////////
//DATA MODUDE

var budgetController = (function () {
  //AHORA, TODA LA INFORMACION QUE LOS USUARIOS INGRESEN DEBERAN
  //SER GUARDADOS EN ALGO. ESE ALGO, SERA UN OBJETO, Y COMO VAN
  // A SER MUCHOS OBJETOS, CONSTRUIMOS CONSTRUCTORES:

  var Expense = function (id, description, value) {
    //CONSTRUCTOR. ES PRIVADO
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentages = function (totalIncome) {
    //ESTE METODO CALCULA EL PORCENTAJE DE CADA EXPENSE

    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    //ESTE METODO RETORNA EL PORCENTAJE CALCULADO POR EL DE ARRIBA
    return this.percentage;
  };

  var Income = function (id, description, value) {
    //CONSTRUCTOR. ES PRIVADO
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    //ES UNA FUNCION PRIVADA
    var sum = 0;

    data.allItems[type].forEach(function (cur) {
      sum += cur.value; //ESTE VALUE ES EL VALUE DEL CONSTRUCTOR
    });

    data.totals[type] = sum;
  };

  //AQUI VAN LOS GASTOS E INGRESOS EN UN OBJETO QUE TIENE METODOS, DONDE CREAMOS UN DATA STRUCTURE ASI:

  var data = {
    //ES UN OBJETO PRIVADO
    allItems: {
      //PROPIEDAD DEL OBJETO data Y DENTRO OTRO OBJETO CON 2 ARRAYS
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    //AQUI ESTAMOS CREANDO UN OBJETO:

    addItem: function (type, des, val) {
      //PUBLIC METHOD
      var newItem;
      var ID = 0;
      //CREAMOS UN ID (ESTA LINEA ES UN LIO)

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //CREAMOS UN ID BASADO EN INC O EXP
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //PUSH EN UN NUESTRO DATA CONTROLLER
      data.allItems[type].push(newItem);

      //DEVUELVE EL ELEMENTO
      return newItem;
    },

    deleteItem: function (type, id) {
      //PUBLIC METHOD

      var ids, index;

      //id = 6 QUE ES EL ID QUE QUEREMOS ELIMINAR
      //data.allItems[type][id] AL EJECUTAR ESTE METODO ME DEVUELVE UN NUEVO ARRAY
      //ids = [1,2,4,6,8]
      //index=3

      ids = data.allItems[type].map(function (current) {
        // EL METODO MAP ES SIMILAR A FOREACH CON LA DIFEENCIA QUE RETORNA UN NUEVO ARRAY
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1); //SPLICE SE UTILIZA PARA ELIMINAR ELEMENTOS EN UN ARRAY,
        //DONDE TIENE 2 PARAMETROS, EL PRIMERO ES EL INDICE DEL
        //ELEMENTO DEL ARRAY Y EL SEGUNDO ES EL NUMERO DE ELEMENTOS
        //QUE QUEREMOS ELIMINAR
      }
    },

    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calculatePercentages(data.totals.inc); //CALCULA CADA PORCENTAGE DE CADA EXPENSE
      });
    },

    getPercentages: function () {
      //AHORA NECESITAMOS OBTENER LOS PORCENTAGES
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc; // ARRAY DE PORCENTAJES
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

////////////////////////////////////////////////////////////////////////////////////////////////////////
//UI MODULE CONTROLLER

var UIController = (function () {
  //PARA EVITAR REPETIR EN LAS PROPIEDADES LOS DATOS, VAMOS A ALMACENARLOS EN UN OBJETO, YA QUE SI
  //UNA CLASE DE LA ETQUETA HTML CAMBIA, NO NECESARIAMENTE TENEMOS QUE CAMBIAR TODO.

  var DOMStrings = {
    //OBJETO PRIVADO
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month", //SIN COMA
  };

  var formatNumber = function (num, type) {
    //FUNCION PRIVADA
    var numSplit, int, dec, type;
    /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands 
        */

    num = Math.abs(num); //ME DEVUELVE ABS SIEMPRE NUMERO ABSOLUTO, ES DECIR SIN EL SIGNO DE + O -
    num = num.toFixed(2); //ESTE METODO PONE 2 DECIMALES A LA VARIABLE NUM DEVOLVIENDO UN STRING
    numSplit = num.split(".");
    int = numSplit[0];

    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        ", " +
        int.substr(int.length - 3, int.length); //IF THE INPUT IS 2310 THE OUTPUT: 2,310
    }

    dec = numSplit[1];

    //OPERADOR TERNARIO EN JAVASCRIPT

    if (type === "exp") {
      type = "-";
    } else type = "+";

    return type + "" + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    //FUNCION NODELIST
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    //AQUI CREAMOS UN NUEVO OBJETO CON METODOS DENTRO
    getInput: function () {
      //CREACION DE METODO QUE DEVUELVE OBJETO Y SERA PUBLICO.
      return {
        //AQUI EL METODO LO QUE HACE ES RETORNAR AL METODO QUE LO LLAME 1 OBJETO CON 3 PROPIEDADES.

        type: document.querySelector(DOMStrings.inputType).value, //Will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value), //SIN COMA AL FINAL
      };
    }, //ATENCION, DESPUES DE UN METODO, SI VA OTRO, PONE LA COMA

    addListItem: function (obj, type) {
      var html, newHtml, element;

      //Create HTML string with placeholder text

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //Relplace the placeholder with some actual data

      newHtml = html.replace("%id%", obj.id); //REEMPLAZA LO QUE ESTA DENTRO DE % % POR EL ID Y ASI SUCESIVAMENTE
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //Insert the HTML into the DOM

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      //EN ESTE CASO LIMPIAMOS EL INPUT FIELD CON EL METODO QUERYSELECTORALL PARA
      //SELECCIONAR INPUTDESCRIPTION E INPUTVALUE. PODEMOS HACERLO CON + ',' +
      //El método querySelectorAll() de un Element devuelve una NodeList estática (no viva) que
      //representa una lista de elementos del documento que coinciden con el grupo de selectores indicados.

      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );

      //AHORA COMO LA VAR FIELDS ES UNA LISTA, DEBEMOS CONVERTIR ESTA LISTA EN UN ARRAY

      fieldsArr = Array.prototype.slice.call(fields); // Y ACA LO QUE HACEMOS ES CONVERTIR UNA LISTA EN UN ARRAY

      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;

      obj.budget > 0 ? (type = "inc") : (type = "exp"); //OPERADOR TERNARIO

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, year, month, months;

      now = new Date(); //SI NO PASAMOS NADA AL CONSTRUCTOR NOS DEVUELVE EL DATE DE HOY
      //EJEMPLO PARA NAVIDAD SERIA: var Christmas = new Date(2016,11,25);
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        //CUANDO SELECCIONAMOS VARIAS CLASES CON QUERYSELECTORALL
        //LAS DIFERENTES CLASES DEBEN SEPARARSE POR COMA. EN ESTE CASO, ESTAMOS CONSTRUYENDO UN STRING
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },

    getDOMStrings: function () {
      //CON ESTA LINEA LO QUE HAGO ES CREAR OTRO METODO QUE PERMITIRA SER LLAMADO DESDE EL GLOBAL APP CONTROLLER, PARTICULARMENTE EL OBJETO DOMStrings
      return DOMStrings; //POR LO TANTO LO QUE HACEMOS ES EXPONER NUESTRO DOMStrings DE PRIVADO A PUBLICO
    },
  };
})();

////////////////////////////////////////////////////////////////////////////////////////////////////////
//CONTROLLER MODULE

var controller = (function (budgetCrtl, UICtrl) {
  var setupEventListeners = function () {
    //CON ESTA FUNCION LO QUE HACEMOS ES ORDENAR LA INFORMACION
    //DE LOS EVENTLISTENERS. ES PRIVADA

    var DOM = UICtrl.getDOMStrings(); //Y CON ESTA LINEA DE CODIGO, LO QUE HACEMOS ES ACCEDER A
    //getDOMStrings()
    document
      .querySelector(DOM.inputBtn)
      .addEventListener("click", ctrolAddItem); //MOUSE

    document.addEventListener("keypress", function (e) {
      //TECLADO. COMO PODEMOS TECLEAR EL "ENTER" EN CUALQUIER PARTE DE LA INTERFAZ VA DOCUMENT.ADDLI...
      if (e.keyCode === 13 || e.which === 13) {
        ctrolAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrolDeleteItem); /* EVENT DELEGATION */

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    //ES PRIVADA

    // 1. Calculate Budget
    budgetCrtl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCrtl.getBudget();

    // 3. Display the budget in the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    //1. Calculate the percentages
    budgetCrtl.calculatePercentages();

    //2. Read percentages from the budget controller
    var percentages = budgetCrtl.getPercentages();

    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrolAddItem = function () {
    //ES PRIVADA
    var input, newItem;
    // 1. Get the field input data

    input = UICtrl.getInput(); //EN ESTA VARIABLE INPUT SE GUARDA EL OBJETO QUE TIPEAMOS
    //console.log(input);

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //ESTA LINEA ES PARA QUE
      //NO ESTE VACIO EL INPUT

      // 2. Add the item to the budget controller. ESTE ES EL OBJETO (TANTO INC COMO EXP) QUE LE VAMOS
      //A PASAR AL NUEVO METODO addListItem en el UIController:
      newItem = budgetCrtl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. For clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update the budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrolDeleteItem = function (event) {
    /* EVENT DELEGATION */
    var itemID, splitID, type, ID;

    itemID =
      event.target.parentNode.parentNode.parentNode.parentNode
        .id; /* EVENT.TARTGET ME INDICA DONDE HICE CLIC EN EL DOCUMENTO HTML */

    if (itemID) {
      splitID = itemID.split("-"); //El método split() divide un objeto de tipo String en un array (vector)
      //de cadenas mediante la separación de la cadena en subcadenas.

      type = splitID[0];

      ID = parseInt(splitID[1]);

      //1 . Delete the item from the data structure

      budgetCrtl.deleteItem(type, ID);

      //2. Delete the item from the UI

      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. Calculate and update  percentages
      updatePercentages();
    }
  };

  return {
    //CREANDO UN PUBLIC INICIALIZATION OBJECT, YA QUE COMO LOS EVENTLISTENER LOS PUSIMOS DENTRO
    //DE LA VAR SETUPEVENTLISTENERS, DE ALGUNA MANERA TENEMOS QUE INVOCARLOS AUTOMATICAMENTE.
    //ES PUBLICA Y ES UN OBJETO
    init: function () {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

//ESTAS VAN A SER LAS UNICAS LINEAS DE CODIGO QUE VAN A EJECUTARSE AFUERA, CON EL OBJETIVO DE LLAMAR A NUESTRO INIT()

controller.init();
