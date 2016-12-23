/*
    scriptify:
      принимает на вход исходную строку (string) с биндингами и контекст (context)
      отдает строку в которой все биндинги заменены вычисленными значеними
      в преданном контексте
      опционально можно скрывать результат биндинга (hideNull) если тот равен null
      true: null => ''
      false: null => 'null'
      по умолчанию значение true

      биндинг angular-style: {{(.*)}}

      пример использования:

      // example = 'binding example a=12345'
      let example = scriptify({
        string: 'binding example a={{a}}',
        context: {
            a: function() {return '12345'}
        }
      });

      // example = 'binding example a=null'
      let example = scriptify({
        string: 'binding example b={{b}}',
        context: {
            b: function() {return null}
        },
        hideNull: false
      });

*/
'use strict';
const vm = require('vm');
const bindingRegEx = /\{\{(.*?[^\}])\}\}/g;
const innerScriptRegEx = /(?:\{\{)(.*?[^\}])(?:\}\})/;

function scriptify (args) {

    /*
    если биндинги в строке есть то
        1) заменяем все переносы строк и лишние вайтспейсы
        2) находим все биндинги в строке
        3) вырезаем скрипт и з биндинга
        4) создаем инстанс vm скрипта
        5) запускаем в контексте объекта который передавали в аргументах
        6) результат кладем в хэшмап
        7) заменяем все биндинги на получившиеся значения

    если нет
        1) возвращаем неизмененную строку
    */

    if (!args) throw 'arguments required!';
    if (!args.string || !args.context) throw 'string and/or context required!';


    const context = args.context;
    const scope = vm.createContext(context);


    let string = args.string;
    let hideNull = args.hideNull ? true : false;
    let matches = string.match(bindingRegEx);


    if (matches != null) {

        const expressions = {};

        matches.forEach((expression) => {
            expressions[expression] = new vm.Script(expression.match(innerScriptRegEx)[1]).runInContext(scope);
        });

        for (let expression in expressions) {
            string = string.replace(
                                      expression,
                                      ((expressions[expression] == null) && hideNull) ? '' : expressions[expression]
                                    );
        };
        
    };


    return string;
};

module.exports = scriptify;
