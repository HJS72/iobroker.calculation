# ioBroker.calculate

[![NPM version](https://img.shields.io/npm/v/iobroker.calculate?style=flat)](https://www.npmjs.com/package/iobroker.calculate)
[![Downloads](https://img.shields.io/npm/dm/iobroker.calculate?style=flat)](https://www.npmjs.com/package/iobroker.calculate)
![Number of Installations (stable)](https://img.shields.io/npm/dt/iobroker.calculate.svg)
[![Build Status](https://github.com/ioBroker/ioBroker.calculate/workflows/CI/badge.svg)](https://github.com/ioBroker/ioBroker.calculate/actions)

**This adapter performs mathematical calculations for ioBroker.**

## Features

- Simple arithmetic operations (add, subtract, multiply, divide)
- Statistical functions (average, sum, product)
- Energy consumption calculation

## Installation

Install via the ioBroker Admin UI or using npm:

```bash
npm install iobroker.calculate
```

## Usage

The adapter provides a CalculationEngine class that can be used to perform various mathematical operations.

### Example

```javascript
const CalculationEngine = require('./lib/CalculationEngine');
const engine = new CalculationEngine();

// Simple arithmetic operation
const result = engine.performSimpleOperation(5, 3, 'add'); // Returns 8

// Calculate average
const avg = engine.calculateAverage([1, 2, 3, 4, 5]); // Returns 3

// Calculate energy consumption
const energy = engine.calculateEnergy(100, 5); // Returns 500 (watt-hours)
```

## Development

### Testing

```bash
npm test
```

### Building

```bash
npm run build
```

## License

MIT License

Copyright (c) 2023 ioBroker Community

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.