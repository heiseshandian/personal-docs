"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execAsync = void 0;
var base_1 = require("./base");
var child_process_1 = require("child_process");
exports.execAsync = base_1.callback2Promise(child_process_1.exec);
