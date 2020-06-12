(function () {
  var constructor = function (firtName, lastName) {
    this.firtName = firtName;
    this.lastName = lastName;
  };

  constructor.prototype.greetings(  );
 

  var greetings = {
    //NO ES EXPUESTO, ESTA DENTRO DEL SCOPE
    en: "Hello",
    es: "Hola",
    pr: "Oi",

    hello: function (language) {
      return this.firtName + '' + this.lastName;
    }

    
  };

  var gonzalo = new constructor("Gonzalo", "De Genaro");

  var objetoGonzalo = gonzalo.hello();

})();
