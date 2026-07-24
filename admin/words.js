// Language support for the calculate adapter

tools.translateWords = function (lang) {
    const words = {
        'en': {
            'Calculate Adapter': 'Calculate Adapter',
            'General': 'General',
            'Enable Calculation Adapter': 'Enable Calculation Adapter',
            'Description': 'Description',
            'Calculations': 'Calculations',
            'Default Operation': 'Default Operation',
            'Addition': 'Addition',
            'Subtraction': 'Subtraction',
            'Multiplication': 'Multiplication',
            'Division': 'Division'
        },
        'de': {
            'Calculate Adapter': 'Berechnungs-Adapter',
            'General': 'Allgemein',
            'Enable Calculation Adapter': 'Berechnungs-Adapter aktivieren',
            'Description': 'Beschreibung',
            'Calculations': 'Berechnungen',
            'Default Operation': 'Standardoperation',
            'Addition': 'Addition',
            'Subtraction': 'Subtraktion',
            'Multiplication': 'Multiplikation',
            'Division': 'Division'
        },
        'ru': {
            'Calculate Adapter': 'Адаптер вычислений',
            'General': 'Общие',
            'Enable Calculation Adapter': 'Включить адаптер вычислений',
            'Description': 'Описание',
            'Calculations': 'Вычисления',
            'Default Operation': 'Операция по умолчанию',
            'Addition': 'Сложение',
            'Subtraction': 'Вычитание',
            'Multiplication': 'Умножение',
            'Division': 'Деление'
        }
    };
    
    return words[lang] || words['en'];
};