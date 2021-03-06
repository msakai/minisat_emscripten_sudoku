// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['thisProgram'] = process['argv'][1];
  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var stack = 0;
  var JSfuncs = {
    'stackSave' : function() {
      stack = Runtime.stackSave();
    },
    'stackRestore' : function() {
      Runtime.stackRestore(stack);
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        ret = Runtime.stackAlloc(str.length + 1); // +1 for the trailing '\0'
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. A convenient way to call C functions (in C files, or
  // defined with extern "C").
  //
  // Note: ccall/cwrap use the C stack for temporary values. If you pass a string
  //       then it is only alive until the call is complete. If the code being
  //       called saves the pointer to be used later, it may point to invalid
  //       data. If you need a string to live forever, you can create it (and
  //       must later delete it manually!) using malloc and writeStringToMemory,
  //       for example.
  //
  // Note: LLVM optimizations can inline and remove functions, after which you will not be
  //       able to call them. Closure can also do so. To avoid that, add your function to
  //       the exports using something like
  //
  //         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
  //
  // @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
  // @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
  //                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
  // @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
  //                   except that 'array' is not possible (there is no way for us to know the length of the array)
  // @param args       An array of the arguments to the function, as native JS values (as in returnType)
  //                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
  // @return           The return value, as a native JS value (as in returnType)
  ccall = function ccallFunc(ident, returnType, argTypes, args) {
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
    var func = getCFunc(ident);
    var cArgs = [];
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) JSfuncs['stackRestore']();
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }
  // Returns a native JS wrapper for a C function. This is similar to ccall, but
  // returns a function you can call repeatedly in a normal way. For example:
  //
  //   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
  //   alert(my_function(5, 22));
  //   alert(my_function(99, 12));
  //
  cwrap = function cwrap(ident, returnType, argTypes) {
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    funcstr += "assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');\n";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
  runtimeInitialized = false;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(2771);
  /* global initializers */ __ATINIT__.push({ func: function() { __GLOBAL__I_a() } }, { func: function() { __GLOBAL__I_a79() } });
  

/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,114,101,115,116,97,114,116,115,32,32,32,32,32,32,32,32,32,32,32,32,32,32,58,32,37,108,108,100,10,0,0,0,99,111,110,102,108,105,99,116,115,32,32,32,32,32,32,32,32,32,32,32,32,32,58,32,37,45,49,50,108,108,100,32,32,32,40,37,46,48,102,32,47,115,101,99,41,10,0,0,100,101,99,105,115,105,111,110,115,32,32,32,32,32,32,32,32,32,32,32,32,32,58,32,37,45,49,50,108,108,100,32,32,32,40,37,52,46,50,102,32,37,37,32,114,97,110,100,111,109,41,32,40,37,46,48,102,32,47,115,101,99,41,10,0,0,0,0,0,0,0,0,112,114,111,112,97,103,97,116,105,111,110,115,32,32,32,32,32,32,32,32,32,32,58,32,37,45,49,50,108,108,100,32,32,32,40,37,46,48,102,32,47,115,101,99,41,10,0,0,99,111,110,102,108,105,99,116,32,108,105,116,101,114,97,108,115,32,32,32,32,32,58,32,37,45,49,50,108,108,100,32,32,32,40,37,52,46,50,102,32,37,37,32,100,101,108,101,116,101,100,41,10,0,0,0,77,101,109,111,114,121,32,117,115,101,100,32,32,32,32,32,32,32,32,32,32,32,58,32,37,46,50,102,32,77,66,10,0,0,0,0,0,0,0,0,67,80,85,32,116,105,109,101,32,32,32,32,32,32,32,32,32,32,32,32,32,32,58,32,37,103,32,115,10,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,84,104,105,115,32,105,115,32,77,105,110,105,83,97,116,32,50,46,48,32,98,101,116,97,10,0,0,0,0,0,0,0,115,116,114,108,101,110,40,105,110,112,117,116,41,32,61,32,37,100,32,33,61,32,56,49,10,0,0,0,0,0,0,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,91,32,80,114,111,98,108,101,109,32,83,116,97,116,105,115,116,105,99,115,32,93,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,10,0,0,0,0,0,0,0,0,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,10,0,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,0,0,0,0,0,0,0,124,32,32,76,111,97,100,105,110,103,32,116,105,109,101,58,32,32,32,32,32,32,32,32,32,37,45,49,50,46,50,102,32,115,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,10,0,0,0,0,0,83,111,108,118,101,100,32,98,121,32,117,110,105,116,32,112,114,111,112,97,103,97,116,105,111,110,10,0,0,0,0,0,85,78,83,65,84,73,83,70,73,65,66,76,69,10,0,0,83,65,84,73,83,70,73,65,66,76,69,10,0,0,0,0,118,32,0,0,0,0,0,0,37,115,37,115,37,100,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,32,48,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,85,78,83,65,84,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,101,99,105,115,105,111,110,76,101,118,101,108,40,41,32,61,61,32,48,0,0,0,0,83,111,108,118,101,114,46,99,112,112,0,0,0,0,0,0,97,100,100,67,108,97,117,115,101,0,0,0,0,0,0,0,118,97,108,117,101,40,112,115,91,48,93,41,32,61,61,32,108,95,85,110,100,101,102,0,99,46,115,105,122,101,40,41,32,62,32,49,0,0,0,0,97,116,116,97,99,104,67,108,97,117,115,101,0,0,0,0,100,101,116,97,99,104,67,108,97,117,115,101,0,0,0,0,102,105,110,100,40,119,97,116,99,104,101,115,91,116,111,73,110,116,40,126,99,91,48,93,41,93,44,32,38,99,41,0,102,105,110,100,40,119,97,116,99,104,101,115,91,116,111,73,110,116,40,126,99,91,49,93,41,93,44,32,38,99,41,0,102,97,108,115,101,0,0,0,112,105,99,107,66,114,97,110,99,104,76,105,116,0,0,0,99,111,110,102,108,32,33,61,32,78,85,76,76,0,0,0,97,110,97,108,121,122,101,0,114,101,97,115,111,110,91,118,97,114,40,97,110,97,108,121,122,101,95,115,116,97,99,107,46,108,97,115,116,40,41,41,93,32,33,61,32,78,85,76,76,0,0,0,0,0,0,0,108,105,116,82,101,100,117,110,100,97,110,116,0,0,0,0,108,101,118,101,108,91,120,93,32,62,32,48,0,0,0,0,97,110,97,108,121,122,101,70,105,110,97,108,0,0,0,0,118,97,108,117,101,40,112,41,32,61,61,32,108,95,85,110,100,101,102,0,0,0,0,0,117,110,99,104,101,99,107,101,100,69,110,113,117,101,117,101,0,0,0,0,0,0,0,0,99,91,49,93,32,61,61,32,102,97,108,115,101,95,108,105,116,0,0,0,0,0,0,0,112,114,111,112,97,103,97,116,101,0,0,0,0,0,0,0,115,105,109,112,108,105,102,121,0,0,0,0,0,0,0,0,111,107,0,0,0,0,0,0,115,101,97,114,99,104,0,0,118,97,108,117,101,40,108,101,97,114,110,116,95,99,108,97,117,115,101,91,48,93,41,32,61,61,32,108,95,85,110,100,101,102,0,0,0,0,0,0,118,97,108,117,101,40,110,101,120,116,41,32,61,61,32,108,95,85,110,100,101,102,0,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,91,32,83,101,97,114,99,104,32,83,116,97,116,105,115,116,105,99,115,32,93,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,10,0,0,0,0,0,0,0,0,124,32,67,111,110,102,108,105,99,116,115,32,124,32,32,32,32,32,32,32,32,32,32,79,82,73,71,73,78,65,76,32,32,32,32,32,32,32,32,32,124,32,32,32,32,32,32,32,32,32,32,76,69,65,82,78,84,32,32,32,32,32,32,32,32,32,32,124,32,80,114,111,103,114,101,115,115,32,124,10,0,0,0,0,0,0,0,0,124,32,32,32,32,32,32,32,32,32,32,32,124,32,32,32,32,86,97,114,115,32,32,67,108,97,117,115,101,115,32,76,105,116,101,114,97,108,115,32,124,32,32,32,32,76,105,109,105,116,32,32,67,108,97,117,115,101,115,32,76,105,116,47,67,108,32,124,32,32,32,32,32,32,32,32,32,32,124,10,0,0,0,0,0,0,0,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,10,0,0,0,0,0,0,0,0,124,32,37,57,100,32,124,32,37,55,100,32,37,56,100,32,37,56,100,32,124,32,37,56,100,32,37,56,100,32,37,54,46,48,102,32,124,32,37,54,46,51,102,32,37,37,32,124,10,0,0,0,0,0,0,0,115,116,97,116,117,115,32,61,61,32,108,95,70,97,108,115,101,0,0,0,0,0,0,0,115,111,108,118,101,0,0,0,99,108,97,117,115,101,115,91,105,93,45,62,109,97,114,107,40,41,32,61,61,32,48,0,118,101,114,105,102,121,77,111,100,101,108,0,0,0,0,0,117,110,115,97,116,105,115,102,105,101,100,32,99,108,97,117,115,101,58,32,0,0,0,0,10,0,0,0,0,0,0,0,33,102,97,105,108,101,100,0,86,101,114,105,102,105,101,100,32,37,100,32,111,114,105,103,105,110,97,108,32,99,108,97,117,115,101,115,46,10,0,0,32,0,0,0,0,0,0,0,37,115,37,100,58,37,99,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,101,97,112,80,114,111,112,101,114,116,121,40,41,0,0,46,47,72,101,97,112,46,104,0,0,0,0,0,0,0,0,102,105,108,116,101,114,0,0,110,101,108,101,109,115,32,60,61,32,115,122,0,0,0,0,46,47,86,101,99,46,104,0,115,104,114,105,110,107,0,0,105,110,100,101,120,32,60,32,104,101,97,112,46,115,105,122,101,40,41,0,0,0,0,0,111,112,101,114,97,116,111,114,91,93,0,0,0,0,0,0,106,32,60,32,116,115,46,115,105,122,101,40,41,0,0,0,46,47,65,108,103,46,104,0,114,101,109,111,118,101,0,0,105,110,72,101,97,112,40,110,41,0,0,0,0,0,0,0,100,101,99,114,101,97,115,101,0,0,0,0,0,0,0,0,33,105,110,72,101,97,112,40,110,41,0,0,0,0,0,0,105,110,115,101,114,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


   
  Module["_i64Subtract"] = _i64Subtract;

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function ___errno_location() {
      return ___errno_state;
    }

   
  Module["_memset"] = _memset;

  var _emscripten_resume=true;

  var _emscripten_landingpad=true;

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function _abort() {
      Module['abort']();
    }

  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (node.contents && node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
  
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
  
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return Math.floor(Math.random()*256); };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[((textIndex)>>0)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)>>0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)>>0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)>>0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)>>0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)>>0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)>>0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[((i)>>0)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  var _UItoF=true;



  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _llvm_pow_f64() {
  return Math_pow.apply(null, arguments)
  }

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)>>0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    }

   
  Module["_i64Add"] = _i64Add;

  var _emscripten_postinvoke=true;

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  var ___cxa_caught_exceptions=[];
  
  var ___cxa_last_thrown_exception=0;function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

  var _emscripten_preinvoke=true;

  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr;
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___gxx_personality_v0() {
    }

  function _getrusage(resource, rlp) {
      // int getrusage(int resource, struct rusage *rlp);
      HEAP32[((rlp)>>2)]=1;
      HEAP32[(((rlp)+(4))>>2)]=2;
      HEAP32[(((rlp)+(8))>>2)]=3;
      HEAP32[(((rlp)+(12))>>2)]=4;
      return 0;
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx) return Module.ctx; // no need to recreate singleton GL context
  
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // possible GL_DEBUG entry point: ctx = wrapDebugGL(ctx);
  
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        }
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
          Module.ctx = ctx;
          if (useWebGL) GLctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = -event.wheelDelta;
            break;
          case 'wheel': 
            delta = event.deltaY;
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return Math.max(-1, Math.min(1, delta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  var _UItoD=true;

___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

  var Math_min = Math.min;
function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_d(x) { Module["printErr"]("Invalid function pointer called with signature 'd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_di(x) { Module["printErr"]("Invalid function pointer called with signature 'di'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiid(x) { Module["printErr"]("Invalid function pointer called with signature 'viiid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_d(index) {
  try {
    return Module["dynCall_d"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_di(index,a1) {
  try {
    return Module["dynCall_di"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiid(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiid"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

  function asmPrintInt(x, y) {
    Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  function asmPrintFloat(x, y) {
    Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  // EMSCRIPTEN_START_ASM
  var asm = (function(global, env, buffer) {
    'almost asm';
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);
  
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;
  var ctlz_i8=env.ctlz_i8|0;
  var _stdout=env._stdout|0;

    var __THREW__ = 0;
    var threwValue = 0;
    var setjmpId = 0;
    var undef = 0;
    var nan = +env.NaN, inf = +env.Infinity;
    var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  
    var tempRet0 = 0;
    var tempRet1 = 0;
    var tempRet2 = 0;
    var tempRet3 = 0;
    var tempRet4 = 0;
    var tempRet5 = 0;
    var tempRet6 = 0;
    var tempRet7 = 0;
    var tempRet8 = 0;
    var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_d=env.nullFunc_d;
  var nullFunc_di=env.nullFunc_di;
  var nullFunc_vi=env.nullFunc_vi;
  var nullFunc_vii=env.nullFunc_vii;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_viiid=env.nullFunc_viiid;
  var nullFunc_viii=env.nullFunc_viii;
  var nullFunc_iii=env.nullFunc_iii;
  var nullFunc_viiii=env.nullFunc_viiii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_d=env.invoke_d;
  var invoke_di=env.invoke_di;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_ii=env.invoke_ii;
  var invoke_viiid=env.invoke_viiid;
  var invoke_viii=env.invoke_viii;
  var invoke_iii=env.invoke_iii;
  var invoke_viiii=env.invoke_viiii;
  var _llvm_pow_f64=env._llvm_pow_f64;
  var _send=env._send;
  var ___cxa_does_inherit=env.___cxa_does_inherit;
  var __ZSt9terminatev=env.__ZSt9terminatev;
  var ___setErrNo=env.___setErrNo;
  var ___cxa_is_number_type=env.___cxa_is_number_type;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var ___assert_fail=env.___assert_fail;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var _fflush=env._fflush;
  var _pwrite=env._pwrite;
  var __reallyNegative=env.__reallyNegative;
  var _sbrk=env._sbrk;
  var ___cxa_begin_catch=env.___cxa_begin_catch;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var ___resumeException=env.___resumeException;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var _sysconf=env._sysconf;
  var _putchar=env._putchar;
  var _puts=env._puts;
  var _mkport=env._mkport;
  var _write=env._write;
  var ___errno_location=env.___errno_location;
  var _printf=env._printf;
  var _getrusage=env._getrusage;
  var __exit=env.__exit;
  var _fputc=env._fputc;
  var _abort=env._abort;
  var _fwrite=env._fwrite;
  var _time=env._time;
  var _fprintf=env._fprintf;
  var __formatString=env.__formatString;
  var _fputs=env._fputs;
  var _exit=env._exit;
  var tempFloat = 0.0;

  // EMSCRIPTEN_START_FUNCS
  function stackAlloc(size) {
    size = size|0;
    var ret = 0;
    ret = STACKTOP;
    STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 7)&-8;
    return ret|0;
  }
  function stackSave() {
    return STACKTOP|0;
  }
  function stackRestore(top) {
    top = top|0;
    STACKTOP = top;
  }
  function setThrew(threw, value) {
    threw = threw|0;
    value = value|0;
    if ((__THREW__|0) == 0) {
      __THREW__ = threw;
      threwValue = value;
    }
  }
  function copyTempFloat(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  }
  function copyTempDouble(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
    HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
    HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
    HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
    HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
  }
  function setTempRet0(value) {
    value = value|0;
    tempRet0 = value;
  }
  function getTempRet0() {
    return tempRet0|0;
  }
  
function ___cxx_global_var_init() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN3LitC1Eib(8,-1,0);
 STACKTOP = sp;return;
}
function __ZN3LitC1Eib($this,$var,$sign) {
 $this = $this|0;
 $var = $var|0;
 $sign = $sign|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $var;
 $3 = $sign&1;
 $2 = $3;
 $4 = $0;
 $5 = $1;
 $6 = $2;
 $7 = $6&1;
 __ZN3LitC2Eib($4,$5,$7);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init1() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN3LitC1Eib(16,-1,1);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init2() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __Z7toLbooli(24,1);
 STACKTOP = sp;return;
}
function __Z7toLbooli($agg$result,$v) {
 $agg$result = $agg$result|0;
 $v = $v|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $v;
 $1 = $0;
 __ZN5lboolC1Ei($agg$result,$1);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init3() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __Z7toLbooli(32,-1);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init4() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __Z7toLbooli(40,0);
 STACKTOP = sp;return;
}
function __Z10printStatsR6Solver($solver) {
 $solver = $solver|0;
 var $0 = 0, $1 = 0.0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0.0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0.0, $153 = 0.0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0.0, $175 = 0.0, $176 = 0, $177 = 0.0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
 var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0.0, $39 = 0.0, $4 = 0, $40 = 0.0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
 var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0.0, $63 = 0.0, $64 = 0;
 var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
 var $83 = 0.0, $84 = 0.0, $85 = 0.0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $cpu_time = 0.0, $mem_used = 0;
 var $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer14 = 0, $vararg_buffer18 = 0, $vararg_buffer21 = 0, $vararg_buffer5 = 0, $vararg_ptr13 = 0, $vararg_ptr17 = 0, $vararg_ptr4 = 0, $vararg_ptr8 = 0, $vararg_ptr9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128|0;
 $vararg_buffer21 = sp;
 $vararg_buffer18 = sp + 40|0;
 $vararg_buffer14 = sp + 16|0;
 $vararg_buffer10 = sp + 48|0;
 $vararg_buffer5 = sp + 72|0;
 $vararg_buffer1 = sp + 96|0;
 $vararg_buffer = sp + 32|0;
 $mem_used = sp + 64|0;
 $0 = $solver;
 $1 = (+__ZL7cpuTimev());
 $cpu_time = $1;
 $2 = (__ZL7memUsedv()|0);
 $3 = tempRet0;
 $4 = $mem_used;
 $5 = $4;
 HEAP32[$5>>2] = $2;
 $6 = (($4) + 4)|0;
 $7 = $6;
 HEAP32[$7>>2] = $3;
 $8 = HEAP32[_stdout>>2]|0;
 $9 = $0;
 $10 = (($9) + 96|0);
 $11 = $10;
 $12 = $11;
 $13 = HEAP32[$12>>2]|0;
 $14 = (($11) + 4)|0;
 $15 = $14;
 $16 = HEAP32[$15>>2]|0;
 $17 = $vararg_buffer;
 $18 = $17;
 HEAP32[$18>>2] = $13;
 $19 = (($17) + 4)|0;
 $20 = $19;
 HEAP32[$20>>2] = $16;
 (_fprintf(($8|0),(48|0),($vararg_buffer|0))|0);
 $21 = HEAP32[_stdout>>2]|0;
 $22 = $0;
 $23 = (($22) + 128|0);
 $24 = $23;
 $25 = $24;
 $26 = HEAP32[$25>>2]|0;
 $27 = (($24) + 4)|0;
 $28 = $27;
 $29 = HEAP32[$28>>2]|0;
 $30 = $0;
 $31 = (($30) + 128|0);
 $32 = $31;
 $33 = $32;
 $34 = HEAP32[$33>>2]|0;
 $35 = (($32) + 4)|0;
 $36 = $35;
 $37 = HEAP32[$36>>2]|0;
 $38 = (+($34>>>0)) + (4294967296.0*(+($37>>>0)));
 $39 = $cpu_time;
 $40 = $38 / $39;
 $41 = $vararg_buffer1;
 $42 = $41;
 HEAP32[$42>>2] = $26;
 $43 = (($41) + 4)|0;
 $44 = $43;
 HEAP32[$44>>2] = $29;
 $vararg_ptr4 = (($vararg_buffer1) + 8|0);
 HEAPF64[tempDoublePtr>>3]=$40;HEAP32[$vararg_ptr4>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr4+4>>2]=HEAP32[tempDoublePtr+4>>2];
 (_fprintf(($21|0),(80|0),($vararg_buffer1|0))|0);
 $45 = HEAP32[_stdout>>2]|0;
 $46 = $0;
 $47 = (($46) + 104|0);
 $48 = $47;
 $49 = $48;
 $50 = HEAP32[$49>>2]|0;
 $51 = (($48) + 4)|0;
 $52 = $51;
 $53 = HEAP32[$52>>2]|0;
 $54 = $0;
 $55 = (($54) + 112|0);
 $56 = $55;
 $57 = $56;
 $58 = HEAP32[$57>>2]|0;
 $59 = (($56) + 4)|0;
 $60 = $59;
 $61 = HEAP32[$60>>2]|0;
 $62 = (+($58>>>0)) + (4294967296.0*(+($61>>>0)));
 $63 = $62 * 100.0;
 $64 = $0;
 $65 = (($64) + 104|0);
 $66 = $65;
 $67 = $66;
 $68 = HEAP32[$67>>2]|0;
 $69 = (($66) + 4)|0;
 $70 = $69;
 $71 = HEAP32[$70>>2]|0;
 $72 = (+($68>>>0)) + (4294967296.0*(+($71>>>0)));
 $73 = $63 / $72;
 $74 = $73;
 $75 = $0;
 $76 = (($75) + 104|0);
 $77 = $76;
 $78 = $77;
 $79 = HEAP32[$78>>2]|0;
 $80 = (($77) + 4)|0;
 $81 = $80;
 $82 = HEAP32[$81>>2]|0;
 $83 = (+($79>>>0)) + (4294967296.0*(+($82>>>0)));
 $84 = $cpu_time;
 $85 = $83 / $84;
 $86 = $vararg_buffer5;
 $87 = $86;
 HEAP32[$87>>2] = $50;
 $88 = (($86) + 4)|0;
 $89 = $88;
 HEAP32[$89>>2] = $53;
 $vararg_ptr8 = (($vararg_buffer5) + 8|0);
 HEAPF64[tempDoublePtr>>3]=$74;HEAP32[$vararg_ptr8>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr8+4>>2]=HEAP32[tempDoublePtr+4>>2];
 $vararg_ptr9 = (($vararg_buffer5) + 16|0);
 HEAPF64[tempDoublePtr>>3]=$85;HEAP32[$vararg_ptr9>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr9+4>>2]=HEAP32[tempDoublePtr+4>>2];
 (_fprintf(($45|0),(128|0),($vararg_buffer5|0))|0);
 $90 = HEAP32[_stdout>>2]|0;
 $91 = $0;
 $92 = (($91) + 120|0);
 $93 = $92;
 $94 = $93;
 $95 = HEAP32[$94>>2]|0;
 $96 = (($93) + 4)|0;
 $97 = $96;
 $98 = HEAP32[$97>>2]|0;
 $99 = $0;
 $100 = (($99) + 120|0);
 $101 = $100;
 $102 = $101;
 $103 = HEAP32[$102>>2]|0;
 $104 = (($101) + 4)|0;
 $105 = $104;
 $106 = HEAP32[$105>>2]|0;
 $107 = (+($103>>>0)) + (4294967296.0*(+($106>>>0)));
 $108 = $cpu_time;
 $109 = $107 / $108;
 $110 = $vararg_buffer10;
 $111 = $110;
 HEAP32[$111>>2] = $95;
 $112 = (($110) + 4)|0;
 $113 = $112;
 HEAP32[$113>>2] = $98;
 $vararg_ptr13 = (($vararg_buffer10) + 8|0);
 HEAPF64[tempDoublePtr>>3]=$109;HEAP32[$vararg_ptr13>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr13+4>>2]=HEAP32[tempDoublePtr+4>>2];
 (_fprintf(($90|0),(200|0),($vararg_buffer10|0))|0);
 $114 = HEAP32[_stdout>>2]|0;
 $115 = $0;
 $116 = (($115) + 160|0);
 $117 = $116;
 $118 = $117;
 $119 = HEAP32[$118>>2]|0;
 $120 = (($117) + 4)|0;
 $121 = $120;
 $122 = HEAP32[$121>>2]|0;
 $123 = $0;
 $124 = (($123) + 152|0);
 $125 = $124;
 $126 = $125;
 $127 = HEAP32[$126>>2]|0;
 $128 = (($125) + 4)|0;
 $129 = $128;
 $130 = HEAP32[$129>>2]|0;
 $131 = $0;
 $132 = (($131) + 160|0);
 $133 = $132;
 $134 = $133;
 $135 = HEAP32[$134>>2]|0;
 $136 = (($133) + 4)|0;
 $137 = $136;
 $138 = HEAP32[$137>>2]|0;
 $139 = (_i64Subtract(($127|0),($130|0),($135|0),($138|0))|0);
 $140 = tempRet0;
 $141 = (___muldi3(($139|0),($140|0),100,0)|0);
 $142 = tempRet0;
 $143 = (+($141>>>0)) + (4294967296.0*(+($142>>>0)));
 $144 = $0;
 $145 = (($144) + 152|0);
 $146 = $145;
 $147 = $146;
 $148 = HEAP32[$147>>2]|0;
 $149 = (($146) + 4)|0;
 $150 = $149;
 $151 = HEAP32[$150>>2]|0;
 $152 = (+($148>>>0)) + (4294967296.0*(+($151>>>0)));
 $153 = $143 / $152;
 $154 = $vararg_buffer14;
 $155 = $154;
 HEAP32[$155>>2] = $119;
 $156 = (($154) + 4)|0;
 $157 = $156;
 HEAP32[$157>>2] = $122;
 $vararg_ptr17 = (($vararg_buffer14) + 8|0);
 HEAPF64[tempDoublePtr>>3]=$153;HEAP32[$vararg_ptr17>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr17+4>>2]=HEAP32[tempDoublePtr+4>>2];
 (_fprintf(($114|0),(248|0),($vararg_buffer14|0))|0);
 $158 = $mem_used;
 $159 = $158;
 $160 = HEAP32[$159>>2]|0;
 $161 = (($158) + 4)|0;
 $162 = $161;
 $163 = HEAP32[$162>>2]|0;
 $164 = ($160|0)!=(0);
 $165 = ($163|0)!=(0);
 $166 = $164 | $165;
 if (!($166)) {
  $176 = HEAP32[_stdout>>2]|0;
  $177 = $cpu_time;
  HEAPF64[tempDoublePtr>>3]=$177;HEAP32[$vararg_buffer21>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_buffer21+4>>2]=HEAP32[tempDoublePtr+4>>2];
  (_fprintf(($176|0),(344|0),($vararg_buffer21|0))|0);
  STACKTOP = sp;return;
 }
 $167 = HEAP32[_stdout>>2]|0;
 $168 = $mem_used;
 $169 = $168;
 $170 = HEAP32[$169>>2]|0;
 $171 = (($168) + 4)|0;
 $172 = $171;
 $173 = HEAP32[$172>>2]|0;
 $174 = (+($170>>>0)) + (4294967296.0*(+($173>>>0)));
 $175 = $174 / 1048576.0;
 HEAPF64[tempDoublePtr>>3]=$175;HEAP32[$vararg_buffer18>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_buffer18+4>>2]=HEAP32[tempDoublePtr+4>>2];
 (_fprintf(($167|0),(304|0),($vararg_buffer18|0))|0);
 $176 = HEAP32[_stdout>>2]|0;
 $177 = $cpu_time;
 HEAPF64[tempDoublePtr>>3]=$177;HEAP32[$vararg_buffer21>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_buffer21+4>>2]=HEAP32[tempDoublePtr+4>>2];
 (_fprintf(($176|0),(344|0),($vararg_buffer21|0))|0);
 STACKTOP = sp;return;
}
function __ZL7cpuTimev() {
 var $0 = 0, $1 = 0.0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $ru = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 144|0;
 $ru = sp;
 (_getrusage(0,($ru|0))|0);
 $0 = HEAP32[$ru>>2]|0;
 $1 = (+($0|0));
 $2 = (($ru) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (+($3|0));
 $5 = $4 / 1.0E+6;
 $6 = $1 + $5;
 STACKTOP = sp;return (+$6);
}
function __ZL7memUsedv() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 tempRet0 = 0;
 STACKTOP = sp;return 0;
}
function __Z6sudokuPKc($sudokudata) {
 $sudokudata = $sudokudata|0;
 var $$byval_copy = 0, $$byval_copy29 = 0, $$byval_copy30 = 0, $$byval_copy31 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0;
 var $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0;
 var $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0;
 var $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0;
 var $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0;
 var $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0.0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0;
 var $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0;
 var $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0;
 var $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0.0, $256 = 0;
 var $257 = 0, $258 = 0.0, $259 = 0.0, $26 = 0, $260 = 0, $261 = 0.0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0;
 var $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0;
 var $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0;
 var $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0;
 var $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0;
 var $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0;
 var $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $S = 0;
 var $c = 0, $c18 = 0, $clause = 0, $cpu_time = 0.0, $i = 0, $i0 = 0, $i1 = 0, $i114 = 0, $i12 = 0, $i15 = 0, $i16 = 0, $i3 = 0, $i7 = 0, $j = 0, $j0 = 0, $j1 = 0, $j10 = 0, $j17 = 0, $j2 = 0, $j4 = 0;
 var $j9 = 0, $k = 0, $k19 = 0, $k5 = 0, $k6 = 0, $lits = 0, $lits11 = 0, $lits13 = 0, $lits8 = 0, $parse_time = 0.0, $ret = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer12 = 0, $vararg_buffer14 = 0, $vararg_buffer16 = 0, $vararg_buffer18 = 0, $vararg_buffer20 = 0, $vararg_buffer25 = 0;
 var $vararg_buffer27 = 0, $vararg_buffer3 = 0, $vararg_buffer5 = 0, $vararg_buffer7 = 0, $vararg_ptr23 = 0, $vararg_ptr24 = 0, $vars = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 3712|0;
 $$byval_copy31 = sp + 3689|0;
 $$byval_copy30 = sp + 588|0;
 $$byval_copy29 = sp + 3694|0;
 $$byval_copy = sp + 3691|0;
 $vararg_buffer27 = sp + 568|0;
 $vararg_buffer25 = sp + 576|0;
 $vararg_buffer20 = sp + 48|0;
 $vararg_buffer18 = sp + 8|0;
 $vararg_buffer16 = sp + 40|0;
 $vararg_buffer14 = sp + 64|0;
 $vararg_buffer12 = sp + 32|0;
 $vararg_buffer10 = sp + 88|0;
 $vararg_buffer7 = sp;
 $vararg_buffer5 = sp + 24|0;
 $vararg_buffer3 = sp + 80|0;
 $vararg_buffer1 = sp + 72|0;
 $vararg_buffer = sp + 16|0;
 $S = sp + 112|0;
 $vars = sp + 736|0;
 $clause = sp + 688|0;
 $5 = sp + 3684|0;
 $lits = sp + 656|0;
 $6 = sp + 676|0;
 $lits8 = sp + 720|0;
 $7 = sp + 3652|0;
 $lits11 = sp + 3660|0;
 $8 = sp + 3676|0;
 $lits13 = sp + 600|0;
 $9 = sp + 616|0;
 $10 = sp + 3692|0;
 $11 = sp + 3695|0;
 $12 = sp + 704|0;
 $13 = sp + 3693|0;
 $14 = sp + 3690|0;
 $1 = $sudokudata;
 __ZN6SolverC2Ev($S);
 $15 = (($S) + 88|0);
 HEAP32[$15>>2] = 1;
 $16 = HEAP32[_stdout>>2]|0;
 __THREW__ = 0;
 (invoke_iiii(1,($16|0),(392|0),($vararg_buffer|0))|0);
 $17 = __THREW__; __THREW__ = 0;
 $18 = $17&1;
 L1: do {
  if ($18) {
   label = 8;
  } else {
   __THREW__ = 0;
   $19 = (+invoke_d(2));
   $20 = __THREW__; __THREW__ = 0;
   $21 = $20&1;
   if ($21) {
    label = 8;
   } else {
    $cpu_time = $19;
    $22 = $1;
    __THREW__ = 0;
    $23 = (invoke_ii(3,($22|0))|0);
    $24 = __THREW__; __THREW__ = 0;
    $25 = $24&1;
    if ($25) {
     label = 8;
    } else {
     $26 = ($23|0)!=(81);
     if ($26) {
      $27 = HEAP32[_stdout>>2]|0;
      $28 = $1;
      __THREW__ = 0;
      $29 = (invoke_ii(3,($28|0))|0);
      $30 = __THREW__; __THREW__ = 0;
      $31 = $30&1;
      if ($31) {
       label = 8;
       break;
      }
      __THREW__ = 0;
      HEAP32[$vararg_buffer1>>2] = $29;
      (invoke_iiii(1,($27|0),(424|0),($vararg_buffer1|0))|0);
      $32 = __THREW__; __THREW__ = 0;
      $33 = $32&1;
      if ($33) {
       label = 8;
       break;
      }
      $0 = 0;
      $4 = 1;
      __ZN6SolverD2Ev($S);
      $368 = $0;
      STACKTOP = sp;return ($368|0);
     }
     HEAP32[376>>2] = $S;
     $36 = HEAP32[_stdout>>2]|0;
     __THREW__ = 0;
     (invoke_iiii(1,($36|0),(456|0),($vararg_buffer3|0))|0);
     $37 = __THREW__; __THREW__ = 0;
     $38 = $37&1;
     if ($38) {
      label = 8;
     } else {
      $39 = HEAP32[_stdout>>2]|0;
      __THREW__ = 0;
      (invoke_iiii(1,($39|0),(544|0),($vararg_buffer5|0))|0);
      $40 = __THREW__; __THREW__ = 0;
      $41 = $40&1;
      if ($41) {
       label = 8;
      } else {
       $i = 0;
       while(1) {
        $42 = $i;
        $43 = ($42|0)<(9);
        if (!($43)) {
         break;
        }
        $j = 0;
        while(1) {
         $44 = $j;
         $45 = ($44|0)<(9);
         if (!($45)) {
          break;
         }
         $k = 0;
         while(1) {
          $46 = $k;
          $47 = ($46|0)<(9);
          if (!($47)) {
           break;
          }
          __THREW__ = 0;
          $48 = (invoke_iiii(4,($S|0),1,1)|0);
          $49 = __THREW__; __THREW__ = 0;
          $50 = $49&1;
          if ($50) {
           label = 8;
           break L1;
          }
          $51 = $k;
          $52 = $j;
          $53 = $i;
          $54 = (($vars) + (($53*324)|0)|0);
          $55 = (($54) + (($52*36)|0)|0);
          $56 = (($55) + ($51<<2)|0);
          HEAP32[$56>>2] = $48;
          $57 = $k;
          $58 = (($57) + 1)|0;
          $k = $58;
         }
         $59 = $j;
         $60 = (($59) + 1)|0;
         $j = $60;
        }
        $61 = $i;
        $62 = (($61) + 1)|0;
        $i = $62;
       }
       __THREW__ = 0;
       (invoke_ii(5,(632|0))|0);
       $63 = __THREW__; __THREW__ = 0;
       $64 = $63&1;
       if ($64) {
        label = 8;
       } else {
        $i1 = 0;
        L30: while(1) {
         $65 = $i1;
         $66 = ($65|0)<(9);
         if (!($66)) {
          break;
         }
         $j2 = 0;
         while(1) {
          $67 = $j2;
          $68 = ($67|0)<(9);
          if (!($68)) {
           break;
          }
          $69 = $i1;
          $70 = ($69*9)|0;
          $71 = $j2;
          $72 = (($70) + ($71))|0;
          $73 = $1;
          $74 = (($73) + ($72)|0);
          $75 = HEAP8[$74>>0]|0;
          $c = $75;
          $76 = $c;
          $77 = $76 << 24 >> 24;
          __THREW__ = 0;
          (invoke_ii(6,($77|0))|0);
          $78 = __THREW__; __THREW__ = 0;
          $79 = $78&1;
          if ($79) {
           label = 8;
           break L1;
          }
          $80 = $c;
          $81 = $80 << 24 >> 24;
          $82 = (49)<=($81|0);
          if ($82) {
           $83 = $c;
           $84 = $83 << 24 >> 24;
           $85 = ($84|0)<=(57);
           if ($85) {
            __THREW__ = 0;
            invoke_vi(7,($clause|0));
            $86 = __THREW__; __THREW__ = 0;
            $87 = $86&1;
            if ($87) {
             label = 8;
             break L1;
            }
            $88 = $c;
            $89 = $88 << 24 >> 24;
            $90 = (($89) - 49)|0;
            $91 = $j2;
            $92 = $i1;
            $93 = (($vars) + (($92*324)|0)|0);
            $94 = (($93) + (($91*36)|0)|0);
            $95 = (($94) + ($90<<2)|0);
            $96 = HEAP32[$95>>2]|0;
            __THREW__ = 0;
            invoke_viii(8,($5|0),($96|0),0);
            $97 = __THREW__; __THREW__ = 0;
            $98 = $97&1;
            if ($98) {
             label = 38;
             break L30;
            }
            __THREW__ = 0;
            invoke_vii(9,($clause|0),($5|0));
            $99 = __THREW__; __THREW__ = 0;
            $100 = $99&1;
            if ($100) {
             label = 38;
             break L30;
            }
            __THREW__ = 0;
            (invoke_iii(10,($S|0),($clause|0))|0);
            $101 = __THREW__; __THREW__ = 0;
            $102 = $101&1;
            if ($102) {
             label = 38;
             break L30;
            }
            __THREW__ = 0;
            invoke_vi(11,($clause|0));
            $103 = __THREW__; __THREW__ = 0;
            $104 = $103&1;
            if ($104) {
             label = 8;
             break L1;
            }
           }
          }
          $109 = $j2;
          $110 = (($109) + 1)|0;
          $j2 = $110;
         }
         __THREW__ = 0;
         (invoke_ii(6,10)|0);
         $111 = __THREW__; __THREW__ = 0;
         $112 = $111&1;
         if ($112) {
          label = 8;
          break L1;
         }
         $113 = $i1;
         $114 = (($113) + 1)|0;
         $i1 = $114;
        }
        if ((label|0) == 38) {
         $105 = ___cxa_find_matching_catch(-1,-1)|0;
         $106 = tempRet0;
         $2 = $105;
         $3 = $106;
         __THREW__ = 0;
         invoke_vi(11,($clause|0));
         $107 = __THREW__; __THREW__ = 0;
         $108 = $107&1;
         if ($108) {
          $373 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
          $374 = tempRet0;
          ___clang_call_terminate($373);
          // unreachable;
         } else {
          break;
         }
        }
        __THREW__ = 0;
        (invoke_ii(5,(632|0))|0);
        $115 = __THREW__; __THREW__ = 0;
        $116 = $115&1;
        if ($116) {
         label = 8;
        } else {
         $i3 = 0;
         L57: while(1) {
          $117 = $i3;
          $118 = ($117|0)<(9);
          if (!($118)) {
           break;
          }
          $j4 = 0;
          while(1) {
           $119 = $j4;
           $120 = ($119|0)<(9);
           if (!($120)) {
            break;
           }
           __THREW__ = 0;
           invoke_vi(7,($lits|0));
           $121 = __THREW__; __THREW__ = 0;
           $122 = $121&1;
           if ($122) {
            label = 8;
            break L1;
           }
           $k5 = 0;
           while(1) {
            $123 = $k5;
            $124 = ($123|0)<(9);
            if (!($124)) {
             break;
            }
            $125 = $k5;
            $126 = $j4;
            $127 = $i3;
            $128 = (($vars) + (($127*324)|0)|0);
            $129 = (($128) + (($126*36)|0)|0);
            $130 = (($129) + ($125<<2)|0);
            $131 = HEAP32[$130>>2]|0;
            __THREW__ = 0;
            invoke_viii(8,($6|0),($131|0),0);
            $132 = __THREW__; __THREW__ = 0;
            $133 = $132&1;
            if ($133) {
             label = 57;
             break L57;
            }
            __THREW__ = 0;
            invoke_vii(9,($lits|0),($6|0));
            $134 = __THREW__; __THREW__ = 0;
            $135 = $134&1;
            if ($135) {
             label = 57;
             break L57;
            }
            $136 = $k5;
            $137 = (($136) + 1)|0;
            $k5 = $137;
           }
           __THREW__ = 0;
           invoke_vii(12,($S|0),($lits|0));
           $142 = __THREW__; __THREW__ = 0;
           $143 = $142&1;
           if ($143) {
            label = 57;
            break L57;
           }
           __THREW__ = 0;
           invoke_vi(11,($lits|0));
           $144 = __THREW__; __THREW__ = 0;
           $145 = $144&1;
           if ($145) {
            label = 8;
            break L1;
           }
           $146 = $j4;
           $147 = (($146) + 1)|0;
           $j4 = $147;
          }
          $148 = $i3;
          $149 = (($148) + 1)|0;
          $i3 = $149;
         }
         if ((label|0) == 57) {
          $138 = ___cxa_find_matching_catch(-1,-1)|0;
          $139 = tempRet0;
          $2 = $138;
          $3 = $139;
          __THREW__ = 0;
          invoke_vi(11,($lits|0));
          $140 = __THREW__; __THREW__ = 0;
          $141 = $140&1;
          if ($141) {
           $373 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
           $374 = tempRet0;
           ___clang_call_terminate($373);
           // unreachable;
          } else {
           break;
          }
         }
         $k6 = 0;
         L82: while(1) {
          $150 = $k6;
          $151 = ($150|0)<(9);
          if (!($151)) {
           label = 122;
           break;
          }
          $i7 = 0;
          while(1) {
           $152 = $i7;
           $153 = ($152|0)<(9);
           if (!($153)) {
            break;
           }
           __THREW__ = 0;
           invoke_vi(7,($lits8|0));
           $154 = __THREW__; __THREW__ = 0;
           $155 = $154&1;
           if ($155) {
            label = 8;
            break L1;
           }
           $j9 = 0;
           while(1) {
            $156 = $j9;
            $157 = ($156|0)<(9);
            if (!($157)) {
             break;
            }
            $158 = $k6;
            $159 = $j9;
            $160 = $i7;
            $161 = (($vars) + (($160*324)|0)|0);
            $162 = (($161) + (($159*36)|0)|0);
            $163 = (($162) + ($158<<2)|0);
            $164 = HEAP32[$163>>2]|0;
            __THREW__ = 0;
            invoke_viii(8,($7|0),($164|0),0);
            $165 = __THREW__; __THREW__ = 0;
            $166 = $165&1;
            if ($166) {
             label = 76;
             break L82;
            }
            __THREW__ = 0;
            invoke_vii(9,($lits8|0),($7|0));
            $167 = __THREW__; __THREW__ = 0;
            $168 = $167&1;
            if ($168) {
             label = 76;
             break L82;
            }
            $169 = $j9;
            $170 = (($169) + 1)|0;
            $j9 = $170;
           }
           __THREW__ = 0;
           invoke_vii(12,($S|0),($lits8|0));
           $175 = __THREW__; __THREW__ = 0;
           $176 = $175&1;
           if ($176) {
            label = 76;
            break L82;
           }
           __THREW__ = 0;
           invoke_vi(11,($lits8|0));
           $177 = __THREW__; __THREW__ = 0;
           $178 = $177&1;
           if ($178) {
            label = 8;
            break L1;
           }
           $179 = $i7;
           $180 = (($179) + 1)|0;
           $i7 = $180;
          }
          $j10 = 0;
          while(1) {
           $181 = $j10;
           $182 = ($181|0)<(9);
           if (!($182)) {
            break;
           }
           __THREW__ = 0;
           invoke_vi(7,($lits11|0));
           $183 = __THREW__; __THREW__ = 0;
           $184 = $183&1;
           if ($184) {
            label = 8;
            break L1;
           }
           $i12 = 0;
           while(1) {
            $185 = $i12;
            $186 = ($185|0)<(9);
            if (!($186)) {
             break;
            }
            $187 = $k6;
            $188 = $j10;
            $189 = $i12;
            $190 = (($vars) + (($189*324)|0)|0);
            $191 = (($190) + (($188*36)|0)|0);
            $192 = (($191) + ($187<<2)|0);
            $193 = HEAP32[$192>>2]|0;
            __THREW__ = 0;
            invoke_viii(8,($8|0),($193|0),0);
            $194 = __THREW__; __THREW__ = 0;
            $195 = $194&1;
            if ($195) {
             label = 91;
             break L82;
            }
            __THREW__ = 0;
            invoke_vii(9,($lits11|0),($8|0));
            $196 = __THREW__; __THREW__ = 0;
            $197 = $196&1;
            if ($197) {
             label = 91;
             break L82;
            }
            $198 = $i12;
            $199 = (($198) + 1)|0;
            $i12 = $199;
           }
           __THREW__ = 0;
           invoke_vii(12,($S|0),($lits11|0));
           $204 = __THREW__; __THREW__ = 0;
           $205 = $204&1;
           if ($205) {
            label = 91;
            break L82;
           }
           __THREW__ = 0;
           invoke_vi(11,($lits11|0));
           $206 = __THREW__; __THREW__ = 0;
           $207 = $206&1;
           if ($207) {
            label = 8;
            break L1;
           }
           $208 = $j10;
           $209 = (($208) + 1)|0;
           $j10 = $209;
          }
          $i0 = 0;
          while(1) {
           $210 = $i0;
           $211 = ($210|0)<(3);
           if (!($211)) {
            break;
           }
           $j0 = 0;
           while(1) {
            $212 = $j0;
            $213 = ($212|0)<(3);
            if (!($213)) {
             break;
            }
            __THREW__ = 0;
            invoke_vi(7,($lits13|0));
            $214 = __THREW__; __THREW__ = 0;
            $215 = $214&1;
            if ($215) {
             label = 8;
             break L1;
            }
            $i114 = 0;
            while(1) {
             $216 = $i114;
             $217 = ($216|0)<(3);
             if (!($217)) {
              break;
             }
             $j1 = 0;
             while(1) {
              $218 = $j1;
              $219 = ($218|0)<(3);
              if (!($219)) {
               break;
              }
              $220 = $k6;
              $221 = $j0;
              $222 = ($221*3)|0;
              $223 = $j1;
              $224 = (($222) + ($223))|0;
              $225 = $i0;
              $226 = ($225*3)|0;
              $227 = $i114;
              $228 = (($226) + ($227))|0;
              $229 = (($vars) + (($228*324)|0)|0);
              $230 = (($229) + (($224*36)|0)|0);
              $231 = (($230) + ($220<<2)|0);
              $232 = HEAP32[$231>>2]|0;
              __THREW__ = 0;
              invoke_viii(8,($9|0),($232|0),0);
              $233 = __THREW__; __THREW__ = 0;
              $234 = $233&1;
              if ($234) {
               label = 110;
               break L82;
              }
              __THREW__ = 0;
              invoke_vii(9,($lits13|0),($9|0));
              $235 = __THREW__; __THREW__ = 0;
              $236 = $235&1;
              if ($236) {
               label = 110;
               break L82;
              }
              $237 = $j1;
              $238 = (($237) + 1)|0;
              $j1 = $238;
             }
             $243 = $i114;
             $244 = (($243) + 1)|0;
             $i114 = $244;
            }
            __THREW__ = 0;
            invoke_vii(12,($S|0),($lits13|0));
            $245 = __THREW__; __THREW__ = 0;
            $246 = $245&1;
            if ($246) {
             label = 110;
             break L82;
            }
            __THREW__ = 0;
            invoke_vi(11,($lits13|0));
            $247 = __THREW__; __THREW__ = 0;
            $248 = $247&1;
            if ($248) {
             label = 8;
             break L1;
            }
            $249 = $j0;
            $250 = (($249) + 1)|0;
            $j0 = $250;
           }
           $251 = $i0;
           $252 = (($251) + 1)|0;
           $i0 = $252;
          }
          $253 = $k6;
          $254 = (($253) + 1)|0;
          $k6 = $254;
         }
         if ((label|0) == 76) {
          $171 = ___cxa_find_matching_catch(-1,-1)|0;
          $172 = tempRet0;
          $2 = $171;
          $3 = $172;
          __THREW__ = 0;
          invoke_vi(11,($lits8|0));
          $173 = __THREW__; __THREW__ = 0;
          $174 = $173&1;
          if ($174) {
           $373 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
           $374 = tempRet0;
           ___clang_call_terminate($373);
           // unreachable;
          } else {
           break;
          }
         }
         else if ((label|0) == 91) {
          $200 = ___cxa_find_matching_catch(-1,-1)|0;
          $201 = tempRet0;
          $2 = $200;
          $3 = $201;
          __THREW__ = 0;
          invoke_vi(11,($lits11|0));
          $202 = __THREW__; __THREW__ = 0;
          $203 = $202&1;
          if ($203) {
           $373 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
           $374 = tempRet0;
           ___clang_call_terminate($373);
           // unreachable;
          } else {
           break;
          }
         }
         else if ((label|0) == 110) {
          $239 = ___cxa_find_matching_catch(-1,-1)|0;
          $240 = tempRet0;
          $2 = $239;
          $3 = $240;
          __THREW__ = 0;
          invoke_vi(11,($lits13|0));
          $241 = __THREW__; __THREW__ = 0;
          $242 = $241&1;
          if ($242) {
           $373 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
           $374 = tempRet0;
           ___clang_call_terminate($373);
           // unreachable;
          } else {
           break;
          }
         }
         else if ((label|0) == 122) {
          __THREW__ = 0;
          $255 = (+invoke_d(2));
          $256 = __THREW__; __THREW__ = 0;
          $257 = $256&1;
          if ($257) {
           label = 8;
           break;
          }
          $258 = $cpu_time;
          $259 = $255 - $258;
          $parse_time = $259;
          $260 = HEAP32[_stdout>>2]|0;
          $261 = $parse_time;
          __THREW__ = 0;
          HEAPF64[tempDoublePtr>>3]=$261;HEAP32[$vararg_buffer7>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_buffer7+4>>2]=HEAP32[tempDoublePtr+4>>2];
          (invoke_iiii(1,($260|0),(648|0),($vararg_buffer7|0))|0);
          $262 = __THREW__; __THREW__ = 0;
          $263 = $262&1;
          if ($263) {
           label = 8;
           break;
          }
          __THREW__ = 0;
          $264 = (invoke_ii(13,($S|0))|0);
          $265 = __THREW__; __THREW__ = 0;
          $266 = $265&1;
          if ($266) {
           label = 8;
           break;
          }
          if (!($264)) {
           $267 = HEAP32[_stdout>>2]|0;
           __THREW__ = 0;
           (invoke_iiii(1,($267|0),(728|0),($vararg_buffer10|0))|0);
           $268 = __THREW__; __THREW__ = 0;
           $269 = $268&1;
           if ($269) {
            label = 8;
            break;
           }
           __THREW__ = 0;
           (invoke_iii(14,(760|0),($vararg_buffer12|0))|0);
           $270 = __THREW__; __THREW__ = 0;
           $271 = $270&1;
           if ($271) {
            label = 8;
            break;
           }
           $0 = 0;
           $4 = 1;
           __ZN6SolverD2Ev($S);
           $368 = $0;
           STACKTOP = sp;return ($368|0);
          }
          __THREW__ = 0;
          $272 = (invoke_ii(15,($S|0))|0);
          $273 = __THREW__; __THREW__ = 0;
          $274 = $273&1;
          if ($274) {
           label = 8;
           break;
          }
          $275 = $272&1;
          $ret = $275;
          __THREW__ = 0;
          invoke_vi(16,($S|0));
          $276 = __THREW__; __THREW__ = 0;
          $277 = $276&1;
          if ($277) {
           label = 8;
           break;
          }
          $278 = HEAP32[_stdout>>2]|0;
          __THREW__ = 0;
          (invoke_iiii(1,($278|0),(384|0),($vararg_buffer14|0))|0);
          $279 = __THREW__; __THREW__ = 0;
          $280 = $279&1;
          if ($280) {
           label = 8;
           break;
          }
          $281 = $ret;
          $282 = $281&1;
          $283 = $282 ? 776 : 760;
          __THREW__ = 0;
          (invoke_iii(14,($283|0),($vararg_buffer16|0))|0);
          $284 = __THREW__; __THREW__ = 0;
          $285 = $284&1;
          if ($285) {
           label = 8;
           break;
          }
          $286 = $ret;
          $287 = $286&1;
          if (!($287)) {
           __THREW__ = 0;
           (invoke_iii(14,(928|0),($vararg_buffer27|0))|0);
           $366 = __THREW__; __THREW__ = 0;
           $367 = $366&1;
           if ($367) {
            label = 8;
            break;
           }
           $0 = 0;
           $4 = 1;
           __ZN6SolverD2Ev($S);
           $368 = $0;
           STACKTOP = sp;return ($368|0);
          }
          __THREW__ = 0;
          (invoke_iii(14,(792|0),($vararg_buffer18|0))|0);
          $288 = __THREW__; __THREW__ = 0;
          $289 = $288&1;
          if ($289) {
           label = 8;
           break;
          }
          $i15 = 0;
          while(1) {
           $290 = $i15;
           __THREW__ = 0;
           $291 = (invoke_ii(17,($S|0))|0);
           $292 = __THREW__; __THREW__ = 0;
           $293 = $292&1;
           if ($293) {
            label = 8;
            break L1;
           }
           $294 = ($290|0)<($291|0);
           if (!($294)) {
            break;
           }
           $295 = $i15;
           __THREW__ = 0;
           $296 = (invoke_iii(18,($S|0),($295|0))|0);
           $297 = __THREW__; __THREW__ = 0;
           $298 = $297&1;
           if ($298) {
            label = 8;
            break L1;
           }
           ;HEAP8[$10+0>>0]=HEAP8[40+0>>0]|0;
           __THREW__ = 0;
           ;HEAP8[$$byval_copy+0>>0]=HEAP8[$10+0>>0]|0;
           $299 = (invoke_iii(19,($296|0),($$byval_copy|0))|0);
           $300 = __THREW__; __THREW__ = 0;
           $301 = $300&1;
           if ($301) {
            label = 8;
            break L1;
           }
           if ($299) {
            $302 = $i15;
            $303 = ($302|0)==(0);
            $304 = $303 ? 808 : 816;
            $305 = $i15;
            __THREW__ = 0;
            $306 = (invoke_iii(18,($S|0),($305|0))|0);
            $307 = __THREW__; __THREW__ = 0;
            $308 = $307&1;
            if ($308) {
             label = 8;
             break L1;
            }
            ;HEAP8[$11+0>>0]=HEAP8[24+0>>0]|0;
            __THREW__ = 0;
            ;HEAP8[$$byval_copy29+0>>0]=HEAP8[$11+0>>0]|0;
            $309 = (invoke_iii(20,($306|0),($$byval_copy29|0))|0);
            $310 = __THREW__; __THREW__ = 0;
            $311 = $310&1;
            if ($311) {
             label = 8;
             break L1;
            }
            $312 = $309 ? 808 : 824;
            $313 = $i15;
            $314 = (($313) + 1)|0;
            __THREW__ = 0;
            HEAP32[$vararg_buffer20>>2] = $304;
            $vararg_ptr23 = (($vararg_buffer20) + 4|0);
            HEAP32[$vararg_ptr23>>2] = $312;
            $vararg_ptr24 = (($vararg_buffer20) + 8|0);
            HEAP32[$vararg_ptr24>>2] = $314;
            (invoke_iii(14,(800|0),($vararg_buffer20|0))|0);
            $315 = __THREW__; __THREW__ = 0;
            $316 = $315&1;
            if ($316) {
             label = 8;
             break L1;
            }
           }
           $317 = $i15;
           $318 = (($317) + 1)|0;
           $i15 = $318;
          }
          __THREW__ = 0;
          (invoke_iii(14,(832|0),($vararg_buffer25|0))|0);
          $319 = __THREW__; __THREW__ = 0;
          $320 = $319&1;
          if ($320) {
           label = 8;
           break;
          }
          HEAP8[((840 + 81|0))>>0] = 0;
          __THREW__ = 0;
          (invoke_ii(5,(632|0))|0);
          $321 = __THREW__; __THREW__ = 0;
          $322 = $321&1;
          if ($322) {
           label = 8;
           break;
          }
          $i16 = 0;
          while(1) {
           $323 = $i16;
           $324 = ($323|0)<(9);
           if (!($324)) {
            break;
           }
           $j17 = 0;
           while(1) {
            $325 = $j17;
            $326 = ($325|0)<(9);
            if (!($326)) {
             break;
            }
            $c18 = 32;
            $k19 = 0;
            while(1) {
             $327 = $k19;
             $328 = ($327|0)<(9);
             if (!($328)) {
              break;
             }
             $329 = $k19;
             $330 = $j17;
             $331 = $i16;
             $332 = (($vars) + (($331*324)|0)|0);
             $333 = (($332) + (($330*36)|0)|0);
             $334 = (($333) + ($329<<2)|0);
             $335 = HEAP32[$334>>2]|0;
             __THREW__ = 0;
             invoke_viii(8,($12|0),($335|0),0);
             $336 = __THREW__; __THREW__ = 0;
             $337 = $336&1;
             if ($337) {
              label = 8;
              break L1;
             }
             __THREW__ = 0;
             ;HEAP32[$$byval_copy30+0>>2]=HEAP32[$12+0>>2]|0;
             invoke_viii(21,($13|0),($S|0),($$byval_copy30|0));
             $338 = __THREW__; __THREW__ = 0;
             $339 = $338&1;
             if ($339) {
              label = 8;
              break L1;
             }
             ;HEAP8[$14+0>>0]=HEAP8[24+0>>0]|0;
             __THREW__ = 0;
             ;HEAP8[$$byval_copy31+0>>0]=HEAP8[$14+0>>0]|0;
             $340 = (invoke_iii(20,($13|0),($$byval_copy31|0))|0);
             $341 = __THREW__; __THREW__ = 0;
             $342 = $341&1;
             if ($342) {
              label = 8;
              break L1;
             }
             if ($340) {
              label = 159;
              break;
             }
             $346 = $k19;
             $347 = (($346) + 1)|0;
             $k19 = $347;
            }
            if ((label|0) == 159) {
             label = 0;
             $343 = $k19;
             $344 = (49 + ($343))|0;
             $345 = $344&255;
             $c18 = $345;
            }
            $348 = $c18;
            $349 = $i16;
            $350 = ($349*9)|0;
            $351 = $j17;
            $352 = (($350) + ($351))|0;
            $353 = (840 + ($352)|0);
            HEAP8[$353>>0] = $348;
            $354 = $c18;
            $355 = $354 << 24 >> 24;
            __THREW__ = 0;
            (invoke_ii(6,($355|0))|0);
            $356 = __THREW__; __THREW__ = 0;
            $357 = $356&1;
            if ($357) {
             label = 8;
             break L1;
            }
            $358 = $j17;
            $359 = (($358) + 1)|0;
            $j17 = $359;
           }
           __THREW__ = 0;
           (invoke_ii(6,10)|0);
           $360 = __THREW__; __THREW__ = 0;
           $361 = $360&1;
           if ($361) {
            label = 8;
            break L1;
           }
           $362 = $i16;
           $363 = (($362) + 1)|0;
           $i16 = $363;
          }
          __THREW__ = 0;
          (invoke_ii(5,(632|0))|0);
          $364 = __THREW__; __THREW__ = 0;
          $365 = $364&1;
          if ($365) {
           label = 8;
           break;
          }
          $0 = 840;
          $4 = 1;
          __ZN6SolverD2Ev($S);
          $368 = $0;
          STACKTOP = sp;return ($368|0);
         }
        }
       }
      }
     }
    }
   }
  }
 } while(0);
 if ((label|0) == 8) {
  $34 = ___cxa_find_matching_catch(-1,-1)|0;
  $35 = tempRet0;
  $2 = $34;
  $3 = $35;
 }
 __THREW__ = 0;
 invoke_vi(22,($S|0));
 $369 = __THREW__; __THREW__ = 0;
 $370 = $369&1;
 if ($370) {
  $373 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $374 = tempRet0;
  ___clang_call_terminate($373);
  // unreachable;
 }
 $371 = $2;
 $372 = $3;
 ___resumeException($371|0);
 // unreachable;
 return 0|0;
}
function __ZN3vecI3LitEC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecI3LitEC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecI3LitE4pushERKS0_($this,$elem) {
 $this = $this|0;
 $elem = $elem|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $elem;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (($2) + 8|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($4|0)==($6|0);
 if ($7) {
  $8 = (($2) + 8|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($9*3)|0;
  $11 = (($10) + 1)|0;
  $12 = $11 >> 1;
  $13 = (__ZN3vecI3LitE4imaxEii(2,$12)|0);
  $14 = (($2) + 8|0);
  HEAP32[$14>>2] = $13;
  $15 = HEAP32[$2>>2]|0;
  $16 = (($2) + 8|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $17<<2;
  $19 = (_realloc($15,$18)|0);
  HEAP32[$2>>2] = $19;
 }
 $20 = (($2) + 4|0);
 $21 = HEAP32[$20>>2]|0;
 $22 = (($21) + 1)|0;
 HEAP32[$20>>2] = $22;
 $23 = HEAP32[$2>>2]|0;
 $24 = (($23) + ($21<<2)|0);
 $25 = $1;
 ;HEAP32[$24+0>>2]=HEAP32[$25+0>>2]|0;
 STACKTOP = sp;return;
}
function __ZN3vecI3LitED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecI3LitED2Ev($1);
 STACKTOP = sp;return;
}
function ___clang_call_terminate($0) {
 $0 = $0|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 (___cxa_begin_catch(($0|0))|0);
 __ZSt9terminatev();
 // unreachable;
}
function __ZL10exactlyOneR6SolverR3vecI3LitE($S,$ps) {
 $S = $S|0;
 $ps = $ps|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $clause = 0, $i = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $$byval_copy1 = sp + 44|0;
 $$byval_copy = sp + 36|0;
 $clause = sp + 48|0;
 $2 = sp + 8|0;
 $3 = sp + 4|0;
 $6 = sp + 28|0;
 $7 = sp;
 $0 = $S;
 $1 = $ps;
 $8 = $0;
 $9 = $1;
 (__ZN6Solver9addClauseER3vecI3LitE($8,$9)|0);
 $i = 0;
 L1: while(1) {
  $10 = $i;
  $11 = $1;
  $12 = (__ZNK3vecI3LitE4sizeEv($11)|0);
  $13 = ($10|0)<($12|0);
  if (!($13)) {
   label = 18;
   break;
  }
  $14 = $i;
  $15 = (($14) + 1)|0;
  $j = $15;
  while(1) {
   $16 = $j;
   $17 = $1;
   $18 = (__ZNK3vecI3LitE4sizeEv($17)|0);
   $19 = ($16|0)<($18|0);
   if (!($19)) {
    break;
   }
   __ZN3vecI3LitEC1Ev($clause);
   $20 = $1;
   $21 = $i;
   __THREW__ = 0;
   $22 = (invoke_iii(23,($20|0),($21|0))|0);
   $23 = __THREW__; __THREW__ = 0;
   $24 = $23&1;
   if ($24) {
    break L1;
   }
   ;HEAP32[$3+0>>2]=HEAP32[$22+0>>2]|0;
   __THREW__ = 0;
   ;HEAP32[$$byval_copy+0>>2]=HEAP32[$3+0>>2]|0;
   invoke_vii(24,($2|0),($$byval_copy|0));
   $25 = __THREW__; __THREW__ = 0;
   $26 = $25&1;
   if ($26) {
    break L1;
   }
   __THREW__ = 0;
   invoke_vii(9,($clause|0),($2|0));
   $27 = __THREW__; __THREW__ = 0;
   $28 = $27&1;
   if ($28) {
    break L1;
   }
   $29 = $1;
   $30 = $j;
   __THREW__ = 0;
   $31 = (invoke_iii(23,($29|0),($30|0))|0);
   $32 = __THREW__; __THREW__ = 0;
   $33 = $32&1;
   if ($33) {
    break L1;
   }
   ;HEAP32[$7+0>>2]=HEAP32[$31+0>>2]|0;
   __THREW__ = 0;
   ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$7+0>>2]|0;
   invoke_vii(24,($6|0),($$byval_copy1|0));
   $34 = __THREW__; __THREW__ = 0;
   $35 = $34&1;
   if ($35) {
    break L1;
   }
   __THREW__ = 0;
   invoke_vii(9,($clause|0),($6|0));
   $36 = __THREW__; __THREW__ = 0;
   $37 = $36&1;
   if ($37) {
    break L1;
   }
   $38 = $0;
   __THREW__ = 0;
   (invoke_iii(10,($38|0),($clause|0))|0);
   $39 = __THREW__; __THREW__ = 0;
   $40 = $39&1;
   if ($40) {
    break L1;
   }
   __ZN3vecI3LitED1Ev($clause);
   $41 = $j;
   $42 = (($41) + 1)|0;
   $j = $42;
  }
  $47 = $i;
  $48 = (($47) + 1)|0;
  $i = $48;
 }
 if ((label|0) == 18) {
  STACKTOP = sp;return;
 }
 $43 = ___cxa_find_matching_catch(-1,-1)|0;
 $44 = tempRet0;
 $4 = $43;
 $5 = $44;
 __THREW__ = 0;
 invoke_vi(11,($clause|0));
 $45 = __THREW__; __THREW__ = 0;
 $46 = $45&1;
 if ($46) {
  $51 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $52 = tempRet0;
  ___clang_call_terminate($51);
  // unreachable;
 }
 $49 = $4;
 $50 = $5;
 ___resumeException($49|0);
 // unreachable;
}
function __ZN6Solver5solveEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $tmp = sp + 12|0;
 $0 = $this;
 $4 = $0;
 __ZN3vecI3LitEC1Ev($tmp);
 __THREW__ = 0;
 $5 = (invoke_iii(25,($4|0),($tmp|0))|0);
 $6 = __THREW__; __THREW__ = 0;
 $7 = $6&1;
 if (!($7)) {
  $3 = 1;
  __ZN3vecI3LitED1Ev($tmp);
  STACKTOP = sp;return ($5|0);
 }
 $8 = ___cxa_find_matching_catch(-1,-1)|0;
 $9 = tempRet0;
 $1 = $8;
 $2 = $9;
 __THREW__ = 0;
 invoke_vi(11,($tmp|0));
 $10 = __THREW__; __THREW__ = 0;
 $11 = $10&1;
 if ($11) {
  $14 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $15 = tempRet0;
  ___clang_call_terminate($14);
  // unreachable;
 }
 $12 = $1;
 $13 = $2;
 ___resumeException($12|0);
 // unreachable;
 return 0|0;
}
function __ZNK6Solver5nVarsEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 244|0);
 $3 = (__ZNK3vecIcE4sizeEv($2)|0);
 STACKTOP = sp;return ($3|0);
}
function __ZN3vecI5lboolEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZNK5lboolneES_($this,$b) {
 $this = $this|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP8[$1>>0]|0;
 $3 = $2 << 24 >> 24;
 $4 = HEAP8[$b>>0]|0;
 $5 = $4 << 24 >> 24;
 $6 = ($3|0)!=($5|0);
 STACKTOP = sp;return ($6|0);
}
function __ZNK5lbooleqES_($this,$b) {
 $this = $this|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP8[$1>>0]|0;
 $3 = $2 << 24 >> 24;
 $4 = HEAP8[$b>>0]|0;
 $5 = $4 << 24 >> 24;
 $6 = ($3|0)==($5|0);
 STACKTOP = sp;return ($6|0);
}
function __ZNK6Solver10modelValueE3Lit($agg$result,$this,$p) {
 $agg$result = $agg$result|0;
 $this = $this|0;
 $p = $p|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy1 = sp + 16|0;
 $$byval_copy = sp + 12|0;
 $1 = sp + 4|0;
 $2 = sp;
 $0 = $this;
 $3 = $0;
 ;HEAP32[$1+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$1+0>>2]|0;
 $4 = (__Z3var3Lit($$byval_copy)|0);
 $5 = (__ZNK3vecI5lboolEixEi($3,$4)|0);
 ;HEAP32[$2+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$2+0>>2]|0;
 $6 = (__Z4sign3Lit($$byval_copy1)|0);
 __ZNK5lbooleoEb($agg$result,$5,$6);
 STACKTOP = sp;return;
}
function _sudoku_c($sudokudata) {
 $sudokudata = $sudokudata|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $sudokudata;
 $1 = $0;
 $2 = (__Z6sudokuPKc($1)|0);
 STACKTOP = sp;return ($2|0);
}
function __ZN3vecI3LitE4imaxEii($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mask = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $x;
 $1 = $y;
 $2 = $1;
 $3 = $0;
 $4 = (($2) - ($3))|0;
 $5 = $4 >> 31;
 $mask = $5;
 $6 = $0;
 $7 = $mask;
 $8 = $6 & $7;
 $9 = $1;
 $10 = $mask;
 $11 = $10 ^ -1;
 $12 = $9 & $11;
 $13 = (($8) + ($12))|0;
 STACKTOP = sp;return ($13|0);
}
function __ZN3vecI3LitED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecI3LitE5clearEb($1,1);
 STACKTOP = sp;return;
}
function __ZN3vecI3LitE5clearEb($this,$dealloc) {
 $this = $this|0;
 $dealloc = $dealloc|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $dealloc&1;
 $1 = $2;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($3) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $12 = (($3) + 4|0);
 HEAP32[$12>>2] = 0;
 $13 = $1;
 $14 = $13&1;
 if ($14) {
  $15 = HEAP32[$3>>2]|0;
  _free($15);
  HEAP32[$3>>2] = 0;
  $16 = (($3) + 8|0);
  HEAP32[$16>>2] = 0;
 }
 STACKTOP = sp;return;
}
function __ZN3vecI3LitEC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = (($1) + 4|0);
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 8|0);
 HEAP32[$3>>2] = 0;
 STACKTOP = sp;return;
}
function __ZNK3vecI5lboolEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3)|0);
 STACKTOP = sp;return ($5|0);
}
function __Z3var3Lit($p) {
 $p = $p|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$p>>2]|0;
 $1 = $0 >> 1;
 STACKTOP = sp;return ($1|0);
}
function __ZNK5lbooleoEb($agg$result,$this,$b) {
 $agg$result = $agg$result|0;
 $this = $this|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $b&1;
 $1 = $2;
 $3 = $0;
 $4 = $1;
 $5 = $4&1;
 if ($5) {
  $6 = HEAP8[$3>>0]|0;
  $7 = $6 << 24 >> 24;
  $8 = (0 - ($7))|0;
  __ZN5lboolC1Ei($agg$result,$8);
  STACKTOP = sp;return;
 } else {
  $9 = HEAP8[$3>>0]|0;
  $10 = $9 << 24 >> 24;
  __ZN5lboolC1Ei($agg$result,$10);
  STACKTOP = sp;return;
 }
}
function __Z4sign3Lit($p) {
 $p = $p|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$p>>2]|0;
 $1 = $0 & 1;
 $2 = ($1|0)!=(0);
 STACKTOP = sp;return ($2|0);
}
function __ZN5lboolC1Ei($this,$v) {
 $this = $this|0;
 $v = $v|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $v;
 $2 = $0;
 $3 = $1;
 __ZN5lboolC2Ei($2,$3);
 STACKTOP = sp;return;
}
function __ZN5lboolC2Ei($this,$v) {
 $this = $this|0;
 $v = $v|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $v;
 $2 = $0;
 $3 = $1;
 $4 = $3&255;
 HEAP8[$2>>0] = $4;
 STACKTOP = sp;return;
}
function __ZNK3vecIcE4sizeEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 STACKTOP = sp;return ($3|0);
}
function __ZNK3vecI3LitE4sizeEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 STACKTOP = sp;return ($3|0);
}
function __Zco3Lit($agg$result,$p) {
 $agg$result = $agg$result|0;
 $p = $p|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 __ZN3LitC1Ev($agg$result);
 $0 = HEAP32[$p>>2]|0;
 $1 = $0 ^ 1;
 HEAP32[$agg$result>>2] = $1;
 STACKTOP = sp;return;
}
function __ZN3vecI3LitEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<2)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZN3LitC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3LitC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3LitC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = -2;
 STACKTOP = sp;return;
}
function __ZN3LitC2Eib($this,$var,$sign) {
 $this = $this|0;
 $var = $var|0;
 $sign = $sign|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $var;
 $3 = $sign&1;
 $2 = $3;
 $4 = $0;
 $5 = $1;
 $6 = $1;
 $7 = (($5) + ($6))|0;
 $8 = $2;
 $9 = $8&1;
 $10 = $9&1;
 $11 = (($7) + ($10))|0;
 HEAP32[$4>>2] = $11;
 STACKTOP = sp;return;
}
function __GLOBAL__I_a() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 ___cxx_global_var_init();
 ___cxx_global_var_init1();
 ___cxx_global_var_init2();
 ___cxx_global_var_init3();
 ___cxx_global_var_init4();
 STACKTOP = sp;return;
}
function ___cxx_global_var_init66() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN3LitC1Eib(936,-1,0);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init167() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN3LitC1Eib(944,-1,1);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init268() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __Z7toLbooli(952,1);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init369() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __Z7toLbooli(960,-1);
 STACKTOP = sp;return;
}
function ___cxx_global_var_init470() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __Z7toLbooli(968,0);
 STACKTOP = sp;return;
}
function __ZN6SolverC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0;
 var $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0;
 var $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0;
 var $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0;
 var $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $3 = sp;
 $0 = $this;
 $4 = $0;
 __ZN3vecI5lboolEC1Ev($4);
 $5 = (($4) + 12|0);
 __THREW__ = 0;
 invoke_vi(7,($5|0));
 $6 = __THREW__; __THREW__ = 0;
 $7 = $6&1;
 L1: do {
  if ($7) {
   $130 = ___cxa_find_matching_catch(-1,-1)|0;
   $131 = tempRet0;
   $1 = $130;
   $2 = $131;
   label = 72;
  } else {
   $8 = (($4) + 24|0);
   HEAPF64[$8>>3] = 1.05263157894736836262;
   $9 = (($4) + 32|0);
   HEAPF64[$9>>3] = 1.00100100100100108946;
   $10 = (($4) + 40|0);
   HEAPF64[$10>>3] = 0.0200000000000000004163;
   $11 = (($4) + 48|0);
   HEAP32[$11>>2] = 100;
   $12 = (($4) + 56|0);
   HEAPF64[$12>>3] = 1.5;
   $13 = (($4) + 64|0);
   HEAPF64[$13>>3] = 0.33333333333333331483;
   $14 = (($4) + 72|0);
   HEAPF64[$14>>3] = 1.10000000000000008882;
   $15 = (($4) + 80|0);
   HEAP8[$15>>0] = 1;
   $16 = (($4) + 84|0);
   HEAP32[$16>>2] = 1;
   $17 = (($4) + 88|0);
   HEAP32[$17>>2] = 0;
   $18 = (($4) + 96|0);
   $19 = $18;
   $20 = $19;
   HEAP32[$20>>2] = 0;
   $21 = (($19) + 4)|0;
   $22 = $21;
   HEAP32[$22>>2] = 0;
   $23 = (($4) + 104|0);
   $24 = $23;
   $25 = $24;
   HEAP32[$25>>2] = 0;
   $26 = (($24) + 4)|0;
   $27 = $26;
   HEAP32[$27>>2] = 0;
   $28 = (($4) + 112|0);
   $29 = $28;
   $30 = $29;
   HEAP32[$30>>2] = 0;
   $31 = (($29) + 4)|0;
   $32 = $31;
   HEAP32[$32>>2] = 0;
   $33 = (($4) + 120|0);
   $34 = $33;
   $35 = $34;
   HEAP32[$35>>2] = 0;
   $36 = (($34) + 4)|0;
   $37 = $36;
   HEAP32[$37>>2] = 0;
   $38 = (($4) + 128|0);
   $39 = $38;
   $40 = $39;
   HEAP32[$40>>2] = 0;
   $41 = (($39) + 4)|0;
   $42 = $41;
   HEAP32[$42>>2] = 0;
   $43 = (($4) + 136|0);
   $44 = $43;
   $45 = $44;
   HEAP32[$45>>2] = 0;
   $46 = (($44) + 4)|0;
   $47 = $46;
   HEAP32[$47>>2] = 0;
   $48 = (($4) + 144|0);
   $49 = $48;
   $50 = $49;
   HEAP32[$50>>2] = 0;
   $51 = (($49) + 4)|0;
   $52 = $51;
   HEAP32[$52>>2] = 0;
   $53 = (($4) + 152|0);
   $54 = $53;
   $55 = $54;
   HEAP32[$55>>2] = 0;
   $56 = (($54) + 4)|0;
   $57 = $56;
   HEAP32[$57>>2] = 0;
   $58 = (($4) + 160|0);
   $59 = $58;
   $60 = $59;
   HEAP32[$60>>2] = 0;
   $61 = (($59) + 4)|0;
   $62 = $61;
   HEAP32[$62>>2] = 0;
   $63 = (($4) + 168|0);
   HEAP8[$63>>0] = 1;
   $64 = (($4) + 172|0);
   __THREW__ = 0;
   invoke_vi(26,($64|0));
   $65 = __THREW__; __THREW__ = 0;
   $66 = $65&1;
   if ($66) {
    $132 = ___cxa_find_matching_catch(-1,-1)|0;
    $133 = tempRet0;
    $1 = $132;
    $2 = $133;
   } else {
    $67 = (($4) + 184|0);
    __THREW__ = 0;
    invoke_vi(26,($67|0));
    $68 = __THREW__; __THREW__ = 0;
    $69 = $68&1;
    if ($69) {
     $134 = ___cxa_find_matching_catch(-1,-1)|0;
     $135 = tempRet0;
     $1 = $134;
     $2 = $135;
    } else {
     $70 = (($4) + 200|0);
     HEAPF64[$70>>3] = 1.0;
     $71 = (($4) + 208|0);
     __THREW__ = 0;
     invoke_vi(27,($71|0));
     $72 = __THREW__; __THREW__ = 0;
     $73 = $72&1;
     if ($73) {
      $136 = ___cxa_find_matching_catch(-1,-1)|0;
      $137 = tempRet0;
      $1 = $136;
      $2 = $137;
     } else {
      $74 = (($4) + 224|0);
      HEAPF64[$74>>3] = 1.0;
      $75 = (($4) + 232|0);
      __THREW__ = 0;
      invoke_vi(28,($75|0));
      $76 = __THREW__; __THREW__ = 0;
      $77 = $76&1;
      if ($77) {
       $138 = ___cxa_find_matching_catch(-1,-1)|0;
       $139 = tempRet0;
       $1 = $138;
       $2 = $139;
      } else {
       $78 = (($4) + 244|0);
       __THREW__ = 0;
       invoke_vi(29,($78|0));
       $79 = __THREW__; __THREW__ = 0;
       $80 = $79&1;
       if ($80) {
        $140 = ___cxa_find_matching_catch(-1,-1)|0;
        $141 = tempRet0;
        $1 = $140;
        $2 = $141;
       } else {
        $81 = (($4) + 256|0);
        __THREW__ = 0;
        invoke_vi(29,($81|0));
        $82 = __THREW__; __THREW__ = 0;
        $83 = $82&1;
        if ($83) {
         $142 = ___cxa_find_matching_catch(-1,-1)|0;
         $143 = tempRet0;
         $1 = $142;
         $2 = $143;
        } else {
         $84 = (($4) + 268|0);
         __THREW__ = 0;
         invoke_vi(29,($84|0));
         $85 = __THREW__; __THREW__ = 0;
         $86 = $85&1;
         if ($86) {
          $144 = ___cxa_find_matching_catch(-1,-1)|0;
          $145 = tempRet0;
          $1 = $144;
          $2 = $145;
         } else {
          $87 = (($4) + 280|0);
          __THREW__ = 0;
          invoke_vi(7,($87|0));
          $88 = __THREW__; __THREW__ = 0;
          $89 = $88&1;
          if ($89) {
           $146 = ___cxa_find_matching_catch(-1,-1)|0;
           $147 = tempRet0;
           $1 = $146;
           $2 = $147;
          } else {
           $90 = (($4) + 292|0);
           __THREW__ = 0;
           invoke_vi(30,($90|0));
           $91 = __THREW__; __THREW__ = 0;
           $92 = $91&1;
           if ($92) {
            $148 = ___cxa_find_matching_catch(-1,-1)|0;
            $149 = tempRet0;
            $1 = $148;
            $2 = $149;
           } else {
            $93 = (($4) + 304|0);
            __THREW__ = 0;
            invoke_vi(26,($93|0));
            $94 = __THREW__; __THREW__ = 0;
            $95 = $94&1;
            if ($95) {
             $150 = ___cxa_find_matching_catch(-1,-1)|0;
             $151 = tempRet0;
             $1 = $150;
             $2 = $151;
            } else {
             $96 = (($4) + 316|0);
             __THREW__ = 0;
             invoke_vi(30,($96|0));
             $97 = __THREW__; __THREW__ = 0;
             $98 = $97&1;
             if ($98) {
              $152 = ___cxa_find_matching_catch(-1,-1)|0;
              $153 = tempRet0;
              $1 = $152;
              $2 = $153;
             } else {
              $99 = (($4) + 328|0);
              HEAP32[$99>>2] = 0;
              $100 = (($4) + 332|0);
              HEAP32[$100>>2] = -1;
              $101 = (($4) + 336|0);
              $102 = $101;
              $103 = $102;
              HEAP32[$103>>2] = 0;
              $104 = (($102) + 4)|0;
              $105 = $104;
              HEAP32[$105>>2] = 0;
              $106 = (($4) + 344|0);
              __THREW__ = 0;
              invoke_vi(7,($106|0));
              $107 = __THREW__; __THREW__ = 0;
              $108 = $107&1;
              if ($108) {
               $154 = ___cxa_find_matching_catch(-1,-1)|0;
               $155 = tempRet0;
               $1 = $154;
               $2 = $155;
              } else {
               $109 = (($4) + 356|0);
               $110 = (($4) + 208|0);
               __THREW__ = 0;
               invoke_vii(31,($3|0),($110|0));
               $111 = __THREW__; __THREW__ = 0;
               $112 = $111&1;
               do {
                if ($112) {
                 label = 34;
                } else {
                 __THREW__ = 0;
                 invoke_vii(32,($109|0),($3|0));
                 $113 = __THREW__; __THREW__ = 0;
                 $114 = $113&1;
                 if ($114) {
                  label = 34;
                  break;
                 }
                 $115 = (($4) + 384|0);
                 HEAPF64[$115>>3] = 91648253.0;
                 $116 = (($4) + 392|0);
                 HEAPF64[$116>>3] = 0.0;
                 $117 = (($4) + 400|0);
                 HEAP8[$117>>0] = 1;
                 $118 = (($4) + 404|0);
                 __THREW__ = 0;
                 invoke_vi(29,($118|0));
                 $119 = __THREW__; __THREW__ = 0;
                 $120 = $119&1;
                 if ($120) {
                  $158 = ___cxa_find_matching_catch(-1,-1)|0;
                  $159 = tempRet0;
                  $1 = $158;
                  $2 = $159;
                 } else {
                  $121 = (($4) + 416|0);
                  __THREW__ = 0;
                  invoke_vi(7,($121|0));
                  $122 = __THREW__; __THREW__ = 0;
                  $123 = $122&1;
                  if ($123) {
                   $160 = ___cxa_find_matching_catch(-1,-1)|0;
                   $161 = tempRet0;
                   $1 = $160;
                   $2 = $161;
                  } else {
                   $124 = (($4) + 428|0);
                   __THREW__ = 0;
                   invoke_vi(7,($124|0));
                   $125 = __THREW__; __THREW__ = 0;
                   $126 = $125&1;
                   if ($126) {
                    $162 = ___cxa_find_matching_catch(-1,-1)|0;
                    $163 = tempRet0;
                    $1 = $162;
                    $2 = $163;
                   } else {
                    $127 = (($4) + 440|0);
                    __THREW__ = 0;
                    invoke_vi(7,($127|0));
                    $128 = __THREW__; __THREW__ = 0;
                    $129 = $128&1;
                    if (!($129)) {
                     STACKTOP = sp;return;
                    }
                    $164 = ___cxa_find_matching_catch(-1,-1)|0;
                    $165 = tempRet0;
                    $1 = $164;
                    $2 = $165;
                    __THREW__ = 0;
                    invoke_vi(11,($124|0));
                    $166 = __THREW__; __THREW__ = 0;
                    $167 = $166&1;
                    if ($167) {
                     break L1;
                    }
                   }
                   __THREW__ = 0;
                   invoke_vi(11,($121|0));
                   $168 = __THREW__; __THREW__ = 0;
                   $169 = $168&1;
                   if ($169) {
                    break L1;
                   }
                  }
                  __THREW__ = 0;
                  invoke_vi(33,($118|0));
                  $170 = __THREW__; __THREW__ = 0;
                  $171 = $170&1;
                  if ($171) {
                   break L1;
                  }
                 }
                 __THREW__ = 0;
                 invoke_vi(34,($109|0));
                 $172 = __THREW__; __THREW__ = 0;
                 $173 = $172&1;
                 if ($173) {
                  break L1;
                 }
                }
               } while(0);
               if ((label|0) == 34) {
                $156 = ___cxa_find_matching_catch(-1,-1)|0;
                $157 = tempRet0;
                $1 = $156;
                $2 = $157;
               }
               __THREW__ = 0;
               invoke_vi(11,($106|0));
               $174 = __THREW__; __THREW__ = 0;
               $175 = $174&1;
               if ($175) {
                break;
               }
              }
              __THREW__ = 0;
              invoke_vi(35,($96|0));
              $176 = __THREW__; __THREW__ = 0;
              $177 = $176&1;
              if ($177) {
               break;
              }
             }
             __THREW__ = 0;
             invoke_vi(36,($93|0));
             $178 = __THREW__; __THREW__ = 0;
             $179 = $178&1;
             if ($179) {
              break;
             }
            }
            __THREW__ = 0;
            invoke_vi(35,($90|0));
            $180 = __THREW__; __THREW__ = 0;
            $181 = $180&1;
            if ($181) {
             break;
            }
           }
           __THREW__ = 0;
           invoke_vi(11,($87|0));
           $182 = __THREW__; __THREW__ = 0;
           $183 = $182&1;
           if ($183) {
            break;
           }
          }
          __THREW__ = 0;
          invoke_vi(33,($84|0));
          $184 = __THREW__; __THREW__ = 0;
          $185 = $184&1;
          if ($185) {
           break;
          }
         }
         __THREW__ = 0;
         invoke_vi(33,($81|0));
         $186 = __THREW__; __THREW__ = 0;
         $187 = $186&1;
         if ($187) {
          break;
         }
        }
        __THREW__ = 0;
        invoke_vi(33,($78|0));
        $188 = __THREW__; __THREW__ = 0;
        $189 = $188&1;
        if ($189) {
         break;
        }
       }
       __THREW__ = 0;
       invoke_vi(37,($75|0));
       $190 = __THREW__; __THREW__ = 0;
       $191 = $190&1;
       if ($191) {
        break;
       }
      }
      __THREW__ = 0;
      invoke_vi(38,($71|0));
      $192 = __THREW__; __THREW__ = 0;
      $193 = $192&1;
      if ($193) {
       break;
      }
     }
     __THREW__ = 0;
     invoke_vi(36,($67|0));
     $194 = __THREW__; __THREW__ = 0;
     $195 = $194&1;
     if ($195) {
      break;
     }
    }
    __THREW__ = 0;
    invoke_vi(36,($64|0));
    $196 = __THREW__; __THREW__ = 0;
    $197 = $196&1;
    if ($197) {
     break;
    }
   }
   __THREW__ = 0;
   invoke_vi(11,($5|0));
   $198 = __THREW__; __THREW__ = 0;
   $199 = $198&1;
   if (!($199)) {
    label = 72;
   }
  }
 } while(0);
 if ((label|0) == 72) {
  __THREW__ = 0;
  invoke_vi(39,($4|0));
  $200 = __THREW__; __THREW__ = 0;
  $201 = $200&1;
  if (!($201)) {
   $202 = $1;
   $203 = $2;
   ___resumeException($202|0);
   // unreachable;
  }
 }
 $204 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
 $205 = tempRet0;
 ___clang_call_terminate($204);
 // unreachable;
}
function __ZN3vecI5lboolEC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecI5lboolEC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseEC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIP6ClauseEC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIdEC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIdEC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIS_IP6ClauseEEC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIS_IP6ClauseEEC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIcEC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIcEC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIiEC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIiEC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN4HeapIN6Solver10VarOrderLtEEC1ERKS1_($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $c;
 $2 = $0;
 $3 = $1;
 __ZN4HeapIN6Solver10VarOrderLtEEC2ERKS1_($2,$3);
 STACKTOP = sp;return;
}
function __ZN6Solver10VarOrderLtC1ERK3vecIdE($this,$act) {
 $this = $this|0;
 $act = $act|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $act;
 $2 = $0;
 $3 = $1;
 __ZN6Solver10VarOrderLtC2ERK3vecIdE($2,$3);
 STACKTOP = sp;return;
}
function __ZN3vecIcED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIcED2Ev($1);
 STACKTOP = sp;return;
}
function __ZN4HeapIN6Solver10VarOrderLtEED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN4HeapIN6Solver10VarOrderLtEED2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIiED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIiED2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIP6ClauseED2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIS_IP6ClauseEED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIS_IP6ClauseEED2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecIdED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIdED2Ev($1);
 STACKTOP = sp;return;
}
function __ZN3vecI5lboolED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecI5lboolED2Ev($1);
 STACKTOP = sp;return;
}
function __ZN6SolverD2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $19 = 0;
 var $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0;
 var $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0;
 var $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0;
 var $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0;
 var $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $i = 0, $i1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $this;
 $3 = $0;
 $i = 0;
 while(1) {
  $4 = $i;
  $5 = (($3) + 184|0);
  __THREW__ = 0;
  $6 = (invoke_ii(40,($5|0))|0);
  $7 = __THREW__; __THREW__ = 0;
  $8 = $7&1;
  if ($8) {
   label = 8;
   break;
  }
  $9 = ($4|0)<($6|0);
  if (!($9)) {
   label = 9;
   break;
  }
  $10 = (($3) + 184|0);
  $11 = $i;
  __THREW__ = 0;
  $12 = (invoke_iii(41,($10|0),($11|0))|0);
  $13 = __THREW__; __THREW__ = 0;
  $14 = $13&1;
  if ($14) {
   label = 8;
   break;
  }
  $15 = HEAP32[$12>>2]|0;
  __THREW__ = 0;
  invoke_vi(42,($15|0));
  $16 = __THREW__; __THREW__ = 0;
  $17 = $16&1;
  if ($17) {
   label = 8;
   break;
  }
  $18 = $i;
  $19 = (($18) + 1)|0;
  $i = $19;
 }
 L8: do {
  if ((label|0) == 9) {
   $i1 = 0;
   while(1) {
    $25 = $i1;
    $26 = (($3) + 172|0);
    __THREW__ = 0;
    $27 = (invoke_ii(40,($26|0))|0);
    $28 = __THREW__; __THREW__ = 0;
    $29 = $28&1;
    if ($29) {
     label = 8;
     break L8;
    }
    $30 = ($25|0)<($27|0);
    if (!($30)) {
     break;
    }
    $31 = (($3) + 172|0);
    $32 = $i1;
    __THREW__ = 0;
    $33 = (invoke_iii(41,($31|0),($32|0))|0);
    $34 = __THREW__; __THREW__ = 0;
    $35 = $34&1;
    if ($35) {
     label = 8;
     break L8;
    }
    $36 = HEAP32[$33>>2]|0;
    __THREW__ = 0;
    invoke_vi(42,($36|0));
    $37 = __THREW__; __THREW__ = 0;
    $38 = $37&1;
    if ($38) {
     label = 8;
     break L8;
    }
    $39 = $i1;
    $40 = (($39) + 1)|0;
    $i1 = $40;
   }
   $41 = (($3) + 440|0);
   __THREW__ = 0;
   invoke_vi(11,($41|0));
   $42 = __THREW__; __THREW__ = 0;
   $43 = $42&1;
   if ($43) {
    $95 = ___cxa_find_matching_catch(-1,-1)|0;
    $96 = tempRet0;
    $1 = $95;
    $2 = $96;
    label = 38;
    break;
   }
   $44 = (($3) + 428|0);
   __THREW__ = 0;
   invoke_vi(11,($44|0));
   $45 = __THREW__; __THREW__ = 0;
   $46 = $45&1;
   if ($46) {
    $97 = ___cxa_find_matching_catch(-1,-1)|0;
    $98 = tempRet0;
    $1 = $97;
    $2 = $98;
    label = 41;
    break;
   }
   $47 = (($3) + 416|0);
   __THREW__ = 0;
   invoke_vi(11,($47|0));
   $48 = __THREW__; __THREW__ = 0;
   $49 = $48&1;
   if ($49) {
    $102 = ___cxa_find_matching_catch(-1,-1)|0;
    $103 = tempRet0;
    $1 = $102;
    $2 = $103;
    label = 44;
    break;
   }
   $50 = (($3) + 404|0);
   __THREW__ = 0;
   invoke_vi(33,($50|0));
   $51 = __THREW__; __THREW__ = 0;
   $52 = $51&1;
   if ($52) {
    $107 = ___cxa_find_matching_catch(-1,-1)|0;
    $108 = tempRet0;
    $1 = $107;
    $2 = $108;
    label = 47;
    break;
   }
   $53 = (($3) + 356|0);
   __THREW__ = 0;
   invoke_vi(34,($53|0));
   $54 = __THREW__; __THREW__ = 0;
   $55 = $54&1;
   if ($55) {
    $112 = ___cxa_find_matching_catch(-1,-1)|0;
    $113 = tempRet0;
    $1 = $112;
    $2 = $113;
    label = 50;
    break;
   }
   $56 = (($3) + 344|0);
   __THREW__ = 0;
   invoke_vi(11,($56|0));
   $57 = __THREW__; __THREW__ = 0;
   $58 = $57&1;
   if ($58) {
    $117 = ___cxa_find_matching_catch(-1,-1)|0;
    $118 = tempRet0;
    $1 = $117;
    $2 = $118;
    label = 53;
    break;
   }
   $59 = (($3) + 316|0);
   __THREW__ = 0;
   invoke_vi(35,($59|0));
   $60 = __THREW__; __THREW__ = 0;
   $61 = $60&1;
   if ($61) {
    $122 = ___cxa_find_matching_catch(-1,-1)|0;
    $123 = tempRet0;
    $1 = $122;
    $2 = $123;
    label = 56;
    break;
   }
   $62 = (($3) + 304|0);
   __THREW__ = 0;
   invoke_vi(36,($62|0));
   $63 = __THREW__; __THREW__ = 0;
   $64 = $63&1;
   if ($64) {
    $127 = ___cxa_find_matching_catch(-1,-1)|0;
    $128 = tempRet0;
    $1 = $127;
    $2 = $128;
    label = 59;
    break;
   }
   $65 = (($3) + 292|0);
   __THREW__ = 0;
   invoke_vi(35,($65|0));
   $66 = __THREW__; __THREW__ = 0;
   $67 = $66&1;
   if ($67) {
    $132 = ___cxa_find_matching_catch(-1,-1)|0;
    $133 = tempRet0;
    $1 = $132;
    $2 = $133;
    label = 62;
    break;
   }
   $68 = (($3) + 280|0);
   __THREW__ = 0;
   invoke_vi(11,($68|0));
   $69 = __THREW__; __THREW__ = 0;
   $70 = $69&1;
   if ($70) {
    $137 = ___cxa_find_matching_catch(-1,-1)|0;
    $138 = tempRet0;
    $1 = $137;
    $2 = $138;
    label = 65;
    break;
   }
   $71 = (($3) + 268|0);
   __THREW__ = 0;
   invoke_vi(33,($71|0));
   $72 = __THREW__; __THREW__ = 0;
   $73 = $72&1;
   if ($73) {
    $142 = ___cxa_find_matching_catch(-1,-1)|0;
    $143 = tempRet0;
    $1 = $142;
    $2 = $143;
    label = 68;
    break;
   }
   $74 = (($3) + 256|0);
   __THREW__ = 0;
   invoke_vi(33,($74|0));
   $75 = __THREW__; __THREW__ = 0;
   $76 = $75&1;
   if ($76) {
    $147 = ___cxa_find_matching_catch(-1,-1)|0;
    $148 = tempRet0;
    $1 = $147;
    $2 = $148;
    label = 71;
    break;
   }
   $77 = (($3) + 244|0);
   __THREW__ = 0;
   invoke_vi(33,($77|0));
   $78 = __THREW__; __THREW__ = 0;
   $79 = $78&1;
   if ($79) {
    $152 = ___cxa_find_matching_catch(-1,-1)|0;
    $153 = tempRet0;
    $1 = $152;
    $2 = $153;
    label = 74;
    break;
   }
   $80 = (($3) + 232|0);
   __THREW__ = 0;
   invoke_vi(37,($80|0));
   $81 = __THREW__; __THREW__ = 0;
   $82 = $81&1;
   if ($82) {
    $157 = ___cxa_find_matching_catch(-1,-1)|0;
    $158 = tempRet0;
    $1 = $157;
    $2 = $158;
    label = 77;
    break;
   }
   $83 = (($3) + 208|0);
   __THREW__ = 0;
   invoke_vi(38,($83|0));
   $84 = __THREW__; __THREW__ = 0;
   $85 = $84&1;
   if ($85) {
    $162 = ___cxa_find_matching_catch(-1,-1)|0;
    $163 = tempRet0;
    $1 = $162;
    $2 = $163;
    label = 80;
    break;
   }
   $86 = (($3) + 184|0);
   __THREW__ = 0;
   invoke_vi(36,($86|0));
   $87 = __THREW__; __THREW__ = 0;
   $88 = $87&1;
   if ($88) {
    $167 = ___cxa_find_matching_catch(-1,-1)|0;
    $168 = tempRet0;
    $1 = $167;
    $2 = $168;
    label = 83;
    break;
   }
   $89 = (($3) + 172|0);
   __THREW__ = 0;
   invoke_vi(36,($89|0));
   $90 = __THREW__; __THREW__ = 0;
   $91 = $90&1;
   if ($91) {
    $172 = ___cxa_find_matching_catch(-1,-1)|0;
    $173 = tempRet0;
    $1 = $172;
    $2 = $173;
    label = 86;
    break;
   }
   $92 = (($3) + 12|0);
   __THREW__ = 0;
   invoke_vi(11,($92|0));
   $93 = __THREW__; __THREW__ = 0;
   $94 = $93&1;
   if ($94) {
    $177 = ___cxa_find_matching_catch(-1,-1)|0;
    $178 = tempRet0;
    $1 = $177;
    $2 = $178;
    label = 88;
    break;
   } else {
    __ZN3vecI5lboolED1Ev($3);
    STACKTOP = sp;return;
   }
  }
 } while(0);
 if ((label|0) == 8) {
  $20 = ___cxa_find_matching_catch(-1,-1)|0;
  $21 = tempRet0;
  $1 = $20;
  $2 = $21;
  $22 = (($3) + 440|0);
  __THREW__ = 0;
  invoke_vi(11,($22|0));
  $23 = __THREW__; __THREW__ = 0;
  $24 = $23&1;
  if (!($24)) {
   label = 38;
  }
 }
 if ((label|0) == 38) {
  $99 = (($3) + 428|0);
  __THREW__ = 0;
  invoke_vi(11,($99|0));
  $100 = __THREW__; __THREW__ = 0;
  $101 = $100&1;
  if (!($101)) {
   label = 41;
  }
 }
 if ((label|0) == 41) {
  $104 = (($3) + 416|0);
  __THREW__ = 0;
  invoke_vi(11,($104|0));
  $105 = __THREW__; __THREW__ = 0;
  $106 = $105&1;
  if (!($106)) {
   label = 44;
  }
 }
 if ((label|0) == 44) {
  $109 = (($3) + 404|0);
  __THREW__ = 0;
  invoke_vi(33,($109|0));
  $110 = __THREW__; __THREW__ = 0;
  $111 = $110&1;
  if (!($111)) {
   label = 47;
  }
 }
 if ((label|0) == 47) {
  $114 = (($3) + 356|0);
  __THREW__ = 0;
  invoke_vi(34,($114|0));
  $115 = __THREW__; __THREW__ = 0;
  $116 = $115&1;
  if (!($116)) {
   label = 50;
  }
 }
 if ((label|0) == 50) {
  $119 = (($3) + 344|0);
  __THREW__ = 0;
  invoke_vi(11,($119|0));
  $120 = __THREW__; __THREW__ = 0;
  $121 = $120&1;
  if (!($121)) {
   label = 53;
  }
 }
 if ((label|0) == 53) {
  $124 = (($3) + 316|0);
  __THREW__ = 0;
  invoke_vi(35,($124|0));
  $125 = __THREW__; __THREW__ = 0;
  $126 = $125&1;
  if (!($126)) {
   label = 56;
  }
 }
 if ((label|0) == 56) {
  $129 = (($3) + 304|0);
  __THREW__ = 0;
  invoke_vi(36,($129|0));
  $130 = __THREW__; __THREW__ = 0;
  $131 = $130&1;
  if (!($131)) {
   label = 59;
  }
 }
 if ((label|0) == 59) {
  $134 = (($3) + 292|0);
  __THREW__ = 0;
  invoke_vi(35,($134|0));
  $135 = __THREW__; __THREW__ = 0;
  $136 = $135&1;
  if (!($136)) {
   label = 62;
  }
 }
 if ((label|0) == 62) {
  $139 = (($3) + 280|0);
  __THREW__ = 0;
  invoke_vi(11,($139|0));
  $140 = __THREW__; __THREW__ = 0;
  $141 = $140&1;
  if (!($141)) {
   label = 65;
  }
 }
 if ((label|0) == 65) {
  $144 = (($3) + 268|0);
  __THREW__ = 0;
  invoke_vi(33,($144|0));
  $145 = __THREW__; __THREW__ = 0;
  $146 = $145&1;
  if (!($146)) {
   label = 68;
  }
 }
 if ((label|0) == 68) {
  $149 = (($3) + 256|0);
  __THREW__ = 0;
  invoke_vi(33,($149|0));
  $150 = __THREW__; __THREW__ = 0;
  $151 = $150&1;
  if (!($151)) {
   label = 71;
  }
 }
 if ((label|0) == 71) {
  $154 = (($3) + 244|0);
  __THREW__ = 0;
  invoke_vi(33,($154|0));
  $155 = __THREW__; __THREW__ = 0;
  $156 = $155&1;
  if (!($156)) {
   label = 74;
  }
 }
 if ((label|0) == 74) {
  $159 = (($3) + 232|0);
  __THREW__ = 0;
  invoke_vi(37,($159|0));
  $160 = __THREW__; __THREW__ = 0;
  $161 = $160&1;
  if (!($161)) {
   label = 77;
  }
 }
 if ((label|0) == 77) {
  $164 = (($3) + 208|0);
  __THREW__ = 0;
  invoke_vi(38,($164|0));
  $165 = __THREW__; __THREW__ = 0;
  $166 = $165&1;
  if (!($166)) {
   label = 80;
  }
 }
 if ((label|0) == 80) {
  $169 = (($3) + 184|0);
  __THREW__ = 0;
  invoke_vi(36,($169|0));
  $170 = __THREW__; __THREW__ = 0;
  $171 = $170&1;
  if (!($171)) {
   label = 83;
  }
 }
 if ((label|0) == 83) {
  $174 = (($3) + 172|0);
  __THREW__ = 0;
  invoke_vi(36,($174|0));
  $175 = __THREW__; __THREW__ = 0;
  $176 = $175&1;
  if (!($176)) {
   label = 86;
  }
 }
 if ((label|0) == 86) {
  $179 = (($3) + 12|0);
  __THREW__ = 0;
  invoke_vi(11,($179|0));
  $180 = __THREW__; __THREW__ = 0;
  $181 = $180&1;
  if (!($181)) {
   label = 88;
  }
 }
 if ((label|0) == 88) {
  __THREW__ = 0;
  invoke_vi(39,($3|0));
  $182 = __THREW__; __THREW__ = 0;
  $183 = $182&1;
  if (!($183)) {
   $184 = $1;
   $185 = $2;
   ___resumeException($184|0);
   // unreachable;
  }
 }
 $186 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
 $187 = tempRet0;
 ___clang_call_terminate($186);
 // unreachable;
}
function __ZNK3vecIP6ClauseE4sizeEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 STACKTOP = sp;return ($3|0);
}
function __ZN3vecIP6ClauseEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<2)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZN6Solver6newVarEbb($this,$sign,$dvar) {
 $this = $this|0;
 $sign = $sign|0;
 $dvar = $dvar|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $v = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy = sp + 28|0;
 $3 = sp + 16|0;
 $4 = sp + 31|0;
 $5 = sp + 27|0;
 $6 = sp + 8|0;
 $7 = sp;
 $8 = sp + 24|0;
 $9 = sp + 30|0;
 $10 = sp + 26|0;
 $0 = $this;
 $11 = $sign&1;
 $1 = $11;
 $12 = $dvar&1;
 $2 = $12;
 $13 = $0;
 $14 = (__ZNK6Solver5nVarsEv($13)|0);
 $v = $14;
 $15 = (($13) + 232|0);
 __ZN3vecIS_IP6ClauseEE4pushEv($15);
 $16 = (($13) + 232|0);
 __ZN3vecIS_IP6ClauseEE4pushEv($16);
 $17 = (($13) + 304|0);
 HEAP32[$3>>2] = 0;
 __ZN3vecIP6ClauseE4pushERKS1_($17,$3);
 $18 = (($13) + 244|0);
 ;HEAP8[$4+0>>0]=HEAP8[968+0>>0]|0;
 ;HEAP8[$$byval_copy+0>>0]=HEAP8[$4+0>>0]|0;
 $19 = (__Z5toInt5lbool($$byval_copy)|0);
 $20 = $19&255;
 HEAP8[$5>>0] = $20;
 __ZN3vecIcE4pushERKc($18,$5);
 $21 = (($13) + 316|0);
 HEAP32[$6>>2] = -1;
 __ZN3vecIiE4pushERKi($21,$6);
 $22 = (($13) + 208|0);
 HEAPF64[$7>>3] = 0.0;
 __ZN3vecIdE4pushERKd($22,$7);
 $23 = (($13) + 404|0);
 HEAP8[$8>>0] = 0;
 __ZN3vecIcE4pushERKc($23,$8);
 $24 = (($13) + 256|0);
 $25 = $1;
 $26 = $25&1;
 $27 = $26&1;
 HEAP8[$9>>0] = $27;
 __ZN3vecIcE4pushERKc($24,$9);
 $28 = (($13) + 268|0);
 $29 = $2;
 $30 = $29&1;
 $31 = $30&1;
 HEAP8[$10>>0] = $31;
 __ZN3vecIcE4pushERKc($28,$10);
 $32 = $v;
 __ZN6Solver14insertVarOrderEi($13,$32);
 $33 = $v;
 STACKTOP = sp;return ($33|0);
}
function __ZN3vecIS_IP6ClauseEE4pushEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($1) + 8|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)==($5|0);
 if ($6) {
  $7 = (($1) + 8|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($8*3)|0;
  $10 = (($9) + 1)|0;
  $11 = $10 >> 1;
  $12 = (__ZN3vecIS_IP6ClauseEE4imaxEii(2,$11)|0);
  $13 = (($1) + 8|0);
  HEAP32[$13>>2] = $12;
  $14 = HEAP32[$1>>2]|0;
  $15 = (($1) + 8|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = ($16*12)|0;
  $18 = (_realloc($14,$17)|0);
  HEAP32[$1>>2] = $18;
 }
 $19 = (($1) + 4|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = HEAP32[$1>>2]|0;
 $22 = (($21) + (($20*12)|0)|0);
 $23 = ($22|0)==(0|0);
 if ($23) {
  $24 = (($1) + 4|0);
  $25 = HEAP32[$24>>2]|0;
  $26 = (($25) + 1)|0;
  HEAP32[$24>>2] = $26;
  STACKTOP = sp;return;
 }
 __ZN3vecIP6ClauseEC1Ev($22);
 $24 = (($1) + 4|0);
 $25 = HEAP32[$24>>2]|0;
 $26 = (($25) + 1)|0;
 HEAP32[$24>>2] = $26;
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseE4pushERKS1_($this,$elem) {
 $this = $this|0;
 $elem = $elem|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $elem;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (($2) + 8|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($4|0)==($6|0);
 if ($7) {
  $8 = (($2) + 8|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($9*3)|0;
  $11 = (($10) + 1)|0;
  $12 = $11 >> 1;
  $13 = (__ZN3vecIP6ClauseE4imaxEii(2,$12)|0);
  $14 = (($2) + 8|0);
  HEAP32[$14>>2] = $13;
  $15 = HEAP32[$2>>2]|0;
  $16 = (($2) + 8|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $17<<2;
  $19 = (_realloc($15,$18)|0);
  HEAP32[$2>>2] = $19;
 }
 $20 = $1;
 $21 = HEAP32[$20>>2]|0;
 $22 = (($2) + 4|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = (($23) + 1)|0;
 HEAP32[$22>>2] = $24;
 $25 = HEAP32[$2>>2]|0;
 $26 = (($25) + ($23<<2)|0);
 HEAP32[$26>>2] = $21;
 STACKTOP = sp;return;
}
function __ZN3vecIcE4pushERKc($this,$elem) {
 $this = $this|0;
 $elem = $elem|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $elem;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (($2) + 8|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($4|0)==($6|0);
 if ($7) {
  $8 = (($2) + 8|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($9*3)|0;
  $11 = (($10) + 1)|0;
  $12 = $11 >> 1;
  $13 = (__ZN3vecIcE4imaxEii(2,$12)|0);
  $14 = (($2) + 8|0);
  HEAP32[$14>>2] = $13;
  $15 = HEAP32[$2>>2]|0;
  $16 = (($2) + 8|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $17;
  $19 = (_realloc($15,$18)|0);
  HEAP32[$2>>2] = $19;
 }
 $20 = $1;
 $21 = HEAP8[$20>>0]|0;
 $22 = (($2) + 4|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = (($23) + 1)|0;
 HEAP32[$22>>2] = $24;
 $25 = HEAP32[$2>>2]|0;
 $26 = (($25) + ($23)|0);
 HEAP8[$26>>0] = $21;
 STACKTOP = sp;return;
}
function __Z5toInt5lbool($l) {
 $l = $l|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (__ZNK5lbool5toIntEv($l)|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN3vecIiE4pushERKi($this,$elem) {
 $this = $this|0;
 $elem = $elem|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $elem;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (($2) + 8|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($4|0)==($6|0);
 if ($7) {
  $8 = (($2) + 8|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($9*3)|0;
  $11 = (($10) + 1)|0;
  $12 = $11 >> 1;
  $13 = (__ZN3vecIiE4imaxEii(2,$12)|0);
  $14 = (($2) + 8|0);
  HEAP32[$14>>2] = $13;
  $15 = HEAP32[$2>>2]|0;
  $16 = (($2) + 8|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $17<<2;
  $19 = (_realloc($15,$18)|0);
  HEAP32[$2>>2] = $19;
 }
 $20 = $1;
 $21 = HEAP32[$20>>2]|0;
 $22 = (($2) + 4|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = (($23) + 1)|0;
 HEAP32[$22>>2] = $24;
 $25 = HEAP32[$2>>2]|0;
 $26 = (($25) + ($23<<2)|0);
 HEAP32[$26>>2] = $21;
 STACKTOP = sp;return;
}
function __ZN3vecIdE4pushERKd($this,$elem) {
 $this = $this|0;
 $elem = $elem|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $elem;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (($2) + 8|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($4|0)==($6|0);
 if ($7) {
  $8 = (($2) + 8|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($9*3)|0;
  $11 = (($10) + 1)|0;
  $12 = $11 >> 1;
  $13 = (__ZN3vecIdE4imaxEii(2,$12)|0);
  $14 = (($2) + 8|0);
  HEAP32[$14>>2] = $13;
  $15 = HEAP32[$2>>2]|0;
  $16 = (($2) + 8|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $17<<3;
  $19 = (_realloc($15,$18)|0);
  HEAP32[$2>>2] = $19;
 }
 $20 = $1;
 $21 = +HEAPF64[$20>>3];
 $22 = (($2) + 4|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = (($23) + 1)|0;
 HEAP32[$22>>2] = $24;
 $25 = HEAP32[$2>>2]|0;
 $26 = (($25) + ($23<<3)|0);
 HEAPF64[$26>>3] = $21;
 STACKTOP = sp;return;
}
function __ZN6Solver14insertVarOrderEi($this,$x) {
 $this = $this|0;
 $x = $x|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $x;
 $2 = $0;
 $3 = (($2) + 356|0);
 $4 = $1;
 $5 = (__ZNK4HeapIN6Solver10VarOrderLtEE6inHeapEi($3,$4)|0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = (($2) + 268|0);
 $7 = $1;
 $8 = (__ZN3vecIcEixEi($6,$7)|0);
 $9 = HEAP8[$8>>0]|0;
 $10 = ($9<<24>>24)!=(0);
 if (!($10)) {
  STACKTOP = sp;return;
 }
 $11 = (($2) + 356|0);
 $12 = $1;
 __ZN4HeapIN6Solver10VarOrderLtEE6insertEi($11,$12);
 STACKTOP = sp;return;
}
function __ZN6Solver9addClauseER3vecI3LitE($this,$ps) {
 $this = $this|0;
 $ps = $ps|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $$byval_copy9 = 0, $$expand_i1_val = 0, $$expand_i1_val11 = 0, $$expand_i1_val13 = 0, $$expand_i1_val15 = 0, $$expand_i1_val17 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0;
 var $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $8 = 0, $9 = 0, $c = 0, $i = 0, $j = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $$byval_copy9 = sp + 44|0;
 $$byval_copy8 = sp + 82|0;
 $$byval_copy7 = sp + 24|0;
 $$byval_copy6 = sp + 32|0;
 $$byval_copy5 = sp + 85|0;
 $$byval_copy4 = sp + 16|0;
 $$byval_copy3 = sp + 48|0;
 $$byval_copy2 = sp + 56|0;
 $$byval_copy1 = sp + 89|0;
 $$byval_copy = sp + 72|0;
 $p = sp;
 $3 = sp + 52|0;
 $4 = sp + 84|0;
 $5 = sp + 80|0;
 $6 = sp + 68|0;
 $7 = sp + 60|0;
 $8 = sp + 28|0;
 $9 = sp + 87|0;
 $10 = sp + 81|0;
 $11 = sp + 36|0;
 $12 = sp + 64|0;
 $13 = sp + 83|0;
 $14 = sp + 86|0;
 $15 = sp + 12|0;
 $c = sp + 20|0;
 $1 = $this;
 $2 = $ps;
 $16 = $1;
 $17 = (__ZNK6Solver13decisionLevelEv($16)|0);
 $18 = ($17|0)==(0);
 if (!($18)) {
  ___assert_fail((976|0),(1000|0),94,(1016|0));
  // unreachable;
 }
 $19 = (($16) + 168|0);
 $20 = HEAP8[$19>>0]|0;
 $21 = $20&1;
 if (!($21)) {
  $$expand_i1_val = 0;
  $0 = $$expand_i1_val;
  $$pre_trunc = $0;
  $76 = $$pre_trunc&1;
  STACKTOP = sp;return ($76|0);
 }
 $22 = $2;
 __Z4sortI3LitEvR3vecIT_E($22);
 __ZN3LitC1Ev($p);
 $j = 0;
 $i = 0;
 ;HEAP32[$p+0>>2]=HEAP32[936+0>>2]|0;
 while(1) {
  $23 = $i;
  $24 = $2;
  $25 = (__ZNK3vecI3LitE4sizeEv($24)|0);
  $26 = ($23|0)<($25|0);
  if (!($26)) {
   break;
  }
  $27 = $2;
  $28 = $i;
  $29 = (__ZN3vecI3LitEixEi($27,$28)|0);
  ;HEAP32[$3+0>>2]=HEAP32[$29+0>>2]|0;
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$3+0>>2]|0;
  __ZNK6Solver5valueE3Lit($4,$16,$$byval_copy);
  ;HEAP8[$5+0>>0]=HEAP8[952+0>>0]|0;
  ;HEAP8[$$byval_copy1+0>>0]=HEAP8[$5+0>>0]|0;
  $30 = (__ZNK5lbooleqES_($4,$$byval_copy1)|0);
  if ($30) {
   label = 9;
   break;
  }
  $31 = $2;
  $32 = $i;
  $33 = (__ZN3vecI3LitEixEi($31,$32)|0);
  ;HEAP32[$7+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$7+0>>2]|0;
  __Zco3Lit($6,$$byval_copy2);
  ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$6+0>>2]|0;
  $34 = (__ZNK3LiteqES_($33,$$byval_copy3)|0);
  if ($34) {
   label = 9;
   break;
  }
  $35 = $2;
  $36 = $i;
  $37 = (__ZN3vecI3LitEixEi($35,$36)|0);
  ;HEAP32[$8+0>>2]=HEAP32[$37+0>>2]|0;
  ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$8+0>>2]|0;
  __ZNK6Solver5valueE3Lit($9,$16,$$byval_copy4);
  ;HEAP8[$10+0>>0]=HEAP8[960+0>>0]|0;
  ;HEAP8[$$byval_copy5+0>>0]=HEAP8[$10+0>>0]|0;
  $38 = (__ZNK5lboolneES_($9,$$byval_copy5)|0);
  if ($38) {
   $39 = $2;
   $40 = $i;
   $41 = (__ZN3vecI3LitEixEi($39,$40)|0);
   ;HEAP32[$11+0>>2]=HEAP32[$p+0>>2]|0;
   ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$11+0>>2]|0;
   $42 = (__ZNK3LitneES_($41,$$byval_copy6)|0);
   if ($42) {
    $43 = $2;
    $44 = $j;
    $45 = (($44) + 1)|0;
    $j = $45;
    $46 = (__ZN3vecI3LitEixEi($43,$44)|0);
    $47 = $2;
    $48 = $i;
    $49 = (__ZN3vecI3LitEixEi($47,$48)|0);
    ;HEAP32[$p+0>>2]=HEAP32[$49+0>>2]|0;
    ;HEAP32[$46+0>>2]=HEAP32[$p+0>>2]|0;
   }
  }
  $50 = $i;
  $51 = (($50) + 1)|0;
  $i = $51;
 }
 if ((label|0) == 9) {
  $$expand_i1_val11 = 1;
  $0 = $$expand_i1_val11;
  $$pre_trunc = $0;
  $76 = $$pre_trunc&1;
  STACKTOP = sp;return ($76|0);
 }
 $52 = $2;
 $53 = $i;
 $54 = $j;
 $55 = (($53) - ($54))|0;
 __ZN3vecI3LitE6shrinkEi($52,$55);
 $56 = $2;
 $57 = (__ZNK3vecI3LitE4sizeEv($56)|0);
 $58 = ($57|0)==(0);
 if ($58) {
  $59 = (($16) + 168|0);
  HEAP8[$59>>0] = 0;
  $$expand_i1_val13 = 0;
  $0 = $$expand_i1_val13;
  $$pre_trunc = $0;
  $76 = $$pre_trunc&1;
  STACKTOP = sp;return ($76|0);
 }
 $60 = $2;
 $61 = (__ZNK3vecI3LitE4sizeEv($60)|0);
 $62 = ($61|0)==(1);
 if ($62) {
  $63 = $2;
  $64 = (__ZN3vecI3LitEixEi($63,0)|0);
  ;HEAP32[$12+0>>2]=HEAP32[$64+0>>2]|0;
  ;HEAP32[$$byval_copy7+0>>2]=HEAP32[$12+0>>2]|0;
  __ZNK6Solver5valueE3Lit($13,$16,$$byval_copy7);
  ;HEAP8[$14+0>>0]=HEAP8[968+0>>0]|0;
  ;HEAP8[$$byval_copy8+0>>0]=HEAP8[$14+0>>0]|0;
  $65 = (__ZNK5lbooleqES_($13,$$byval_copy8)|0);
  if (!($65)) {
   ___assert_fail((1032|0),(1000|0),113,(1016|0));
   // unreachable;
  }
  $66 = $2;
  $67 = (__ZN3vecI3LitEixEi($66,0)|0);
  ;HEAP32[$15+0>>2]=HEAP32[$67+0>>2]|0;
  ;HEAP32[$$byval_copy9+0>>2]=HEAP32[$15+0>>2]|0;
  __ZN6Solver16uncheckedEnqueueE3LitP6Clause($16,$$byval_copy9,0);
  $68 = (__ZN6Solver9propagateEv($16)|0);
  $69 = ($68|0)==(0|0);
  $70 = (($16) + 168|0);
  $71 = $69&1;
  HEAP8[$70>>0] = $71;
  $$expand_i1_val15 = $69&1;
  $0 = $$expand_i1_val15;
  $$pre_trunc = $0;
  $76 = $$pre_trunc&1;
  STACKTOP = sp;return ($76|0);
 } else {
  $72 = $2;
  $73 = (__Z10Clause_newI3vecI3LitEEP6ClauseRKT_b($72,0)|0);
  HEAP32[$c>>2] = $73;
  $74 = (($16) + 172|0);
  __ZN3vecIP6ClauseE4pushERKS1_($74,$c);
  $75 = HEAP32[$c>>2]|0;
  __ZN6Solver12attachClauseER6Clause($16,$75);
  $$expand_i1_val17 = 1;
  $0 = $$expand_i1_val17;
  $$pre_trunc = $0;
  $76 = $$pre_trunc&1;
  STACKTOP = sp;return ($76|0);
 }
 return 0|0;
}
function __ZNK6Solver13decisionLevelEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 292|0);
 $3 = (__ZNK3vecIiE4sizeEv($2)|0);
 STACKTOP = sp;return ($3|0);
}
function __Z4sortI3LitEvR3vecIT_E($v) {
 $v = $v|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $$byval_copy = sp + 5|0;
 $1 = sp + 4|0;
 $0 = $v;
 $2 = $0;
 ;HEAP8[$$byval_copy+0>>0]=HEAP8[$1+0>>0]|0;
 __Z4sortI3Lit16LessThan_defaultIS0_EEvR3vecIT_ET0_($2,$$byval_copy);
 STACKTOP = sp;return;
}
function __ZNK6Solver5valueE3Lit($agg$result,$this,$p) {
 $agg$result = $agg$result|0;
 $this = $this|0;
 $p = $p|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy1 = sp + 16|0;
 $$byval_copy = sp + 12|0;
 $1 = sp + 4|0;
 $2 = sp + 20|0;
 $3 = sp;
 $0 = $this;
 $4 = $0;
 $5 = (($4) + 244|0);
 ;HEAP32[$1+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$1+0>>2]|0;
 $6 = (__Z3var3Lit($$byval_copy)|0);
 $7 = (__ZNK3vecIcEixEi($5,$6)|0);
 $8 = HEAP8[$7>>0]|0;
 $9 = $8 << 24 >> 24;
 __Z7toLbooli($2,$9);
 ;HEAP32[$3+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$3+0>>2]|0;
 $10 = (__Z4sign3Lit($$byval_copy1)|0);
 __ZNK5lbooleoEb($agg$result,$2,$10);
 STACKTOP = sp;return;
}
function __ZNK3LiteqES_($this,$p) {
 $this = $this|0;
 $p = $p|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = HEAP32[$p>>2]|0;
 $4 = ($2|0)==($3|0);
 STACKTOP = sp;return ($4|0);
}
function __ZNK3LitneES_($this,$p) {
 $this = $this|0;
 $p = $p|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = HEAP32[$p>>2]|0;
 $4 = ($2|0)!=($3|0);
 STACKTOP = sp;return ($4|0);
}
function __ZN3vecI3LitE6shrinkEi($this,$nelems) {
 $this = $this|0;
 $nelems = $nelems|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $nelems;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)<=($5|0);
 if (!($6)) {
  ___assert_fail((2120|0),(2136|0),72,(2144|0));
  // unreachable;
 }
 $i = 0;
 while(1) {
  $7 = $i;
  $8 = $1;
  $9 = ($7|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = (($2) + 4|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = (($11) + -1)|0;
  HEAP32[$10>>2] = $12;
  $13 = $i;
  $14 = (($13) + 1)|0;
  $i = $14;
 }
 STACKTOP = sp;return;
}
function __ZN6Solver16uncheckedEnqueueE3LitP6Clause($this,$p,$from) {
 $this = $this|0;
 $p = $p|0;
 $from = $from|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0;
 var $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $$byval_copy6 = sp + 20|0;
 $$byval_copy5 = sp + 16|0;
 $$byval_copy4 = sp;
 $$byval_copy3 = sp + 48|0;
 $$byval_copy2 = sp + 32|0;
 $$byval_copy1 = sp + 49|0;
 $$byval_copy = sp + 12|0;
 $2 = sp + 8|0;
 $3 = sp + 50|0;
 $4 = sp + 51|0;
 $5 = sp + 52|0;
 $6 = sp + 36|0;
 $7 = sp + 4|0;
 $8 = sp + 40|0;
 $9 = sp + 28|0;
 $0 = $this;
 $1 = $from;
 $10 = $0;
 ;HEAP32[$2+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$2+0>>2]|0;
 __ZNK6Solver5valueE3Lit($3,$10,$$byval_copy);
 ;HEAP8[$4+0>>0]=HEAP8[968+0>>0]|0;
 ;HEAP8[$$byval_copy1+0>>0]=HEAP8[$4+0>>0]|0;
 $11 = (__ZNK5lbooleqES_($3,$$byval_copy1)|0);
 if ($11) {
  ;HEAP32[$6+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$6+0>>2]|0;
  $12 = (__Z4sign3Lit($$byval_copy2)|0);
  $13 = $12 ^ 1;
  __ZN5lboolC1Eb($5,$13);
  ;HEAP8[$$byval_copy3+0>>0]=HEAP8[$5+0>>0]|0;
  $14 = (__Z5toInt5lbool($$byval_copy3)|0);
  $15 = $14&255;
  $16 = (($10) + 244|0);
  ;HEAP32[$7+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$7+0>>2]|0;
  $17 = (__Z3var3Lit($$byval_copy4)|0);
  $18 = (__ZN3vecIcEixEi($16,$17)|0);
  HEAP8[$18>>0] = $15;
  $19 = (__ZNK6Solver13decisionLevelEv($10)|0);
  $20 = (($10) + 316|0);
  ;HEAP32[$8+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy5+0>>2]=HEAP32[$8+0>>2]|0;
  $21 = (__Z3var3Lit($$byval_copy5)|0);
  $22 = (__ZN3vecIiEixEi($20,$21)|0);
  HEAP32[$22>>2] = $19;
  $23 = $1;
  $24 = (($10) + 304|0);
  ;HEAP32[$9+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$9+0>>2]|0;
  $25 = (__Z3var3Lit($$byval_copy6)|0);
  $26 = (__ZN3vecIP6ClauseEixEi($24,$25)|0);
  HEAP32[$26>>2] = $23;
  $27 = (($10) + 280|0);
  __ZN3vecI3LitE4pushERKS0_($27,$p);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((1312|0),(1000|0),382,(1336|0));
  // unreachable;
 }
}
function __ZN6Solver9propagateEv($this) {
 $this = $this|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $$byval_copy9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0;
 var $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0;
 var $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0;
 var $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
 var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
 var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0;
 var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
 var $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $c = 0, $confl = 0;
 var $end = 0, $false_lit = 0, $first = 0, $i = 0, $j = 0, $k = 0, $num_props = 0, $p = 0, $ws = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 144|0;
 $$byval_copy12 = sp + 80|0;
 $$byval_copy11 = sp + 137|0;
 $$byval_copy10 = sp + 44|0;
 $$byval_copy9 = sp + 108|0;
 $$byval_copy8 = sp + 116|0;
 $$byval_copy7 = sp + 132|0;
 $$byval_copy6 = sp + 20|0;
 $$byval_copy5 = sp + 140|0;
 $$byval_copy4 = sp + 28|0;
 $$byval_copy3 = sp + 32|0;
 $$byval_copy2 = sp + 36|0;
 $$byval_copy1 = sp + 40|0;
 $$byval_copy = sp + 96|0;
 $p = sp + 124|0;
 $1 = sp + 68|0;
 $false_lit = sp + 12|0;
 $2 = sp + 4|0;
 $3 = sp;
 $4 = sp + 8|0;
 $first = sp + 88|0;
 $5 = sp + 92|0;
 $6 = sp + 134|0;
 $7 = sp + 133|0;
 $8 = sp + 60|0;
 $9 = sp + 139|0;
 $10 = sp + 136|0;
 $11 = sp + 100|0;
 $12 = sp + 48|0;
 $13 = sp + 24|0;
 $14 = sp + 16|0;
 $15 = sp + 135|0;
 $16 = sp + 138|0;
 $17 = sp + 56|0;
 $0 = $this;
 $18 = $0;
 $confl = 0;
 $num_props = 0;
 L1: while(1) {
  $19 = (($18) + 328|0);
  $20 = HEAP32[$19>>2]|0;
  $21 = (($18) + 280|0);
  $22 = (__ZNK3vecI3LitE4sizeEv($21)|0);
  $23 = ($20|0)<($22|0);
  if (!($23)) {
   label = 27;
   break;
  }
  $24 = (($18) + 280|0);
  $25 = (($18) + 328|0);
  $26 = HEAP32[$25>>2]|0;
  $27 = (($26) + 1)|0;
  HEAP32[$25>>2] = $27;
  $28 = (__ZN3vecI3LitEixEi($24,$26)|0);
  ;HEAP32[$p+0>>2]=HEAP32[$28+0>>2]|0;
  $29 = (($18) + 232|0);
  ;HEAP32[$1+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$1+0>>2]|0;
  $30 = (__Z5toInt3Lit($$byval_copy)|0);
  $31 = (__ZN3vecIS_IP6ClauseEEixEi($29,$30)|0);
  $ws = $31;
  $32 = $num_props;
  $33 = (($32) + 1)|0;
  $num_props = $33;
  $34 = $ws;
  $35 = (__ZN3vecIP6ClauseEcvPS1_Ev($34)|0);
  $j = $35;
  $i = $35;
  $36 = $i;
  $37 = $ws;
  $38 = (__ZNK3vecIP6ClauseE4sizeEv($37)|0);
  $39 = (($36) + ($38<<2)|0);
  $end = $39;
  while(1) {
   $40 = $i;
   $41 = $end;
   $42 = ($40|0)!=($41|0);
   if (!($42)) {
    break;
   }
   $43 = $i;
   $44 = (($43) + 4|0);
   $i = $44;
   $45 = HEAP32[$43>>2]|0;
   $c = $45;
   ;HEAP32[$2+0>>2]=HEAP32[$p+0>>2]|0;
   ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$2+0>>2]|0;
   __Zco3Lit($false_lit,$$byval_copy1);
   $46 = $c;
   $47 = (__ZN6ClauseixEi($46,0)|0);
   ;HEAP32[$3+0>>2]=HEAP32[$false_lit+0>>2]|0;
   ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$3+0>>2]|0;
   $48 = (__ZNK3LiteqES_($47,$$byval_copy2)|0);
   if ($48) {
    $49 = $c;
    $50 = (__ZN6ClauseixEi($49,0)|0);
    $51 = $c;
    $52 = (__ZN6ClauseixEi($51,1)|0);
    ;HEAP32[$50+0>>2]=HEAP32[$52+0>>2]|0;
    $53 = $c;
    $54 = (__ZN6ClauseixEi($53,1)|0);
    ;HEAP32[$54+0>>2]=HEAP32[$false_lit+0>>2]|0;
   }
   $55 = $c;
   $56 = (__ZN6ClauseixEi($55,1)|0);
   ;HEAP32[$4+0>>2]=HEAP32[$false_lit+0>>2]|0;
   ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$4+0>>2]|0;
   $57 = (__ZNK3LiteqES_($56,$$byval_copy3)|0);
   if (!($57)) {
    label = 8;
    break L1;
   }
   $58 = $c;
   $59 = (__ZN6ClauseixEi($58,0)|0);
   ;HEAP32[$first+0>>2]=HEAP32[$59+0>>2]|0;
   ;HEAP32[$5+0>>2]=HEAP32[$first+0>>2]|0;
   ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$5+0>>2]|0;
   __ZNK6Solver5valueE3Lit($6,$18,$$byval_copy4);
   ;HEAP8[$7+0>>0]=HEAP8[952+0>>0]|0;
   ;HEAP8[$$byval_copy5+0>>0]=HEAP8[$7+0>>0]|0;
   $60 = (__ZNK5lbooleqES_($6,$$byval_copy5)|0);
   do {
    if ($60) {
     $61 = $c;
     $62 = $j;
     $63 = (($62) + 4|0);
     $j = $63;
     HEAP32[$62>>2] = $61;
     label = 24;
    } else {
     $k = 2;
     while(1) {
      $64 = $k;
      $65 = $c;
      $66 = (__ZNK6Clause4sizeEv($65)|0);
      $67 = ($64|0)<($66|0);
      if (!($67)) {
       break;
      }
      $68 = $c;
      $69 = $k;
      $70 = (__ZN6ClauseixEi($68,$69)|0);
      ;HEAP32[$8+0>>2]=HEAP32[$70+0>>2]|0;
      ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$8+0>>2]|0;
      __ZNK6Solver5valueE3Lit($9,$18,$$byval_copy6);
      ;HEAP8[$10+0>>0]=HEAP8[960+0>>0]|0;
      ;HEAP8[$$byval_copy7+0>>0]=HEAP8[$10+0>>0]|0;
      $71 = (__ZNK5lboolneES_($9,$$byval_copy7)|0);
      if ($71) {
       label = 14;
       break;
      }
      $86 = $k;
      $87 = (($86) + 1)|0;
      $k = $87;
     }
     if ((label|0) == 14) {
      label = 0;
      $72 = $c;
      $73 = (__ZN6ClauseixEi($72,1)|0);
      $74 = $c;
      $75 = $k;
      $76 = (__ZN6ClauseixEi($74,$75)|0);
      ;HEAP32[$73+0>>2]=HEAP32[$76+0>>2]|0;
      $77 = $c;
      $78 = $k;
      $79 = (__ZN6ClauseixEi($77,$78)|0);
      ;HEAP32[$79+0>>2]=HEAP32[$false_lit+0>>2]|0;
      $80 = (($18) + 232|0);
      $81 = $c;
      $82 = (__ZN6ClauseixEi($81,1)|0);
      ;HEAP32[$12+0>>2]=HEAP32[$82+0>>2]|0;
      ;HEAP32[$$byval_copy8+0>>2]=HEAP32[$12+0>>2]|0;
      __Zco3Lit($11,$$byval_copy8);
      ;HEAP32[$$byval_copy9+0>>2]=HEAP32[$11+0>>2]|0;
      $83 = (__Z5toInt3Lit($$byval_copy9)|0);
      $84 = (__ZN3vecIS_IP6ClauseEEixEi($80,$83)|0);
      $85 = $c;
      HEAP32[$13>>2] = $85;
      __ZN3vecIP6ClauseE4pushERKS1_($84,$13);
      break;
     }
     $88 = $c;
     $89 = $j;
     $90 = (($89) + 4|0);
     $j = $90;
     HEAP32[$89>>2] = $88;
     ;HEAP32[$14+0>>2]=HEAP32[$first+0>>2]|0;
     ;HEAP32[$$byval_copy10+0>>2]=HEAP32[$14+0>>2]|0;
     __ZNK6Solver5valueE3Lit($15,$18,$$byval_copy10);
     ;HEAP8[$16+0>>0]=HEAP8[960+0>>0]|0;
     ;HEAP8[$$byval_copy11+0>>0]=HEAP8[$16+0>>0]|0;
     $91 = (__ZNK5lbooleqES_($15,$$byval_copy11)|0);
     if ($91) {
      $92 = $c;
      $confl = $92;
      $93 = (($18) + 280|0);
      $94 = (__ZNK3vecI3LitE4sizeEv($93)|0);
      $95 = (($18) + 328|0);
      HEAP32[$95>>2] = $94;
      while(1) {
       $96 = $i;
       $97 = $end;
       $98 = ($96>>>0)<($97>>>0);
       if (!($98)) {
        break;
       }
       $99 = $i;
       $100 = (($99) + 4|0);
       $i = $100;
       $101 = HEAP32[$99>>2]|0;
       $102 = $j;
       $103 = (($102) + 4|0);
       $j = $103;
       HEAP32[$102>>2] = $101;
      }
     } else {
      ;HEAP32[$17+0>>2]=HEAP32[$first+0>>2]|0;
      $104 = $c;
      ;HEAP32[$$byval_copy12+0>>2]=HEAP32[$17+0>>2]|0;
      __ZN6Solver16uncheckedEnqueueE3LitP6Clause($18,$$byval_copy12,$104);
     }
     label = 24;
    }
   } while(0);
   if ((label|0) == 24) {
    label = 0;
   }
  }
  $105 = $ws;
  $106 = $i;
  $107 = $j;
  $108 = $106;
  $109 = $107;
  $110 = (($108) - ($109))|0;
  $111 = (($110|0) / 4)&-1;
  __ZN3vecIP6ClauseE6shrinkEi($105,$111);
 }
 if ((label|0) == 8) {
  ___assert_fail((1360|0),(1000|0),420,(1384|0));
  // unreachable;
 }
 else if ((label|0) == 27) {
  $112 = $num_props;
  $113 = ($112|0)<(0);
  $114 = $113 << 31 >> 31;
  $115 = (($18) + 120|0);
  $116 = $115;
  $117 = $116;
  $118 = HEAP32[$117>>2]|0;
  $119 = (($116) + 4)|0;
  $120 = $119;
  $121 = HEAP32[$120>>2]|0;
  $122 = (_i64Add(($118|0),($121|0),($112|0),($114|0))|0);
  $123 = tempRet0;
  $124 = $115;
  $125 = $124;
  HEAP32[$125>>2] = $122;
  $126 = (($124) + 4)|0;
  $127 = $126;
  HEAP32[$127>>2] = $123;
  $128 = $num_props;
  $129 = ($128|0)<(0);
  $130 = $129 << 31 >> 31;
  $131 = (($18) + 336|0);
  $132 = $131;
  $133 = $132;
  $134 = HEAP32[$133>>2]|0;
  $135 = (($132) + 4)|0;
  $136 = $135;
  $137 = HEAP32[$136>>2]|0;
  $138 = (_i64Subtract(($134|0),($137|0),($128|0),($130|0))|0);
  $139 = tempRet0;
  $140 = $131;
  $141 = $140;
  HEAP32[$141>>2] = $138;
  $142 = (($140) + 4)|0;
  $143 = $142;
  HEAP32[$143>>2] = $139;
  $144 = $confl;
  STACKTOP = sp;return ($144|0);
 }
 return 0|0;
}
function __Z10Clause_newI3vecI3LitEEP6ClauseRKT_b($ps,$learnt) {
 $ps = $ps|0;
 $learnt = $learnt|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mem = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $ps;
 $2 = $learnt&1;
 $1 = $2;
 $3 = $0;
 $4 = (__ZNK3vecI3LitE4sizeEv($3)|0);
 $5 = $4<<2;
 $6 = (8 + ($5))|0;
 $7 = (_malloc($6)|0);
 $mem = $7;
 $8 = $mem;
 $9 = ($8|0)==(0|0);
 if ($9) {
  $13 = 0;
  STACKTOP = sp;return ($13|0);
 }
 $10 = $0;
 $11 = $1;
 $12 = $11&1;
 __ZN6ClauseC1I3vecI3LitEEERKT_b($8,$10,$12);
 $13 = $8;
 STACKTOP = sp;return ($13|0);
}
function __ZN6Solver12attachClauseER6Clause($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $$byval_copy3 = sp + 4|0;
 $$byval_copy2 = sp + 16|0;
 $$byval_copy1 = sp + 36|0;
 $$byval_copy = sp;
 $2 = sp + 44|0;
 $3 = sp + 24|0;
 $4 = sp + 20|0;
 $5 = sp + 8|0;
 $6 = sp + 12|0;
 $7 = sp + 28|0;
 $0 = $this;
 $1 = $c;
 $8 = $0;
 $9 = $1;
 $10 = (__ZNK6Clause4sizeEv($9)|0);
 $11 = ($10|0)>(1);
 if (!($11)) {
  ___assert_fail((1056|0),(1000|0),127,(1072|0));
  // unreachable;
 }
 $12 = (($8) + 232|0);
 $13 = $1;
 $14 = (__ZN6ClauseixEi($13,0)|0);
 ;HEAP32[$3+0>>2]=HEAP32[$14+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$3+0>>2]|0;
 __Zco3Lit($2,$$byval_copy);
 ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$2+0>>2]|0;
 $15 = (__Z5toInt3Lit($$byval_copy1)|0);
 $16 = (__ZN3vecIS_IP6ClauseEEixEi($12,$15)|0);
 $17 = $1;
 HEAP32[$4>>2] = $17;
 __ZN3vecIP6ClauseE4pushERKS1_($16,$4);
 $18 = (($8) + 232|0);
 $19 = $1;
 $20 = (__ZN6ClauseixEi($19,1)|0);
 ;HEAP32[$6+0>>2]=HEAP32[$20+0>>2]|0;
 ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$6+0>>2]|0;
 __Zco3Lit($5,$$byval_copy2);
 ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$5+0>>2]|0;
 $21 = (__Z5toInt3Lit($$byval_copy3)|0);
 $22 = (__ZN3vecIS_IP6ClauseEEixEi($18,$21)|0);
 $23 = $1;
 HEAP32[$7>>2] = $23;
 __ZN3vecIP6ClauseE4pushERKS1_($22,$7);
 $24 = $1;
 $25 = (__ZNK6Clause6learntEv($24)|0);
 if ($25) {
  $26 = $1;
  $27 = (__ZNK6Clause4sizeEv($26)|0);
  $28 = ($27|0)<(0);
  $29 = $28 << 31 >> 31;
  $30 = (($8) + 144|0);
  $31 = $30;
  $32 = $31;
  $33 = HEAP32[$32>>2]|0;
  $34 = (($31) + 4)|0;
  $35 = $34;
  $36 = HEAP32[$35>>2]|0;
  $37 = (_i64Add(($33|0),($36|0),($27|0),($29|0))|0);
  $38 = tempRet0;
  $39 = $30;
  $40 = $39;
  HEAP32[$40>>2] = $37;
  $41 = (($39) + 4)|0;
  $42 = $41;
  HEAP32[$42>>2] = $38;
  STACKTOP = sp;return;
 } else {
  $43 = $1;
  $44 = (__ZNK6Clause4sizeEv($43)|0);
  $45 = ($44|0)<(0);
  $46 = $45 << 31 >> 31;
  $47 = (($8) + 136|0);
  $48 = $47;
  $49 = $48;
  $50 = HEAP32[$49>>2]|0;
  $51 = (($48) + 4)|0;
  $52 = $51;
  $53 = HEAP32[$52>>2]|0;
  $54 = (_i64Add(($50|0),($53|0),($44|0),($46|0))|0);
  $55 = tempRet0;
  $56 = $47;
  $57 = $56;
  HEAP32[$57>>2] = $54;
  $58 = (($56) + 4)|0;
  $59 = $58;
  HEAP32[$59>>2] = $55;
  STACKTOP = sp;return;
 }
}
function __ZNK6Clause4sizeEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = $2 >>> 3;
 STACKTOP = sp;return ($3|0);
}
function __ZN3vecIS_IP6ClauseEEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + (($3*12)|0)|0);
 STACKTOP = sp;return ($5|0);
}
function __Z5toInt3Lit($p) {
 $p = $p|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$p>>2]|0;
 STACKTOP = sp;return ($0|0);
}
function __ZN6ClauseixEi($this,$i) {
 $this = $this|0;
 $i = $i|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $i;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 8|0);
 $5 = (($4) + ($3<<2)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZNK6Clause6learntEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = $2 & 1;
 $4 = ($3|0)!=(0);
 STACKTOP = sp;return ($4|0);
}
function __ZN6Solver12detachClauseER6Clause($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0;
 var $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0;
 var $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0;
 var $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0;
 var $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $$byval_copy7 = sp + 40|0;
 $$byval_copy6 = sp + 52|0;
 $$byval_copy5 = sp + 4|0;
 $$byval_copy4 = sp + 76|0;
 $$byval_copy3 = sp + 36|0;
 $$byval_copy2 = sp + 16|0;
 $$byval_copy1 = sp + 20|0;
 $$byval_copy = sp + 56|0;
 $2 = sp + 80|0;
 $3 = sp + 84|0;
 $4 = sp + 44|0;
 $5 = sp + 48|0;
 $6 = sp + 8|0;
 $7 = sp;
 $8 = sp + 24|0;
 $9 = sp + 28|0;
 $10 = sp + 60|0;
 $11 = sp + 12|0;
 $12 = sp + 32|0;
 $13 = sp + 68|0;
 $0 = $this;
 $1 = $c;
 $14 = $0;
 $15 = $1;
 $16 = (__ZNK6Clause4sizeEv($15)|0);
 $17 = ($16|0)>(1);
 if (!($17)) {
  ___assert_fail((1056|0),(1000|0),135,(1088|0));
  // unreachable;
 }
 $18 = (($14) + 232|0);
 $19 = $1;
 $20 = (__ZN6ClauseixEi($19,0)|0);
 ;HEAP32[$3+0>>2]=HEAP32[$20+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$3+0>>2]|0;
 __Zco3Lit($2,$$byval_copy);
 ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$2+0>>2]|0;
 $21 = (__Z5toInt3Lit($$byval_copy1)|0);
 $22 = (__ZN3vecIS_IP6ClauseEEixEi($18,$21)|0);
 $23 = $1;
 HEAP32[$4>>2] = $23;
 $24 = (__ZL4findI3vecIP6ClauseES2_EbRT_RKT0_($22,$4)|0);
 if (!($24)) {
  ___assert_fail((1104|0),(1000|0),136,(1088|0));
  // unreachable;
 }
 $25 = (($14) + 232|0);
 $26 = $1;
 $27 = (__ZN6ClauseixEi($26,1)|0);
 ;HEAP32[$6+0>>2]=HEAP32[$27+0>>2]|0;
 ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$6+0>>2]|0;
 __Zco3Lit($5,$$byval_copy2);
 ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$5+0>>2]|0;
 $28 = (__Z5toInt3Lit($$byval_copy3)|0);
 $29 = (__ZN3vecIS_IP6ClauseEEixEi($25,$28)|0);
 $30 = $1;
 HEAP32[$7>>2] = $30;
 $31 = (__ZL4findI3vecIP6ClauseES2_EbRT_RKT0_($29,$7)|0);
 if (!($31)) {
  ___assert_fail((1136|0),(1000|0),137,(1088|0));
  // unreachable;
 }
 $32 = (($14) + 232|0);
 $33 = $1;
 $34 = (__ZN6ClauseixEi($33,0)|0);
 ;HEAP32[$9+0>>2]=HEAP32[$34+0>>2]|0;
 ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$9+0>>2]|0;
 __Zco3Lit($8,$$byval_copy4);
 ;HEAP32[$$byval_copy5+0>>2]=HEAP32[$8+0>>2]|0;
 $35 = (__Z5toInt3Lit($$byval_copy5)|0);
 $36 = (__ZN3vecIS_IP6ClauseEEixEi($32,$35)|0);
 $37 = $1;
 HEAP32[$10>>2] = $37;
 __ZL6removeI3vecIP6ClauseES2_EvRT_RKT0_($36,$10);
 $38 = (($14) + 232|0);
 $39 = $1;
 $40 = (__ZN6ClauseixEi($39,1)|0);
 ;HEAP32[$12+0>>2]=HEAP32[$40+0>>2]|0;
 ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$12+0>>2]|0;
 __Zco3Lit($11,$$byval_copy6);
 ;HEAP32[$$byval_copy7+0>>2]=HEAP32[$11+0>>2]|0;
 $41 = (__Z5toInt3Lit($$byval_copy7)|0);
 $42 = (__ZN3vecIS_IP6ClauseEEixEi($38,$41)|0);
 $43 = $1;
 HEAP32[$13>>2] = $43;
 __ZL6removeI3vecIP6ClauseES2_EvRT_RKT0_($42,$13);
 $44 = $1;
 $45 = (__ZNK6Clause6learntEv($44)|0);
 if ($45) {
  $46 = $1;
  $47 = (__ZNK6Clause4sizeEv($46)|0);
  $48 = ($47|0)<(0);
  $49 = $48 << 31 >> 31;
  $50 = (($14) + 144|0);
  $51 = $50;
  $52 = $51;
  $53 = HEAP32[$52>>2]|0;
  $54 = (($51) + 4)|0;
  $55 = $54;
  $56 = HEAP32[$55>>2]|0;
  $57 = (_i64Subtract(($53|0),($56|0),($47|0),($49|0))|0);
  $58 = tempRet0;
  $59 = $50;
  $60 = $59;
  HEAP32[$60>>2] = $57;
  $61 = (($59) + 4)|0;
  $62 = $61;
  HEAP32[$62>>2] = $58;
  STACKTOP = sp;return;
 } else {
  $63 = $1;
  $64 = (__ZNK6Clause4sizeEv($63)|0);
  $65 = ($64|0)<(0);
  $66 = $65 << 31 >> 31;
  $67 = (($14) + 136|0);
  $68 = $67;
  $69 = $68;
  $70 = HEAP32[$69>>2]|0;
  $71 = (($68) + 4)|0;
  $72 = $71;
  $73 = HEAP32[$72>>2]|0;
  $74 = (_i64Subtract(($70|0),($73|0),($64|0),($66|0))|0);
  $75 = tempRet0;
  $76 = $67;
  $77 = $76;
  HEAP32[$77>>2] = $74;
  $78 = (($76) + 4)|0;
  $79 = $78;
  HEAP32[$79>>2] = $75;
  STACKTOP = sp;return;
 }
}
function __ZL4findI3vecIP6ClauseES2_EbRT_RKT0_($ts,$t) {
 $ts = $ts|0;
 $t = $t|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $ts;
 $1 = $t;
 $j = 0;
 while(1) {
  $2 = $j;
  $3 = $0;
  $4 = (__ZNK3vecIP6ClauseE4sizeEv($3)|0);
  $5 = ($2|0)<($4|0);
  if ($5) {
   $6 = $0;
   $7 = $j;
   $8 = (__ZN3vecIP6ClauseEixEi($6,$7)|0);
   $9 = HEAP32[$8>>2]|0;
   $10 = $1;
   $11 = HEAP32[$10>>2]|0;
   $12 = ($9|0)!=($11|0);
   $19 = $12;
  } else {
   $19 = 0;
  }
  if (!($19)) {
   break;
  }
  $13 = $j;
  $14 = (($13) + 1)|0;
  $j = $14;
 }
 $15 = $j;
 $16 = $0;
 $17 = (__ZNK3vecIP6ClauseE4sizeEv($16)|0);
 $18 = ($15|0)<($17|0);
 STACKTOP = sp;return ($18|0);
}
function __ZL6removeI3vecIP6ClauseES2_EvRT_RKT0_($ts,$t) {
 $ts = $ts|0;
 $t = $t|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $ts;
 $1 = $t;
 $j = 0;
 while(1) {
  $2 = $j;
  $3 = $0;
  $4 = (__ZNK3vecIP6ClauseE4sizeEv($3)|0);
  $5 = ($2|0)<($4|0);
  if ($5) {
   $6 = $0;
   $7 = $j;
   $8 = (__ZN3vecIP6ClauseEixEi($6,$7)|0);
   $9 = HEAP32[$8>>2]|0;
   $10 = $1;
   $11 = HEAP32[$10>>2]|0;
   $12 = ($9|0)!=($11|0);
   $35 = $12;
  } else {
   $35 = 0;
  }
  if (!($35)) {
   break;
  }
  $13 = $j;
  $14 = (($13) + 1)|0;
  $j = $14;
 }
 $15 = $j;
 $16 = $0;
 $17 = (__ZNK3vecIP6ClauseE4sizeEv($16)|0);
 $18 = ($15|0)<($17|0);
 if (!($18)) {
  ___assert_fail((2192|0),(2208|0),33,(2216|0));
  // unreachable;
 }
 while(1) {
  $19 = $j;
  $20 = $0;
  $21 = (__ZNK3vecIP6ClauseE4sizeEv($20)|0);
  $22 = (($21) - 1)|0;
  $23 = ($19|0)<($22|0);
  if (!($23)) {
   break;
  }
  $24 = $0;
  $25 = $j;
  $26 = (($25) + 1)|0;
  $27 = (__ZN3vecIP6ClauseEixEi($24,$26)|0);
  $28 = HEAP32[$27>>2]|0;
  $29 = $0;
  $30 = $j;
  $31 = (__ZN3vecIP6ClauseEixEi($29,$30)|0);
  HEAP32[$31>>2] = $28;
  $32 = $j;
  $33 = (($32) + 1)|0;
  $j = $33;
 }
 $34 = $0;
 __ZN3vecIP6ClauseE3popEv($34);
 STACKTOP = sp;return;
}
function __ZN6Solver12removeClauseER6Clause($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $c;
 $2 = $0;
 $3 = $1;
 __ZN6Solver12detachClauseER6Clause($2,$3);
 $4 = $1;
 _free($4);
 STACKTOP = sp;return;
}
function __ZNK6Solver9satisfiedERK6Clause($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$expand_i1_val = 0, $$expand_i1_val3 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy1 = sp + 22|0;
 $$byval_copy = sp + 16|0;
 $3 = sp + 4|0;
 $4 = sp + 20|0;
 $5 = sp + 23|0;
 $1 = $this;
 $2 = $c;
 $6 = $1;
 $i = 0;
 while(1) {
  $7 = $i;
  $8 = $2;
  $9 = (__ZNK6Clause4sizeEv($8)|0);
  $10 = ($7|0)<($9|0);
  if (!($10)) {
   label = 7;
   break;
  }
  $11 = $2;
  $12 = $i;
  __ZNK6ClauseixEi($3,$11,$12);
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$3+0>>2]|0;
  __ZNK6Solver5valueE3Lit($4,$6,$$byval_copy);
  ;HEAP8[$5+0>>0]=HEAP8[952+0>>0]|0;
  ;HEAP8[$$byval_copy1+0>>0]=HEAP8[$5+0>>0]|0;
  $13 = (__ZNK5lbooleqES_($4,$$byval_copy1)|0);
  if ($13) {
   label = 4;
   break;
  }
  $14 = $i;
  $15 = (($14) + 1)|0;
  $i = $15;
 }
 if ((label|0) == 4) {
  $$expand_i1_val = 1;
  $0 = $$expand_i1_val;
  $$pre_trunc = $0;
  $16 = $$pre_trunc&1;
  STACKTOP = sp;return ($16|0);
 }
 else if ((label|0) == 7) {
  $$expand_i1_val3 = 0;
  $0 = $$expand_i1_val3;
  $$pre_trunc = $0;
  $16 = $$pre_trunc&1;
  STACKTOP = sp;return ($16|0);
 }
 return 0|0;
}
function __ZNK6ClauseixEi($agg$result,$this,$i) {
 $agg$result = $agg$result|0;
 $this = $this|0;
 $i = $i|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $i;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 8|0);
 $5 = (($4) + ($3<<2)|0);
 ;HEAP32[$agg$result+0>>2]=HEAP32[$5+0>>2]|0;
 STACKTOP = sp;return;
}
function __ZN6Solver11cancelUntilEi($this,$level) {
 $this = $this|0;
 $level = $level|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c = 0, $x = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy1 = sp + 24|0;
 $$byval_copy = sp + 16|0;
 $2 = sp + 12|0;
 $3 = sp + 25|0;
 $0 = $this;
 $1 = $level;
 $4 = $0;
 $5 = (__ZNK6Solver13decisionLevelEv($4)|0);
 $6 = $1;
 $7 = ($5|0)>($6|0);
 if (!($7)) {
  STACKTOP = sp;return;
 }
 $8 = (($4) + 280|0);
 $9 = (__ZNK3vecI3LitE4sizeEv($8)|0);
 $10 = (($9) - 1)|0;
 $c = $10;
 while(1) {
  $11 = $c;
  $12 = (($4) + 292|0);
  $13 = $1;
  $14 = (__ZN3vecIiEixEi($12,$13)|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = ($11|0)>=($15|0);
  if (!($16)) {
   break;
  }
  $17 = (($4) + 280|0);
  $18 = $c;
  $19 = (__ZN3vecI3LitEixEi($17,$18)|0);
  ;HEAP32[$2+0>>2]=HEAP32[$19+0>>2]|0;
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$2+0>>2]|0;
  $20 = (__Z3var3Lit($$byval_copy)|0);
  $x = $20;
  ;HEAP8[$3+0>>0]=HEAP8[968+0>>0]|0;
  ;HEAP8[$$byval_copy1+0>>0]=HEAP8[$3+0>>0]|0;
  $21 = (__Z5toInt5lbool($$byval_copy1)|0);
  $22 = $21&255;
  $23 = (($4) + 244|0);
  $24 = $x;
  $25 = (__ZN3vecIcEixEi($23,$24)|0);
  HEAP8[$25>>0] = $22;
  $26 = $x;
  __ZN6Solver14insertVarOrderEi($4,$26);
  $27 = $c;
  $28 = (($27) + -1)|0;
  $c = $28;
 }
 $29 = (($4) + 292|0);
 $30 = $1;
 $31 = (__ZN3vecIiEixEi($29,$30)|0);
 $32 = HEAP32[$31>>2]|0;
 $33 = (($4) + 328|0);
 HEAP32[$33>>2] = $32;
 $34 = (($4) + 280|0);
 $35 = (($4) + 280|0);
 $36 = (__ZNK3vecI3LitE4sizeEv($35)|0);
 $37 = (($4) + 292|0);
 $38 = $1;
 $39 = (__ZN3vecIiEixEi($37,$38)|0);
 $40 = HEAP32[$39>>2]|0;
 $41 = (($36) - ($40))|0;
 __ZN3vecI3LitE6shrinkEi($34,$41);
 $42 = (($4) + 292|0);
 $43 = (($4) + 292|0);
 $44 = (__ZNK3vecIiE4sizeEv($43)|0);
 $45 = $1;
 $46 = (($44) - ($45))|0;
 __ZN3vecIiE6shrinkEi($42,$46);
 STACKTOP = sp;return;
}
function __ZN3vecIiEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<2)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZN3vecIcEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZN3vecIiE6shrinkEi($this,$nelems) {
 $this = $this|0;
 $nelems = $nelems|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $nelems;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)<=($5|0);
 if (!($6)) {
  ___assert_fail((2120|0),(2136|0),72,(2144|0));
  // unreachable;
 }
 $i = 0;
 while(1) {
  $7 = $i;
  $8 = $1;
  $9 = ($7|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = (($2) + 4|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = (($11) + -1)|0;
  HEAP32[$10>>2] = $12;
  $13 = $i;
  $14 = (($13) + 1)|0;
  $i = $14;
 }
 STACKTOP = sp;return;
}
function __ZNK3vecIiE4sizeEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 STACKTOP = sp;return ($3|0);
}
function __ZN6Solver13pickBranchLitEid($agg$result,$this,$polarity_mode,$random_var_freq) {
 $agg$result = $agg$result|0;
 $this = $this|0;
 $polarity_mode = $polarity_mode|0;
 $random_var_freq = +$random_var_freq;
 var $$byval_copy = 0, $$byval_copy1 = 0, $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0.0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
 var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $8 = 0;
 var $9 = 0.0, $next = 0, $sign = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy1 = sp + 25|0;
 $$byval_copy = sp + 24|0;
 $3 = sp + 23|0;
 $4 = sp + 22|0;
 $5 = sp + 21|0;
 $6 = sp + 20|0;
 $0 = $this;
 $1 = $polarity_mode;
 $2 = $random_var_freq;
 $7 = $0;
 $next = -1;
 $8 = (($7) + 384|0);
 $9 = (+__ZN6Solver5drandERd($8));
 $10 = $2;
 $11 = $9 < $10;
 if ($11) {
  $12 = (($7) + 356|0);
  $13 = (__ZNK4HeapIN6Solver10VarOrderLtEE5emptyEv($12)|0);
  if (!($13)) {
   $14 = (($7) + 356|0);
   $15 = (($7) + 384|0);
   $16 = (($7) + 356|0);
   $17 = (__ZNK4HeapIN6Solver10VarOrderLtEE4sizeEv($16)|0);
   $18 = (__ZN6Solver5irandERdi($15,$17)|0);
   $19 = (__ZNK4HeapIN6Solver10VarOrderLtEEixEi($14,$18)|0);
   $next = $19;
   $20 = (($7) + 244|0);
   $21 = $next;
   $22 = (__ZN3vecIcEixEi($20,$21)|0);
   $23 = HEAP8[$22>>0]|0;
   $24 = $23 << 24 >> 24;
   __Z7toLbooli($3,$24);
   ;HEAP8[$4+0>>0]=HEAP8[968+0>>0]|0;
   ;HEAP8[$$byval_copy+0>>0]=HEAP8[$4+0>>0]|0;
   $25 = (__ZNK5lbooleqES_($3,$$byval_copy)|0);
   if ($25) {
    $26 = (($7) + 268|0);
    $27 = $next;
    $28 = (__ZN3vecIcEixEi($26,$27)|0);
    $29 = HEAP8[$28>>0]|0;
    $30 = ($29<<24>>24)!=(0);
    if ($30) {
     $31 = (($7) + 112|0);
     $32 = $31;
     $33 = $32;
     $34 = HEAP32[$33>>2]|0;
     $35 = (($32) + 4)|0;
     $36 = $35;
     $37 = HEAP32[$36>>2]|0;
     $38 = (_i64Add(($34|0),($37|0),1,0)|0);
     $39 = tempRet0;
     $40 = $31;
     $41 = $40;
     HEAP32[$41>>2] = $38;
     $42 = (($40) + 4)|0;
     $43 = $42;
     HEAP32[$43>>2] = $39;
    }
   }
  }
 }
 while(1) {
  $44 = $next;
  $45 = ($44|0)==(-1);
  if ($45) {
   $78 = 1;
  } else {
   $46 = (($7) + 244|0);
   $47 = $next;
   $48 = (__ZN3vecIcEixEi($46,$47)|0);
   $49 = HEAP8[$48>>0]|0;
   $50 = $49 << 24 >> 24;
   __Z7toLbooli($5,$50);
   ;HEAP8[$6+0>>0]=HEAP8[968+0>>0]|0;
   ;HEAP8[$$byval_copy1+0>>0]=HEAP8[$6+0>>0]|0;
   $51 = (__ZNK5lboolneES_($5,$$byval_copy1)|0);
   if ($51) {
    $78 = 1;
   } else {
    $52 = (($7) + 268|0);
    $53 = $next;
    $54 = (__ZN3vecIcEixEi($52,$53)|0);
    $55 = HEAP8[$54>>0]|0;
    $56 = ($55<<24>>24)!=(0);
    $57 = $56 ^ 1;
    $78 = $57;
   }
  }
  if (!($78)) {
   break;
  }
  $58 = (($7) + 356|0);
  $59 = (__ZNK4HeapIN6Solver10VarOrderLtEE5emptyEv($58)|0);
  if ($59) {
   label = 13;
   break;
  }
  $60 = (($7) + 356|0);
  $61 = (__ZN4HeapIN6Solver10VarOrderLtEE9removeMinEv($60)|0);
  $next = $61;
 }
 if ((label|0) == 13) {
  $next = -1;
 }
 $sign = 0;
 $62 = $1;
 if ((($62|0) == 2)) {
  $63 = (($7) + 256|0);
  $64 = $next;
  $65 = (__ZN3vecIcEixEi($63,$64)|0);
  $66 = HEAP8[$65>>0]|0;
  $67 = ($66<<24>>24)!=(0);
  $68 = $67&1;
  $sign = $68;
 } else if ((($62|0) == 3)) {
  $69 = (($7) + 384|0);
  $70 = (__ZN6Solver5irandERdi($69,2)|0);
  $71 = ($70|0)!=(0);
  $72 = $71&1;
  $sign = $72;
 } else if ((($62|0) == 0)) {
  $sign = 0;
 } else if ((($62|0) == 1)) {
  $sign = 1;
 } else {
  ___assert_fail((1168|0),(1000|0),198,(1176|0));
  // unreachable;
 }
 $73 = $next;
 $74 = ($73|0)==(-1);
 if ($74) {
  ;HEAP32[$agg$result+0>>2]=HEAP32[936+0>>2]|0;
  STACKTOP = sp;return;
 } else {
  $75 = $next;
  $76 = $sign;
  $77 = $76&1;
  __ZN3LitC1Eib($agg$result,$75,$77);
  STACKTOP = sp;return;
 }
}
function __ZN6Solver5drandERd($seed) {
 $seed = $seed|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0.0, $16 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0, $5 = 0.0, $6 = 0.0, $7 = 0, $8 = 0, $9 = 0.0, $q = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $seed;
 $1 = $0;
 $2 = +HEAPF64[$1>>3];
 $3 = $2 * 1389796.0;
 HEAPF64[$1>>3] = $3;
 $4 = $0;
 $5 = +HEAPF64[$4>>3];
 $6 = $5 / 2147483647.0;
 $7 = (~~(($6)));
 $q = $7;
 $8 = $q;
 $9 = (+($8|0));
 $10 = $9 * 2147483647.0;
 $11 = $0;
 $12 = +HEAPF64[$11>>3];
 $13 = $12 - $10;
 HEAPF64[$11>>3] = $13;
 $14 = $0;
 $15 = +HEAPF64[$14>>3];
 $16 = $15 / 2147483647.0;
 STACKTOP = sp;return (+$16);
}
function __ZNK4HeapIN6Solver10VarOrderLtEE5emptyEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = (__ZNK3vecIiE4sizeEv($2)|0);
 $4 = ($3|0)==(0);
 STACKTOP = sp;return ($4|0);
}
function __ZNK4HeapIN6Solver10VarOrderLtEEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 4|0);
 $5 = (__ZNK3vecIiE4sizeEv($4)|0);
 $6 = ($3|0)<($5|0);
 if ($6) {
  $7 = (($2) + 4|0);
  $8 = $1;
  $9 = (__ZNK3vecIiEixEi($7,$8)|0);
  $10 = HEAP32[$9>>2]|0;
  STACKTOP = sp;return ($10|0);
 } else {
  ___assert_fail((2152|0),(2096|0),80,(2176|0));
  // unreachable;
 }
 return 0|0;
}
function __ZN6Solver5irandERdi($seed,$size) {
 $seed = $seed|0;
 $size = $size|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0.0, $4 = 0, $5 = 0.0, $6 = 0.0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $seed;
 $1 = $size;
 $2 = $0;
 $3 = (+__ZN6Solver5drandERd($2));
 $4 = $1;
 $5 = (+($4|0));
 $6 = $3 * $5;
 $7 = (~~(($6)));
 STACKTOP = sp;return ($7|0);
}
function __ZNK4HeapIN6Solver10VarOrderLtEE4sizeEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = (__ZNK3vecIiE4sizeEv($2)|0);
 STACKTOP = sp;return ($3|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEE9removeMinEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $x = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = (__ZN3vecIiEixEi($2,0)|0);
 $4 = HEAP32[$3>>2]|0;
 $x = $4;
 $5 = (($1) + 4|0);
 $6 = (__ZN3vecIiE4lastEv($5)|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = (($1) + 4|0);
 $9 = (__ZN3vecIiEixEi($8,0)|0);
 HEAP32[$9>>2] = $7;
 $10 = (($1) + 16|0);
 $11 = (($1) + 4|0);
 $12 = (__ZN3vecIiEixEi($11,0)|0);
 $13 = HEAP32[$12>>2]|0;
 $14 = (__ZN3vecIiEixEi($10,$13)|0);
 HEAP32[$14>>2] = 0;
 $15 = (($1) + 16|0);
 $16 = $x;
 $17 = (__ZN3vecIiEixEi($15,$16)|0);
 HEAP32[$17>>2] = -1;
 $18 = (($1) + 4|0);
 __ZN3vecIiE3popEv($18);
 $19 = (($1) + 4|0);
 $20 = (__ZNK3vecIiE4sizeEv($19)|0);
 $21 = ($20|0)>(1);
 if (!($21)) {
  $22 = $x;
  STACKTOP = sp;return ($22|0);
 }
 __ZN4HeapIN6Solver10VarOrderLtEE13percolateDownEi($1,0);
 $22 = $x;
 STACKTOP = sp;return ($22|0);
}
function __ZN6Solver7analyzeEP6ClauseR3vecI3LitERi($this,$confl,$out_learnt,$out_btlevel) {
 $this = $this|0;
 $confl = $confl|0;
 $out_learnt = $out_learnt|0;
 $out_btlevel = $out_btlevel|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy13 = 0, $$byval_copy14 = 0, $$byval_copy15 = 0, $$byval_copy16 = 0, $$byval_copy17 = 0, $$byval_copy18 = 0, $$byval_copy19 = 0, $$byval_copy2 = 0, $$byval_copy20 = 0, $$byval_copy21 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0;
 var $$byval_copy8 = 0, $$byval_copy9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0;
 var $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0;
 var $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0;
 var $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0;
 var $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0;
 var $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0;
 var $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0;
 var $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0;
 var $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0;
 var $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0;
 var $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $abstract_level = 0, $c = 0, $c2 = 0, $i = 0, $i3 = 0, $index = 0, $j = 0;
 var $j1 = 0, $j5 = 0, $k = 0, $max_i = 0, $p = 0, $p4 = 0, $pathC = 0, $q = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0;
 $$byval_copy21 = sp + 104|0;
 $$byval_copy20 = sp + 184|0;
 $$byval_copy19 = sp + 100|0;
 $$byval_copy18 = sp + 196|0;
 $$byval_copy17 = sp + 236|0;
 $$byval_copy16 = sp + 244|0;
 $$byval_copy15 = sp;
 $$byval_copy14 = sp + 192|0;
 $$byval_copy13 = sp + 16|0;
 $$byval_copy12 = sp + 20|0;
 $$byval_copy11 = sp + 24|0;
 $$byval_copy10 = sp + 28|0;
 $$byval_copy9 = sp + 32|0;
 $$byval_copy8 = sp + 36|0;
 $$byval_copy7 = sp + 40|0;
 $$byval_copy6 = sp + 188|0;
 $$byval_copy5 = sp + 44|0;
 $$byval_copy4 = sp + 48|0;
 $$byval_copy3 = sp + 52|0;
 $$byval_copy2 = sp + 56|0;
 $$byval_copy1 = sp + 60|0;
 $$byval_copy = sp + 64|0;
 $p = sp + 216|0;
 $4 = sp + 248|0;
 $q = sp + 252|0;
 $5 = sp + 108|0;
 $6 = sp + 112|0;
 $7 = sp + 116|0;
 $8 = sp + 120|0;
 $9 = sp + 124|0;
 $10 = sp + 128|0;
 $11 = sp + 132|0;
 $12 = sp + 136|0;
 $13 = sp + 140|0;
 $14 = sp + 144|0;
 $15 = sp + 148|0;
 $16 = sp + 152|0;
 $17 = sp + 168|0;
 $18 = sp + 172|0;
 $19 = sp + 176|0;
 $20 = sp + 8|0;
 $21 = sp + 84|0;
 $22 = sp + 12|0;
 $23 = sp + 92|0;
 $24 = sp + 220|0;
 $p4 = sp + 200|0;
 $25 = sp + 4|0;
 $26 = sp + 228|0;
 $0 = $this;
 $1 = $confl;
 $2 = $out_learnt;
 $3 = $out_btlevel;
 $27 = $0;
 $pathC = 0;
 ;HEAP32[$p+0>>2]=HEAP32[936+0>>2]|0;
 $28 = $2;
 __ZN3vecI3LitE4pushEv($28);
 $29 = (($27) + 280|0);
 $30 = (__ZNK3vecI3LitE4sizeEv($29)|0);
 $31 = (($30) - 1)|0;
 $index = $31;
 $32 = $3;
 HEAP32[$32>>2] = 0;
 while(1) {
  $33 = $1;
  $34 = ($33|0)!=(0|0);
  if (!($34)) {
   label = 3;
   break;
  }
  $35 = $1;
  $c = $35;
  $36 = $c;
  $37 = (__ZNK6Clause6learntEv($36)|0);
  if ($37) {
   $38 = $c;
   __ZN6Solver15claBumpActivityER6Clause($27,$38);
  }
  ;HEAP32[$4+0>>2]=HEAP32[936+0>>2]|0;
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$4+0>>2]|0;
  $39 = (__ZNK3LiteqES_($p,$$byval_copy)|0);
  $40 = $39 ? 0 : 1;
  $j = $40;
  while(1) {
   $41 = $j;
   $42 = $c;
   $43 = (__ZNK6Clause4sizeEv($42)|0);
   $44 = ($41|0)<($43|0);
   if (!($44)) {
    break;
   }
   $45 = $c;
   $46 = $j;
   $47 = (__ZN6ClauseixEi($45,$46)|0);
   ;HEAP32[$q+0>>2]=HEAP32[$47+0>>2]|0;
   $48 = (($27) + 404|0);
   ;HEAP32[$5+0>>2]=HEAP32[$q+0>>2]|0;
   ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$5+0>>2]|0;
   $49 = (__Z3var3Lit($$byval_copy1)|0);
   $50 = (__ZN3vecIcEixEi($48,$49)|0);
   $51 = HEAP8[$50>>0]|0;
   $52 = ($51<<24>>24)!=(0);
   if (!($52)) {
    $53 = (($27) + 316|0);
    ;HEAP32[$6+0>>2]=HEAP32[$q+0>>2]|0;
    ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$6+0>>2]|0;
    $54 = (__Z3var3Lit($$byval_copy2)|0);
    $55 = (__ZN3vecIiEixEi($53,$54)|0);
    $56 = HEAP32[$55>>2]|0;
    $57 = ($56|0)>(0);
    if ($57) {
     ;HEAP32[$7+0>>2]=HEAP32[$q+0>>2]|0;
     ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$7+0>>2]|0;
     $58 = (__Z3var3Lit($$byval_copy3)|0);
     __ZN6Solver15varBumpActivityEi($27,$58);
     $59 = (($27) + 404|0);
     ;HEAP32[$8+0>>2]=HEAP32[$q+0>>2]|0;
     ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$8+0>>2]|0;
     $60 = (__Z3var3Lit($$byval_copy4)|0);
     $61 = (__ZN3vecIcEixEi($59,$60)|0);
     HEAP8[$61>>0] = 1;
     $62 = (($27) + 316|0);
     ;HEAP32[$9+0>>2]=HEAP32[$q+0>>2]|0;
     ;HEAP32[$$byval_copy5+0>>2]=HEAP32[$9+0>>2]|0;
     $63 = (__Z3var3Lit($$byval_copy5)|0);
     $64 = (__ZN3vecIiEixEi($62,$63)|0);
     $65 = HEAP32[$64>>2]|0;
     $66 = (__ZNK6Solver13decisionLevelEv($27)|0);
     $67 = ($65|0)>=($66|0);
     if ($67) {
      $68 = $pathC;
      $69 = (($68) + 1)|0;
      $pathC = $69;
     } else {
      $70 = $2;
      __ZN3vecI3LitE4pushERKS0_($70,$q);
      $71 = (($27) + 316|0);
      ;HEAP32[$10+0>>2]=HEAP32[$q+0>>2]|0;
      ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$10+0>>2]|0;
      $72 = (__Z3var3Lit($$byval_copy6)|0);
      $73 = (__ZN3vecIiEixEi($71,$72)|0);
      $74 = HEAP32[$73>>2]|0;
      $75 = $3;
      $76 = HEAP32[$75>>2]|0;
      $77 = ($74|0)>($76|0);
      if ($77) {
       $78 = (($27) + 316|0);
       ;HEAP32[$11+0>>2]=HEAP32[$q+0>>2]|0;
       ;HEAP32[$$byval_copy7+0>>2]=HEAP32[$11+0>>2]|0;
       $79 = (__Z3var3Lit($$byval_copy7)|0);
       $80 = (__ZN3vecIiEixEi($78,$79)|0);
       $81 = HEAP32[$80>>2]|0;
       $82 = $3;
       HEAP32[$82>>2] = $81;
      }
     }
    }
   }
   $83 = $j;
   $84 = (($83) + 1)|0;
   $j = $84;
  }
  while(1) {
   $85 = (($27) + 404|0);
   $86 = (($27) + 280|0);
   $87 = $index;
   $88 = (($87) + -1)|0;
   $index = $88;
   $89 = (__ZN3vecI3LitEixEi($86,$87)|0);
   ;HEAP32[$12+0>>2]=HEAP32[$89+0>>2]|0;
   ;HEAP32[$$byval_copy8+0>>2]=HEAP32[$12+0>>2]|0;
   $90 = (__Z3var3Lit($$byval_copy8)|0);
   $91 = (__ZN3vecIcEixEi($85,$90)|0);
   $92 = HEAP8[$91>>0]|0;
   $93 = ($92<<24>>24)!=(0);
   $94 = $93 ^ 1;
   if (!($94)) {
    break;
   }
  }
  $95 = (($27) + 280|0);
  $96 = $index;
  $97 = (($96) + 1)|0;
  $98 = (__ZN3vecI3LitEixEi($95,$97)|0);
  ;HEAP32[$p+0>>2]=HEAP32[$98+0>>2]|0;
  $99 = (($27) + 304|0);
  ;HEAP32[$13+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy9+0>>2]=HEAP32[$13+0>>2]|0;
  $100 = (__Z3var3Lit($$byval_copy9)|0);
  $101 = (__ZN3vecIP6ClauseEixEi($99,$100)|0);
  $102 = HEAP32[$101>>2]|0;
  $1 = $102;
  $103 = (($27) + 404|0);
  ;HEAP32[$14+0>>2]=HEAP32[$p+0>>2]|0;
  ;HEAP32[$$byval_copy10+0>>2]=HEAP32[$14+0>>2]|0;
  $104 = (__Z3var3Lit($$byval_copy10)|0);
  $105 = (__ZN3vecIcEixEi($103,$104)|0);
  HEAP8[$105>>0] = 0;
  $106 = $pathC;
  $107 = (($106) + -1)|0;
  $pathC = $107;
  $108 = $pathC;
  $109 = ($108|0)>(0);
  if (!($109)) {
   break;
  }
 }
 if ((label|0) == 3) {
  ___assert_fail((1192|0),(1000|0),232,(1208|0));
  // unreachable;
 }
 $110 = $2;
 $111 = (__ZN3vecI3LitEixEi($110,0)|0);
 ;HEAP32[$16+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy11+0>>2]=HEAP32[$16+0>>2]|0;
 __Zco3Lit($15,$$byval_copy11);
 ;HEAP32[$111+0>>2]=HEAP32[$15+0>>2]|0;
 $112 = (($27) + 80|0);
 $113 = HEAP8[$112>>0]|0;
 $114 = $113&1;
 if ($114) {
  $abstract_level = 0;
  $i = 1;
  while(1) {
   $115 = $i;
   $116 = $2;
   $117 = (__ZNK3vecI3LitE4sizeEv($116)|0);
   $118 = ($115|0)<($117|0);
   if (!($118)) {
    break;
   }
   $119 = $2;
   $120 = $i;
   $121 = (__ZN3vecI3LitEixEi($119,$120)|0);
   ;HEAP32[$17+0>>2]=HEAP32[$121+0>>2]|0;
   ;HEAP32[$$byval_copy12+0>>2]=HEAP32[$17+0>>2]|0;
   $122 = (__Z3var3Lit($$byval_copy12)|0);
   $123 = (__ZNK6Solver13abstractLevelEi($27,$122)|0);
   $124 = $abstract_level;
   $125 = $124 | $123;
   $abstract_level = $125;
   $126 = $i;
   $127 = (($126) + 1)|0;
   $i = $127;
  }
  $128 = $2;
  $129 = (($27) + 428|0);
  __ZNK3vecI3LitE6copyToERS1_($128,$129);
  $j1 = 1;
  $i = 1;
  while(1) {
   $130 = $i;
   $131 = $2;
   $132 = (__ZNK3vecI3LitE4sizeEv($131)|0);
   $133 = ($130|0)<($132|0);
   if (!($133)) {
    break;
   }
   $134 = (($27) + 304|0);
   $135 = $2;
   $136 = $i;
   $137 = (__ZN3vecI3LitEixEi($135,$136)|0);
   ;HEAP32[$18+0>>2]=HEAP32[$137+0>>2]|0;
   ;HEAP32[$$byval_copy13+0>>2]=HEAP32[$18+0>>2]|0;
   $138 = (__Z3var3Lit($$byval_copy13)|0);
   $139 = (__ZN3vecIP6ClauseEixEi($134,$138)|0);
   $140 = HEAP32[$139>>2]|0;
   $141 = ($140|0)==(0|0);
   if ($141) {
    label = 32;
   } else {
    $142 = $2;
    $143 = $i;
    $144 = (__ZN3vecI3LitEixEi($142,$143)|0);
    ;HEAP32[$19+0>>2]=HEAP32[$144+0>>2]|0;
    $145 = $abstract_level;
    ;HEAP32[$$byval_copy14+0>>2]=HEAP32[$19+0>>2]|0;
    $146 = (__ZN6Solver12litRedundantE3Litj($27,$$byval_copy14,$145)|0);
    if (!($146)) {
     label = 32;
    }
   }
   if ((label|0) == 32) {
    label = 0;
    $147 = $2;
    $148 = $j1;
    $149 = (($148) + 1)|0;
    $j1 = $149;
    $150 = (__ZN3vecI3LitEixEi($147,$148)|0);
    $151 = $2;
    $152 = $i;
    $153 = (__ZN3vecI3LitEixEi($151,$152)|0);
    ;HEAP32[$150+0>>2]=HEAP32[$153+0>>2]|0;
   }
   $154 = $i;
   $155 = (($154) + 1)|0;
   $i = $155;
  }
 } else {
  $156 = $2;
  $157 = (($27) + 428|0);
  __ZNK3vecI3LitE6copyToERS1_($156,$157);
  $j1 = 1;
  $i = 1;
  while(1) {
   $158 = $i;
   $159 = $2;
   $160 = (__ZNK3vecI3LitE4sizeEv($159)|0);
   $161 = ($158|0)<($160|0);
   if (!($161)) {
    break;
   }
   $162 = (($27) + 304|0);
   $163 = $2;
   $164 = $i;
   $165 = (__ZN3vecI3LitEixEi($163,$164)|0);
   ;HEAP32[$20+0>>2]=HEAP32[$165+0>>2]|0;
   ;HEAP32[$$byval_copy15+0>>2]=HEAP32[$20+0>>2]|0;
   $166 = (__Z3var3Lit($$byval_copy15)|0);
   $167 = (__ZN3vecIP6ClauseEixEi($162,$166)|0);
   $168 = HEAP32[$167>>2]|0;
   $c2 = $168;
   $k = 1;
   while(1) {
    $169 = $k;
    $170 = $c2;
    $171 = (__ZNK6Clause4sizeEv($170)|0);
    $172 = ($169|0)<($171|0);
    if (!($172)) {
     break;
    }
    $173 = (($27) + 404|0);
    $174 = $c2;
    $175 = $k;
    $176 = (__ZN6ClauseixEi($174,$175)|0);
    ;HEAP32[$21+0>>2]=HEAP32[$176+0>>2]|0;
    ;HEAP32[$$byval_copy16+0>>2]=HEAP32[$21+0>>2]|0;
    $177 = (__Z3var3Lit($$byval_copy16)|0);
    $178 = (__ZN3vecIcEixEi($173,$177)|0);
    $179 = HEAP8[$178>>0]|0;
    $180 = ($179<<24>>24)!=(0);
    if (!($180)) {
     $181 = (($27) + 316|0);
     $182 = $c2;
     $183 = $k;
     $184 = (__ZN6ClauseixEi($182,$183)|0);
     ;HEAP32[$22+0>>2]=HEAP32[$184+0>>2]|0;
     ;HEAP32[$$byval_copy17+0>>2]=HEAP32[$22+0>>2]|0;
     $185 = (__Z3var3Lit($$byval_copy17)|0);
     $186 = (__ZN3vecIiEixEi($181,$185)|0);
     $187 = HEAP32[$186>>2]|0;
     $188 = ($187|0)>(0);
     if ($188) {
      label = 42;
      break;
     }
    }
    $196 = $k;
    $197 = (($196) + 1)|0;
    $k = $197;
   }
   if ((label|0) == 42) {
    label = 0;
    $189 = $2;
    $190 = $j1;
    $191 = (($190) + 1)|0;
    $j1 = $191;
    $192 = (__ZN3vecI3LitEixEi($189,$190)|0);
    $193 = $2;
    $194 = $i;
    $195 = (__ZN3vecI3LitEixEi($193,$194)|0);
    ;HEAP32[$192+0>>2]=HEAP32[$195+0>>2]|0;
   }
   $198 = $i;
   $199 = (($198) + 1)|0;
   $i = $199;
  }
 }
 $200 = $2;
 $201 = (__ZNK3vecI3LitE4sizeEv($200)|0);
 $202 = ($201|0)<(0);
 $203 = $202 << 31 >> 31;
 $204 = (($27) + 152|0);
 $205 = $204;
 $206 = $205;
 $207 = HEAP32[$206>>2]|0;
 $208 = (($205) + 4)|0;
 $209 = $208;
 $210 = HEAP32[$209>>2]|0;
 $211 = (_i64Add(($207|0),($210|0),($201|0),($203|0))|0);
 $212 = tempRet0;
 $213 = $204;
 $214 = $213;
 HEAP32[$214>>2] = $211;
 $215 = (($213) + 4)|0;
 $216 = $215;
 HEAP32[$216>>2] = $212;
 $217 = $2;
 $218 = $i;
 $219 = $j1;
 $220 = (($218) - ($219))|0;
 __ZN3vecI3LitE6shrinkEi($217,$220);
 $221 = $2;
 $222 = (__ZNK3vecI3LitE4sizeEv($221)|0);
 $223 = ($222|0)<(0);
 $224 = $223 << 31 >> 31;
 $225 = (($27) + 160|0);
 $226 = $225;
 $227 = $226;
 $228 = HEAP32[$227>>2]|0;
 $229 = (($226) + 4)|0;
 $230 = $229;
 $231 = HEAP32[$230>>2]|0;
 $232 = (_i64Add(($228|0),($231|0),($222|0),($224|0))|0);
 $233 = tempRet0;
 $234 = $225;
 $235 = $234;
 HEAP32[$235>>2] = $232;
 $236 = (($234) + 4)|0;
 $237 = $236;
 HEAP32[$237>>2] = $233;
 $238 = $2;
 $239 = (__ZNK3vecI3LitE4sizeEv($238)|0);
 $240 = ($239|0)==(1);
 if ($240) {
  $241 = $3;
  HEAP32[$241>>2] = 0;
 } else {
  $max_i = 1;
  $i3 = 2;
  while(1) {
   $242 = $i3;
   $243 = $2;
   $244 = (__ZNK3vecI3LitE4sizeEv($243)|0);
   $245 = ($242|0)<($244|0);
   if (!($245)) {
    break;
   }
   $246 = (($27) + 316|0);
   $247 = $2;
   $248 = $i3;
   $249 = (__ZN3vecI3LitEixEi($247,$248)|0);
   ;HEAP32[$23+0>>2]=HEAP32[$249+0>>2]|0;
   ;HEAP32[$$byval_copy18+0>>2]=HEAP32[$23+0>>2]|0;
   $250 = (__Z3var3Lit($$byval_copy18)|0);
   $251 = (__ZN3vecIiEixEi($246,$250)|0);
   $252 = HEAP32[$251>>2]|0;
   $253 = (($27) + 316|0);
   $254 = $2;
   $255 = $max_i;
   $256 = (__ZN3vecI3LitEixEi($254,$255)|0);
   ;HEAP32[$24+0>>2]=HEAP32[$256+0>>2]|0;
   ;HEAP32[$$byval_copy19+0>>2]=HEAP32[$24+0>>2]|0;
   $257 = (__Z3var3Lit($$byval_copy19)|0);
   $258 = (__ZN3vecIiEixEi($253,$257)|0);
   $259 = HEAP32[$258>>2]|0;
   $260 = ($252|0)>($259|0);
   if ($260) {
    $261 = $i3;
    $max_i = $261;
   }
   $262 = $i3;
   $263 = (($262) + 1)|0;
   $i3 = $263;
  }
  $264 = $2;
  $265 = $max_i;
  $266 = (__ZN3vecI3LitEixEi($264,$265)|0);
  ;HEAP32[$p4+0>>2]=HEAP32[$266+0>>2]|0;
  $267 = $2;
  $268 = $max_i;
  $269 = (__ZN3vecI3LitEixEi($267,$268)|0);
  $270 = $2;
  $271 = (__ZN3vecI3LitEixEi($270,1)|0);
  ;HEAP32[$269+0>>2]=HEAP32[$271+0>>2]|0;
  $272 = $2;
  $273 = (__ZN3vecI3LitEixEi($272,1)|0);
  ;HEAP32[$273+0>>2]=HEAP32[$p4+0>>2]|0;
  $274 = (($27) + 316|0);
  ;HEAP32[$25+0>>2]=HEAP32[$p4+0>>2]|0;
  ;HEAP32[$$byval_copy20+0>>2]=HEAP32[$25+0>>2]|0;
  $275 = (__Z3var3Lit($$byval_copy20)|0);
  $276 = (__ZN3vecIiEixEi($274,$275)|0);
  $277 = HEAP32[$276>>2]|0;
  $278 = $3;
  HEAP32[$278>>2] = $277;
 }
 $j5 = 0;
 while(1) {
  $279 = $j5;
  $280 = (($27) + 428|0);
  $281 = (__ZNK3vecI3LitE4sizeEv($280)|0);
  $282 = ($279|0)<($281|0);
  if (!($282)) {
   break;
  }
  $283 = (($27) + 404|0);
  $284 = (($27) + 428|0);
  $285 = $j5;
  $286 = (__ZN3vecI3LitEixEi($284,$285)|0);
  ;HEAP32[$26+0>>2]=HEAP32[$286+0>>2]|0;
  ;HEAP32[$$byval_copy21+0>>2]=HEAP32[$26+0>>2]|0;
  $287 = (__Z3var3Lit($$byval_copy21)|0);
  $288 = (__ZN3vecIcEixEi($283,$287)|0);
  HEAP8[$288>>0] = 0;
  $289 = $j5;
  $290 = (($289) + 1)|0;
  $j5 = $290;
 }
 STACKTOP = sp;return;
}
function __ZN3vecI3LitE4pushEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($1) + 8|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)==($5|0);
 if ($6) {
  $7 = (($1) + 8|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($8*3)|0;
  $10 = (($9) + 1)|0;
  $11 = $10 >> 1;
  $12 = (__ZN3vecI3LitE4imaxEii(2,$11)|0);
  $13 = (($1) + 8|0);
  HEAP32[$13>>2] = $12;
  $14 = HEAP32[$1>>2]|0;
  $15 = (($1) + 8|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = $16<<2;
  $18 = (_realloc($14,$17)|0);
  HEAP32[$1>>2] = $18;
 }
 $19 = (($1) + 4|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = HEAP32[$1>>2]|0;
 $22 = (($21) + ($20<<2)|0);
 $23 = ($22|0)==(0|0);
 if ($23) {
  $24 = (($1) + 4|0);
  $25 = HEAP32[$24>>2]|0;
  $26 = (($25) + 1)|0;
  HEAP32[$24>>2] = $26;
  STACKTOP = sp;return;
 }
 __ZN3LitC1Ev($22);
 $24 = (($1) + 4|0);
 $25 = HEAP32[$24>>2]|0;
 $26 = (($25) + 1)|0;
 HEAP32[$24>>2] = $26;
 STACKTOP = sp;return;
}
function __ZN6Solver15claBumpActivityER6Clause($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0.0, $3 = 0, $30 = 0.0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0.0, $9 = 0.0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $c;
 $2 = $0;
 $3 = (($2) + 200|0);
 $4 = +HEAPF64[$3>>3];
 $5 = $1;
 $6 = (__ZN6Clause8activityEv($5)|0);
 $7 = +HEAPF32[$6>>2];
 $8 = $7;
 $9 = $8 + $4;
 $10 = $9;
 HEAPF32[$6>>2] = $10;
 $11 = $10;
 $12 = $11 > 1.0E+20;
 if (!($12)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $13 = $i;
  $14 = (($2) + 184|0);
  $15 = (__ZNK3vecIP6ClauseE4sizeEv($14)|0);
  $16 = ($13|0)<($15|0);
  if (!($16)) {
   break;
  }
  $17 = (($2) + 184|0);
  $18 = $i;
  $19 = (__ZN3vecIP6ClauseEixEi($17,$18)|0);
  $20 = HEAP32[$19>>2]|0;
  $21 = (__ZN6Clause8activityEv($20)|0);
  $22 = +HEAPF32[$21>>2];
  $23 = $22;
  $24 = $23 * 9.99999999999999945153E-21;
  $25 = $24;
  HEAPF32[$21>>2] = $25;
  $26 = $i;
  $27 = (($26) + 1)|0;
  $i = $27;
 }
 $28 = (($2) + 200|0);
 $29 = +HEAPF64[$28>>3];
 $30 = $29 * 9.99999999999999945153E-21;
 HEAPF64[$28>>3] = $30;
 STACKTOP = sp;return;
}
function __ZN6Solver15varBumpActivityEi($this,$v) {
 $this = $this|0;
 $v = $v|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0.0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0.0, $23 = 0.0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $3 = 0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0, $8 = 0.0, $9 = 0.0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $v;
 $2 = $0;
 $3 = (($2) + 224|0);
 $4 = +HEAPF64[$3>>3];
 $5 = (($2) + 208|0);
 $6 = $1;
 $7 = (__ZN3vecIdEixEi($5,$6)|0);
 $8 = +HEAPF64[$7>>3];
 $9 = $8 + $4;
 HEAPF64[$7>>3] = $9;
 $10 = $9 > 1.0000000000000000159E+100;
 if ($10) {
  $i = 0;
  while(1) {
   $11 = $i;
   $12 = (__ZNK6Solver5nVarsEv($2)|0);
   $13 = ($11|0)<($12|0);
   if (!($13)) {
    break;
   }
   $14 = (($2) + 208|0);
   $15 = $i;
   $16 = (__ZN3vecIdEixEi($14,$15)|0);
   $17 = +HEAPF64[$16>>3];
   $18 = $17 * 1.00000000000000001999E-100;
   HEAPF64[$16>>3] = $18;
   $19 = $i;
   $20 = (($19) + 1)|0;
   $i = $20;
  }
  $21 = (($2) + 224|0);
  $22 = +HEAPF64[$21>>3];
  $23 = $22 * 1.00000000000000001999E-100;
  HEAPF64[$21>>3] = $23;
 }
 $24 = (($2) + 356|0);
 $25 = $1;
 $26 = (__ZNK4HeapIN6Solver10VarOrderLtEE6inHeapEi($24,$25)|0);
 if (!($26)) {
  STACKTOP = sp;return;
 }
 $27 = (($2) + 356|0);
 $28 = $1;
 __ZN4HeapIN6Solver10VarOrderLtEE8decreaseEi($27,$28);
 STACKTOP = sp;return;
}
function __ZNK6Solver13abstractLevelEi($this,$x) {
 $this = $this|0;
 $x = $x|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $x;
 $2 = $0;
 $3 = (($2) + 316|0);
 $4 = $1;
 $5 = (__ZNK3vecIiEixEi($3,$4)|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = $6 & 31;
 $8 = 1 << $7;
 STACKTOP = sp;return ($8|0);
}
function __ZNK3vecI3LitE6copyToERS1_($this,$copy) {
 $this = $this|0;
 $copy = $copy|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $copy;
 $2 = $0;
 $3 = $1;
 __ZN3vecI3LitE5clearEb($3,0);
 $4 = $1;
 $5 = (($2) + 4|0);
 $6 = HEAP32[$5>>2]|0;
 __ZN3vecI3LitE6growToEi($4,$6);
 $i = 0;
 while(1) {
  $7 = $i;
  $8 = (($2) + 4|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($7|0)<($9|0);
  if (!($10)) {
   break;
  }
  $11 = $1;
  $12 = $i;
  $13 = (__ZN3vecI3LitEixEi($11,$12)|0);
  $14 = ($13|0)==(0|0);
  if (!($14)) {
   $15 = $i;
   $16 = HEAP32[$2>>2]|0;
   $17 = (($16) + ($15<<2)|0);
   ;HEAP32[$13+0>>2]=HEAP32[$17+0>>2]|0;
  }
  $18 = $i;
  $19 = (($18) + 1)|0;
  $i = $19;
 }
 STACKTOP = sp;return;
}
function __ZN6Solver12litRedundantE3Litj($this,$p,$abstract_levels) {
 $this = $this|0;
 $p = $p|0;
 $abstract_levels = $abstract_levels|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$expand_i1_val = 0, $$expand_i1_val9 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0;
 var $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0;
 var $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0;
 var $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0;
 var $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $9 = 0, $c = 0, $i = 0, $j = 0;
 var $p1 = 0, $top = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $$byval_copy7 = sp + 32|0;
 $$byval_copy6 = sp;
 $$byval_copy5 = sp + 52|0;
 $$byval_copy4 = sp + 76|0;
 $$byval_copy3 = sp + 24|0;
 $$byval_copy2 = sp + 8|0;
 $$byval_copy1 = sp + 12|0;
 $$byval_copy = sp + 44|0;
 $3 = sp + 88|0;
 $4 = sp + 40|0;
 $p1 = sp + 56|0;
 $5 = sp + 16|0;
 $6 = sp + 60|0;
 $7 = sp + 4|0;
 $8 = sp + 20|0;
 $9 = sp + 68|0;
 $10 = sp + 64|0;
 $1 = $this;
 $2 = $abstract_levels;
 $11 = $1;
 $12 = (($11) + 416|0);
 __ZN3vecI3LitE5clearEb($12,0);
 $13 = (($11) + 416|0);
 __ZN3vecI3LitE4pushERKS0_($13,$p);
 $14 = (($11) + 428|0);
 $15 = (__ZNK3vecI3LitE4sizeEv($14)|0);
 $top = $15;
 L1: while(1) {
  $16 = (($11) + 416|0);
  $17 = (__ZNK3vecI3LitE4sizeEv($16)|0);
  $18 = ($17|0)>(0);
  if (!($18)) {
   label = 21;
   break;
  }
  $19 = (($11) + 304|0);
  $20 = (($11) + 416|0);
  $21 = (__ZN3vecI3LitE4lastEv($20)|0);
  ;HEAP32[$3+0>>2]=HEAP32[$21+0>>2]|0;
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$3+0>>2]|0;
  $22 = (__Z3var3Lit($$byval_copy)|0);
  $23 = (__ZN3vecIP6ClauseEixEi($19,$22)|0);
  $24 = HEAP32[$23>>2]|0;
  $25 = ($24|0)!=(0|0);
  if (!($25)) {
   label = 4;
   break;
  }
  $26 = (($11) + 304|0);
  $27 = (($11) + 416|0);
  $28 = (__ZN3vecI3LitE4lastEv($27)|0);
  ;HEAP32[$4+0>>2]=HEAP32[$28+0>>2]|0;
  ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$4+0>>2]|0;
  $29 = (__Z3var3Lit($$byval_copy1)|0);
  $30 = (__ZN3vecIP6ClauseEixEi($26,$29)|0);
  $31 = HEAP32[$30>>2]|0;
  $c = $31;
  $32 = (($11) + 416|0);
  __ZN3vecI3LitE3popEv($32);
  $i = 1;
  while(1) {
   $33 = $i;
   $34 = $c;
   $35 = (__ZNK6Clause4sizeEv($34)|0);
   $36 = ($33|0)<($35|0);
   if (!($36)) {
    break;
   }
   $37 = $c;
   $38 = $i;
   $39 = (__ZN6ClauseixEi($37,$38)|0);
   ;HEAP32[$p1+0>>2]=HEAP32[$39+0>>2]|0;
   $40 = (($11) + 404|0);
   ;HEAP32[$5+0>>2]=HEAP32[$p1+0>>2]|0;
   ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$5+0>>2]|0;
   $41 = (__Z3var3Lit($$byval_copy2)|0);
   $42 = (__ZN3vecIcEixEi($40,$41)|0);
   $43 = HEAP8[$42>>0]|0;
   $44 = ($43<<24>>24)!=(0);
   if (!($44)) {
    $45 = (($11) + 316|0);
    ;HEAP32[$6+0>>2]=HEAP32[$p1+0>>2]|0;
    ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$6+0>>2]|0;
    $46 = (__Z3var3Lit($$byval_copy3)|0);
    $47 = (__ZN3vecIiEixEi($45,$46)|0);
    $48 = HEAP32[$47>>2]|0;
    $49 = ($48|0)>(0);
    if ($49) {
     $50 = (($11) + 304|0);
     ;HEAP32[$7+0>>2]=HEAP32[$p1+0>>2]|0;
     ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$7+0>>2]|0;
     $51 = (__Z3var3Lit($$byval_copy4)|0);
     $52 = (__ZN3vecIP6ClauseEixEi($50,$51)|0);
     $53 = HEAP32[$52>>2]|0;
     $54 = ($53|0)!=(0|0);
     if (!($54)) {
      label = 12;
      break L1;
     }
     ;HEAP32[$8+0>>2]=HEAP32[$p1+0>>2]|0;
     ;HEAP32[$$byval_copy5+0>>2]=HEAP32[$8+0>>2]|0;
     $55 = (__Z3var3Lit($$byval_copy5)|0);
     $56 = (__ZNK6Solver13abstractLevelEi($11,$55)|0);
     $57 = $2;
     $58 = $56 & $57;
     $59 = ($58|0)!=(0);
     if (!($59)) {
      label = 12;
      break L1;
     }
     $60 = (($11) + 404|0);
     ;HEAP32[$9+0>>2]=HEAP32[$p1+0>>2]|0;
     ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$9+0>>2]|0;
     $61 = (__Z3var3Lit($$byval_copy6)|0);
     $62 = (__ZN3vecIcEixEi($60,$61)|0);
     HEAP8[$62>>0] = 1;
     $63 = (($11) + 416|0);
     __ZN3vecI3LitE4pushERKS0_($63,$p1);
     $64 = (($11) + 428|0);
     __ZN3vecI3LitE4pushERKS0_($64,$p1);
    }
   }
   $83 = $i;
   $84 = (($83) + 1)|0;
   $i = $84;
  }
 }
 if ((label|0) == 4) {
  ___assert_fail((1216|0),(1000|0),317,(1264|0));
  // unreachable;
 }
 else if ((label|0) == 12) {
  $65 = $top;
  $j = $65;
  while(1) {
   $66 = $j;
   $67 = (($11) + 428|0);
   $68 = (__ZNK3vecI3LitE4sizeEv($67)|0);
   $69 = ($66|0)<($68|0);
   if (!($69)) {
    break;
   }
   $70 = (($11) + 404|0);
   $71 = (($11) + 428|0);
   $72 = $j;
   $73 = (__ZN3vecI3LitEixEi($71,$72)|0);
   ;HEAP32[$10+0>>2]=HEAP32[$73+0>>2]|0;
   ;HEAP32[$$byval_copy7+0>>2]=HEAP32[$10+0>>2]|0;
   $74 = (__Z3var3Lit($$byval_copy7)|0);
   $75 = (__ZN3vecIcEixEi($70,$74)|0);
   HEAP8[$75>>0] = 0;
   $76 = $j;
   $77 = (($76) + 1)|0;
   $j = $77;
  }
  $78 = (($11) + 428|0);
  $79 = (($11) + 428|0);
  $80 = (__ZNK3vecI3LitE4sizeEv($79)|0);
  $81 = $top;
  $82 = (($80) - ($81))|0;
  __ZN3vecI3LitE6shrinkEi($78,$82);
  $$expand_i1_val = 0;
  $0 = $$expand_i1_val;
  $$pre_trunc = $0;
  $85 = $$pre_trunc&1;
  STACKTOP = sp;return ($85|0);
 }
 else if ((label|0) == 21) {
  $$expand_i1_val9 = 1;
  $0 = $$expand_i1_val9;
  $$pre_trunc = $0;
  $85 = $$pre_trunc&1;
  STACKTOP = sp;return ($85|0);
 }
 return 0|0;
}
function __ZN3vecI3LitE4lastEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) - 1)|0;
 $5 = HEAP32[$1>>2]|0;
 $6 = (($5) + ($4<<2)|0);
 STACKTOP = sp;return ($6|0);
}
function __ZN3vecI3LitE3popEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) + -1)|0;
 HEAP32[$2>>2] = $4;
 STACKTOP = sp;return;
}
function __ZN6Solver12analyzeFinalE3LitR3vecIS0_E($this,$p,$out_conflict) {
 $this = $this|0;
 $p = $p|0;
 $out_conflict = $out_conflict|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0;
 var $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0;
 var $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0;
 var $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $9 = 0, $c = 0, $i = 0, $j = 0, $x = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $$byval_copy5 = sp + 68|0;
 $$byval_copy4 = sp + 44|0;
 $$byval_copy3 = sp + 28|0;
 $$byval_copy2 = sp + 20|0;
 $$byval_copy1 = sp + 4|0;
 $$byval_copy = sp + 8|0;
 $2 = sp + 64|0;
 $3 = sp + 32|0;
 $4 = sp + 36|0;
 $5 = sp;
 $6 = sp + 52|0;
 $7 = sp + 16|0;
 $8 = sp + 60|0;
 $0 = $this;
 $1 = $out_conflict;
 $9 = $0;
 $10 = $1;
 __ZN3vecI3LitE5clearEb($10,0);
 $11 = $1;
 __ZN3vecI3LitE4pushERKS0_($11,$p);
 $12 = (__ZNK6Solver13decisionLevelEv($9)|0);
 $13 = ($12|0)==(0);
 if ($13) {
  STACKTOP = sp;return;
 }
 $14 = (($9) + 404|0);
 ;HEAP32[$2+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$2+0>>2]|0;
 $15 = (__Z3var3Lit($$byval_copy)|0);
 $16 = (__ZN3vecIcEixEi($14,$15)|0);
 HEAP8[$16>>0] = 1;
 $17 = (($9) + 280|0);
 $18 = (__ZNK3vecI3LitE4sizeEv($17)|0);
 $19 = (($18) - 1)|0;
 $i = $19;
 while(1) {
  $20 = $i;
  $21 = (($9) + 292|0);
  $22 = (__ZN3vecIiEixEi($21,0)|0);
  $23 = HEAP32[$22>>2]|0;
  $24 = ($20|0)>=($23|0);
  if (!($24)) {
   break;
  }
  $25 = (($9) + 280|0);
  $26 = $i;
  $27 = (__ZN3vecI3LitEixEi($25,$26)|0);
  ;HEAP32[$3+0>>2]=HEAP32[$27+0>>2]|0;
  ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$3+0>>2]|0;
  $28 = (__Z3var3Lit($$byval_copy1)|0);
  $x = $28;
  $29 = (($9) + 404|0);
  $30 = $x;
  $31 = (__ZN3vecIcEixEi($29,$30)|0);
  $32 = HEAP8[$31>>0]|0;
  $33 = ($32<<24>>24)!=(0);
  if ($33) {
   $34 = (($9) + 304|0);
   $35 = $x;
   $36 = (__ZN3vecIP6ClauseEixEi($34,$35)|0);
   $37 = HEAP32[$36>>2]|0;
   $38 = ($37|0)==(0|0);
   if ($38) {
    $39 = (($9) + 316|0);
    $40 = $x;
    $41 = (__ZN3vecIiEixEi($39,$40)|0);
    $42 = HEAP32[$41>>2]|0;
    $43 = ($42|0)>(0);
    if (!($43)) {
     label = 8;
     break;
    }
    $44 = $1;
    $45 = (($9) + 280|0);
    $46 = $i;
    $47 = (__ZN3vecI3LitEixEi($45,$46)|0);
    ;HEAP32[$5+0>>2]=HEAP32[$47+0>>2]|0;
    ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$5+0>>2]|0;
    __Zco3Lit($4,$$byval_copy2);
    __ZN3vecI3LitE4pushERKS0_($44,$4);
   } else {
    $48 = (($9) + 304|0);
    $49 = $x;
    $50 = (__ZN3vecIP6ClauseEixEi($48,$49)|0);
    $51 = HEAP32[$50>>2]|0;
    $c = $51;
    $j = 1;
    while(1) {
     $52 = $j;
     $53 = $c;
     $54 = (__ZNK6Clause4sizeEv($53)|0);
     $55 = ($52|0)<($54|0);
     if (!($55)) {
      break;
     }
     $56 = (($9) + 316|0);
     $57 = $c;
     $58 = $j;
     $59 = (__ZN6ClauseixEi($57,$58)|0);
     ;HEAP32[$6+0>>2]=HEAP32[$59+0>>2]|0;
     ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$6+0>>2]|0;
     $60 = (__Z3var3Lit($$byval_copy3)|0);
     $61 = (__ZN3vecIiEixEi($56,$60)|0);
     $62 = HEAP32[$61>>2]|0;
     $63 = ($62|0)>(0);
     if ($63) {
      $64 = (($9) + 404|0);
      $65 = $c;
      $66 = $j;
      $67 = (__ZN6ClauseixEi($65,$66)|0);
      ;HEAP32[$7+0>>2]=HEAP32[$67+0>>2]|0;
      ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$7+0>>2]|0;
      $68 = (__Z3var3Lit($$byval_copy4)|0);
      $69 = (__ZN3vecIcEixEi($64,$68)|0);
      HEAP8[$69>>0] = 1;
     }
     $70 = $j;
     $71 = (($70) + 1)|0;
     $j = $71;
    }
   }
   $72 = (($9) + 404|0);
   $73 = $x;
   $74 = (__ZN3vecIcEixEi($72,$73)|0);
   HEAP8[$74>>0] = 0;
  }
  $75 = $i;
  $76 = (($75) + -1)|0;
  $i = $76;
 }
 if ((label|0) == 8) {
  ___assert_fail((1280|0),(1000|0),364,(1296|0));
  // unreachable;
 }
 $77 = (($9) + 404|0);
 ;HEAP32[$8+0>>2]=HEAP32[$p+0>>2]|0;
 ;HEAP32[$$byval_copy5+0>>2]=HEAP32[$8+0>>2]|0;
 $78 = (__Z3var3Lit($$byval_copy5)|0);
 $79 = (__ZN3vecIcEixEi($77,$78)|0);
 HEAP8[$79>>0] = 0;
 STACKTOP = sp;return;
}
function __ZN5lboolC1Eb($this,$x) {
 $this = $this|0;
 $x = $x|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $x&1;
 $1 = $2;
 $3 = $0;
 $4 = $1;
 $5 = $4&1;
 __ZN5lboolC2Eb($3,$5);
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseEcvPS1_Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN3vecIP6ClauseE6shrinkEi($this,$nelems) {
 $this = $this|0;
 $nelems = $nelems|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $nelems;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)<=($5|0);
 if (!($6)) {
  ___assert_fail((2120|0),(2136|0),72,(2144|0));
  // unreachable;
 }
 $i = 0;
 while(1) {
  $7 = $i;
  $8 = $1;
  $9 = ($7|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = (($2) + 4|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = (($11) + -1)|0;
  HEAP32[$10>>2] = $12;
  $13 = $i;
  $14 = (($13) + 1)|0;
  $i = $14;
 }
 STACKTOP = sp;return;
}
function __ZN6Solver8reduceDBEv($this) {
 $this = $this|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0.0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0.0, $61 = 0.0;
 var $62 = 0.0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0.0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0.0;
 var $80 = 0, $81 = 0, $9 = 0, $extra_lim = 0.0, $i = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy = sp + 21|0;
 $1 = sp + 20|0;
 $0 = $this;
 $2 = $0;
 $3 = (($2) + 200|0);
 $4 = +HEAPF64[$3>>3];
 $5 = (($2) + 184|0);
 $6 = (__ZNK3vecIP6ClauseE4sizeEv($5)|0);
 $7 = (+($6|0));
 $8 = $4 / $7;
 $extra_lim = $8;
 $9 = (($2) + 184|0);
 ;HEAP8[$$byval_copy+0>>0]=HEAP8[$1+0>>0]|0;
 __Z4sortIP6Clause11reduceDB_ltEvR3vecIT_ET0_($9,$$byval_copy);
 $j = 0;
 $i = 0;
 while(1) {
  $10 = $i;
  $11 = (($2) + 184|0);
  $12 = (__ZNK3vecIP6ClauseE4sizeEv($11)|0);
  $13 = (($12|0) / 2)&-1;
  $14 = ($10|0)<($13|0);
  if (!($14)) {
   break;
  }
  $15 = (($2) + 184|0);
  $16 = $i;
  $17 = (__ZN3vecIP6ClauseEixEi($15,$16)|0);
  $18 = HEAP32[$17>>2]|0;
  $19 = (__ZNK6Clause4sizeEv($18)|0);
  $20 = ($19|0)>(2);
  if ($20) {
   $21 = (($2) + 184|0);
   $22 = $i;
   $23 = (__ZN3vecIP6ClauseEixEi($21,$22)|0);
   $24 = HEAP32[$23>>2]|0;
   $25 = (__ZNK6Solver6lockedERK6Clause($2,$24)|0);
   if ($25) {
    label = 6;
   } else {
    $26 = (($2) + 184|0);
    $27 = $i;
    $28 = (__ZN3vecIP6ClauseEixEi($26,$27)|0);
    $29 = HEAP32[$28>>2]|0;
    __ZN6Solver12removeClauseER6Clause($2,$29);
   }
  } else {
   label = 6;
  }
  if ((label|0) == 6) {
   label = 0;
   $30 = (($2) + 184|0);
   $31 = $i;
   $32 = (__ZN3vecIP6ClauseEixEi($30,$31)|0);
   $33 = HEAP32[$32>>2]|0;
   $34 = (($2) + 184|0);
   $35 = $j;
   $36 = (($35) + 1)|0;
   $j = $36;
   $37 = (__ZN3vecIP6ClauseEixEi($34,$35)|0);
   HEAP32[$37>>2] = $33;
  }
  $38 = $i;
  $39 = (($38) + 1)|0;
  $i = $39;
 }
 while(1) {
  $40 = $i;
  $41 = (($2) + 184|0);
  $42 = (__ZNK3vecIP6ClauseE4sizeEv($41)|0);
  $43 = ($40|0)<($42|0);
  if (!($43)) {
   break;
  }
  $44 = (($2) + 184|0);
  $45 = $i;
  $46 = (__ZN3vecIP6ClauseEixEi($44,$45)|0);
  $47 = HEAP32[$46>>2]|0;
  $48 = (__ZNK6Clause4sizeEv($47)|0);
  $49 = ($48|0)>(2);
  if ($49) {
   $50 = (($2) + 184|0);
   $51 = $i;
   $52 = (__ZN3vecIP6ClauseEixEi($50,$51)|0);
   $53 = HEAP32[$52>>2]|0;
   $54 = (__ZNK6Solver6lockedERK6Clause($2,$53)|0);
   if ($54) {
    label = 15;
   } else {
    $55 = (($2) + 184|0);
    $56 = $i;
    $57 = (__ZN3vecIP6ClauseEixEi($55,$56)|0);
    $58 = HEAP32[$57>>2]|0;
    $59 = (__ZN6Clause8activityEv($58)|0);
    $60 = +HEAPF32[$59>>2];
    $61 = $60;
    $62 = $extra_lim;
    $63 = $61 < $62;
    if ($63) {
     $64 = (($2) + 184|0);
     $65 = $i;
     $66 = (__ZN3vecIP6ClauseEixEi($64,$65)|0);
     $67 = HEAP32[$66>>2]|0;
     __ZN6Solver12removeClauseER6Clause($2,$67);
    } else {
     label = 15;
    }
   }
  } else {
   label = 15;
  }
  if ((label|0) == 15) {
   label = 0;
   $68 = (($2) + 184|0);
   $69 = $i;
   $70 = (__ZN3vecIP6ClauseEixEi($68,$69)|0);
   $71 = HEAP32[$70>>2]|0;
   $72 = (($2) + 184|0);
   $73 = $j;
   $74 = (($73) + 1)|0;
   $j = $74;
   $75 = (__ZN3vecIP6ClauseEixEi($72,$73)|0);
   HEAP32[$75>>2] = $71;
  }
  $76 = $i;
  $77 = (($76) + 1)|0;
  $i = $77;
 }
 $78 = (($2) + 184|0);
 $79 = $i;
 $80 = $j;
 $81 = (($79) - ($80))|0;
 __ZN3vecIP6ClauseE6shrinkEi($78,$81);
 STACKTOP = sp;return;
}
function __Z4sortIP6Clause11reduceDB_ltEvR3vecIT_ET0_($v,$lt) {
 $v = $v|0;
 $lt = $lt|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $$byval_copy = sp + 5|0;
 $1 = sp + 4|0;
 $0 = $v;
 $2 = $0;
 $3 = (__ZN3vecIP6ClauseEcvPS1_Ev($2)|0);
 $4 = $0;
 $5 = (__ZNK3vecIP6ClauseE4sizeEv($4)|0);
 ;HEAP8[$$byval_copy+0>>0]=HEAP8[$1+0>>0]|0;
 __Z4sortIP6Clause11reduceDB_ltEvPT_iT0_($3,$5,$$byval_copy);
 STACKTOP = sp;return;
}
function __ZNK6Solver6lockedERK6Clause($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy2 = sp + 25|0;
 $$byval_copy1 = sp + 12|0;
 $$byval_copy = sp + 20|0;
 $2 = sp + 16|0;
 $3 = sp + 4|0;
 $4 = sp + 24|0;
 $5 = sp + 26|0;
 $0 = $this;
 $1 = $c;
 $6 = $0;
 $7 = (($6) + 304|0);
 $8 = $1;
 __ZNK6ClauseixEi($2,$8,0);
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$2+0>>2]|0;
 $9 = (__Z3var3Lit($$byval_copy)|0);
 $10 = (__ZNK3vecIP6ClauseEixEi($7,$9)|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = $1;
 $13 = ($11|0)==($12|0);
 if (!($13)) {
  $16 = 0;
  STACKTOP = sp;return ($16|0);
 }
 $14 = $1;
 __ZNK6ClauseixEi($3,$14,0);
 ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$3+0>>2]|0;
 __ZNK6Solver5valueE3Lit($4,$6,$$byval_copy1);
 ;HEAP8[$5+0>>0]=HEAP8[952+0>>0]|0;
 ;HEAP8[$$byval_copy2+0>>0]=HEAP8[$5+0>>0]|0;
 $15 = (__ZNK5lbooleqES_($4,$$byval_copy2)|0);
 $16 = $15;
 STACKTOP = sp;return ($16|0);
}
function __ZN6Clause8activityEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 STACKTOP = sp;return ($2|0);
}
function __ZN6Solver15removeSatisfiedER3vecIP6ClauseE($this,$cs) {
 $this = $this|0;
 $cs = $cs|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $cs;
 $2 = $0;
 $j = 0;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $1;
  $5 = (__ZNK3vecIP6ClauseE4sizeEv($4)|0);
  $6 = ($3|0)<($5|0);
  if (!($6)) {
   break;
  }
  $7 = $1;
  $8 = $i;
  $9 = (__ZN3vecIP6ClauseEixEi($7,$8)|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = (__ZNK6Solver9satisfiedERK6Clause($2,$10)|0);
  if ($11) {
   $12 = $1;
   $13 = $i;
   $14 = (__ZN3vecIP6ClauseEixEi($12,$13)|0);
   $15 = HEAP32[$14>>2]|0;
   __ZN6Solver12removeClauseER6Clause($2,$15);
  } else {
   $16 = $1;
   $17 = $i;
   $18 = (__ZN3vecIP6ClauseEixEi($16,$17)|0);
   $19 = HEAP32[$18>>2]|0;
   $20 = $1;
   $21 = $j;
   $22 = (($21) + 1)|0;
   $j = $22;
   $23 = (__ZN3vecIP6ClauseEixEi($20,$21)|0);
   HEAP32[$23>>2] = $19;
  }
  $24 = $i;
  $25 = (($24) + 1)|0;
  $i = $25;
 }
 $26 = $1;
 $27 = $i;
 $28 = $j;
 $29 = (($27) - ($28))|0;
 __ZN3vecIP6ClauseE6shrinkEi($26,$29);
 STACKTOP = sp;return;
}
function __ZN6Solver8simplifyEv($this) {
 $this = $this|0;
 var $$expand_i1_val = 0, $$expand_i1_val2 = 0, $$expand_i1_val4 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $2 = sp;
 $1 = $this;
 $3 = $1;
 $4 = (__ZNK6Solver13decisionLevelEv($3)|0);
 $5 = ($4|0)==(0);
 if (!($5)) {
  ___assert_fail((976|0),(1000|0),509,(1400|0));
  // unreachable;
 }
 $6 = (($3) + 168|0);
 $7 = HEAP8[$6>>0]|0;
 $8 = $7&1;
 if ($8) {
  $9 = (__ZN6Solver9propagateEv($3)|0);
  $10 = ($9|0)!=(0|0);
  if (!($10)) {
   $12 = (__ZNK6Solver8nAssignsEv($3)|0);
   $13 = (($3) + 332|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = ($12|0)==($14|0);
   if (!($15)) {
    $16 = (($3) + 336|0);
    $17 = $16;
    $18 = $17;
    $19 = HEAP32[$18>>2]|0;
    $20 = (($17) + 4)|0;
    $21 = $20;
    $22 = HEAP32[$21>>2]|0;
    $23 = ($22|0)>(0);
    $24 = ($22|0)==(0);
    $25 = ($19>>>0)>(0);
    $26 = $24 & $25;
    $27 = $23 | $26;
    if (!($27)) {
     $28 = (($3) + 184|0);
     __ZN6Solver15removeSatisfiedER3vecIP6ClauseE($3,$28);
     $29 = (($3) + 400|0);
     $30 = HEAP8[$29>>0]|0;
     $31 = $30&1;
     if ($31) {
      $32 = (($3) + 172|0);
      __ZN6Solver15removeSatisfiedER3vecIP6ClauseE($3,$32);
     }
     $33 = (($3) + 356|0);
     __ZN6Solver9VarFilterC1ERKS_($2,$3);
     __ZN4HeapIN6Solver10VarOrderLtEE6filterINS0_9VarFilterEEEvRKT_($33,$2);
     $34 = (__ZNK6Solver8nAssignsEv($3)|0);
     $35 = (($3) + 332|0);
     HEAP32[$35>>2] = $34;
     $36 = (($3) + 136|0);
     $37 = $36;
     $38 = $37;
     $39 = HEAP32[$38>>2]|0;
     $40 = (($37) + 4)|0;
     $41 = $40;
     $42 = HEAP32[$41>>2]|0;
     $43 = (($3) + 144|0);
     $44 = $43;
     $45 = $44;
     $46 = HEAP32[$45>>2]|0;
     $47 = (($44) + 4)|0;
     $48 = $47;
     $49 = HEAP32[$48>>2]|0;
     $50 = (_i64Add(($39|0),($42|0),($46|0),($49|0))|0);
     $51 = tempRet0;
     $52 = (($3) + 336|0);
     $53 = $52;
     $54 = $53;
     HEAP32[$54>>2] = $50;
     $55 = (($53) + 4)|0;
     $56 = $55;
     HEAP32[$56>>2] = $51;
     $$expand_i1_val4 = 1;
     $0 = $$expand_i1_val4;
     $$pre_trunc = $0;
     $57 = $$pre_trunc&1;
     STACKTOP = sp;return ($57|0);
    }
   }
   $$expand_i1_val2 = 1;
   $0 = $$expand_i1_val2;
   $$pre_trunc = $0;
   $57 = $$pre_trunc&1;
   STACKTOP = sp;return ($57|0);
  }
 }
 $11 = (($3) + 168|0);
 HEAP8[$11>>0] = 0;
 $$expand_i1_val = 0;
 $0 = $$expand_i1_val;
 $$pre_trunc = $0;
 $57 = $$pre_trunc&1;
 STACKTOP = sp;return ($57|0);
}
function __ZNK6Solver8nAssignsEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 280|0);
 $3 = (__ZNK3vecI3LitE4sizeEv($2)|0);
 STACKTOP = sp;return ($3|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEE6filterINS0_9VarFilterEEEvRKT_($this,$filt) {
 $this = $this|0;
 $filt = $filt|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $i1 = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $this;
 $1 = $filt;
 $2 = $0;
 $j = 0;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = (($2) + 4|0);
  $5 = (__ZNK3vecIiE4sizeEv($4)|0);
  $6 = ($3|0)<($5|0);
  if (!($6)) {
   break;
  }
  $7 = $1;
  $8 = (($2) + 4|0);
  $9 = $i;
  $10 = (__ZN3vecIiEixEi($8,$9)|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = (__ZNK6Solver9VarFilterclEi($7,$11)|0);
  if ($12) {
   $13 = (($2) + 4|0);
   $14 = $i;
   $15 = (__ZN3vecIiEixEi($13,$14)|0);
   $16 = HEAP32[$15>>2]|0;
   $17 = (($2) + 4|0);
   $18 = $j;
   $19 = (__ZN3vecIiEixEi($17,$18)|0);
   HEAP32[$19>>2] = $16;
   $20 = $j;
   $21 = (($20) + 1)|0;
   $j = $21;
   $22 = (($2) + 16|0);
   $23 = (($2) + 4|0);
   $24 = $i;
   $25 = (__ZN3vecIiEixEi($23,$24)|0);
   $26 = HEAP32[$25>>2]|0;
   $27 = (__ZN3vecIiEixEi($22,$26)|0);
   HEAP32[$27>>2] = $20;
  } else {
   $28 = (($2) + 16|0);
   $29 = (($2) + 4|0);
   $30 = $i;
   $31 = (__ZN3vecIiEixEi($29,$30)|0);
   $32 = HEAP32[$31>>2]|0;
   $33 = (__ZN3vecIiEixEi($28,$32)|0);
   HEAP32[$33>>2] = -1;
  }
  $34 = $i;
  $35 = (($34) + 1)|0;
  $i = $35;
 }
 $36 = (($2) + 4|0);
 $37 = $i;
 $38 = $j;
 $39 = (($37) - ($38))|0;
 __ZN3vecIiE6shrinkEi($36,$39);
 $40 = (($2) + 4|0);
 $41 = (__ZNK3vecIiE4sizeEv($40)|0);
 $42 = (($41|0) / 2)&-1;
 $43 = (($42) - 1)|0;
 $i1 = $43;
 while(1) {
  $44 = $i1;
  $45 = ($44|0)>=(0);
  if (!($45)) {
   break;
  }
  $46 = $i1;
  __ZN4HeapIN6Solver10VarOrderLtEE13percolateDownEi($2,$46);
  $47 = $i1;
  $48 = (($47) + -1)|0;
  $i1 = $48;
 }
 $49 = (__ZNK4HeapIN6Solver10VarOrderLtEE12heapPropertyEv($2)|0);
 if ($49) {
  STACKTOP = sp;return;
 } else {
  ___assert_fail((2080|0),(2096|0),151,(2112|0));
  // unreachable;
 }
}
function __ZN6Solver9VarFilterC1ERKS_($this,$_s) {
 $this = $this|0;
 $_s = $_s|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $_s;
 $2 = $0;
 $3 = $1;
 __ZN6Solver9VarFilterC2ERKS_($2,$3);
 STACKTOP = sp;return;
}
function __ZN6Solver6searchEii($agg$result,$this,$nof_conflicts,$nof_learnts) {
 $agg$result = $agg$result|0;
 $this = $this|0;
 $nof_conflicts = $nof_conflicts|0;
 $nof_learnts = $nof_learnts|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy13 = 0, $$byval_copy14 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $$byval_copy9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0;
 var $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0.0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0.0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $backtrack_level = 0;
 var $c = 0, $confl = 0, $conflictC = 0, $first = 0, $learnt_clause = 0, $next = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 176|0;
 $$byval_copy14 = sp + 84|0;
 $$byval_copy13 = sp + 156|0;
 $$byval_copy12 = sp + 104|0;
 $$byval_copy11 = sp + 92|0;
 $$byval_copy10 = sp + 48|0;
 $$byval_copy9 = sp + 8|0;
 $$byval_copy8 = sp + 12|0;
 $$byval_copy7 = sp + 154|0;
 $$byval_copy6 = sp + 16|0;
 $$byval_copy5 = sp + 157|0;
 $$byval_copy4 = sp + 24|0;
 $$byval_copy3 = sp + 28|0;
 $$byval_copy2 = sp + 32|0;
 $$byval_copy1 = sp + 158|0;
 $$byval_copy = sp + 120|0;
 $backtrack_level = sp + 52|0;
 $learnt_clause = sp + 60|0;
 $6 = sp + 4|0;
 $7 = sp + 162|0;
 $8 = sp + 160|0;
 $9 = sp + 108|0;
 $c = sp + 36|0;
 $10 = sp + 40|0;
 $next = sp + 124|0;
 $p = sp + 44|0;
 $11 = sp + 132|0;
 $12 = sp + 161|0;
 $13 = sp + 163|0;
 $14 = sp + 140|0;
 $15 = sp + 155|0;
 $16 = sp + 152|0;
 $17 = sp + 100|0;
 $18 = sp;
 $19 = sp + 72|0;
 $20 = sp + 112|0;
 $21 = sp + 20|0;
 $22 = sp + 96|0;
 $23 = sp + 153|0;
 $24 = sp + 159|0;
 $25 = sp + 116|0;
 $0 = $this;
 $1 = $nof_conflicts;
 $2 = $nof_learnts;
 $26 = $0;
 $27 = (($26) + 168|0);
 $28 = HEAP8[$27>>0]|0;
 $29 = $28&1;
 if (!($29)) {
  ___assert_fail((1416|0),(1000|0),548,(1424|0));
  // unreachable;
 }
 $conflictC = 0;
 __ZN3vecI3LitEC1Ev($learnt_clause);
 $30 = (($26) + 96|0);
 $31 = $30;
 $32 = $31;
 $33 = HEAP32[$32>>2]|0;
 $34 = (($31) + 4)|0;
 $35 = $34;
 $36 = HEAP32[$35>>2]|0;
 $37 = (_i64Add(($33|0),($36|0),1,0)|0);
 $38 = tempRet0;
 $39 = $30;
 $40 = $39;
 HEAP32[$40>>2] = $37;
 $41 = (($39) + 4)|0;
 $42 = $41;
 HEAP32[$42>>2] = $38;
 $first = 1;
 L4: while(1) {
  __THREW__ = 0;
  $43 = (invoke_ii(43,($26|0))|0);
  $44 = __THREW__; __THREW__ = 0;
  $45 = $44&1;
  if ($45) {
   break;
  }
  $confl = $43;
  $46 = $confl;
  $47 = ($46|0)!=(0|0);
  if ($47) {
   $48 = (($26) + 128|0);
   $49 = $48;
   $50 = $49;
   $51 = HEAP32[$50>>2]|0;
   $52 = (($49) + 4)|0;
   $53 = $52;
   $54 = HEAP32[$53>>2]|0;
   $55 = (_i64Add(($51|0),($54|0),1,0)|0);
   $56 = tempRet0;
   $57 = $48;
   $58 = $57;
   HEAP32[$58>>2] = $55;
   $59 = (($57) + 4)|0;
   $60 = $59;
   HEAP32[$60>>2] = $56;
   $61 = $conflictC;
   $62 = (($61) + 1)|0;
   $conflictC = $62;
   __THREW__ = 0;
   $63 = (invoke_ii(44,($26|0))|0);
   $64 = __THREW__; __THREW__ = 0;
   $65 = $64&1;
   if ($65) {
    break;
   }
   $66 = ($63|0)==(0);
   if ($66) {
    label = 8;
    break;
   }
   $first = 0;
   __THREW__ = 0;
   invoke_vii(45,($learnt_clause|0),0);
   $71 = __THREW__; __THREW__ = 0;
   $72 = $71&1;
   if ($72) {
    break;
   }
   $73 = $confl;
   __THREW__ = 0;
   invoke_viiii(46,($26|0),($73|0),($learnt_clause|0),($backtrack_level|0));
   $74 = __THREW__; __THREW__ = 0;
   $75 = $74&1;
   if ($75) {
    break;
   }
   $76 = HEAP32[$backtrack_level>>2]|0;
   __THREW__ = 0;
   invoke_vii(47,($26|0),($76|0));
   $77 = __THREW__; __THREW__ = 0;
   $78 = $77&1;
   if ($78) {
    break;
   }
   __THREW__ = 0;
   $79 = (invoke_iii(23,($learnt_clause|0),0)|0);
   $80 = __THREW__; __THREW__ = 0;
   $81 = $80&1;
   if ($81) {
    break;
   }
   ;HEAP32[$6+0>>2]=HEAP32[$79+0>>2]|0;
   __THREW__ = 0;
   ;HEAP32[$$byval_copy+0>>2]=HEAP32[$6+0>>2]|0;
   invoke_viii(48,($7|0),($26|0),($$byval_copy|0));
   $82 = __THREW__; __THREW__ = 0;
   $83 = $82&1;
   if ($83) {
    break;
   }
   ;HEAP8[$8+0>>0]=HEAP8[968+0>>0]|0;
   __THREW__ = 0;
   ;HEAP8[$$byval_copy1+0>>0]=HEAP8[$8+0>>0]|0;
   $84 = (invoke_iii(20,($7|0),($$byval_copy1|0))|0);
   $85 = __THREW__; __THREW__ = 0;
   $86 = $85&1;
   if ($86) {
    break;
   }
   if (!($84)) {
    label = 17;
    break;
   }
   __THREW__ = 0;
   $89 = (invoke_ii(50,($learnt_clause|0))|0);
   $90 = __THREW__; __THREW__ = 0;
   $91 = $90&1;
   if ($91) {
    break;
   }
   $92 = ($89|0)==(1);
   if ($92) {
    __THREW__ = 0;
    $93 = (invoke_iii(23,($learnt_clause|0),0)|0);
    $94 = __THREW__; __THREW__ = 0;
    $95 = $94&1;
    if ($95) {
     break;
    }
    ;HEAP32[$9+0>>2]=HEAP32[$93+0>>2]|0;
    __THREW__ = 0;
    ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$9+0>>2]|0;
    invoke_viii(51,($26|0),($$byval_copy2|0),(0|0));
    $96 = __THREW__; __THREW__ = 0;
    $97 = $96&1;
    if ($97) {
     break;
    }
   } else {
    __THREW__ = 0;
    $98 = (invoke_iii(52,($learnt_clause|0),1)|0);
    $99 = __THREW__; __THREW__ = 0;
    $100 = $99&1;
    if ($100) {
     break;
    }
    HEAP32[$c>>2] = $98;
    $101 = (($26) + 184|0);
    __THREW__ = 0;
    invoke_vii(53,($101|0),($c|0));
    $102 = __THREW__; __THREW__ = 0;
    $103 = $102&1;
    if ($103) {
     break;
    }
    $104 = HEAP32[$c>>2]|0;
    __THREW__ = 0;
    invoke_vii(54,($26|0),($104|0));
    $105 = __THREW__; __THREW__ = 0;
    $106 = $105&1;
    if ($106) {
     break;
    }
    $107 = HEAP32[$c>>2]|0;
    __THREW__ = 0;
    invoke_vii(55,($26|0),($107|0));
    $108 = __THREW__; __THREW__ = 0;
    $109 = $108&1;
    if ($109) {
     break;
    }
    __THREW__ = 0;
    $110 = (invoke_iii(23,($learnt_clause|0),0)|0);
    $111 = __THREW__; __THREW__ = 0;
    $112 = $111&1;
    if ($112) {
     break;
    }
    ;HEAP32[$10+0>>2]=HEAP32[$110+0>>2]|0;
    $113 = HEAP32[$c>>2]|0;
    __THREW__ = 0;
    ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$10+0>>2]|0;
    invoke_viii(51,($26|0),($$byval_copy3|0),($113|0));
    $114 = __THREW__; __THREW__ = 0;
    $115 = $114&1;
    if ($115) {
     break;
    }
   }
   __THREW__ = 0;
   invoke_vi(56,($26|0));
   $116 = __THREW__; __THREW__ = 0;
   $117 = $116&1;
   if ($117) {
    break;
   }
   __THREW__ = 0;
   invoke_vi(57,($26|0));
   $118 = __THREW__; __THREW__ = 0;
   $119 = $118&1;
   if ($119) {
    break;
   }
  } else {
   $120 = $1;
   $121 = ($120|0)>=(0);
   if ($121) {
    $122 = $conflictC;
    $123 = $1;
    $124 = ($122|0)>=($123|0);
    if ($124) {
     label = 36;
     break;
    }
   }
   __THREW__ = 0;
   $131 = (invoke_ii(44,($26|0))|0);
   $132 = __THREW__; __THREW__ = 0;
   $133 = $132&1;
   if ($133) {
    break;
   }
   $134 = ($131|0)==(0);
   if ($134) {
    __THREW__ = 0;
    $135 = (invoke_ii(13,($26|0))|0);
    $136 = __THREW__; __THREW__ = 0;
    $137 = $136&1;
    if ($137) {
     break;
    }
    if (!($135)) {
     label = 43;
     break;
    }
   }
   $138 = $2;
   $139 = ($138|0)>=(0);
   if ($139) {
    $140 = (($26) + 184|0);
    __THREW__ = 0;
    $141 = (invoke_ii(40,($140|0))|0);
    $142 = __THREW__; __THREW__ = 0;
    $143 = $142&1;
    if ($143) {
     break;
    }
    __THREW__ = 0;
    $144 = (invoke_ii(59,($26|0))|0);
    $145 = __THREW__; __THREW__ = 0;
    $146 = $145&1;
    if ($146) {
     break;
    }
    $147 = (($141) - ($144))|0;
    $148 = $2;
    $149 = ($147|0)>=($148|0);
    if ($149) {
     __THREW__ = 0;
     invoke_vi(60,($26|0));
     $150 = __THREW__; __THREW__ = 0;
     $151 = $150&1;
     if ($151) {
      break;
     }
    }
   }
   ;HEAP32[$next+0>>2]=HEAP32[936+0>>2]|0;
   while(1) {
    __THREW__ = 0;
    $152 = (invoke_ii(44,($26|0))|0);
    $153 = __THREW__; __THREW__ = 0;
    $154 = $153&1;
    if ($154) {
     break L4;
    }
    $155 = (($26) + 344|0);
    __THREW__ = 0;
    $156 = (invoke_ii(50,($155|0))|0);
    $157 = __THREW__; __THREW__ = 0;
    $158 = $157&1;
    if ($158) {
     break L4;
    }
    $159 = ($152|0)<($156|0);
    if (!($159)) {
     break;
    }
    $160 = (($26) + 344|0);
    __THREW__ = 0;
    $161 = (invoke_ii(44,($26|0))|0);
    $162 = __THREW__; __THREW__ = 0;
    $163 = $162&1;
    if ($163) {
     break L4;
    }
    __THREW__ = 0;
    $164 = (invoke_iii(23,($160|0),($161|0))|0);
    $165 = __THREW__; __THREW__ = 0;
    $166 = $165&1;
    if ($166) {
     break L4;
    }
    ;HEAP32[$p+0>>2]=HEAP32[$164+0>>2]|0;
    ;HEAP32[$11+0>>2]=HEAP32[$p+0>>2]|0;
    __THREW__ = 0;
    ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$11+0>>2]|0;
    invoke_viii(48,($12|0),($26|0),($$byval_copy4|0));
    $167 = __THREW__; __THREW__ = 0;
    $168 = $167&1;
    if ($168) {
     break L4;
    }
    ;HEAP8[$13+0>>0]=HEAP8[952+0>>0]|0;
    __THREW__ = 0;
    ;HEAP8[$$byval_copy5+0>>0]=HEAP8[$13+0>>0]|0;
    $169 = (invoke_iii(20,($12|0),($$byval_copy5|0))|0);
    $170 = __THREW__; __THREW__ = 0;
    $171 = $170&1;
    if ($171) {
     break L4;
    }
    if (!($169)) {
     label = 61;
     break;
    }
    __THREW__ = 0;
    invoke_vi(61,($26|0));
    $172 = __THREW__; __THREW__ = 0;
    $173 = $172&1;
    if ($173) {
     break L4;
    }
   }
   if ((label|0) == 61) {
    label = 0;
    ;HEAP32[$14+0>>2]=HEAP32[$p+0>>2]|0;
    __THREW__ = 0;
    ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$14+0>>2]|0;
    invoke_viii(48,($15|0),($26|0),($$byval_copy6|0));
    $174 = __THREW__; __THREW__ = 0;
    $175 = $174&1;
    if ($175) {
     break;
    }
    ;HEAP8[$16+0>>0]=HEAP8[960+0>>0]|0;
    __THREW__ = 0;
    ;HEAP8[$$byval_copy7+0>>0]=HEAP8[$16+0>>0]|0;
    $176 = (invoke_iii(20,($15|0),($$byval_copy7|0))|0);
    $177 = __THREW__; __THREW__ = 0;
    $178 = $177&1;
    if ($178) {
     break;
    }
    if ($176) {
     label = 64;
     break;
    }
    ;HEAP32[$next+0>>2]=HEAP32[$p+0>>2]|0;
   }
   ;HEAP32[$19+0>>2]=HEAP32[936+0>>2]|0;
   __THREW__ = 0;
   ;HEAP32[$$byval_copy10+0>>2]=HEAP32[$19+0>>2]|0;
   $184 = (invoke_iii(63,($next|0),($$byval_copy10|0))|0);
   $185 = __THREW__; __THREW__ = 0;
   $186 = $185&1;
   if ($186) {
    break;
   }
   if ($184) {
    $187 = (($26) + 104|0);
    $188 = $187;
    $189 = $188;
    $190 = HEAP32[$189>>2]|0;
    $191 = (($188) + 4)|0;
    $192 = $191;
    $193 = HEAP32[$192>>2]|0;
    $194 = (_i64Add(($190|0),($193|0),1,0)|0);
    $195 = tempRet0;
    $196 = $187;
    $197 = $196;
    HEAP32[$197>>2] = $194;
    $198 = (($196) + 4)|0;
    $199 = $198;
    HEAP32[$199>>2] = $195;
    $200 = (($26) + 84|0);
    $201 = HEAP32[$200>>2]|0;
    $202 = (($26) + 40|0);
    $203 = +HEAPF64[$202>>3];
    __THREW__ = 0;
    invoke_viiid(64,($20|0),($26|0),($201|0),(+$203));
    $204 = __THREW__; __THREW__ = 0;
    $205 = $204&1;
    if ($205) {
     break;
    }
    ;HEAP32[$next+0>>2]=HEAP32[$20+0>>2]|0;
    ;HEAP32[$21+0>>2]=HEAP32[936+0>>2]|0;
    __THREW__ = 0;
    ;HEAP32[$$byval_copy11+0>>2]=HEAP32[$21+0>>2]|0;
    $206 = (invoke_iii(63,($next|0),($$byval_copy11|0))|0);
    $207 = __THREW__; __THREW__ = 0;
    $208 = $207&1;
    if ($208) {
     break;
    }
    if ($206) {
     label = 74;
     break;
    }
   }
   ;HEAP32[$22+0>>2]=HEAP32[$next+0>>2]|0;
   __THREW__ = 0;
   ;HEAP32[$$byval_copy12+0>>2]=HEAP32[$22+0>>2]|0;
   invoke_viii(48,($23|0),($26|0),($$byval_copy12|0));
   $209 = __THREW__; __THREW__ = 0;
   $210 = $209&1;
   if ($210) {
    break;
   }
   ;HEAP8[$24+0>>0]=HEAP8[968+0>>0]|0;
   __THREW__ = 0;
   ;HEAP8[$$byval_copy13+0>>0]=HEAP8[$24+0>>0]|0;
   $211 = (invoke_iii(20,($23|0),($$byval_copy13|0))|0);
   $212 = __THREW__; __THREW__ = 0;
   $213 = $212&1;
   if ($213) {
    break;
   }
   if (!($211)) {
    label = 79;
    break;
   }
   __THREW__ = 0;
   invoke_vi(61,($26|0));
   $216 = __THREW__; __THREW__ = 0;
   $217 = $216&1;
   if ($217) {
    break;
   }
   ;HEAP32[$25+0>>2]=HEAP32[$next+0>>2]|0;
   __THREW__ = 0;
   ;HEAP32[$$byval_copy14+0>>2]=HEAP32[$25+0>>2]|0;
   invoke_viii(51,($26|0),($$byval_copy14|0),(0|0));
   $218 = __THREW__; __THREW__ = 0;
   $219 = $218&1;
   if ($219) {
    break;
   }
  }
 }
 if ((label|0) == 8) {
  ;HEAP8[$agg$result+0>>0]=HEAP8[960+0>>0]|0;
  $5 = 1;
  __ZN3vecI3LitED1Ev($learnt_clause);
  STACKTOP = sp;return;
 }
 else if ((label|0) == 17) {
  __THREW__ = 0;
  invoke_viiii(49,(1432|0),(1000|0),569,(1424|0));
  $87 = __THREW__; __THREW__ = 0;
  $88 = $87&1;
  if (!($88)) {
   // unreachable;
  }
 }
 else if ((label|0) == 36) {
  __THREW__ = 0;
  $125 = (+invoke_di(58,($26|0)));
  $126 = __THREW__; __THREW__ = 0;
  $127 = $126&1;
  if (!($127)) {
   $128 = (($26) + 392|0);
   HEAPF64[$128>>3] = $125;
   __THREW__ = 0;
   invoke_vii(47,($26|0),0);
   $129 = __THREW__; __THREW__ = 0;
   $130 = $129&1;
   if (!($130)) {
    ;HEAP8[$agg$result+0>>0]=HEAP8[968+0>>0]|0;
    $5 = 1;
    __ZN3vecI3LitED1Ev($learnt_clause);
    STACKTOP = sp;return;
   }
  }
 }
 else if ((label|0) == 43) {
  ;HEAP8[$agg$result+0>>0]=HEAP8[960+0>>0]|0;
  $5 = 1;
  __ZN3vecI3LitED1Ev($learnt_clause);
  STACKTOP = sp;return;
 }
 else if ((label|0) == 64) {
  ;HEAP32[$18+0>>2]=HEAP32[$p+0>>2]|0;
  __THREW__ = 0;
  ;HEAP32[$$byval_copy8+0>>2]=HEAP32[$18+0>>2]|0;
  invoke_vii(24,($17|0),($$byval_copy8|0));
  $179 = __THREW__; __THREW__ = 0;
  $180 = $179&1;
  if (!($180)) {
   $181 = (($26) + 12|0);
   __THREW__ = 0;
   ;HEAP32[$$byval_copy9+0>>2]=HEAP32[$17+0>>2]|0;
   invoke_viii(62,($26|0),($$byval_copy9|0),($181|0));
   $182 = __THREW__; __THREW__ = 0;
   $183 = $182&1;
   if (!($183)) {
    ;HEAP8[$agg$result+0>>0]=HEAP8[960+0>>0]|0;
    $5 = 1;
    __ZN3vecI3LitED1Ev($learnt_clause);
    STACKTOP = sp;return;
   }
  }
 }
 else if ((label|0) == 74) {
  ;HEAP8[$agg$result+0>>0]=HEAP8[952+0>>0]|0;
  $5 = 1;
  __ZN3vecI3LitED1Ev($learnt_clause);
  STACKTOP = sp;return;
 }
 else if ((label|0) == 79) {
  __THREW__ = 0;
  invoke_viiii(49,(1472|0),(1000|0),628,(1424|0));
  $214 = __THREW__; __THREW__ = 0;
  $215 = $214&1;
  if (!($215)) {
   // unreachable;
  }
 }
 $67 = ___cxa_find_matching_catch(-1,-1)|0;
 $68 = tempRet0;
 $3 = $67;
 $4 = $68;
 __THREW__ = 0;
 invoke_vi(11,($learnt_clause|0));
 $69 = __THREW__; __THREW__ = 0;
 $70 = $69&1;
 if ($70) {
  $222 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $223 = tempRet0;
  ___clang_call_terminate($222);
  // unreachable;
 }
 $220 = $3;
 $221 = $4;
 ___resumeException($220|0);
 // unreachable;
}
function __ZN6Solver16varDecayActivityEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0.0, $4 = 0, $5 = 0.0, $6 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 24|0);
 $3 = +HEAPF64[$2>>3];
 $4 = (($1) + 224|0);
 $5 = +HEAPF64[$4>>3];
 $6 = $5 * $3;
 HEAPF64[$4>>3] = $6;
 STACKTOP = sp;return;
}
function __ZN6Solver16claDecayActivityEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0.0, $4 = 0, $5 = 0.0, $6 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 32|0);
 $3 = +HEAPF64[$2>>3];
 $4 = (($1) + 200|0);
 $5 = +HEAPF64[$4>>3];
 $6 = $5 * $3;
 HEAPF64[$4>>3] = $6;
 STACKTOP = sp;return;
}
function __ZNK6Solver16progressEstimateEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0.0;
 var $27 = 0, $28 = 0.0, $29 = 0.0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0, $38 = 0, $39 = 0.0, $4 = 0.0, $40 = 0, $41 = 0.0, $42 = 0.0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $F = 0.0, $beg = 0, $end = 0, $i = 0, $progress = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $this;
 $1 = $0;
 $progress = 0.0;
 $2 = (__ZNK6Solver5nVarsEv($1)|0);
 $3 = (+($2|0));
 $4 = 1.0 / $3;
 $F = $4;
 $i = 0;
 while(1) {
  $5 = $i;
  $6 = (__ZNK6Solver13decisionLevelEv($1)|0);
  $7 = ($5|0)<=($6|0);
  if (!($7)) {
   break;
  }
  $8 = $i;
  $9 = ($8|0)==(0);
  if ($9) {
   $15 = 0;
  } else {
   $10 = (($1) + 292|0);
   $11 = $i;
   $12 = (($11) - 1)|0;
   $13 = (__ZNK3vecIiEixEi($10,$12)|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = $14;
  }
  $beg = $15;
  $16 = $i;
  $17 = (__ZNK6Solver13decisionLevelEv($1)|0);
  $18 = ($16|0)==($17|0);
  if ($18) {
   $19 = (($1) + 280|0);
   $20 = (__ZNK3vecI3LitE4sizeEv($19)|0);
   $25 = $20;
  } else {
   $21 = (($1) + 292|0);
   $22 = $i;
   $23 = (__ZNK3vecIiEixEi($21,$22)|0);
   $24 = HEAP32[$23>>2]|0;
   $25 = $24;
  }
  $end = $25;
  $26 = $F;
  $27 = $i;
  $28 = (+($27|0));
  $29 = (+Math_pow((+$26),(+$28)));
  $30 = $end;
  $31 = $beg;
  $32 = (($30) - ($31))|0;
  $33 = (+($32|0));
  $34 = $29 * $33;
  $35 = $progress;
  $36 = $35 + $34;
  $progress = $36;
  $37 = $i;
  $38 = (($37) + 1)|0;
  $i = $38;
 }
 $39 = $progress;
 $40 = (__ZNK6Solver5nVarsEv($1)|0);
 $41 = (+($40|0));
 $42 = $39 / $41;
 STACKTOP = sp;return (+$42);
}
function __ZN6Solver16newDecisionLevelEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = sp;
 $0 = $this;
 $2 = $0;
 $3 = (($2) + 292|0);
 $4 = (($2) + 280|0);
 $5 = (__ZNK3vecI3LitE4sizeEv($4)|0);
 HEAP32[$1>>2] = $5;
 __ZN3vecIiE4pushERKi($3,$1);
 STACKTOP = sp;return;
}
function __ZNK3vecIiEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<2)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZN6Solver5solveERK3vecI3LitE($this,$assumps) {
 $this = $this|0;
 $assumps = $assumps|0;
 var $$byval_copy = 0, $$byval_copy18 = 0, $$byval_copy19 = 0, $$byval_copy20 = 0, $$expand_i1_val = 0, $$expand_i1_val22 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0;
 var $17 = 0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0.0, $21 = 0, $22 = 0.0, $23 = 0.0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0;
 var $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0;
 var $53 = 0.0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0.0, $64 = 0, $65 = 0.0, $66 = 0.0, $67 = 0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0;
 var $71 = 0.0, $72 = 0, $73 = 0.0, $74 = 0, $75 = 0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0, $8 = 0, $80 = 0.0, $81 = 0.0, $82 = 0.0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0;
 var $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $i = 0, $nof_conflicts = 0.0, $nof_learnts = 0.0, $status = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer16 = 0, $vararg_buffer3 = 0, $vararg_buffer5 = 0;
 var $vararg_buffer7 = 0, $vararg_ptr10 = 0, $vararg_ptr11 = 0, $vararg_ptr12 = 0, $vararg_ptr13 = 0, $vararg_ptr14 = 0, $vararg_ptr15 = 0, $vararg_ptr9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128|0;
 $$byval_copy20 = sp + 110|0;
 $$byval_copy19 = sp + 112|0;
 $$byval_copy18 = sp + 109|0;
 $$byval_copy = sp + 113|0;
 $vararg_buffer16 = sp + 32|0;
 $vararg_buffer7 = sp + 56|0;
 $vararg_buffer5 = sp + 24|0;
 $vararg_buffer3 = sp + 16|0;
 $vararg_buffer1 = sp;
 $vararg_buffer = sp + 48|0;
 $status = sp + 116|0;
 $3 = sp + 108|0;
 $4 = sp + 111|0;
 $5 = sp + 114|0;
 $6 = sp + 117|0;
 $7 = sp + 118|0;
 $8 = sp + 119|0;
 $1 = $this;
 $2 = $assumps;
 $9 = $1;
 __ZN3vecI5lboolE5clearEb($9,0);
 $10 = (($9) + 12|0);
 __ZN3vecI3LitE5clearEb($10,0);
 $11 = (($9) + 168|0);
 $12 = HEAP8[$11>>0]|0;
 $13 = $12&1;
 if (!($13)) {
  $$expand_i1_val = 0;
  $0 = $$expand_i1_val;
  $$pre_trunc = $0;
  $103 = $$pre_trunc&1;
  STACKTOP = sp;return ($103|0);
 }
 $14 = $2;
 $15 = (($9) + 344|0);
 __ZNK3vecI3LitE6copyToERS1_($14,$15);
 $16 = (($9) + 48|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = (+($17|0));
 $nof_conflicts = $18;
 $19 = (__ZNK6Solver8nClausesEv($9)|0);
 $20 = (+($19|0));
 $21 = (($9) + 64|0);
 $22 = +HEAPF64[$21>>3];
 $23 = $20 * $22;
 $nof_learnts = $23;
 ;HEAP8[$status+0>>0]=HEAP8[968+0>>0]|0;
 $24 = (($9) + 88|0);
 $25 = HEAP32[$24>>2]|0;
 $26 = ($25|0)>=(1);
 if ($26) {
  $27 = HEAP32[_stdout>>2]|0;
  (_fprintf(($27|0),(1496|0),($vararg_buffer|0))|0);
  $28 = HEAP32[_stdout>>2]|0;
  (_fprintf(($28|0),(1584|0),($vararg_buffer1|0))|0);
  $29 = HEAP32[_stdout>>2]|0;
  (_fprintf(($29|0),(1672|0),($vararg_buffer3|0))|0);
  $30 = HEAP32[_stdout>>2]|0;
  (_fprintf(($30|0),(1760|0),($vararg_buffer5|0))|0);
 }
 while(1) {
  ;HEAP8[$3+0>>0]=HEAP8[968+0>>0]|0;
  ;HEAP8[$$byval_copy+0>>0]=HEAP8[$3+0>>0]|0;
  $31 = (__ZNK5lbooleqES_($status,$$byval_copy)|0);
  if (!($31)) {
   break;
  }
  $32 = (($9) + 88|0);
  $33 = HEAP32[$32>>2]|0;
  $34 = ($33|0)>=(1);
  if ($34) {
   $35 = HEAP32[_stdout>>2]|0;
   $36 = (($9) + 128|0);
   $37 = $36;
   $38 = $37;
   $39 = HEAP32[$38>>2]|0;
   $40 = (($37) + 4)|0;
   $41 = $40;
   $42 = HEAP32[$41>>2]|0;
   $43 = (($9) + 356|0);
   $44 = (__ZNK4HeapIN6Solver10VarOrderLtEE4sizeEv($43)|0);
   $45 = (__ZNK6Solver8nClausesEv($9)|0);
   $46 = (($9) + 136|0);
   $47 = $46;
   $48 = $47;
   $49 = HEAP32[$48>>2]|0;
   $50 = (($47) + 4)|0;
   $51 = $50;
   $52 = HEAP32[$51>>2]|0;
   $53 = $nof_learnts;
   $54 = (~~(($53)));
   $55 = (__ZNK6Solver8nLearntsEv($9)|0);
   $56 = (($9) + 144|0);
   $57 = $56;
   $58 = $57;
   $59 = HEAP32[$58>>2]|0;
   $60 = (($57) + 4)|0;
   $61 = $60;
   $62 = HEAP32[$61>>2]|0;
   $63 = (+($59>>>0)) + (4294967296.0*(+($62>>>0)));
   $64 = (__ZNK6Solver8nLearntsEv($9)|0);
   $65 = (+($64|0));
   $66 = $63 / $65;
   $67 = (($9) + 392|0);
   $68 = +HEAPF64[$67>>3];
   $69 = $68 * 100.0;
   HEAP32[$vararg_buffer7>>2] = $39;
   $vararg_ptr9 = (($vararg_buffer7) + 4|0);
   HEAP32[$vararg_ptr9>>2] = $44;
   $vararg_ptr10 = (($vararg_buffer7) + 8|0);
   HEAP32[$vararg_ptr10>>2] = $45;
   $vararg_ptr11 = (($vararg_buffer7) + 12|0);
   HEAP32[$vararg_ptr11>>2] = $49;
   $vararg_ptr12 = (($vararg_buffer7) + 16|0);
   HEAP32[$vararg_ptr12>>2] = $54;
   $vararg_ptr13 = (($vararg_buffer7) + 20|0);
   HEAP32[$vararg_ptr13>>2] = $55;
   $vararg_ptr14 = (($vararg_buffer7) + 24|0);
   HEAPF64[tempDoublePtr>>3]=$66;HEAP32[$vararg_ptr14>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr14+4>>2]=HEAP32[tempDoublePtr+4>>2];
   $vararg_ptr15 = (($vararg_buffer7) + 32|0);
   HEAPF64[tempDoublePtr>>3]=$69;HEAP32[$vararg_ptr15>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr15+4>>2]=HEAP32[tempDoublePtr+4>>2];
   (_fprintf(($35|0),(1848|0),($vararg_buffer7|0))|0);
   $70 = HEAP32[_stdout>>2]|0;
   (_fflush(($70|0))|0);
  }
  $71 = $nof_conflicts;
  $72 = (~~(($71)));
  $73 = $nof_learnts;
  $74 = (~~(($73)));
  __ZN6Solver6searchEii($4,$9,$72,$74);
  ;HEAP8[$status+0>>0]=HEAP8[$4+0>>0]|0;
  $75 = (($9) + 56|0);
  $76 = +HEAPF64[$75>>3];
  $77 = $nof_conflicts;
  $78 = $77 * $76;
  $nof_conflicts = $78;
  $79 = (($9) + 72|0);
  $80 = +HEAPF64[$79>>3];
  $81 = $nof_learnts;
  $82 = $81 * $80;
  $nof_learnts = $82;
 }
 $83 = (($9) + 88|0);
 $84 = HEAP32[$83>>2]|0;
 $85 = ($84|0)>=(1);
 if ($85) {
  $86 = HEAP32[_stdout>>2]|0;
  (_fprintf(($86|0),(1760|0),($vararg_buffer16|0))|0);
 }
 ;HEAP8[$5+0>>0]=HEAP8[952+0>>0]|0;
 ;HEAP8[$$byval_copy18+0>>0]=HEAP8[$5+0>>0]|0;
 $87 = (__ZNK5lbooleqES_($status,$$byval_copy18)|0);
 if ($87) {
  $88 = (__ZNK6Solver5nVarsEv($9)|0);
  __ZN3vecI5lboolE6growToEi($9,$88);
  $i = 0;
  while(1) {
   $89 = $i;
   $90 = (__ZNK6Solver5nVarsEv($9)|0);
   $91 = ($89|0)<($90|0);
   if (!($91)) {
    break;
   }
   $92 = $i;
   $93 = (__ZN3vecI5lboolEixEi($9,$92)|0);
   $94 = $i;
   __ZNK6Solver5valueEi($6,$9,$94);
   ;HEAP8[$93+0>>0]=HEAP8[$6+0>>0]|0;
   $95 = $i;
   $96 = (($95) + 1)|0;
   $i = $96;
  }
  __ZN6Solver11verifyModelEv($9);
 } else {
  ;HEAP8[$7+0>>0]=HEAP8[960+0>>0]|0;
  ;HEAP8[$$byval_copy19+0>>0]=HEAP8[$7+0>>0]|0;
  $97 = (__ZNK5lbooleqES_($status,$$byval_copy19)|0);
  if (!($97)) {
   ___assert_fail((1904|0),(1000|0),692,(1928|0));
   // unreachable;
  }
  $98 = (($9) + 12|0);
  $99 = (__ZNK3vecI3LitE4sizeEv($98)|0);
  $100 = ($99|0)==(0);
  if ($100) {
   $101 = (($9) + 168|0);
   HEAP8[$101>>0] = 0;
  }
 }
 __ZN6Solver11cancelUntilEi($9,0);
 ;HEAP8[$8+0>>0]=HEAP8[952+0>>0]|0;
 ;HEAP8[$$byval_copy20+0>>0]=HEAP8[$8+0>>0]|0;
 $102 = (__ZNK5lbooleqES_($status,$$byval_copy20)|0);
 $$expand_i1_val22 = $102&1;
 $0 = $$expand_i1_val22;
 $$pre_trunc = $0;
 $103 = $$pre_trunc&1;
 STACKTOP = sp;return ($103|0);
}
function __ZN3vecI5lboolE5clearEb($this,$dealloc) {
 $this = $this|0;
 $dealloc = $dealloc|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $dealloc&1;
 $1 = $2;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($3) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $12 = (($3) + 4|0);
 HEAP32[$12>>2] = 0;
 $13 = $1;
 $14 = $13&1;
 if ($14) {
  $15 = HEAP32[$3>>2]|0;
  _free($15);
  HEAP32[$3>>2] = 0;
  $16 = (($3) + 8|0);
  HEAP32[$16>>2] = 0;
 }
 STACKTOP = sp;return;
}
function __ZNK6Solver8nClausesEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 172|0);
 $3 = (__ZNK3vecIP6ClauseE4sizeEv($2)|0);
 STACKTOP = sp;return ($3|0);
}
function __ZNK6Solver8nLearntsEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 184|0);
 $3 = (__ZNK3vecIP6ClauseE4sizeEv($2)|0);
 STACKTOP = sp;return ($3|0);
}
function __ZN3vecI5lboolE6growToEi($this,$size) {
 $this = $this|0;
 $size = $size|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $size;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = $1;
 $6 = ($4|0)>=($5|0);
 if ($6) {
  STACKTOP = sp;return;
 }
 $7 = $1;
 __ZN3vecI5lboolE4growEi($2,$7);
 $8 = (($2) + 4|0);
 $9 = HEAP32[$8>>2]|0;
 $i = $9;
 while(1) {
  $10 = $i;
  $11 = $1;
  $12 = ($10|0)<($11|0);
  if (!($12)) {
   break;
  }
  $13 = $i;
  $14 = HEAP32[$2>>2]|0;
  $15 = (($14) + ($13)|0);
  $16 = ($15|0)==(0|0);
  if (!($16)) {
   __ZN5lboolC1Ev($15);
  }
  $17 = $i;
  $18 = (($17) + 1)|0;
  $i = $18;
 }
 $19 = $1;
 $20 = (($2) + 4|0);
 HEAP32[$20>>2] = $19;
 STACKTOP = sp;return;
}
function __ZNK6Solver5valueEi($agg$result,$this,$x) {
 $agg$result = $agg$result|0;
 $this = $this|0;
 $x = $x|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $x;
 $2 = $0;
 $3 = (($2) + 244|0);
 $4 = $1;
 $5 = (__ZNK3vecIcEixEi($3,$4)|0);
 $6 = HEAP8[$5>>0]|0;
 $7 = $6 << 24 >> 24;
 __Z7toLbooli($agg$result,$7);
 STACKTOP = sp;return;
}
function __ZN6Solver11verifyModelEv($this) {
 $this = $this|0;
 var $$byval_copy = 0, $$byval_copy5 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c = 0, $failed = 0, $i = 0, $j = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $$byval_copy5 = sp + 45|0;
 $$byval_copy = sp + 28|0;
 $vararg_buffer3 = sp + 8|0;
 $vararg_buffer1 = sp + 16|0;
 $vararg_buffer = sp;
 $1 = sp + 40|0;
 $2 = sp + 46|0;
 $3 = sp + 44|0;
 $0 = $this;
 $4 = $0;
 $failed = 0;
 $i = 0;
 while(1) {
  $5 = $i;
  $6 = (($4) + 172|0);
  $7 = (__ZNK3vecIP6ClauseE4sizeEv($6)|0);
  $8 = ($5|0)<($7|0);
  if (!($8)) {
   break;
  }
  $9 = (($4) + 172|0);
  $10 = $i;
  $11 = (__ZN3vecIP6ClauseEixEi($9,$10)|0);
  $12 = HEAP32[$11>>2]|0;
  $13 = (__ZNK6Clause4markEv($12)|0);
  $14 = ($13|0)==(0);
  if (!($14)) {
   label = 4;
   break;
  }
  $15 = (($4) + 172|0);
  $16 = $i;
  $17 = (__ZN3vecIP6ClauseEixEi($15,$16)|0);
  $18 = HEAP32[$17>>2]|0;
  $c = $18;
  $j = 0;
  while(1) {
   $19 = $j;
   $20 = $c;
   $21 = (__ZNK6Clause4sizeEv($20)|0);
   $22 = ($19|0)<($21|0);
   if (!($22)) {
    label = 11;
    break;
   }
   $23 = $c;
   $24 = $j;
   $25 = (__ZN6ClauseixEi($23,$24)|0);
   ;HEAP32[$1+0>>2]=HEAP32[$25+0>>2]|0;
   ;HEAP32[$$byval_copy+0>>2]=HEAP32[$1+0>>2]|0;
   __ZNK6Solver10modelValueE3Lit($2,$4,$$byval_copy);
   ;HEAP8[$3+0>>0]=HEAP8[952+0>>0]|0;
   ;HEAP8[$$byval_copy5+0>>0]=HEAP8[$3+0>>0]|0;
   $26 = (__ZNK5lbooleqES_($2,$$byval_copy5)|0);
   if ($26) {
    label = 8;
    break;
   }
   $27 = $j;
   $28 = (($27) + 1)|0;
   $j = $28;
  }
  if ((label|0) == 8) {
   label = 0;
  }
  else if ((label|0) == 11) {
   label = 0;
   $29 = HEAP32[_stdout>>2]|0;
   (_fprintf(($29|0),(1976|0),($vararg_buffer|0))|0);
   $30 = (($4) + 172|0);
   $31 = $i;
   $32 = (__ZN3vecIP6ClauseEixEi($30,$31)|0);
   $33 = HEAP32[$32>>2]|0;
   __ZN6Solver11printClauseI6ClauseEEvRKT_($4,$33);
   $34 = HEAP32[_stdout>>2]|0;
   (_fprintf(($34|0),(2000|0),($vararg_buffer1|0))|0);
   $failed = 1;
  }
  $35 = $i;
  $36 = (($35) + 1)|0;
  $i = $36;
 }
 if ((label|0) == 4) {
  ___assert_fail((1936|0),(1000|0),709,(1960|0));
  // unreachable;
 }
 $37 = $failed;
 $38 = $37&1;
 if ($38) {
  ___assert_fail((2008|0),(1000|0),722,(1960|0));
  // unreachable;
 } else {
  $39 = HEAP32[_stdout>>2]|0;
  $40 = (($4) + 172|0);
  $41 = (__ZNK3vecIP6ClauseE4sizeEv($40)|0);
  HEAP32[$vararg_buffer3>>2] = $41;
  (_fprintf(($39|0),(2016|0),($vararg_buffer3|0))|0);
  STACKTOP = sp;return;
 }
}
function __ZNK6Clause4markEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = $2 >>> 1;
 $4 = $3 & 3;
 STACKTOP = sp;return ($4|0);
}
function __ZN6Solver11printClauseI6ClauseEEvRKT_($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy = sp + 20|0;
 $vararg_buffer = sp;
 $2 = sp + 4|0;
 $0 = $this;
 $1 = $c;
 $3 = $0;
 $i = 0;
 while(1) {
  $4 = $i;
  $5 = $1;
  $6 = (__ZNK6Clause4sizeEv($5)|0);
  $7 = ($4|0)<($6|0);
  if (!($7)) {
   break;
  }
  $8 = $1;
  $9 = $i;
  __ZNK6ClauseixEi($2,$8,$9);
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$2+0>>2]|0;
  __ZN6Solver8printLitE3Lit($3,$$byval_copy);
  $10 = HEAP32[_stdout>>2]|0;
  (_fprintf(($10|0),(2048|0),($vararg_buffer|0))|0);
  $11 = $i;
  $12 = (($11) + 1)|0;
  $i = $12;
 }
 STACKTOP = sp;return;
}
function __ZN6Solver8printLitE3Lit($this,$l) {
 $this = $this|0;
 $l = $l|0;
 var $$byval_copy = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $$byval_copy7 = sp + 52|0;
 $$byval_copy6 = sp + 20|0;
 $$byval_copy5 = sp + 49|0;
 $$byval_copy4 = sp + 44|0;
 $$byval_copy3 = sp + 28|0;
 $$byval_copy = sp + 12|0;
 $vararg_buffer = sp;
 $1 = sp + 24|0;
 $2 = sp + 36|0;
 $3 = sp + 40|0;
 $4 = sp + 51|0;
 $5 = sp + 50|0;
 $6 = sp + 16|0;
 $7 = sp + 48|0;
 $8 = sp + 53|0;
 $0 = $this;
 $9 = $0;
 $10 = HEAP32[_stdout>>2]|0;
 ;HEAP32[$1+0>>2]=HEAP32[$l+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$1+0>>2]|0;
 $11 = (__Z4sign3Lit($$byval_copy)|0);
 $12 = $11 ? 2064 : 2072;
 ;HEAP32[$2+0>>2]=HEAP32[$l+0>>2]|0;
 ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$2+0>>2]|0;
 $13 = (__Z3var3Lit($$byval_copy3)|0);
 $14 = (($13) + 1)|0;
 ;HEAP32[$3+0>>2]=HEAP32[$l+0>>2]|0;
 ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$3+0>>2]|0;
 __ZNK6Solver5valueE3Lit($4,$9,$$byval_copy4);
 ;HEAP8[$5+0>>0]=HEAP8[952+0>>0]|0;
 ;HEAP8[$$byval_copy5+0>>0]=HEAP8[$5+0>>0]|0;
 $15 = (__ZNK5lbooleqES_($4,$$byval_copy5)|0);
 if ($15) {
  $19 = 49;
  $18 = $19 << 24 >> 24;
  HEAP32[$vararg_buffer>>2] = $12;
  $vararg_ptr1 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr1>>2] = $14;
  $vararg_ptr2 = (($vararg_buffer) + 8|0);
  HEAP32[$vararg_ptr2>>2] = $18;
  (_fprintf(($10|0),(2056|0),($vararg_buffer|0))|0);
  STACKTOP = sp;return;
 } else {
  ;HEAP32[$6+0>>2]=HEAP32[$l+0>>2]|0;
  ;HEAP32[$$byval_copy6+0>>2]=HEAP32[$6+0>>2]|0;
  __ZNK6Solver5valueE3Lit($7,$9,$$byval_copy6);
  ;HEAP8[$8+0>>0]=HEAP8[960+0>>0]|0;
  ;HEAP8[$$byval_copy7+0>>0]=HEAP8[$8+0>>0]|0;
  $16 = (__ZNK5lbooleqES_($7,$$byval_copy7)|0);
  $17 = $16 ? 48 : 88;
  $19 = $17;
  $18 = $19 << 24 >> 24;
  HEAP32[$vararg_buffer>>2] = $12;
  $vararg_ptr1 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr1>>2] = $14;
  $vararg_ptr2 = (($vararg_buffer) + 8|0);
  HEAP32[$vararg_ptr2>>2] = $18;
  (_fprintf(($10|0),(2056|0),($vararg_buffer|0))|0);
  STACKTOP = sp;return;
 }
}
function __ZN3vecI5lboolE4growEi($this,$min_cap) {
 $this = $this|0;
 $min_cap = $min_cap|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $min_cap;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 8|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)<=($5|0);
 if ($6) {
  STACKTOP = sp;return;
 }
 $7 = (($2) + 8|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = ($8|0)==(0);
 if ($9) {
  $10 = $1;
  $11 = ($10|0)>=(2);
  if ($11) {
   $12 = $1;
   $14 = $12;
  } else {
   $14 = 2;
  }
  $13 = (($2) + 8|0);
  HEAP32[$13>>2] = $14;
 } else {
  while(1) {
   $15 = (($2) + 8|0);
   $16 = HEAP32[$15>>2]|0;
   $17 = ($16*3)|0;
   $18 = (($17) + 1)|0;
   $19 = $18 >> 1;
   $20 = (($2) + 8|0);
   HEAP32[$20>>2] = $19;
   $21 = (($2) + 8|0);
   $22 = HEAP32[$21>>2]|0;
   $23 = $1;
   $24 = ($22|0)<($23|0);
   if (!($24)) {
    break;
   }
  }
 }
 $25 = HEAP32[$2>>2]|0;
 $26 = (($2) + 8|0);
 $27 = HEAP32[$26>>2]|0;
 $28 = $27;
 $29 = (_realloc($25,$28)|0);
 HEAP32[$2>>2] = $29;
 STACKTOP = sp;return;
}
function __ZN5lboolC1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN5lboolC2Ev($1);
 STACKTOP = sp;return;
}
function __ZN5lboolC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP8[$1>>0] = 0;
 STACKTOP = sp;return;
}
function __ZNK6Solver9VarFilterclEi($this,$v) {
 $this = $this|0;
 $v = $v|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $$byval_copy = sp + 10|0;
 $2 = sp + 9|0;
 $3 = sp + 8|0;
 $0 = $this;
 $1 = $v;
 $4 = $0;
 $5 = HEAP32[$4>>2]|0;
 $6 = (($5) + 244|0);
 $7 = $1;
 $8 = (__ZNK3vecIcEixEi($6,$7)|0);
 $9 = HEAP8[$8>>0]|0;
 $10 = $9 << 24 >> 24;
 __Z7toLbooli($2,$10);
 ;HEAP8[$3+0>>0]=HEAP8[968+0>>0]|0;
 ;HEAP8[$$byval_copy+0>>0]=HEAP8[$3+0>>0]|0;
 $11 = (__ZNK5lbooleqES_($2,$$byval_copy)|0);
 if (!($11)) {
  $18 = 0;
  STACKTOP = sp;return ($18|0);
 }
 $12 = HEAP32[$4>>2]|0;
 $13 = (($12) + 268|0);
 $14 = $1;
 $15 = (__ZNK3vecIcEixEi($13,$14)|0);
 $16 = HEAP8[$15>>0]|0;
 $17 = ($16<<24>>24)!=(0);
 $18 = $17;
 STACKTOP = sp;return ($18|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEE13percolateDownEi($this,$i) {
 $this = $this|0;
 $i = $i|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $child = 0, $x = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $i;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = $1;
 $5 = (__ZN3vecIiEixEi($3,$4)|0);
 $6 = HEAP32[$5>>2]|0;
 $x = $6;
 while(1) {
  $7 = $1;
  $8 = (__ZN4HeapIN6Solver10VarOrderLtEE4leftEi($7)|0);
  $9 = (($2) + 4|0);
  $10 = (__ZNK3vecIiE4sizeEv($9)|0);
  $11 = ($8|0)<($10|0);
  if (!($11)) {
   label = 10;
   break;
  }
  $12 = $1;
  $13 = (__ZN4HeapIN6Solver10VarOrderLtEE5rightEi($12)|0);
  $14 = (($2) + 4|0);
  $15 = (__ZNK3vecIiE4sizeEv($14)|0);
  $16 = ($13|0)<($15|0);
  if ($16) {
   $17 = (($2) + 4|0);
   $18 = $1;
   $19 = (__ZN4HeapIN6Solver10VarOrderLtEE5rightEi($18)|0);
   $20 = (__ZN3vecIiEixEi($17,$19)|0);
   $21 = HEAP32[$20>>2]|0;
   $22 = (($2) + 4|0);
   $23 = $1;
   $24 = (__ZN4HeapIN6Solver10VarOrderLtEE4leftEi($23)|0);
   $25 = (__ZN3vecIiEixEi($22,$24)|0);
   $26 = HEAP32[$25>>2]|0;
   $27 = (__ZNK6Solver10VarOrderLtclEii($2,$21,$26)|0);
   if ($27) {
    $28 = $1;
    $29 = (__ZN4HeapIN6Solver10VarOrderLtEE5rightEi($28)|0);
    $32 = $29;
   } else {
    label = 6;
   }
  } else {
   label = 6;
  }
  if ((label|0) == 6) {
   label = 0;
   $30 = $1;
   $31 = (__ZN4HeapIN6Solver10VarOrderLtEE4leftEi($30)|0);
   $32 = $31;
  }
  $child = $32;
  $33 = (($2) + 4|0);
  $34 = $child;
  $35 = (__ZN3vecIiEixEi($33,$34)|0);
  $36 = HEAP32[$35>>2]|0;
  $37 = $x;
  $38 = (__ZNK6Solver10VarOrderLtclEii($2,$36,$37)|0);
  if (!($38)) {
   break;
  }
  $39 = (($2) + 4|0);
  $40 = $child;
  $41 = (__ZN3vecIiEixEi($39,$40)|0);
  $42 = HEAP32[$41>>2]|0;
  $43 = (($2) + 4|0);
  $44 = $1;
  $45 = (__ZN3vecIiEixEi($43,$44)|0);
  HEAP32[$45>>2] = $42;
  $46 = $1;
  $47 = (($2) + 16|0);
  $48 = (($2) + 4|0);
  $49 = $1;
  $50 = (__ZN3vecIiEixEi($48,$49)|0);
  $51 = HEAP32[$50>>2]|0;
  $52 = (__ZN3vecIiEixEi($47,$51)|0);
  HEAP32[$52>>2] = $46;
  $53 = $child;
  $1 = $53;
 }
 if ((label|0) == 10) {
  $54 = $x;
  $55 = (($2) + 4|0);
  $56 = $1;
  $57 = (__ZN3vecIiEixEi($55,$56)|0);
  HEAP32[$57>>2] = $54;
  $58 = $1;
  $59 = (($2) + 16|0);
  $60 = $x;
  $61 = (__ZN3vecIiEixEi($59,$60)|0);
  HEAP32[$61>>2] = $58;
  STACKTOP = sp;return;
 }
 $54 = $x;
 $55 = (($2) + 4|0);
 $56 = $1;
 $57 = (__ZN3vecIiEixEi($55,$56)|0);
 HEAP32[$57>>2] = $54;
 $58 = $1;
 $59 = (($2) + 16|0);
 $60 = $x;
 $61 = (__ZN3vecIiEixEi($59,$60)|0);
 HEAP32[$61>>2] = $58;
 STACKTOP = sp;return;
}
function __ZNK4HeapIN6Solver10VarOrderLtEE12heapPropertyEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (__ZNK4HeapIN6Solver10VarOrderLtEE12heapPropertyEi($1,1)|0);
 STACKTOP = sp;return ($2|0);
}
function __ZNK4HeapIN6Solver10VarOrderLtEE12heapPropertyEi($this,$i) {
 $this = $this|0;
 $i = $i|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $i;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 4|0);
 $5 = (__ZNK3vecIiE4sizeEv($4)|0);
 $6 = ($3|0)>=($5|0);
 if ($6) {
  $25 = 1;
  STACKTOP = sp;return ($25|0);
 }
 $7 = $1;
 $8 = ($7|0)==(0);
 if ($8) {
  label = 4;
 } else {
  $9 = (($2) + 4|0);
  $10 = $1;
  $11 = (__ZNK3vecIiEixEi($9,$10)|0);
  $12 = HEAP32[$11>>2]|0;
  $13 = (($2) + 4|0);
  $14 = $1;
  $15 = (__ZN4HeapIN6Solver10VarOrderLtEE6parentEi($14)|0);
  $16 = (__ZNK3vecIiEixEi($13,$15)|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = (__ZNK6Solver10VarOrderLtclEii($2,$12,$17)|0);
  if ($18) {
   $26 = 0;
  } else {
   label = 4;
  }
 }
 if ((label|0) == 4) {
  $19 = $1;
  $20 = (__ZN4HeapIN6Solver10VarOrderLtEE4leftEi($19)|0);
  $21 = (__ZNK4HeapIN6Solver10VarOrderLtEE12heapPropertyEi($2,$20)|0);
  if ($21) {
   $22 = $1;
   $23 = (__ZN4HeapIN6Solver10VarOrderLtEE5rightEi($22)|0);
   $24 = (__ZNK4HeapIN6Solver10VarOrderLtEE12heapPropertyEi($2,$23)|0);
   $26 = $24;
  } else {
   $26 = 0;
  }
 }
 $25 = $26;
 STACKTOP = sp;return ($25|0);
}
function __ZNK6Solver10VarOrderLtclEii($this,$x,$y) {
 $this = $this|0;
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0.0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $x;
 $2 = $y;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = $1;
 $6 = (__ZNK3vecIdEixEi($4,$5)|0);
 $7 = +HEAPF64[$6>>3];
 $8 = HEAP32[$3>>2]|0;
 $9 = $2;
 $10 = (__ZNK3vecIdEixEi($8,$9)|0);
 $11 = +HEAPF64[$10>>3];
 $12 = $7 > $11;
 STACKTOP = sp;return ($12|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEE6parentEi($i) {
 $i = $i|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $i;
 $1 = $0;
 $2 = (($1) - 1)|0;
 $3 = $2 >> 1;
 STACKTOP = sp;return ($3|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEE4leftEi($i) {
 $i = $i|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $i;
 $1 = $0;
 $2 = $1<<1;
 $3 = (($2) + 1)|0;
 STACKTOP = sp;return ($3|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEE5rightEi($i) {
 $i = $i|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $i;
 $1 = $0;
 $2 = (($1) + 1)|0;
 $3 = $2<<1;
 STACKTOP = sp;return ($3|0);
}
function __ZNK3vecIdEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<3)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZNK3vecIcEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3)|0);
 STACKTOP = sp;return ($5|0);
}
function __Z4sortIP6Clause11reduceDB_ltEvPT_iT0_($array,$size,$lt) {
 $array = $array|0;
 $size = $size|0;
 $lt = $lt|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, $j = 0, $pivot = 0, $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy2 = sp + 24|0;
 $$byval_copy1 = sp + 25|0;
 $$byval_copy = sp + 27|0;
 $2 = sp + 28|0;
 $3 = sp + 26|0;
 $4 = sp + 29|0;
 $0 = $array;
 $1 = $size;
 $5 = $1;
 $6 = ($5|0)<=(15);
 if ($6) {
  $7 = $0;
  $8 = $1;
  ;HEAP8[$$byval_copy+0>>0]=HEAP8[$2+0>>0]|0;
  __Z13selectionSortIP6Clause11reduceDB_ltEvPT_iT0_($7,$8,$$byval_copy);
  STACKTOP = sp;return;
 }
 $9 = $1;
 $10 = (($9|0) / 2)&-1;
 $11 = $0;
 $12 = (($11) + ($10<<2)|0);
 $13 = HEAP32[$12>>2]|0;
 $pivot = $13;
 $i = -1;
 $14 = $1;
 $j = $14;
 while(1) {
  while(1) {
   $15 = $i;
   $16 = (($15) + 1)|0;
   $i = $16;
   $17 = $i;
   $18 = $0;
   $19 = (($18) + ($17<<2)|0);
   $20 = HEAP32[$19>>2]|0;
   $21 = $pivot;
   $22 = (__ZN11reduceDB_ltclEP6ClauseS1_($lt,$20,$21)|0);
   if (!($22)) {
    break;
   }
  }
  while(1) {
   $23 = $j;
   $24 = (($23) + -1)|0;
   $j = $24;
   $25 = $pivot;
   $26 = $j;
   $27 = $0;
   $28 = (($27) + ($26<<2)|0);
   $29 = HEAP32[$28>>2]|0;
   $30 = (__ZN11reduceDB_ltclEP6ClauseS1_($lt,$25,$29)|0);
   if (!($30)) {
    break;
   }
  }
  $31 = $i;
  $32 = $j;
  $33 = ($31|0)>=($32|0);
  if ($33) {
   break;
  }
  $34 = $i;
  $35 = $0;
  $36 = (($35) + ($34<<2)|0);
  $37 = HEAP32[$36>>2]|0;
  $tmp = $37;
  $38 = $j;
  $39 = $0;
  $40 = (($39) + ($38<<2)|0);
  $41 = HEAP32[$40>>2]|0;
  $42 = $i;
  $43 = $0;
  $44 = (($43) + ($42<<2)|0);
  HEAP32[$44>>2] = $41;
  $45 = $tmp;
  $46 = $j;
  $47 = $0;
  $48 = (($47) + ($46<<2)|0);
  HEAP32[$48>>2] = $45;
 }
 $49 = $0;
 $50 = $i;
 ;HEAP8[$$byval_copy1+0>>0]=HEAP8[$3+0>>0]|0;
 __Z4sortIP6Clause11reduceDB_ltEvPT_iT0_($49,$50,$$byval_copy1);
 $51 = $i;
 $52 = $0;
 $53 = (($52) + ($51<<2)|0);
 $54 = $1;
 $55 = $i;
 $56 = (($54) - ($55))|0;
 ;HEAP8[$$byval_copy2+0>>0]=HEAP8[$4+0>>0]|0;
 __Z4sortIP6Clause11reduceDB_ltEvPT_iT0_($53,$56,$$byval_copy2);
 STACKTOP = sp;return;
}
function __Z13selectionSortIP6Clause11reduceDB_ltEvPT_iT0_($array,$size,$lt) {
 $array = $array|0;
 $size = $size|0;
 $lt = $lt|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $best_i = 0, $i = 0, $j = 0, $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $array;
 $1 = $size;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = $1;
  $4 = (($3) - 1)|0;
  $5 = ($2|0)<($4|0);
  if (!($5)) {
   break;
  }
  $6 = $i;
  $best_i = $6;
  $7 = $i;
  $8 = (($7) + 1)|0;
  $j = $8;
  while(1) {
   $9 = $j;
   $10 = $1;
   $11 = ($9|0)<($10|0);
   if (!($11)) {
    break;
   }
   $12 = $j;
   $13 = $0;
   $14 = (($13) + ($12<<2)|0);
   $15 = HEAP32[$14>>2]|0;
   $16 = $best_i;
   $17 = $0;
   $18 = (($17) + ($16<<2)|0);
   $19 = HEAP32[$18>>2]|0;
   $20 = (__ZN11reduceDB_ltclEP6ClauseS1_($lt,$15,$19)|0);
   if ($20) {
    $21 = $j;
    $best_i = $21;
   }
   $22 = $j;
   $23 = (($22) + 1)|0;
   $j = $23;
  }
  $24 = $i;
  $25 = $0;
  $26 = (($25) + ($24<<2)|0);
  $27 = HEAP32[$26>>2]|0;
  $tmp = $27;
  $28 = $best_i;
  $29 = $0;
  $30 = (($29) + ($28<<2)|0);
  $31 = HEAP32[$30>>2]|0;
  $32 = $i;
  $33 = $0;
  $34 = (($33) + ($32<<2)|0);
  HEAP32[$34>>2] = $31;
  $35 = $tmp;
  $36 = $best_i;
  $37 = $0;
  $38 = (($37) + ($36<<2)|0);
  HEAP32[$38>>2] = $35;
  $39 = $i;
  $40 = (($39) + 1)|0;
  $i = $40;
 }
 STACKTOP = sp;return;
}
function __ZN11reduceDB_ltclEP6ClauseS1_($this,$x,$y) {
 $this = $this|0;
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0.0, $12 = 0, $13 = 0, $14 = 0.0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $x;
 $2 = $y;
 $3 = $1;
 $4 = (__ZNK6Clause4sizeEv($3)|0);
 $5 = ($4|0)>(2);
 if (!($5)) {
  $16 = 0;
  STACKTOP = sp;return ($16|0);
 }
 $6 = $2;
 $7 = (__ZNK6Clause4sizeEv($6)|0);
 $8 = ($7|0)==(2);
 if ($8) {
  $17 = 1;
 } else {
  $9 = $1;
  $10 = (__ZN6Clause8activityEv($9)|0);
  $11 = +HEAPF32[$10>>2];
  $12 = $2;
  $13 = (__ZN6Clause8activityEv($12)|0);
  $14 = +HEAPF32[$13>>2];
  $15 = $11 < $14;
  $17 = $15;
 }
 $16 = $17;
 STACKTOP = sp;return ($16|0);
}
function __ZN3vecI3LitE6growToEi($this,$size) {
 $this = $this|0;
 $size = $size|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $size;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = $1;
 $6 = ($4|0)>=($5|0);
 if ($6) {
  STACKTOP = sp;return;
 }
 $7 = $1;
 __ZN3vecI3LitE4growEi($2,$7);
 $8 = (($2) + 4|0);
 $9 = HEAP32[$8>>2]|0;
 $i = $9;
 while(1) {
  $10 = $i;
  $11 = $1;
  $12 = ($10|0)<($11|0);
  if (!($12)) {
   break;
  }
  $13 = $i;
  $14 = HEAP32[$2>>2]|0;
  $15 = (($14) + ($13<<2)|0);
  $16 = ($15|0)==(0|0);
  if (!($16)) {
   __ZN3LitC1Ev($15);
  }
  $17 = $i;
  $18 = (($17) + 1)|0;
  $i = $18;
 }
 $19 = $1;
 $20 = (($2) + 4|0);
 HEAP32[$20>>2] = $19;
 STACKTOP = sp;return;
}
function __ZN3vecI3LitE4growEi($this,$min_cap) {
 $this = $this|0;
 $min_cap = $min_cap|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $min_cap;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 8|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)<=($5|0);
 if ($6) {
  STACKTOP = sp;return;
 }
 $7 = (($2) + 8|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = ($8|0)==(0);
 if ($9) {
  $10 = $1;
  $11 = ($10|0)>=(2);
  if ($11) {
   $12 = $1;
   $14 = $12;
  } else {
   $14 = 2;
  }
  $13 = (($2) + 8|0);
  HEAP32[$13>>2] = $14;
 } else {
  while(1) {
   $15 = (($2) + 8|0);
   $16 = HEAP32[$15>>2]|0;
   $17 = ($16*3)|0;
   $18 = (($17) + 1)|0;
   $19 = $18 >> 1;
   $20 = (($2) + 8|0);
   HEAP32[$20>>2] = $19;
   $21 = (($2) + 8|0);
   $22 = HEAP32[$21>>2]|0;
   $23 = $1;
   $24 = ($22|0)<($23|0);
   if (!($24)) {
    break;
   }
  }
 }
 $25 = HEAP32[$2>>2]|0;
 $26 = (($2) + 8|0);
 $27 = HEAP32[$26>>2]|0;
 $28 = $27<<2;
 $29 = (_realloc($25,$28)|0);
 HEAP32[$2>>2] = $29;
 STACKTOP = sp;return;
}
function __ZN3vecIiE4lastEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) - 1)|0;
 $5 = HEAP32[$1>>2]|0;
 $6 = (($5) + ($4<<2)|0);
 STACKTOP = sp;return ($6|0);
}
function __ZN3vecIiE3popEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) + -1)|0;
 HEAP32[$2>>2] = $4;
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseE3popEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) + -1)|0;
 HEAP32[$2>>2] = $4;
 STACKTOP = sp;return;
}
function __ZN6ClauseC1I3vecI3LitEEERKT_b($this,$ps,$learnt) {
 $this = $this|0;
 $ps = $ps|0;
 $learnt = $learnt|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $ps;
 $3 = $learnt&1;
 $2 = $3;
 $4 = $0;
 $5 = $2;
 $6 = $5&1;
 $7 = $1;
 __ZN6ClauseC2I3vecI3LitEEERKT_b($4,$7,$6);
 STACKTOP = sp;return;
}
function __ZN6ClauseC2I3vecI3LitEEERKT_b($this,$ps,$learnt) {
 $this = $this|0;
 $ps = $ps|0;
 $learnt = $learnt|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $ps;
 $3 = $learnt&1;
 $2 = $3;
 $4 = $0;
 $5 = $1;
 $6 = (__ZNK3vecI3LitE4sizeEv($5)|0);
 $7 = $6 << 3;
 $8 = $2;
 $9 = $8&1;
 $10 = $9&1;
 $11 = $7 | $10;
 HEAP32[$4>>2] = $11;
 $i = 0;
 while(1) {
  $12 = $i;
  $13 = $1;
  $14 = (__ZNK3vecI3LitE4sizeEv($13)|0);
  $15 = ($12|0)<($14|0);
  if (!($15)) {
   break;
  }
  $16 = $i;
  $17 = (($4) + 8|0);
  $18 = (($17) + ($16<<2)|0);
  $19 = $1;
  $20 = $i;
  $21 = (__ZNK3vecI3LitEixEi($19,$20)|0);
  ;HEAP32[$18+0>>2]=HEAP32[$21+0>>2]|0;
  $22 = $i;
  $23 = (($22) + 1)|0;
  $i = $23;
 }
 $24 = $2;
 $25 = $24&1;
 if ($25) {
  $26 = (($4) + 4|0);
  HEAPF32[$26>>2] = 0.0;
  STACKTOP = sp;return;
 } else {
  __ZN6Clause15calcAbstractionEv($4);
  STACKTOP = sp;return;
 }
}
function __ZNK3vecI3LitEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<2)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZN6Clause15calcAbstractionEv($this) {
 $this = $this|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $abstraction = 0;
 var $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy = sp + 16|0;
 $1 = sp;
 $0 = $this;
 $2 = $0;
 $abstraction = 0;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = (__ZNK6Clause4sizeEv($2)|0);
  $5 = ($3|0)<($4|0);
  if (!($5)) {
   break;
  }
  $6 = $i;
  $7 = (($2) + 8|0);
  $8 = (($7) + ($6<<2)|0);
  ;HEAP32[$1+0>>2]=HEAP32[$8+0>>2]|0;
  ;HEAP32[$$byval_copy+0>>2]=HEAP32[$1+0>>2]|0;
  $9 = (__Z3var3Lit($$byval_copy)|0);
  $10 = $9 & 31;
  $11 = 1 << $10;
  $12 = $abstraction;
  $13 = $12 | $11;
  $abstraction = $13;
  $14 = $i;
  $15 = (($14) + 1)|0;
  $i = $15;
 }
 $16 = $abstraction;
 $17 = (($2) + 4|0);
 HEAP32[$17>>2] = $16;
 STACKTOP = sp;return;
}
function __Z4sortI3Lit16LessThan_defaultIS0_EEvR3vecIT_ET0_($v,$lt) {
 $v = $v|0;
 $lt = $lt|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $$byval_copy = sp + 5|0;
 $1 = sp + 4|0;
 $0 = $v;
 $2 = $0;
 $3 = (__ZN3vecI3LitEcvPS0_Ev($2)|0);
 $4 = $0;
 $5 = (__ZNK3vecI3LitE4sizeEv($4)|0);
 ;HEAP8[$$byval_copy+0>>0]=HEAP8[$1+0>>0]|0;
 __Z4sortI3Lit16LessThan_defaultIS0_EEvPT_iT0_($3,$5,$$byval_copy);
 STACKTOP = sp;return;
}
function __Z4sortI3Lit16LessThan_defaultIS0_EEvPT_iT0_($array,$size,$lt) {
 $array = $array|0;
 $size = $size|0;
 $lt = $lt|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0;
 var $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0;
 var $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, $j = 0, $pivot = 0, $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $$byval_copy6 = sp + 56|0;
 $$byval_copy5 = sp + 57|0;
 $$byval_copy4 = sp + 36|0;
 $$byval_copy3 = sp + 20|0;
 $$byval_copy2 = sp + 52|0;
 $$byval_copy1 = sp + 32|0;
 $$byval_copy = sp + 58|0;
 $2 = sp + 59|0;
 $pivot = sp + 28|0;
 $tmp = sp + 12|0;
 $3 = sp + 4|0;
 $4 = sp + 48|0;
 $5 = sp + 40|0;
 $6 = sp + 16|0;
 $7 = sp + 60|0;
 $8 = sp + 61|0;
 $0 = $array;
 $1 = $size;
 $9 = $1;
 $10 = ($9|0)<=(15);
 if ($10) {
  $11 = $0;
  $12 = $1;
  ;HEAP8[$$byval_copy+0>>0]=HEAP8[$2+0>>0]|0;
  __Z13selectionSortI3Lit16LessThan_defaultIS0_EEvPT_iT0_($11,$12,$$byval_copy);
  STACKTOP = sp;return;
 }
 $13 = $1;
 $14 = (($13|0) / 2)&-1;
 $15 = $0;
 $16 = (($15) + ($14<<2)|0);
 ;HEAP32[$pivot+0>>2]=HEAP32[$16+0>>2]|0;
 __ZN3LitC1Ev($tmp);
 $i = -1;
 $17 = $1;
 $j = $17;
 while(1) {
  while(1) {
   $18 = $i;
   $19 = (($18) + 1)|0;
   $i = $19;
   $20 = $i;
   $21 = $0;
   $22 = (($21) + ($20<<2)|0);
   ;HEAP32[$3+0>>2]=HEAP32[$22+0>>2]|0;
   ;HEAP32[$4+0>>2]=HEAP32[$pivot+0>>2]|0;
   ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$3+0>>2]|0;
   ;HEAP32[$$byval_copy2+0>>2]=HEAP32[$4+0>>2]|0;
   $23 = (__ZN16LessThan_defaultI3LitEclES0_S0_($lt,$$byval_copy1,$$byval_copy2)|0);
   if (!($23)) {
    break;
   }
  }
  while(1) {
   $24 = $j;
   $25 = (($24) + -1)|0;
   $j = $25;
   ;HEAP32[$5+0>>2]=HEAP32[$pivot+0>>2]|0;
   $26 = $j;
   $27 = $0;
   $28 = (($27) + ($26<<2)|0);
   ;HEAP32[$6+0>>2]=HEAP32[$28+0>>2]|0;
   ;HEAP32[$$byval_copy3+0>>2]=HEAP32[$5+0>>2]|0;
   ;HEAP32[$$byval_copy4+0>>2]=HEAP32[$6+0>>2]|0;
   $29 = (__ZN16LessThan_defaultI3LitEclES0_S0_($lt,$$byval_copy3,$$byval_copy4)|0);
   if (!($29)) {
    break;
   }
  }
  $30 = $i;
  $31 = $j;
  $32 = ($30|0)>=($31|0);
  if ($32) {
   break;
  }
  $33 = $i;
  $34 = $0;
  $35 = (($34) + ($33<<2)|0);
  ;HEAP32[$tmp+0>>2]=HEAP32[$35+0>>2]|0;
  $36 = $i;
  $37 = $0;
  $38 = (($37) + ($36<<2)|0);
  $39 = $j;
  $40 = $0;
  $41 = (($40) + ($39<<2)|0);
  ;HEAP32[$38+0>>2]=HEAP32[$41+0>>2]|0;
  $42 = $j;
  $43 = $0;
  $44 = (($43) + ($42<<2)|0);
  ;HEAP32[$44+0>>2]=HEAP32[$tmp+0>>2]|0;
 }
 $45 = $0;
 $46 = $i;
 ;HEAP8[$$byval_copy5+0>>0]=HEAP8[$7+0>>0]|0;
 __Z4sortI3Lit16LessThan_defaultIS0_EEvPT_iT0_($45,$46,$$byval_copy5);
 $47 = $i;
 $48 = $0;
 $49 = (($48) + ($47<<2)|0);
 $50 = $1;
 $51 = $i;
 $52 = (($50) - ($51))|0;
 ;HEAP8[$$byval_copy6+0>>0]=HEAP8[$8+0>>0]|0;
 __Z4sortI3Lit16LessThan_defaultIS0_EEvPT_iT0_($49,$52,$$byval_copy6);
 STACKTOP = sp;return;
}
function __ZN3vecI3LitEcvPS0_Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __Z13selectionSortI3Lit16LessThan_defaultIS0_EEvPT_iT0_($array,$size,$lt) {
 $array = $array|0;
 $size = $size|0;
 $lt = $lt|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $best_i = 0, $i = 0, $j = 0, $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $$byval_copy1 = sp;
 $$byval_copy = sp + 16|0;
 $tmp = sp + 24|0;
 $2 = sp + 20|0;
 $3 = sp + 8|0;
 $0 = $array;
 $1 = $size;
 __ZN3LitC1Ev($tmp);
 $i = 0;
 while(1) {
  $4 = $i;
  $5 = $1;
  $6 = (($5) - 1)|0;
  $7 = ($4|0)<($6|0);
  if (!($7)) {
   break;
  }
  $8 = $i;
  $best_i = $8;
  $9 = $i;
  $10 = (($9) + 1)|0;
  $j = $10;
  while(1) {
   $11 = $j;
   $12 = $1;
   $13 = ($11|0)<($12|0);
   if (!($13)) {
    break;
   }
   $14 = $j;
   $15 = $0;
   $16 = (($15) + ($14<<2)|0);
   ;HEAP32[$2+0>>2]=HEAP32[$16+0>>2]|0;
   $17 = $best_i;
   $18 = $0;
   $19 = (($18) + ($17<<2)|0);
   ;HEAP32[$3+0>>2]=HEAP32[$19+0>>2]|0;
   ;HEAP32[$$byval_copy+0>>2]=HEAP32[$2+0>>2]|0;
   ;HEAP32[$$byval_copy1+0>>2]=HEAP32[$3+0>>2]|0;
   $20 = (__ZN16LessThan_defaultI3LitEclES0_S0_($lt,$$byval_copy,$$byval_copy1)|0);
   if ($20) {
    $21 = $j;
    $best_i = $21;
   }
   $22 = $j;
   $23 = (($22) + 1)|0;
   $j = $23;
  }
  $24 = $i;
  $25 = $0;
  $26 = (($25) + ($24<<2)|0);
  ;HEAP32[$tmp+0>>2]=HEAP32[$26+0>>2]|0;
  $27 = $i;
  $28 = $0;
  $29 = (($28) + ($27<<2)|0);
  $30 = $best_i;
  $31 = $0;
  $32 = (($31) + ($30<<2)|0);
  ;HEAP32[$29+0>>2]=HEAP32[$32+0>>2]|0;
  $33 = $best_i;
  $34 = $0;
  $35 = (($34) + ($33<<2)|0);
  ;HEAP32[$35+0>>2]=HEAP32[$tmp+0>>2]|0;
  $36 = $i;
  $37 = (($36) + 1)|0;
  $i = $37;
 }
 STACKTOP = sp;return;
}
function __ZN16LessThan_defaultI3LitEclES0_S0_($this,$x,$y) {
 $this = $this|0;
 $x = $x|0;
 $y = $y|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $$byval_copy = sp + 8|0;
 $1 = sp;
 $0 = $this;
 ;HEAP32[$1+0>>2]=HEAP32[$y+0>>2]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$1+0>>2]|0;
 $2 = (__ZNK3LitltES_($x,$$byval_copy)|0);
 STACKTOP = sp;return ($2|0);
}
function __ZNK3LitltES_($this,$p) {
 $this = $this|0;
 $p = $p|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = HEAP32[$p>>2]|0;
 $4 = ($2|0)<($3|0);
 STACKTOP = sp;return ($4|0);
}
function __ZN3vecIdE4imaxEii($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mask = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $x;
 $1 = $y;
 $2 = $1;
 $3 = $0;
 $4 = (($2) - ($3))|0;
 $5 = $4 >> 31;
 $mask = $5;
 $6 = $0;
 $7 = $mask;
 $8 = $6 & $7;
 $9 = $1;
 $10 = $mask;
 $11 = $10 ^ -1;
 $12 = $9 & $11;
 $13 = (($8) + ($12))|0;
 STACKTOP = sp;return ($13|0);
}
function __ZN3vecIcE4imaxEii($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mask = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $x;
 $1 = $y;
 $2 = $1;
 $3 = $0;
 $4 = (($2) - ($3))|0;
 $5 = $4 >> 31;
 $mask = $5;
 $6 = $0;
 $7 = $mask;
 $8 = $6 & $7;
 $9 = $1;
 $10 = $mask;
 $11 = $10 ^ -1;
 $12 = $9 & $11;
 $13 = (($8) + ($12))|0;
 STACKTOP = sp;return ($13|0);
}
function __ZN3vecIP6ClauseE4imaxEii($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mask = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $x;
 $1 = $y;
 $2 = $1;
 $3 = $0;
 $4 = (($2) - ($3))|0;
 $5 = $4 >> 31;
 $mask = $5;
 $6 = $0;
 $7 = $mask;
 $8 = $6 & $7;
 $9 = $1;
 $10 = $mask;
 $11 = $10 ^ -1;
 $12 = $9 & $11;
 $13 = (($8) + ($12))|0;
 STACKTOP = sp;return ($13|0);
}
function __ZN3vecIS_IP6ClauseEE4imaxEii($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mask = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $x;
 $1 = $y;
 $2 = $1;
 $3 = $0;
 $4 = (($2) - ($3))|0;
 $5 = $4 >> 31;
 $mask = $5;
 $6 = $0;
 $7 = $mask;
 $8 = $6 & $7;
 $9 = $1;
 $10 = $mask;
 $11 = $10 ^ -1;
 $12 = $9 & $11;
 $13 = (($8) + ($12))|0;
 STACKTOP = sp;return ($13|0);
}
function __ZN3vecIiED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIiE5clearEb($1,1);
 STACKTOP = sp;return;
}
function __ZN3vecIiE5clearEb($this,$dealloc) {
 $this = $this|0;
 $dealloc = $dealloc|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $dealloc&1;
 $1 = $2;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($3) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $12 = (($3) + 4|0);
 HEAP32[$12>>2] = 0;
 $13 = $1;
 $14 = $13&1;
 if ($14) {
  $15 = HEAP32[$3>>2]|0;
  _free($15);
  HEAP32[$3>>2] = 0;
  $16 = (($3) + 8|0);
  HEAP32[$16>>2] = 0;
 }
 STACKTOP = sp;return;
}
function __ZN3vecIcED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIcE5clearEb($1,1);
 STACKTOP = sp;return;
}
function __ZN3vecIcE5clearEb($this,$dealloc) {
 $this = $this|0;
 $dealloc = $dealloc|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $dealloc&1;
 $1 = $2;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($3) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $12 = (($3) + 4|0);
 HEAP32[$12>>2] = 0;
 $13 = $1;
 $14 = $13&1;
 if ($14) {
  $15 = HEAP32[$3>>2]|0;
  _free($15);
  HEAP32[$3>>2] = 0;
  $16 = (($3) + 8|0);
  HEAP32[$16>>2] = 0;
 }
 STACKTOP = sp;return;
}
function __ZN3vecIS_IP6ClauseEED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIS_IP6ClauseEE5clearEb($1,1);
 STACKTOP = sp;return;
}
function __ZN3vecIS_IP6ClauseEE5clearEb($this,$dealloc) {
 $this = $this|0;
 $dealloc = $dealloc|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $dealloc&1;
 $1 = $2;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($3) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = HEAP32[$3>>2]|0;
  $12 = (($11) + (($10*12)|0)|0);
  __ZN3vecIP6ClauseED1Ev($12);
  $13 = $i;
  $14 = (($13) + 1)|0;
  $i = $14;
 }
 $15 = (($3) + 4|0);
 HEAP32[$15>>2] = 0;
 $16 = $1;
 $17 = $16&1;
 if ($17) {
  $18 = HEAP32[$3>>2]|0;
  _free($18);
  HEAP32[$3>>2] = 0;
  $19 = (($3) + 8|0);
  HEAP32[$19>>2] = 0;
 }
 STACKTOP = sp;return;
}
function __ZN3vecIdED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIdE5clearEb($1,1);
 STACKTOP = sp;return;
}
function __ZN3vecIdE5clearEb($this,$dealloc) {
 $this = $this|0;
 $dealloc = $dealloc|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $dealloc&1;
 $1 = $2;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($3) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $12 = (($3) + 4|0);
 HEAP32[$12>>2] = 0;
 $13 = $1;
 $14 = $13&1;
 if ($14) {
  $15 = HEAP32[$3>>2]|0;
  _free($15);
  HEAP32[$3>>2] = 0;
  $16 = (($3) + 8|0);
  HEAP32[$16>>2] = 0;
 }
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecIP6ClauseE5clearEb($1,1);
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseE5clearEb($this,$dealloc) {
 $this = $this|0;
 $dealloc = $dealloc|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $dealloc&1;
 $1 = $2;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($3) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $12 = (($3) + 4|0);
 HEAP32[$12>>2] = 0;
 $13 = $1;
 $14 = $13&1;
 if ($14) {
  $15 = HEAP32[$3>>2]|0;
  _free($15);
  HEAP32[$3>>2] = 0;
  $16 = (($3) + 8|0);
  HEAP32[$16>>2] = 0;
 }
 STACKTOP = sp;return;
}
function __ZN3vecI5lboolED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 __ZN3vecI5lboolE5clearEb($1,1);
 STACKTOP = sp;return;
}
function __ZN3vecIiEC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = (($1) + 4|0);
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 8|0);
 HEAP32[$3>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN3vecIcEC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = (($1) + 4|0);
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 8|0);
 HEAP32[$3>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN3vecIS_IP6ClauseEEC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = (($1) + 4|0);
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 8|0);
 HEAP32[$3>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN3vecIdEC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = (($1) + 4|0);
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 8|0);
 HEAP32[$3>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN3vecIP6ClauseEC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = (($1) + 4|0);
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 8|0);
 HEAP32[$3>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN3vecI5lboolEC2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = (($1) + 4|0);
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 8|0);
 HEAP32[$3>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN4HeapIN6Solver10VarOrderLtEEC2ERKS1_($this,$c) {
 $this = $this|0;
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $c;
 $4 = $0;
 $5 = $1;
 ;HEAP32[$4+0>>2]=HEAP32[$5+0>>2]|0;
 $6 = (($4) + 4|0);
 __ZN3vecIiEC1Ev($6);
 $7 = (($4) + 16|0);
 __THREW__ = 0;
 invoke_vi(30,($7|0));
 $8 = __THREW__; __THREW__ = 0;
 $9 = $8&1;
 if (!($9)) {
  STACKTOP = sp;return;
 }
 $10 = ___cxa_find_matching_catch(-1,-1)|0;
 $11 = tempRet0;
 $2 = $10;
 $3 = $11;
 __THREW__ = 0;
 invoke_vi(35,($6|0));
 $12 = __THREW__; __THREW__ = 0;
 $13 = $12&1;
 if ($13) {
  $16 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $17 = tempRet0;
  ___clang_call_terminate($16);
  // unreachable;
 }
 $14 = $2;
 $15 = $3;
 ___resumeException($14|0);
 // unreachable;
}
function __ZN3vecIiE4imaxEii($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mask = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $x;
 $1 = $y;
 $2 = $1;
 $3 = $0;
 $4 = (($2) - ($3))|0;
 $5 = $4 >> 31;
 $mask = $5;
 $6 = $0;
 $7 = $mask;
 $8 = $6 & $7;
 $9 = $1;
 $10 = $mask;
 $11 = $10 ^ -1;
 $12 = $9 & $11;
 $13 = (($8) + ($12))|0;
 STACKTOP = sp;return ($13|0);
}
function __ZN6Solver9VarFilterC2ERKS_($this,$_s) {
 $this = $this|0;
 $_s = $_s|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $_s;
 $2 = $0;
 $3 = $1;
 HEAP32[$2>>2] = $3;
 STACKTOP = sp;return;
}
function __ZNK3vecIP6ClauseEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<2)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZN5lboolC2Eb($this,$x) {
 $this = $this|0;
 $x = $x|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $2 = $x&1;
 $1 = $2;
 $3 = $0;
 $4 = $1;
 $5 = $4&1;
 $6 = $5&1;
 $7 = $6<<1;
 $8 = (($7) - 1)|0;
 $9 = $8&255;
 HEAP8[$3>>0] = $9;
 STACKTOP = sp;return;
}
function __ZN3vecIdEixEi($this,$index) {
 $this = $this|0;
 $index = $index|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $index;
 $2 = $0;
 $3 = $1;
 $4 = HEAP32[$2>>2]|0;
 $5 = (($4) + ($3<<3)|0);
 STACKTOP = sp;return ($5|0);
}
function __ZNK4HeapIN6Solver10VarOrderLtEE6inHeapEi($this,$n) {
 $this = $this|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $n;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 16|0);
 $5 = (__ZNK3vecIiE4sizeEv($4)|0);
 $6 = ($3|0)<($5|0);
 if (!($6)) {
  $12 = 0;
  STACKTOP = sp;return ($12|0);
 }
 $7 = (($2) + 16|0);
 $8 = $1;
 $9 = (__ZNK3vecIiEixEi($7,$8)|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = ($10|0)>=(0);
 $12 = $11;
 STACKTOP = sp;return ($12|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEE8decreaseEi($this,$n) {
 $this = $this|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $n;
 $2 = $0;
 $3 = $1;
 $4 = (__ZNK4HeapIN6Solver10VarOrderLtEE6inHeapEi($2,$3)|0);
 if ($4) {
  $5 = (($2) + 16|0);
  $6 = $1;
  $7 = (__ZN3vecIiEixEi($5,$6)|0);
  $8 = HEAP32[$7>>2]|0;
  __ZN4HeapIN6Solver10VarOrderLtEE11percolateUpEi($2,$8);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((2224|0),(2096|0),82,(2240|0));
  // unreachable;
 }
}
function __ZN4HeapIN6Solver10VarOrderLtEE11percolateUpEi($this,$i) {
 $this = $this|0;
 $i = $i|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $x = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $i;
 $2 = $0;
 $3 = (($2) + 4|0);
 $4 = $1;
 $5 = (__ZN3vecIiEixEi($3,$4)|0);
 $6 = HEAP32[$5>>2]|0;
 $x = $6;
 while(1) {
  $7 = $1;
  $8 = ($7|0)!=(0);
  if ($8) {
   $9 = $x;
   $10 = (($2) + 4|0);
   $11 = $1;
   $12 = (__ZN4HeapIN6Solver10VarOrderLtEE6parentEi($11)|0);
   $13 = (__ZN3vecIiEixEi($10,$12)|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = (__ZNK6Solver10VarOrderLtclEii($2,$9,$14)|0);
   $41 = $15;
  } else {
   $41 = 0;
  }
  if (!($41)) {
   break;
  }
  $16 = (($2) + 4|0);
  $17 = $1;
  $18 = (__ZN4HeapIN6Solver10VarOrderLtEE6parentEi($17)|0);
  $19 = (__ZN3vecIiEixEi($16,$18)|0);
  $20 = HEAP32[$19>>2]|0;
  $21 = (($2) + 4|0);
  $22 = $1;
  $23 = (__ZN3vecIiEixEi($21,$22)|0);
  HEAP32[$23>>2] = $20;
  $24 = $1;
  $25 = (($2) + 16|0);
  $26 = (($2) + 4|0);
  $27 = $1;
  $28 = (__ZN3vecIiEixEi($26,$27)|0);
  $29 = HEAP32[$28>>2]|0;
  $30 = (__ZN3vecIiEixEi($25,$29)|0);
  HEAP32[$30>>2] = $24;
  $31 = $1;
  $32 = (__ZN4HeapIN6Solver10VarOrderLtEE6parentEi($31)|0);
  $1 = $32;
 }
 $33 = $x;
 $34 = (($2) + 4|0);
 $35 = $1;
 $36 = (__ZN3vecIiEixEi($34,$35)|0);
 HEAP32[$36>>2] = $33;
 $37 = $1;
 $38 = (($2) + 16|0);
 $39 = $x;
 $40 = (__ZN3vecIiEixEi($38,$39)|0);
 HEAP32[$40>>2] = $37;
 STACKTOP = sp;return;
}
function __ZN4HeapIN6Solver10VarOrderLtEE6insertEi($this,$n) {
 $this = $this|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = sp + 4|0;
 $2 = sp;
 $0 = $this;
 HEAP32[$1>>2] = $n;
 $3 = $0;
 $4 = (($3) + 16|0);
 $5 = HEAP32[$1>>2]|0;
 $6 = (($5) + 1)|0;
 HEAP32[$2>>2] = -1;
 __ZN3vecIiE6growToEiRKi($4,$6,$2);
 $7 = HEAP32[$1>>2]|0;
 $8 = (__ZNK4HeapIN6Solver10VarOrderLtEE6inHeapEi($3,$7)|0);
 if ($8) {
  ___assert_fail((2256|0),(2096|0),91,(2272|0));
  // unreachable;
 } else {
  $9 = (($3) + 4|0);
  $10 = (__ZNK3vecIiE4sizeEv($9)|0);
  $11 = (($3) + 16|0);
  $12 = HEAP32[$1>>2]|0;
  $13 = (__ZN3vecIiEixEi($11,$12)|0);
  HEAP32[$13>>2] = $10;
  $14 = (($3) + 4|0);
  __ZN3vecIiE4pushERKi($14,$1);
  $15 = (($3) + 16|0);
  $16 = HEAP32[$1>>2]|0;
  $17 = (__ZN3vecIiEixEi($15,$16)|0);
  $18 = HEAP32[$17>>2]|0;
  __ZN4HeapIN6Solver10VarOrderLtEE11percolateUpEi($3,$18);
  STACKTOP = sp;return;
 }
}
function __ZN3vecIiE6growToEiRKi($this,$size,$pad) {
 $this = $this|0;
 $size = $size|0;
 $pad = $pad|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $size;
 $2 = $pad;
 $3 = $0;
 $4 = (($3) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $1;
 $7 = ($5|0)>=($6|0);
 if ($7) {
  STACKTOP = sp;return;
 }
 $8 = $1;
 __ZN3vecIiE4growEi($3,$8);
 $9 = (($3) + 4|0);
 $10 = HEAP32[$9>>2]|0;
 $i = $10;
 while(1) {
  $11 = $i;
  $12 = $1;
  $13 = ($11|0)<($12|0);
  if (!($13)) {
   break;
  }
  $14 = $i;
  $15 = HEAP32[$3>>2]|0;
  $16 = (($15) + ($14<<2)|0);
  $17 = ($16|0)==(0|0);
  if (!($17)) {
   $18 = $2;
   $19 = HEAP32[$18>>2]|0;
   HEAP32[$16>>2] = $19;
  }
  $20 = $i;
  $21 = (($20) + 1)|0;
  $i = $21;
 }
 $22 = $1;
 $23 = (($3) + 4|0);
 HEAP32[$23>>2] = $22;
 STACKTOP = sp;return;
}
function __ZN3vecIiE4growEi($this,$min_cap) {
 $this = $this|0;
 $min_cap = $min_cap|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $min_cap;
 $2 = $0;
 $3 = $1;
 $4 = (($2) + 8|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)<=($5|0);
 if ($6) {
  STACKTOP = sp;return;
 }
 $7 = (($2) + 8|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = ($8|0)==(0);
 if ($9) {
  $10 = $1;
  $11 = ($10|0)>=(2);
  if ($11) {
   $12 = $1;
   $14 = $12;
  } else {
   $14 = 2;
  }
  $13 = (($2) + 8|0);
  HEAP32[$13>>2] = $14;
 } else {
  while(1) {
   $15 = (($2) + 8|0);
   $16 = HEAP32[$15>>2]|0;
   $17 = ($16*3)|0;
   $18 = (($17) + 1)|0;
   $19 = $18 >> 1;
   $20 = (($2) + 8|0);
   HEAP32[$20>>2] = $19;
   $21 = (($2) + 8|0);
   $22 = HEAP32[$21>>2]|0;
   $23 = $1;
   $24 = ($22|0)<($23|0);
   if (!($24)) {
    break;
   }
  }
 }
 $25 = HEAP32[$2>>2]|0;
 $26 = (($2) + 8|0);
 $27 = HEAP32[$26>>2]|0;
 $28 = $27<<2;
 $29 = (_realloc($25,$28)|0);
 HEAP32[$2>>2] = $29;
 STACKTOP = sp;return;
}
function __ZNK5lbool5toIntEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $0;
 $2 = HEAP8[$1>>0]|0;
 $3 = $2 << 24 >> 24;
 STACKTOP = sp;return ($3|0);
}
function __ZN4HeapIN6Solver10VarOrderLtEED2Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $3 = $0;
 $4 = (($3) + 16|0);
 __THREW__ = 0;
 invoke_vi(35,($4|0));
 $5 = __THREW__; __THREW__ = 0;
 $6 = $5&1;
 if (!($6)) {
  $7 = (($3) + 4|0);
  __ZN3vecIiED1Ev($7);
  STACKTOP = sp;return;
 }
 $8 = ___cxa_find_matching_catch(-1,-1)|0;
 $9 = tempRet0;
 $1 = $8;
 $2 = $9;
 $10 = (($3) + 4|0);
 __THREW__ = 0;
 invoke_vi(35,($10|0));
 $11 = __THREW__; __THREW__ = 0;
 $12 = $11&1;
 if ($12) {
  $15 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $16 = tempRet0;
  ___clang_call_terminate($15);
  // unreachable;
 }
 $13 = $1;
 $14 = $2;
 ___resumeException($13|0);
 // unreachable;
}
function __ZN6Solver10VarOrderLtC2ERK3vecIdE($this,$act) {
 $this = $this|0;
 $act = $act|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $this;
 $1 = $act;
 $2 = $0;
 $3 = $1;
 HEAP32[$2>>2] = $3;
 STACKTOP = sp;return;
}
function __GLOBAL__I_a79() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 ___cxx_global_var_init66();
 ___cxx_global_var_init167();
 ___cxx_global_var_init268();
 ___cxx_global_var_init369();
 ___cxx_global_var_init470();
 STACKTOP = sp;return;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0;
 var $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0, $$sum108$i = 0, $$sum109$i = 0;
 var $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0;
 var $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0;
 var $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0;
 var $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0;
 var $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0;
 var $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0;
 var $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0;
 var $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0;
 var $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i18 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i17 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0;
 var $T$024$i = 0, $T$051$i$i = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0;
 var $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0;
 var $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$228$i = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0;
 var $v$330$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   if ($1) {
    $5 = 16;
   } else {
    $2 = (($bytes) + 11)|0;
    $3 = $2 & -8;
    $5 = $3;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[2280>>2]|0;
   $7 = $6 >>> $4;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($4))|0;
    $13 = $12 << 1;
    $14 = ((2280 + ($13<<2)|0) + 40|0);
    $$sum10 = (($13) + 2)|0;
    $15 = ((2280 + ($$sum10<<2)|0) + 40|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = (($16) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[2280>>2] = $22;
     } else {
      $23 = HEAP32[((2280 + 16|0))>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = (($18) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = (($16) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    STACKTOP = sp;return ($mem$0|0);
   }
   $34 = HEAP32[((2280 + 8|0))>>2]|0;
   $35 = ($5>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $4;
     $38 = 2 << $4;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = ((2280 + ($65<<2)|0) + 40|0);
     $$sum4 = (($65) + 2)|0;
     $67 = ((2280 + ($$sum4<<2)|0) + 40|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = (($68) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[2280>>2] = $74;
      } else {
       $75 = HEAP32[((2280 + 16|0))>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = (($70) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($5))|0;
     $82 = $5 | 3;
     $83 = (($68) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($5)|0);
     $85 = $81 | 1;
     $$sum56 = $5 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $88 = HEAP32[((2280 + 8|0))>>2]|0;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[((2280 + 20|0))>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = ((2280 + ($92<<2)|0) + 40|0);
      $94 = HEAP32[2280>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[2280>>2] = $98;
       $$sum8$pre = (($92) + 2)|0;
       $$pre = ((2280 + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = ((2280 + ($$sum9<<2)|0) + 40|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[((2280 + 16|0))>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = (($F4$0) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = (($90) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = (($90) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[((2280 + 8|0))>>2] = $81;
     HEAP32[((2280 + 20|0))>>2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $106 = HEAP32[((2280 + 4|0))>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $5;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = ((2280 + ($130<<2)|0) + 304|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = (($132) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($5))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = (($t$0$i) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = (($t$0$i) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = (($144) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($5))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[((2280 + 16|0))>>2]|0;
     $150 = ($v$0$i>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i) + ($5)|0);
     $152 = ($v$0$i>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = (($v$0$i) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = (($v$0$i) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i|0);
     do {
      if ($157) {
       $167 = (($v$0$i) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = (($v$0$i) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = (($R$0$i) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = (($R$0$i) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $158 = (($v$0$i) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = (($159) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = (($156) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = (($v$0$i) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ((2280 + ($182<<2)|0) + 304|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[((2280 + 4|0))>>2]|0;
         $189 = $188 & $187;
         HEAP32[((2280 + 4|0))>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[((2280 + 16|0))>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = (($154) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = (($154) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[((2280 + 16|0))>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = (($R$1$i) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = (($v$0$i) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = HEAP32[((2280 + 16|0))>>2]|0;
         $204 = ($201>>>0)<($203>>>0);
         if ($204) {
          _abort();
          // unreachable;
         } else {
          $205 = (($R$1$i) + 16|0);
          HEAP32[$205>>2] = $201;
          $206 = (($201) + 24|0);
          HEAP32[$206>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $207 = (($v$0$i) + 20|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==(0|0);
       if (!($209)) {
        $210 = HEAP32[((2280 + 16|0))>>2]|0;
        $211 = ($208>>>0)<($210>>>0);
        if ($211) {
         _abort();
         // unreachable;
        } else {
         $212 = (($R$1$i) + 20|0);
         HEAP32[$212>>2] = $208;
         $213 = (($208) + 24|0);
         HEAP32[$213>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $214 = ($rsize$0$i>>>0)<(16);
     if ($214) {
      $215 = (($rsize$0$i) + ($5))|0;
      $216 = $215 | 3;
      $217 = (($v$0$i) + 4|0);
      HEAP32[$217>>2] = $216;
      $$sum4$i = (($215) + 4)|0;
      $218 = (($v$0$i) + ($$sum4$i)|0);
      $219 = HEAP32[$218>>2]|0;
      $220 = $219 | 1;
      HEAP32[$218>>2] = $220;
     } else {
      $221 = $5 | 3;
      $222 = (($v$0$i) + 4|0);
      HEAP32[$222>>2] = $221;
      $223 = $rsize$0$i | 1;
      $$sum$i35 = $5 | 4;
      $224 = (($v$0$i) + ($$sum$i35)|0);
      HEAP32[$224>>2] = $223;
      $$sum1$i = (($rsize$0$i) + ($5))|0;
      $225 = (($v$0$i) + ($$sum1$i)|0);
      HEAP32[$225>>2] = $rsize$0$i;
      $226 = HEAP32[((2280 + 8|0))>>2]|0;
      $227 = ($226|0)==(0);
      if (!($227)) {
       $228 = HEAP32[((2280 + 20|0))>>2]|0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = ((2280 + ($230<<2)|0) + 40|0);
       $232 = HEAP32[2280>>2]|0;
       $233 = 1 << $229;
       $234 = $232 & $233;
       $235 = ($234|0)==(0);
       if ($235) {
        $236 = $232 | $233;
        HEAP32[2280>>2] = $236;
        $$sum2$pre$i = (($230) + 2)|0;
        $$pre$i = ((2280 + ($$sum2$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $231;
       } else {
        $$sum3$i = (($230) + 2)|0;
        $237 = ((2280 + ($$sum3$i<<2)|0) + 40|0);
        $238 = HEAP32[$237>>2]|0;
        $239 = HEAP32[((2280 + 16|0))>>2]|0;
        $240 = ($238>>>0)<($239>>>0);
        if ($240) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $237;$F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $228;
       $241 = (($F1$0$i) + 12|0);
       HEAP32[$241>>2] = $228;
       $242 = (($228) + 8|0);
       HEAP32[$242>>2] = $F1$0$i;
       $243 = (($228) + 12|0);
       HEAP32[$243>>2] = $231;
      }
      HEAP32[((2280 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((2280 + 20|0))>>2] = $151;
     }
     $244 = (($v$0$i) + 8|0);
     $mem$0 = $244;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   $245 = ($bytes>>>0)>(4294967231);
   if ($245) {
    $nb$0 = -1;
   } else {
    $246 = (($bytes) + 11)|0;
    $247 = $246 & -8;
    $248 = HEAP32[((2280 + 4|0))>>2]|0;
    $249 = ($248|0)==(0);
    if ($249) {
     $nb$0 = $247;
    } else {
     $250 = (0 - ($247))|0;
     $251 = $246 >>> 8;
     $252 = ($251|0)==(0);
     if ($252) {
      $idx$0$i = 0;
     } else {
      $253 = ($247>>>0)>(16777215);
      if ($253) {
       $idx$0$i = 31;
      } else {
       $254 = (($251) + 1048320)|0;
       $255 = $254 >>> 16;
       $256 = $255 & 8;
       $257 = $251 << $256;
       $258 = (($257) + 520192)|0;
       $259 = $258 >>> 16;
       $260 = $259 & 4;
       $261 = $260 | $256;
       $262 = $257 << $260;
       $263 = (($262) + 245760)|0;
       $264 = $263 >>> 16;
       $265 = $264 & 2;
       $266 = $261 | $265;
       $267 = (14 - ($266))|0;
       $268 = $262 << $265;
       $269 = $268 >>> 15;
       $270 = (($267) + ($269))|0;
       $271 = $270 << 1;
       $272 = (($270) + 7)|0;
       $273 = $247 >>> $272;
       $274 = $273 & 1;
       $275 = $274 | $271;
       $idx$0$i = $275;
      }
     }
     $276 = ((2280 + ($idx$0$i<<2)|0) + 304|0);
     $277 = HEAP32[$276>>2]|0;
     $278 = ($277|0)==(0|0);
     L126: do {
      if ($278) {
       $rsize$2$i = $250;$t$1$i = 0;$v$2$i = 0;
      } else {
       $279 = ($idx$0$i|0)==(31);
       if ($279) {
        $283 = 0;
       } else {
        $280 = $idx$0$i >>> 1;
        $281 = (25 - ($280))|0;
        $283 = $281;
       }
       $282 = $247 << $283;
       $rsize$0$i15 = $250;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $277;$v$0$i16 = 0;
       while(1) {
        $284 = (($t$0$i14) + 4|0);
        $285 = HEAP32[$284>>2]|0;
        $286 = $285 & -8;
        $287 = (($286) - ($247))|0;
        $288 = ($287>>>0)<($rsize$0$i15>>>0);
        if ($288) {
         $289 = ($286|0)==($247|0);
         if ($289) {
          $rsize$2$i = $287;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $290 = (($t$0$i14) + 20|0);
        $291 = HEAP32[$290>>2]|0;
        $292 = $sizebits$0$i >>> 31;
        $293 = ((($t$0$i14) + ($292<<2)|0) + 16|0);
        $294 = HEAP32[$293>>2]|0;
        $295 = ($291|0)==(0|0);
        $296 = ($291|0)==($294|0);
        $or$cond$i = $295 | $296;
        $rst$1$i = $or$cond$i ? $rst$0$i : $291;
        $297 = ($294|0)==(0|0);
        $298 = $sizebits$0$i << 1;
        if ($297) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $298;$t$0$i14 = $294;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     $299 = ($t$1$i|0)==(0|0);
     $300 = ($v$2$i|0)==(0|0);
     $or$cond19$i = $299 & $300;
     if ($or$cond19$i) {
      $301 = 2 << $idx$0$i;
      $302 = (0 - ($301))|0;
      $303 = $301 | $302;
      $304 = $248 & $303;
      $305 = ($304|0)==(0);
      if ($305) {
       $nb$0 = $247;
       break;
      }
      $306 = (0 - ($304))|0;
      $307 = $304 & $306;
      $308 = (($307) + -1)|0;
      $309 = $308 >>> 12;
      $310 = $309 & 16;
      $311 = $308 >>> $310;
      $312 = $311 >>> 5;
      $313 = $312 & 8;
      $314 = $313 | $310;
      $315 = $311 >>> $313;
      $316 = $315 >>> 2;
      $317 = $316 & 4;
      $318 = $314 | $317;
      $319 = $315 >>> $317;
      $320 = $319 >>> 1;
      $321 = $320 & 2;
      $322 = $318 | $321;
      $323 = $319 >>> $321;
      $324 = $323 >>> 1;
      $325 = $324 & 1;
      $326 = $322 | $325;
      $327 = $323 >>> $325;
      $328 = (($326) + ($327))|0;
      $329 = ((2280 + ($328<<2)|0) + 304|0);
      $330 = HEAP32[$329>>2]|0;
      $t$2$ph$i = $330;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $331 = ($t$2$ph$i|0)==(0|0);
     if ($331) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
      while(1) {
       $332 = (($t$228$i) + 4|0);
       $333 = HEAP32[$332>>2]|0;
       $334 = $333 & -8;
       $335 = (($334) - ($247))|0;
       $336 = ($335>>>0)<($rsize$329$i>>>0);
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $337 = (($t$228$i) + 16|0);
       $338 = HEAP32[$337>>2]|0;
       $339 = ($338|0)==(0|0);
       if (!($339)) {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $338;$v$330$i = $t$2$v$3$i;
        continue;
       }
       $340 = (($t$228$i) + 20|0);
       $341 = HEAP32[$340>>2]|0;
       $342 = ($341|0)==(0|0);
       if ($342) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $341;$v$330$i = $t$2$v$3$i;
       }
      }
     }
     $343 = ($v$3$lcssa$i|0)==(0|0);
     if ($343) {
      $nb$0 = $247;
     } else {
      $344 = HEAP32[((2280 + 8|0))>>2]|0;
      $345 = (($344) - ($247))|0;
      $346 = ($rsize$3$lcssa$i>>>0)<($345>>>0);
      if ($346) {
       $347 = HEAP32[((2280 + 16|0))>>2]|0;
       $348 = ($v$3$lcssa$i>>>0)<($347>>>0);
       if ($348) {
        _abort();
        // unreachable;
       }
       $349 = (($v$3$lcssa$i) + ($247)|0);
       $350 = ($v$3$lcssa$i>>>0)<($349>>>0);
       if (!($350)) {
        _abort();
        // unreachable;
       }
       $351 = (($v$3$lcssa$i) + 24|0);
       $352 = HEAP32[$351>>2]|0;
       $353 = (($v$3$lcssa$i) + 12|0);
       $354 = HEAP32[$353>>2]|0;
       $355 = ($354|0)==($v$3$lcssa$i|0);
       do {
        if ($355) {
         $365 = (($v$3$lcssa$i) + 20|0);
         $366 = HEAP32[$365>>2]|0;
         $367 = ($366|0)==(0|0);
         if ($367) {
          $368 = (($v$3$lcssa$i) + 16|0);
          $369 = HEAP32[$368>>2]|0;
          $370 = ($369|0)==(0|0);
          if ($370) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;$RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;$RP$0$i17 = $365;
         }
         while(1) {
          $371 = (($R$0$i18) + 20|0);
          $372 = HEAP32[$371>>2]|0;
          $373 = ($372|0)==(0|0);
          if (!($373)) {
           $R$0$i18 = $372;$RP$0$i17 = $371;
           continue;
          }
          $374 = (($R$0$i18) + 16|0);
          $375 = HEAP32[$374>>2]|0;
          $376 = ($375|0)==(0|0);
          if ($376) {
           break;
          } else {
           $R$0$i18 = $375;$RP$0$i17 = $374;
          }
         }
         $377 = ($RP$0$i17>>>0)<($347>>>0);
         if ($377) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17>>2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $356 = (($v$3$lcssa$i) + 8|0);
         $357 = HEAP32[$356>>2]|0;
         $358 = ($357>>>0)<($347>>>0);
         if ($358) {
          _abort();
          // unreachable;
         }
         $359 = (($357) + 12|0);
         $360 = HEAP32[$359>>2]|0;
         $361 = ($360|0)==($v$3$lcssa$i|0);
         if (!($361)) {
          _abort();
          // unreachable;
         }
         $362 = (($354) + 8|0);
         $363 = HEAP32[$362>>2]|0;
         $364 = ($363|0)==($v$3$lcssa$i|0);
         if ($364) {
          HEAP32[$359>>2] = $354;
          HEAP32[$362>>2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $378 = ($352|0)==(0|0);
       do {
        if (!($378)) {
         $379 = (($v$3$lcssa$i) + 28|0);
         $380 = HEAP32[$379>>2]|0;
         $381 = ((2280 + ($380<<2)|0) + 304|0);
         $382 = HEAP32[$381>>2]|0;
         $383 = ($v$3$lcssa$i|0)==($382|0);
         if ($383) {
          HEAP32[$381>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $384 = 1 << $380;
           $385 = $384 ^ -1;
           $386 = HEAP32[((2280 + 4|0))>>2]|0;
           $387 = $386 & $385;
           HEAP32[((2280 + 4|0))>>2] = $387;
           break;
          }
         } else {
          $388 = HEAP32[((2280 + 16|0))>>2]|0;
          $389 = ($352>>>0)<($388>>>0);
          if ($389) {
           _abort();
           // unreachable;
          }
          $390 = (($352) + 16|0);
          $391 = HEAP32[$390>>2]|0;
          $392 = ($391|0)==($v$3$lcssa$i|0);
          if ($392) {
           HEAP32[$390>>2] = $R$1$i20;
          } else {
           $393 = (($352) + 20|0);
           HEAP32[$393>>2] = $R$1$i20;
          }
          $394 = ($R$1$i20|0)==(0|0);
          if ($394) {
           break;
          }
         }
         $395 = HEAP32[((2280 + 16|0))>>2]|0;
         $396 = ($R$1$i20>>>0)<($395>>>0);
         if ($396) {
          _abort();
          // unreachable;
         }
         $397 = (($R$1$i20) + 24|0);
         HEAP32[$397>>2] = $352;
         $398 = (($v$3$lcssa$i) + 16|0);
         $399 = HEAP32[$398>>2]|0;
         $400 = ($399|0)==(0|0);
         do {
          if (!($400)) {
           $401 = HEAP32[((2280 + 16|0))>>2]|0;
           $402 = ($399>>>0)<($401>>>0);
           if ($402) {
            _abort();
            // unreachable;
           } else {
            $403 = (($R$1$i20) + 16|0);
            HEAP32[$403>>2] = $399;
            $404 = (($399) + 24|0);
            HEAP32[$404>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $405 = (($v$3$lcssa$i) + 20|0);
         $406 = HEAP32[$405>>2]|0;
         $407 = ($406|0)==(0|0);
         if (!($407)) {
          $408 = HEAP32[((2280 + 16|0))>>2]|0;
          $409 = ($406>>>0)<($408>>>0);
          if ($409) {
           _abort();
           // unreachable;
          } else {
           $410 = (($R$1$i20) + 20|0);
           HEAP32[$410>>2] = $406;
           $411 = (($406) + 24|0);
           HEAP32[$411>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $412 = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($412) {
         $413 = (($rsize$3$lcssa$i) + ($247))|0;
         $414 = $413 | 3;
         $415 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$415>>2] = $414;
         $$sum18$i = (($413) + 4)|0;
         $416 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $417 = HEAP32[$416>>2]|0;
         $418 = $417 | 1;
         HEAP32[$416>>2] = $418;
        } else {
         $419 = $247 | 3;
         $420 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$420>>2] = $419;
         $421 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $247 | 4;
         $422 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$422>>2] = $421;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($247))|0;
         $423 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$423>>2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         $425 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($425) {
          $426 = $424 << 1;
          $427 = ((2280 + ($426<<2)|0) + 40|0);
          $428 = HEAP32[2280>>2]|0;
          $429 = 1 << $424;
          $430 = $428 & $429;
          $431 = ($430|0)==(0);
          do {
           if ($431) {
            $432 = $428 | $429;
            HEAP32[2280>>2] = $432;
            $$sum14$pre$i = (($426) + 2)|0;
            $$pre$i25 = ((2280 + ($$sum14$pre$i<<2)|0) + 40|0);
            $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $427;
           } else {
            $$sum17$i = (($426) + 2)|0;
            $433 = ((2280 + ($$sum17$i<<2)|0) + 40|0);
            $434 = HEAP32[$433>>2]|0;
            $435 = HEAP32[((2280 + 16|0))>>2]|0;
            $436 = ($434>>>0)<($435>>>0);
            if (!($436)) {
             $$pre$phi$i26Z2D = $433;$F5$0$i = $434;
             break;
            }
            _abort();
            // unreachable;
           }
          } while(0);
          HEAP32[$$pre$phi$i26Z2D>>2] = $349;
          $437 = (($F5$0$i) + 12|0);
          HEAP32[$437>>2] = $349;
          $$sum15$i = (($247) + 8)|0;
          $438 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$438>>2] = $F5$0$i;
          $$sum16$i = (($247) + 12)|0;
          $439 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$439>>2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         $441 = ($440|0)==(0);
         if ($441) {
          $I7$0$i = 0;
         } else {
          $442 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($442) {
           $I7$0$i = 31;
          } else {
           $443 = (($440) + 1048320)|0;
           $444 = $443 >>> 16;
           $445 = $444 & 8;
           $446 = $440 << $445;
           $447 = (($446) + 520192)|0;
           $448 = $447 >>> 16;
           $449 = $448 & 4;
           $450 = $449 | $445;
           $451 = $446 << $449;
           $452 = (($451) + 245760)|0;
           $453 = $452 >>> 16;
           $454 = $453 & 2;
           $455 = $450 | $454;
           $456 = (14 - ($455))|0;
           $457 = $451 << $454;
           $458 = $457 >>> 15;
           $459 = (($456) + ($458))|0;
           $460 = $459 << 1;
           $461 = (($459) + 7)|0;
           $462 = $rsize$3$lcssa$i >>> $461;
           $463 = $462 & 1;
           $464 = $463 | $460;
           $I7$0$i = $464;
          }
         }
         $465 = ((2280 + ($I7$0$i<<2)|0) + 304|0);
         $$sum2$i = (($247) + 28)|0;
         $466 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$466>>2] = $I7$0$i;
         $$sum3$i27 = (($247) + 16)|0;
         $467 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($247) + 20)|0;
         $468 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$468>>2] = 0;
         HEAP32[$467>>2] = 0;
         $469 = HEAP32[((2280 + 4|0))>>2]|0;
         $470 = 1 << $I7$0$i;
         $471 = $469 & $470;
         $472 = ($471|0)==(0);
         if ($472) {
          $473 = $469 | $470;
          HEAP32[((2280 + 4|0))>>2] = $473;
          HEAP32[$465>>2] = $349;
          $$sum5$i = (($247) + 24)|0;
          $474 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$474>>2] = $465;
          $$sum6$i = (($247) + 12)|0;
          $475 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$475>>2] = $349;
          $$sum7$i = (($247) + 8)|0;
          $476 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$476>>2] = $349;
          break;
         }
         $477 = HEAP32[$465>>2]|0;
         $478 = ($I7$0$i|0)==(31);
         if ($478) {
          $486 = 0;
         } else {
          $479 = $I7$0$i >>> 1;
          $480 = (25 - ($479))|0;
          $486 = $480;
         }
         $481 = (($477) + 4|0);
         $482 = HEAP32[$481>>2]|0;
         $483 = $482 & -8;
         $484 = ($483|0)==($rsize$3$lcssa$i|0);
         L225: do {
          if ($484) {
           $T$0$lcssa$i = $477;
          } else {
           $485 = $rsize$3$lcssa$i << $486;
           $K12$025$i = $485;$T$024$i = $477;
           while(1) {
            $493 = $K12$025$i >>> 31;
            $494 = ((($T$024$i) + ($493<<2)|0) + 16|0);
            $489 = HEAP32[$494>>2]|0;
            $495 = ($489|0)==(0|0);
            if ($495) {
             break;
            }
            $487 = $K12$025$i << 1;
            $488 = (($489) + 4|0);
            $490 = HEAP32[$488>>2]|0;
            $491 = $490 & -8;
            $492 = ($491|0)==($rsize$3$lcssa$i|0);
            if ($492) {
             $T$0$lcssa$i = $489;
             break L225;
            } else {
             $K12$025$i = $487;$T$024$i = $489;
            }
           }
           $496 = HEAP32[((2280 + 16|0))>>2]|0;
           $497 = ($494>>>0)<($496>>>0);
           if ($497) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$494>>2] = $349;
            $$sum11$i = (($247) + 24)|0;
            $498 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$498>>2] = $T$024$i;
            $$sum12$i = (($247) + 12)|0;
            $499 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$499>>2] = $349;
            $$sum13$i = (($247) + 8)|0;
            $500 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$500>>2] = $349;
            break L204;
           }
          }
         } while(0);
         $501 = (($T$0$lcssa$i) + 8|0);
         $502 = HEAP32[$501>>2]|0;
         $503 = HEAP32[((2280 + 16|0))>>2]|0;
         $504 = ($T$0$lcssa$i>>>0)<($503>>>0);
         if ($504) {
          _abort();
          // unreachable;
         }
         $505 = ($502>>>0)<($503>>>0);
         if ($505) {
          _abort();
          // unreachable;
         } else {
          $506 = (($502) + 12|0);
          HEAP32[$506>>2] = $349;
          HEAP32[$501>>2] = $349;
          $$sum8$i = (($247) + 8)|0;
          $507 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$507>>2] = $502;
          $$sum9$i = (($247) + 12)|0;
          $508 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$508>>2] = $T$0$lcssa$i;
          $$sum10$i = (($247) + 24)|0;
          $509 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$509>>2] = 0;
          break;
         }
        }
       } while(0);
       $510 = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $510;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while(0);
 $511 = HEAP32[((2280 + 8|0))>>2]|0;
 $512 = ($nb$0>>>0)>($511>>>0);
 if (!($512)) {
  $513 = (($511) - ($nb$0))|0;
  $514 = HEAP32[((2280 + 20|0))>>2]|0;
  $515 = ($513>>>0)>(15);
  if ($515) {
   $516 = (($514) + ($nb$0)|0);
   HEAP32[((2280 + 20|0))>>2] = $516;
   HEAP32[((2280 + 8|0))>>2] = $513;
   $517 = $513 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $518 = (($514) + ($$sum2)|0);
   HEAP32[$518>>2] = $517;
   $519 = (($514) + ($511)|0);
   HEAP32[$519>>2] = $513;
   $520 = $nb$0 | 3;
   $521 = (($514) + 4|0);
   HEAP32[$521>>2] = $520;
  } else {
   HEAP32[((2280 + 8|0))>>2] = 0;
   HEAP32[((2280 + 20|0))>>2] = 0;
   $522 = $511 | 3;
   $523 = (($514) + 4|0);
   HEAP32[$523>>2] = $522;
   $$sum1 = (($511) + 4)|0;
   $524 = (($514) + ($$sum1)|0);
   $525 = HEAP32[$524>>2]|0;
   $526 = $525 | 1;
   HEAP32[$524>>2] = $526;
  }
  $527 = (($514) + 8|0);
  $mem$0 = $527;
  STACKTOP = sp;return ($mem$0|0);
 }
 $528 = HEAP32[((2280 + 12|0))>>2]|0;
 $529 = ($nb$0>>>0)<($528>>>0);
 if ($529) {
  $530 = (($528) - ($nb$0))|0;
  HEAP32[((2280 + 12|0))>>2] = $530;
  $531 = HEAP32[((2280 + 24|0))>>2]|0;
  $532 = (($531) + ($nb$0)|0);
  HEAP32[((2280 + 24|0))>>2] = $532;
  $533 = $530 | 1;
  $$sum = (($nb$0) + 4)|0;
  $534 = (($531) + ($$sum)|0);
  HEAP32[$534>>2] = $533;
  $535 = $nb$0 | 3;
  $536 = (($531) + 4|0);
  HEAP32[$536>>2] = $535;
  $537 = (($531) + 8|0);
  $mem$0 = $537;
  STACKTOP = sp;return ($mem$0|0);
 }
 $538 = HEAP32[2752>>2]|0;
 $539 = ($538|0)==(0);
 do {
  if ($539) {
   $540 = (_sysconf(30)|0);
   $541 = (($540) + -1)|0;
   $542 = $541 & $540;
   $543 = ($542|0)==(0);
   if ($543) {
    HEAP32[((2752 + 8|0))>>2] = $540;
    HEAP32[((2752 + 4|0))>>2] = $540;
    HEAP32[((2752 + 12|0))>>2] = -1;
    HEAP32[((2752 + 16|0))>>2] = -1;
    HEAP32[((2752 + 20|0))>>2] = 0;
    HEAP32[((2280 + 444|0))>>2] = 0;
    $544 = (_time((0|0))|0);
    $545 = $544 & -16;
    $546 = $545 ^ 1431655768;
    HEAP32[2752>>2] = $546;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $547 = (($nb$0) + 48)|0;
 $548 = HEAP32[((2752 + 8|0))>>2]|0;
 $549 = (($nb$0) + 47)|0;
 $550 = (($548) + ($549))|0;
 $551 = (0 - ($548))|0;
 $552 = $550 & $551;
 $553 = ($552>>>0)>($nb$0>>>0);
 if (!($553)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $554 = HEAP32[((2280 + 440|0))>>2]|0;
 $555 = ($554|0)==(0);
 if (!($555)) {
  $556 = HEAP32[((2280 + 432|0))>>2]|0;
  $557 = (($556) + ($552))|0;
  $558 = ($557>>>0)<=($556>>>0);
  $559 = ($557>>>0)>($554>>>0);
  $or$cond1$i = $558 | $559;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $560 = HEAP32[((2280 + 444|0))>>2]|0;
 $561 = $560 & 4;
 $562 = ($561|0)==(0);
 L269: do {
  if ($562) {
   $563 = HEAP32[((2280 + 24|0))>>2]|0;
   $564 = ($563|0)==(0|0);
   L271: do {
    if ($564) {
     label = 182;
    } else {
     $sp$0$i$i = ((2280 + 448|0));
     while(1) {
      $565 = HEAP32[$sp$0$i$i>>2]|0;
      $566 = ($565>>>0)>($563>>>0);
      if (!($566)) {
       $567 = (($sp$0$i$i) + 4|0);
       $568 = HEAP32[$567>>2]|0;
       $569 = (($565) + ($568)|0);
       $570 = ($569>>>0)>($563>>>0);
       if ($570) {
        break;
       }
      }
      $571 = (($sp$0$i$i) + 8|0);
      $572 = HEAP32[$571>>2]|0;
      $573 = ($572|0)==(0|0);
      if ($573) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     $574 = ($sp$0$i$i|0)==(0|0);
     if ($574) {
      label = 182;
     } else {
      $597 = HEAP32[((2280 + 12|0))>>2]|0;
      $598 = (($550) - ($597))|0;
      $599 = $598 & $551;
      $600 = ($599>>>0)<(2147483647);
      if ($600) {
       $601 = (_sbrk(($599|0))|0);
       $602 = HEAP32[$sp$0$i$i>>2]|0;
       $603 = HEAP32[$567>>2]|0;
       $604 = (($602) + ($603)|0);
       $605 = ($601|0)==($604|0);
       $$3$i = $605 ? $599 : 0;
       $$4$i = $605 ? $601 : (-1);
       $br$0$i = $601;$ssize$1$i = $599;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $575 = (_sbrk(0)|0);
     $576 = ($575|0)==((-1)|0);
     if ($576) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[((2752 + 4|0))>>2]|0;
      $579 = (($578) + -1)|0;
      $580 = $579 & $577;
      $581 = ($580|0)==(0);
      if ($581) {
       $ssize$0$i = $552;
      } else {
       $582 = (($579) + ($577))|0;
       $583 = (0 - ($578))|0;
       $584 = $582 & $583;
       $585 = (($552) - ($577))|0;
       $586 = (($585) + ($584))|0;
       $ssize$0$i = $586;
      }
      $587 = HEAP32[((2280 + 432|0))>>2]|0;
      $588 = (($587) + ($ssize$0$i))|0;
      $589 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $590 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i29 = $589 & $590;
      if ($or$cond$i29) {
       $591 = HEAP32[((2280 + 440|0))>>2]|0;
       $592 = ($591|0)==(0);
       if (!($592)) {
        $593 = ($588>>>0)<=($587>>>0);
        $594 = ($588>>>0)>($591>>>0);
        $or$cond2$i = $593 | $594;
        if ($or$cond2$i) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = (_sbrk(($ssize$0$i|0))|0);
       $596 = ($595|0)==($575|0);
       $ssize$0$$i = $596 ? $ssize$0$i : 0;
       $$$i = $596 ? $575 : (-1);
       $br$0$i = $595;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $606 = (0 - ($ssize$1$i))|0;
     $607 = ($tbase$0$i|0)==((-1)|0);
     if (!($607)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $608 = ($br$0$i|0)!=((-1)|0);
     $609 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $608 & $609;
     $610 = ($ssize$1$i>>>0)<($547>>>0);
     $or$cond6$i = $or$cond5$i & $610;
     do {
      if ($or$cond6$i) {
       $611 = HEAP32[((2752 + 8|0))>>2]|0;
       $612 = (($549) - ($ssize$1$i))|0;
       $613 = (($612) + ($611))|0;
       $614 = (0 - ($611))|0;
       $615 = $613 & $614;
       $616 = ($615>>>0)<(2147483647);
       if ($616) {
        $617 = (_sbrk(($615|0))|0);
        $618 = ($617|0)==((-1)|0);
        if ($618) {
         (_sbrk(($606|0))|0);
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $619 = (($615) + ($ssize$1$i))|0;
         $ssize$2$i = $619;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $620 = ($br$0$i|0)==((-1)|0);
     if ($620) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $621 = HEAP32[((2280 + 444|0))>>2]|0;
   $622 = $621 | 4;
   HEAP32[((2280 + 444|0))>>2] = $622;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $623 = ($552>>>0)<(2147483647);
  if ($623) {
   $624 = (_sbrk(($552|0))|0);
   $625 = (_sbrk(0)|0);
   $notlhs$i = ($624|0)!=((-1)|0);
   $notrhs$i = ($625|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $626 = ($624>>>0)<($625>>>0);
   $or$cond9$i = $or$cond8$not$i & $626;
   if ($or$cond9$i) {
    $627 = $625;
    $628 = $624;
    $629 = (($627) - ($628))|0;
    $630 = (($nb$0) + 40)|0;
    $631 = ($629>>>0)>($630>>>0);
    $$tsize$1$i = $631 ? $629 : $tsize$1$i;
    if ($631) {
     $tbase$247$i = $624;$tsize$246$i = $$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $632 = HEAP32[((2280 + 432|0))>>2]|0;
  $633 = (($632) + ($tsize$246$i))|0;
  HEAP32[((2280 + 432|0))>>2] = $633;
  $634 = HEAP32[((2280 + 436|0))>>2]|0;
  $635 = ($633>>>0)>($634>>>0);
  if ($635) {
   HEAP32[((2280 + 436|0))>>2] = $633;
  }
  $636 = HEAP32[((2280 + 24|0))>>2]|0;
  $637 = ($636|0)==(0|0);
  L311: do {
   if ($637) {
    $638 = HEAP32[((2280 + 16|0))>>2]|0;
    $639 = ($638|0)==(0|0);
    $640 = ($tbase$247$i>>>0)<($638>>>0);
    $or$cond10$i = $639 | $640;
    if ($or$cond10$i) {
     HEAP32[((2280 + 16|0))>>2] = $tbase$247$i;
    }
    HEAP32[((2280 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((2280 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((2280 + 460|0))>>2] = 0;
    $641 = HEAP32[2752>>2]|0;
    HEAP32[((2280 + 36|0))>>2] = $641;
    HEAP32[((2280 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $642 = $i$02$i$i << 1;
     $643 = ((2280 + ($642<<2)|0) + 40|0);
     $$sum$i$i = (($642) + 3)|0;
     $644 = ((2280 + ($$sum$i$i<<2)|0) + 40|0);
     HEAP32[$644>>2] = $643;
     $$sum1$i$i = (($642) + 2)|0;
     $645 = ((2280 + ($$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$645>>2] = $643;
     $646 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($646|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $646;
     }
    }
    $647 = (($tsize$246$i) + -40)|0;
    $648 = (($tbase$247$i) + 8|0);
    $649 = $648;
    $650 = $649 & 7;
    $651 = ($650|0)==(0);
    if ($651) {
     $655 = 0;
    } else {
     $652 = (0 - ($649))|0;
     $653 = $652 & 7;
     $655 = $653;
    }
    $654 = (($tbase$247$i) + ($655)|0);
    $656 = (($647) - ($655))|0;
    HEAP32[((2280 + 24|0))>>2] = $654;
    HEAP32[((2280 + 12|0))>>2] = $656;
    $657 = $656 | 1;
    $$sum$i14$i = (($655) + 4)|0;
    $658 = (($tbase$247$i) + ($$sum$i14$i)|0);
    HEAP32[$658>>2] = $657;
    $$sum2$i$i = (($tsize$246$i) + -36)|0;
    $659 = (($tbase$247$i) + ($$sum2$i$i)|0);
    HEAP32[$659>>2] = 40;
    $660 = HEAP32[((2752 + 16|0))>>2]|0;
    HEAP32[((2280 + 28|0))>>2] = $660;
   } else {
    $sp$075$i = ((2280 + 448|0));
    while(1) {
     $661 = HEAP32[$sp$075$i>>2]|0;
     $662 = (($sp$075$i) + 4|0);
     $663 = HEAP32[$662>>2]|0;
     $664 = (($661) + ($663)|0);
     $665 = ($tbase$247$i|0)==($664|0);
     if ($665) {
      label = 214;
      break;
     }
     $666 = (($sp$075$i) + 8|0);
     $667 = HEAP32[$666>>2]|0;
     $668 = ($667|0)==(0|0);
     if ($668) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label|0) == 214) {
     $669 = (($sp$075$i) + 12|0);
     $670 = HEAP32[$669>>2]|0;
     $671 = $670 & 8;
     $672 = ($671|0)==(0);
     if ($672) {
      $673 = ($636>>>0)>=($661>>>0);
      $674 = ($636>>>0)<($tbase$247$i>>>0);
      $or$cond49$i = $673 & $674;
      if ($or$cond49$i) {
       $675 = (($663) + ($tsize$246$i))|0;
       HEAP32[$662>>2] = $675;
       $676 = HEAP32[((2280 + 12|0))>>2]|0;
       $677 = (($676) + ($tsize$246$i))|0;
       $678 = (($636) + 8|0);
       $679 = $678;
       $680 = $679 & 7;
       $681 = ($680|0)==(0);
       if ($681) {
        $685 = 0;
       } else {
        $682 = (0 - ($679))|0;
        $683 = $682 & 7;
        $685 = $683;
       }
       $684 = (($636) + ($685)|0);
       $686 = (($677) - ($685))|0;
       HEAP32[((2280 + 24|0))>>2] = $684;
       HEAP32[((2280 + 12|0))>>2] = $686;
       $687 = $686 | 1;
       $$sum$i18$i = (($685) + 4)|0;
       $688 = (($636) + ($$sum$i18$i)|0);
       HEAP32[$688>>2] = $687;
       $$sum2$i19$i = (($677) + 4)|0;
       $689 = (($636) + ($$sum2$i19$i)|0);
       HEAP32[$689>>2] = 40;
       $690 = HEAP32[((2752 + 16|0))>>2]|0;
       HEAP32[((2280 + 28|0))>>2] = $690;
       break;
      }
     }
    }
    $691 = HEAP32[((2280 + 16|0))>>2]|0;
    $692 = ($tbase$247$i>>>0)<($691>>>0);
    if ($692) {
     HEAP32[((2280 + 16|0))>>2] = $tbase$247$i;
    }
    $693 = (($tbase$247$i) + ($tsize$246$i)|0);
    $sp$168$i = ((2280 + 448|0));
    while(1) {
     $694 = HEAP32[$sp$168$i>>2]|0;
     $695 = ($694|0)==($693|0);
     if ($695) {
      label = 224;
      break;
     }
     $696 = (($sp$168$i) + 8|0);
     $697 = HEAP32[$696>>2]|0;
     $698 = ($697|0)==(0|0);
     if ($698) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label|0) == 224) {
     $699 = (($sp$168$i) + 12|0);
     $700 = HEAP32[$699>>2]|0;
     $701 = $700 & 8;
     $702 = ($701|0)==(0);
     if ($702) {
      HEAP32[$sp$168$i>>2] = $tbase$247$i;
      $703 = (($sp$168$i) + 4|0);
      $704 = HEAP32[$703>>2]|0;
      $705 = (($704) + ($tsize$246$i))|0;
      HEAP32[$703>>2] = $705;
      $706 = (($tbase$247$i) + 8|0);
      $707 = $706;
      $708 = $707 & 7;
      $709 = ($708|0)==(0);
      if ($709) {
       $713 = 0;
      } else {
       $710 = (0 - ($707))|0;
       $711 = $710 & 7;
       $713 = $711;
      }
      $712 = (($tbase$247$i) + ($713)|0);
      $$sum107$i = (($tsize$246$i) + 8)|0;
      $714 = (($tbase$247$i) + ($$sum107$i)|0);
      $715 = $714;
      $716 = $715 & 7;
      $717 = ($716|0)==(0);
      if ($717) {
       $720 = 0;
      } else {
       $718 = (0 - ($715))|0;
       $719 = $718 & 7;
       $720 = $719;
      }
      $$sum108$i = (($720) + ($tsize$246$i))|0;
      $721 = (($tbase$247$i) + ($$sum108$i)|0);
      $722 = $721;
      $723 = $712;
      $724 = (($722) - ($723))|0;
      $$sum$i21$i = (($713) + ($nb$0))|0;
      $725 = (($tbase$247$i) + ($$sum$i21$i)|0);
      $726 = (($724) - ($nb$0))|0;
      $727 = $nb$0 | 3;
      $$sum1$i22$i = (($713) + 4)|0;
      $728 = (($tbase$247$i) + ($$sum1$i22$i)|0);
      HEAP32[$728>>2] = $727;
      $729 = HEAP32[((2280 + 24|0))>>2]|0;
      $730 = ($721|0)==($729|0);
      L348: do {
       if ($730) {
        $731 = HEAP32[((2280 + 12|0))>>2]|0;
        $732 = (($731) + ($726))|0;
        HEAP32[((2280 + 12|0))>>2] = $732;
        HEAP32[((2280 + 24|0))>>2] = $725;
        $733 = $732 | 1;
        $$sum42$i$i = (($$sum$i21$i) + 4)|0;
        $734 = (($tbase$247$i) + ($$sum42$i$i)|0);
        HEAP32[$734>>2] = $733;
       } else {
        $735 = HEAP32[((2280 + 20|0))>>2]|0;
        $736 = ($721|0)==($735|0);
        if ($736) {
         $737 = HEAP32[((2280 + 8|0))>>2]|0;
         $738 = (($737) + ($726))|0;
         HEAP32[((2280 + 8|0))>>2] = $738;
         HEAP32[((2280 + 20|0))>>2] = $725;
         $739 = $738 | 1;
         $$sum40$i$i = (($$sum$i21$i) + 4)|0;
         $740 = (($tbase$247$i) + ($$sum40$i$i)|0);
         HEAP32[$740>>2] = $739;
         $$sum41$i$i = (($738) + ($$sum$i21$i))|0;
         $741 = (($tbase$247$i) + ($$sum41$i$i)|0);
         HEAP32[$741>>2] = $738;
         break;
        }
        $$sum2$i23$i = (($tsize$246$i) + 4)|0;
        $$sum109$i = (($$sum2$i23$i) + ($720))|0;
        $742 = (($tbase$247$i) + ($$sum109$i)|0);
        $743 = HEAP32[$742>>2]|0;
        $744 = $743 & 3;
        $745 = ($744|0)==(1);
        if ($745) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         $748 = ($743>>>0)<(256);
         L356: do {
          if ($748) {
           $$sum3738$i$i = $720 | 8;
           $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
           $749 = (($tbase$247$i) + ($$sum119$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $$sum39$i$i = (($tsize$246$i) + 12)|0;
           $$sum120$i = (($$sum39$i$i) + ($720))|0;
           $751 = (($tbase$247$i) + ($$sum120$i)|0);
           $752 = HEAP32[$751>>2]|0;
           $753 = $747 << 1;
           $754 = ((2280 + ($753<<2)|0) + 40|0);
           $755 = ($750|0)==($754|0);
           do {
            if (!($755)) {
             $756 = HEAP32[((2280 + 16|0))>>2]|0;
             $757 = ($750>>>0)<($756>>>0);
             if ($757) {
              _abort();
              // unreachable;
             }
             $758 = (($750) + 12|0);
             $759 = HEAP32[$758>>2]|0;
             $760 = ($759|0)==($721|0);
             if ($760) {
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $761 = ($752|0)==($750|0);
           if ($761) {
            $762 = 1 << $747;
            $763 = $762 ^ -1;
            $764 = HEAP32[2280>>2]|0;
            $765 = $764 & $763;
            HEAP32[2280>>2] = $765;
            break;
           }
           $766 = ($752|0)==($754|0);
           do {
            if ($766) {
             $$pre57$i$i = (($752) + 8|0);
             $$pre$phi58$i$iZ2D = $$pre57$i$i;
            } else {
             $767 = HEAP32[((2280 + 16|0))>>2]|0;
             $768 = ($752>>>0)<($767>>>0);
             if ($768) {
              _abort();
              // unreachable;
             }
             $769 = (($752) + 8|0);
             $770 = HEAP32[$769>>2]|0;
             $771 = ($770|0)==($721|0);
             if ($771) {
              $$pre$phi58$i$iZ2D = $769;
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $772 = (($750) + 12|0);
           HEAP32[$772>>2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $750;
          } else {
           $$sum34$i$i = $720 | 24;
           $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
           $773 = (($tbase$247$i) + ($$sum110$i)|0);
           $774 = HEAP32[$773>>2]|0;
           $$sum5$i$i = (($tsize$246$i) + 12)|0;
           $$sum111$i = (($$sum5$i$i) + ($720))|0;
           $775 = (($tbase$247$i) + ($$sum111$i)|0);
           $776 = HEAP32[$775>>2]|0;
           $777 = ($776|0)==($721|0);
           do {
            if ($777) {
             $$sum67$i$i = $720 | 16;
             $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
             $788 = (($tbase$247$i) + ($$sum117$i)|0);
             $789 = HEAP32[$788>>2]|0;
             $790 = ($789|0)==(0|0);
             if ($790) {
              $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
              $791 = (($tbase$247$i) + ($$sum118$i)|0);
              $792 = HEAP32[$791>>2]|0;
              $793 = ($792|0)==(0|0);
              if ($793) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;$RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;$RP$0$i$i = $788;
             }
             while(1) {
              $794 = (($R$0$i$i) + 20|0);
              $795 = HEAP32[$794>>2]|0;
              $796 = ($795|0)==(0|0);
              if (!($796)) {
               $R$0$i$i = $795;$RP$0$i$i = $794;
               continue;
              }
              $797 = (($R$0$i$i) + 16|0);
              $798 = HEAP32[$797>>2]|0;
              $799 = ($798|0)==(0|0);
              if ($799) {
               break;
              } else {
               $R$0$i$i = $798;$RP$0$i$i = $797;
              }
             }
             $800 = HEAP32[((2280 + 16|0))>>2]|0;
             $801 = ($RP$0$i$i>>>0)<($800>>>0);
             if ($801) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $$sum3536$i$i = $720 | 8;
             $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
             $778 = (($tbase$247$i) + ($$sum112$i)|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = HEAP32[((2280 + 16|0))>>2]|0;
             $781 = ($779>>>0)<($780>>>0);
             if ($781) {
              _abort();
              // unreachable;
             }
             $782 = (($779) + 12|0);
             $783 = HEAP32[$782>>2]|0;
             $784 = ($783|0)==($721|0);
             if (!($784)) {
              _abort();
              // unreachable;
             }
             $785 = (($776) + 8|0);
             $786 = HEAP32[$785>>2]|0;
             $787 = ($786|0)==($721|0);
             if ($787) {
              HEAP32[$782>>2] = $776;
              HEAP32[$785>>2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $802 = ($774|0)==(0|0);
           if ($802) {
            break;
           }
           $$sum30$i$i = (($tsize$246$i) + 28)|0;
           $$sum113$i = (($$sum30$i$i) + ($720))|0;
           $803 = (($tbase$247$i) + ($$sum113$i)|0);
           $804 = HEAP32[$803>>2]|0;
           $805 = ((2280 + ($804<<2)|0) + 304|0);
           $806 = HEAP32[$805>>2]|0;
           $807 = ($721|0)==($806|0);
           do {
            if ($807) {
             HEAP32[$805>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if (!($cond$i$i)) {
              break;
             }
             $808 = 1 << $804;
             $809 = $808 ^ -1;
             $810 = HEAP32[((2280 + 4|0))>>2]|0;
             $811 = $810 & $809;
             HEAP32[((2280 + 4|0))>>2] = $811;
             break L356;
            } else {
             $812 = HEAP32[((2280 + 16|0))>>2]|0;
             $813 = ($774>>>0)<($812>>>0);
             if ($813) {
              _abort();
              // unreachable;
             }
             $814 = (($774) + 16|0);
             $815 = HEAP32[$814>>2]|0;
             $816 = ($815|0)==($721|0);
             if ($816) {
              HEAP32[$814>>2] = $R$1$i$i;
             } else {
              $817 = (($774) + 20|0);
              HEAP32[$817>>2] = $R$1$i$i;
             }
             $818 = ($R$1$i$i|0)==(0|0);
             if ($818) {
              break L356;
             }
            }
           } while(0);
           $819 = HEAP32[((2280 + 16|0))>>2]|0;
           $820 = ($R$1$i$i>>>0)<($819>>>0);
           if ($820) {
            _abort();
            // unreachable;
           }
           $821 = (($R$1$i$i) + 24|0);
           HEAP32[$821>>2] = $774;
           $$sum3132$i$i = $720 | 16;
           $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
           $822 = (($tbase$247$i) + ($$sum114$i)|0);
           $823 = HEAP32[$822>>2]|0;
           $824 = ($823|0)==(0|0);
           do {
            if (!($824)) {
             $825 = HEAP32[((2280 + 16|0))>>2]|0;
             $826 = ($823>>>0)<($825>>>0);
             if ($826) {
              _abort();
              // unreachable;
             } else {
              $827 = (($R$1$i$i) + 16|0);
              HEAP32[$827>>2] = $823;
              $828 = (($823) + 24|0);
              HEAP32[$828>>2] = $R$1$i$i;
              break;
             }
            }
           } while(0);
           $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
           $829 = (($tbase$247$i) + ($$sum115$i)|0);
           $830 = HEAP32[$829>>2]|0;
           $831 = ($830|0)==(0|0);
           if ($831) {
            break;
           }
           $832 = HEAP32[((2280 + 16|0))>>2]|0;
           $833 = ($830>>>0)<($832>>>0);
           if ($833) {
            _abort();
            // unreachable;
           } else {
            $834 = (($R$1$i$i) + 20|0);
            HEAP32[$834>>2] = $830;
            $835 = (($830) + 24|0);
            HEAP32[$835>>2] = $R$1$i$i;
            break;
           }
          }
         } while(0);
         $$sum9$i$i = $746 | $720;
         $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
         $836 = (($tbase$247$i) + ($$sum116$i)|0);
         $837 = (($746) + ($726))|0;
         $oldfirst$0$i$i = $836;$qsize$0$i$i = $837;
        } else {
         $oldfirst$0$i$i = $721;$qsize$0$i$i = $726;
        }
        $838 = (($oldfirst$0$i$i) + 4|0);
        $839 = HEAP32[$838>>2]|0;
        $840 = $839 & -2;
        HEAP32[$838>>2] = $840;
        $841 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i21$i) + 4)|0;
        $842 = (($tbase$247$i) + ($$sum10$i$i)|0);
        HEAP32[$842>>2] = $841;
        $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
        $843 = (($tbase$247$i) + ($$sum11$i24$i)|0);
        HEAP32[$843>>2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        $845 = ($qsize$0$i$i>>>0)<(256);
        if ($845) {
         $846 = $844 << 1;
         $847 = ((2280 + ($846<<2)|0) + 40|0);
         $848 = HEAP32[2280>>2]|0;
         $849 = 1 << $844;
         $850 = $848 & $849;
         $851 = ($850|0)==(0);
         do {
          if ($851) {
           $852 = $848 | $849;
           HEAP32[2280>>2] = $852;
           $$sum26$pre$i$i = (($846) + 2)|0;
           $$pre$i25$i = ((2280 + ($$sum26$pre$i$i<<2)|0) + 40|0);
           $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $847;
          } else {
           $$sum29$i$i = (($846) + 2)|0;
           $853 = ((2280 + ($$sum29$i$i<<2)|0) + 40|0);
           $854 = HEAP32[$853>>2]|0;
           $855 = HEAP32[((2280 + 16|0))>>2]|0;
           $856 = ($854>>>0)<($855>>>0);
           if (!($856)) {
            $$pre$phi$i26$iZ2D = $853;$F4$0$i$i = $854;
            break;
           }
           _abort();
           // unreachable;
          }
         } while(0);
         HEAP32[$$pre$phi$i26$iZ2D>>2] = $725;
         $857 = (($F4$0$i$i) + 12|0);
         HEAP32[$857>>2] = $725;
         $$sum27$i$i = (($$sum$i21$i) + 8)|0;
         $858 = (($tbase$247$i) + ($$sum27$i$i)|0);
         HEAP32[$858>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i21$i) + 12)|0;
         $859 = (($tbase$247$i) + ($$sum28$i$i)|0);
         HEAP32[$859>>2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        $861 = ($860|0)==(0);
        do {
         if ($861) {
          $I7$0$i$i = 0;
         } else {
          $862 = ($qsize$0$i$i>>>0)>(16777215);
          if ($862) {
           $I7$0$i$i = 31;
           break;
          }
          $863 = (($860) + 1048320)|0;
          $864 = $863 >>> 16;
          $865 = $864 & 8;
          $866 = $860 << $865;
          $867 = (($866) + 520192)|0;
          $868 = $867 >>> 16;
          $869 = $868 & 4;
          $870 = $869 | $865;
          $871 = $866 << $869;
          $872 = (($871) + 245760)|0;
          $873 = $872 >>> 16;
          $874 = $873 & 2;
          $875 = $870 | $874;
          $876 = (14 - ($875))|0;
          $877 = $871 << $874;
          $878 = $877 >>> 15;
          $879 = (($876) + ($878))|0;
          $880 = $879 << 1;
          $881 = (($879) + 7)|0;
          $882 = $qsize$0$i$i >>> $881;
          $883 = $882 & 1;
          $884 = $883 | $880;
          $I7$0$i$i = $884;
         }
        } while(0);
        $885 = ((2280 + ($I7$0$i$i<<2)|0) + 304|0);
        $$sum12$i$i = (($$sum$i21$i) + 28)|0;
        $886 = (($tbase$247$i) + ($$sum12$i$i)|0);
        HEAP32[$886>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i21$i) + 16)|0;
        $887 = (($tbase$247$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i21$i) + 20)|0;
        $888 = (($tbase$247$i) + ($$sum14$i$i)|0);
        HEAP32[$888>>2] = 0;
        HEAP32[$887>>2] = 0;
        $889 = HEAP32[((2280 + 4|0))>>2]|0;
        $890 = 1 << $I7$0$i$i;
        $891 = $889 & $890;
        $892 = ($891|0)==(0);
        if ($892) {
         $893 = $889 | $890;
         HEAP32[((2280 + 4|0))>>2] = $893;
         HEAP32[$885>>2] = $725;
         $$sum15$i$i = (($$sum$i21$i) + 24)|0;
         $894 = (($tbase$247$i) + ($$sum15$i$i)|0);
         HEAP32[$894>>2] = $885;
         $$sum16$i$i = (($$sum$i21$i) + 12)|0;
         $895 = (($tbase$247$i) + ($$sum16$i$i)|0);
         HEAP32[$895>>2] = $725;
         $$sum17$i$i = (($$sum$i21$i) + 8)|0;
         $896 = (($tbase$247$i) + ($$sum17$i$i)|0);
         HEAP32[$896>>2] = $725;
         break;
        }
        $897 = HEAP32[$885>>2]|0;
        $898 = ($I7$0$i$i|0)==(31);
        if ($898) {
         $906 = 0;
        } else {
         $899 = $I7$0$i$i >>> 1;
         $900 = (25 - ($899))|0;
         $906 = $900;
        }
        $901 = (($897) + 4|0);
        $902 = HEAP32[$901>>2]|0;
        $903 = $902 & -8;
        $904 = ($903|0)==($qsize$0$i$i|0);
        L445: do {
         if ($904) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $905 = $qsize$0$i$i << $906;
          $K8$052$i$i = $905;$T$051$i$i = $897;
          while(1) {
           $913 = $K8$052$i$i >>> 31;
           $914 = ((($T$051$i$i) + ($913<<2)|0) + 16|0);
           $909 = HEAP32[$914>>2]|0;
           $915 = ($909|0)==(0|0);
           if ($915) {
            break;
           }
           $907 = $K8$052$i$i << 1;
           $908 = (($909) + 4|0);
           $910 = HEAP32[$908>>2]|0;
           $911 = $910 & -8;
           $912 = ($911|0)==($qsize$0$i$i|0);
           if ($912) {
            $T$0$lcssa$i28$i = $909;
            break L445;
           } else {
            $K8$052$i$i = $907;$T$051$i$i = $909;
           }
          }
          $916 = HEAP32[((2280 + 16|0))>>2]|0;
          $917 = ($914>>>0)<($916>>>0);
          if ($917) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$914>>2] = $725;
           $$sum23$i$i = (($$sum$i21$i) + 24)|0;
           $918 = (($tbase$247$i) + ($$sum23$i$i)|0);
           HEAP32[$918>>2] = $T$051$i$i;
           $$sum24$i$i = (($$sum$i21$i) + 12)|0;
           $919 = (($tbase$247$i) + ($$sum24$i$i)|0);
           HEAP32[$919>>2] = $725;
           $$sum25$i$i = (($$sum$i21$i) + 8)|0;
           $920 = (($tbase$247$i) + ($$sum25$i$i)|0);
           HEAP32[$920>>2] = $725;
           break L348;
          }
         }
        } while(0);
        $921 = (($T$0$lcssa$i28$i) + 8|0);
        $922 = HEAP32[$921>>2]|0;
        $923 = HEAP32[((2280 + 16|0))>>2]|0;
        $924 = ($T$0$lcssa$i28$i>>>0)<($923>>>0);
        if ($924) {
         _abort();
         // unreachable;
        }
        $925 = ($922>>>0)<($923>>>0);
        if ($925) {
         _abort();
         // unreachable;
        } else {
         $926 = (($922) + 12|0);
         HEAP32[$926>>2] = $725;
         HEAP32[$921>>2] = $725;
         $$sum20$i$i = (($$sum$i21$i) + 8)|0;
         $927 = (($tbase$247$i) + ($$sum20$i$i)|0);
         HEAP32[$927>>2] = $922;
         $$sum21$i$i = (($$sum$i21$i) + 12)|0;
         $928 = (($tbase$247$i) + ($$sum21$i$i)|0);
         HEAP32[$928>>2] = $T$0$lcssa$i28$i;
         $$sum22$i$i = (($$sum$i21$i) + 24)|0;
         $929 = (($tbase$247$i) + ($$sum22$i$i)|0);
         HEAP32[$929>>2] = 0;
         break;
        }
       }
      } while(0);
      $$sum1819$i$i = $713 | 8;
      $930 = (($tbase$247$i) + ($$sum1819$i$i)|0);
      $mem$0 = $930;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((2280 + 448|0));
    while(1) {
     $931 = HEAP32[$sp$0$i$i$i>>2]|0;
     $932 = ($931>>>0)>($636>>>0);
     if (!($932)) {
      $933 = (($sp$0$i$i$i) + 4|0);
      $934 = HEAP32[$933>>2]|0;
      $935 = (($931) + ($934)|0);
      $936 = ($935>>>0)>($636>>>0);
      if ($936) {
       break;
      }
     }
     $937 = (($sp$0$i$i$i) + 8|0);
     $938 = HEAP32[$937>>2]|0;
     $sp$0$i$i$i = $938;
    }
    $$sum$i15$i = (($934) + -47)|0;
    $$sum1$i16$i = (($934) + -39)|0;
    $939 = (($931) + ($$sum1$i16$i)|0);
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941|0)==(0);
    if ($942) {
     $945 = 0;
    } else {
     $943 = (0 - ($940))|0;
     $944 = $943 & 7;
     $945 = $944;
    }
    $$sum2$i17$i = (($$sum$i15$i) + ($945))|0;
    $946 = (($931) + ($$sum2$i17$i)|0);
    $947 = (($636) + 16|0);
    $948 = ($946>>>0)<($947>>>0);
    $949 = $948 ? $636 : $946;
    $950 = (($949) + 8|0);
    $951 = (($tsize$246$i) + -40)|0;
    $952 = (($tbase$247$i) + 8|0);
    $953 = $952;
    $954 = $953 & 7;
    $955 = ($954|0)==(0);
    if ($955) {
     $959 = 0;
    } else {
     $956 = (0 - ($953))|0;
     $957 = $956 & 7;
     $959 = $957;
    }
    $958 = (($tbase$247$i) + ($959)|0);
    $960 = (($951) - ($959))|0;
    HEAP32[((2280 + 24|0))>>2] = $958;
    HEAP32[((2280 + 12|0))>>2] = $960;
    $961 = $960 | 1;
    $$sum$i$i$i = (($959) + 4)|0;
    $962 = (($tbase$247$i) + ($$sum$i$i$i)|0);
    HEAP32[$962>>2] = $961;
    $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
    $963 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
    HEAP32[$963>>2] = 40;
    $964 = HEAP32[((2752 + 16|0))>>2]|0;
    HEAP32[((2280 + 28|0))>>2] = $964;
    $965 = (($949) + 4|0);
    HEAP32[$965>>2] = 27;
    ;HEAP32[$950+0>>2]=HEAP32[((2280 + 448|0))+0>>2]|0;HEAP32[$950+4>>2]=HEAP32[((2280 + 448|0))+4>>2]|0;HEAP32[$950+8>>2]=HEAP32[((2280 + 448|0))+8>>2]|0;HEAP32[$950+12>>2]=HEAP32[((2280 + 448|0))+12>>2]|0;
    HEAP32[((2280 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((2280 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((2280 + 460|0))>>2] = 0;
    HEAP32[((2280 + 456|0))>>2] = $950;
    $966 = (($949) + 28|0);
    HEAP32[$966>>2] = 7;
    $967 = (($949) + 32|0);
    $968 = ($967>>>0)<($935>>>0);
    if ($968) {
     $970 = $966;
     while(1) {
      $969 = (($970) + 4|0);
      HEAP32[$969>>2] = 7;
      $971 = (($970) + 8|0);
      $972 = ($971>>>0)<($935>>>0);
      if ($972) {
       $970 = $969;
      } else {
       break;
      }
     }
    }
    $973 = ($949|0)==($636|0);
    if (!($973)) {
     $974 = $949;
     $975 = $636;
     $976 = (($974) - ($975))|0;
     $977 = (($636) + ($976)|0);
     $$sum3$i$i = (($976) + 4)|0;
     $978 = (($636) + ($$sum3$i$i)|0);
     $979 = HEAP32[$978>>2]|0;
     $980 = $979 & -2;
     HEAP32[$978>>2] = $980;
     $981 = $976 | 1;
     $982 = (($636) + 4|0);
     HEAP32[$982>>2] = $981;
     HEAP32[$977>>2] = $976;
     $983 = $976 >>> 3;
     $984 = ($976>>>0)<(256);
     if ($984) {
      $985 = $983 << 1;
      $986 = ((2280 + ($985<<2)|0) + 40|0);
      $987 = HEAP32[2280>>2]|0;
      $988 = 1 << $983;
      $989 = $987 & $988;
      $990 = ($989|0)==(0);
      do {
       if ($990) {
        $991 = $987 | $988;
        HEAP32[2280>>2] = $991;
        $$sum10$pre$i$i = (($985) + 2)|0;
        $$pre$i$i = ((2280 + ($$sum10$pre$i$i<<2)|0) + 40|0);
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $986;
       } else {
        $$sum11$i$i = (($985) + 2)|0;
        $992 = ((2280 + ($$sum11$i$i<<2)|0) + 40|0);
        $993 = HEAP32[$992>>2]|0;
        $994 = HEAP32[((2280 + 16|0))>>2]|0;
        $995 = ($993>>>0)<($994>>>0);
        if (!($995)) {
         $$pre$phi$i$iZ2D = $992;$F$0$i$i = $993;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i$iZ2D>>2] = $636;
      $996 = (($F$0$i$i) + 12|0);
      HEAP32[$996>>2] = $636;
      $997 = (($636) + 8|0);
      HEAP32[$997>>2] = $F$0$i$i;
      $998 = (($636) + 12|0);
      HEAP32[$998>>2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     $1000 = ($999|0)==(0);
     if ($1000) {
      $I1$0$i$i = 0;
     } else {
      $1001 = ($976>>>0)>(16777215);
      if ($1001) {
       $I1$0$i$i = 31;
      } else {
       $1002 = (($999) + 1048320)|0;
       $1003 = $1002 >>> 16;
       $1004 = $1003 & 8;
       $1005 = $999 << $1004;
       $1006 = (($1005) + 520192)|0;
       $1007 = $1006 >>> 16;
       $1008 = $1007 & 4;
       $1009 = $1008 | $1004;
       $1010 = $1005 << $1008;
       $1011 = (($1010) + 245760)|0;
       $1012 = $1011 >>> 16;
       $1013 = $1012 & 2;
       $1014 = $1009 | $1013;
       $1015 = (14 - ($1014))|0;
       $1016 = $1010 << $1013;
       $1017 = $1016 >>> 15;
       $1018 = (($1015) + ($1017))|0;
       $1019 = $1018 << 1;
       $1020 = (($1018) + 7)|0;
       $1021 = $976 >>> $1020;
       $1022 = $1021 & 1;
       $1023 = $1022 | $1019;
       $I1$0$i$i = $1023;
      }
     }
     $1024 = ((2280 + ($I1$0$i$i<<2)|0) + 304|0);
     $1025 = (($636) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1025>>2] = $I1$0$c$i$i;
     $1026 = (($636) + 20|0);
     HEAP32[$1026>>2] = 0;
     $1027 = (($636) + 16|0);
     HEAP32[$1027>>2] = 0;
     $1028 = HEAP32[((2280 + 4|0))>>2]|0;
     $1029 = 1 << $I1$0$i$i;
     $1030 = $1028 & $1029;
     $1031 = ($1030|0)==(0);
     if ($1031) {
      $1032 = $1028 | $1029;
      HEAP32[((2280 + 4|0))>>2] = $1032;
      HEAP32[$1024>>2] = $636;
      $1033 = (($636) + 24|0);
      HEAP32[$1033>>2] = $1024;
      $1034 = (($636) + 12|0);
      HEAP32[$1034>>2] = $636;
      $1035 = (($636) + 8|0);
      HEAP32[$1035>>2] = $636;
      break;
     }
     $1036 = HEAP32[$1024>>2]|0;
     $1037 = ($I1$0$i$i|0)==(31);
     if ($1037) {
      $1045 = 0;
     } else {
      $1038 = $I1$0$i$i >>> 1;
      $1039 = (25 - ($1038))|0;
      $1045 = $1039;
     }
     $1040 = (($1036) + 4|0);
     $1041 = HEAP32[$1040>>2]|0;
     $1042 = $1041 & -8;
     $1043 = ($1042|0)==($976|0);
     L499: do {
      if ($1043) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $1044 = $976 << $1045;
       $K2$014$i$i = $1044;$T$013$i$i = $1036;
       while(1) {
        $1052 = $K2$014$i$i >>> 31;
        $1053 = ((($T$013$i$i) + ($1052<<2)|0) + 16|0);
        $1048 = HEAP32[$1053>>2]|0;
        $1054 = ($1048|0)==(0|0);
        if ($1054) {
         break;
        }
        $1046 = $K2$014$i$i << 1;
        $1047 = (($1048) + 4|0);
        $1049 = HEAP32[$1047>>2]|0;
        $1050 = $1049 & -8;
        $1051 = ($1050|0)==($976|0);
        if ($1051) {
         $T$0$lcssa$i$i = $1048;
         break L499;
        } else {
         $K2$014$i$i = $1046;$T$013$i$i = $1048;
        }
       }
       $1055 = HEAP32[((2280 + 16|0))>>2]|0;
       $1056 = ($1053>>>0)<($1055>>>0);
       if ($1056) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1053>>2] = $636;
        $1057 = (($636) + 24|0);
        HEAP32[$1057>>2] = $T$013$i$i;
        $1058 = (($636) + 12|0);
        HEAP32[$1058>>2] = $636;
        $1059 = (($636) + 8|0);
        HEAP32[$1059>>2] = $636;
        break L311;
       }
      }
     } while(0);
     $1060 = (($T$0$lcssa$i$i) + 8|0);
     $1061 = HEAP32[$1060>>2]|0;
     $1062 = HEAP32[((2280 + 16|0))>>2]|0;
     $1063 = ($T$0$lcssa$i$i>>>0)<($1062>>>0);
     if ($1063) {
      _abort();
      // unreachable;
     }
     $1064 = ($1061>>>0)<($1062>>>0);
     if ($1064) {
      _abort();
      // unreachable;
     } else {
      $1065 = (($1061) + 12|0);
      HEAP32[$1065>>2] = $636;
      HEAP32[$1060>>2] = $636;
      $1066 = (($636) + 8|0);
      HEAP32[$1066>>2] = $1061;
      $1067 = (($636) + 12|0);
      HEAP32[$1067>>2] = $T$0$lcssa$i$i;
      $1068 = (($636) + 24|0);
      HEAP32[$1068>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $1069 = HEAP32[((2280 + 12|0))>>2]|0;
  $1070 = ($1069>>>0)>($nb$0>>>0);
  if ($1070) {
   $1071 = (($1069) - ($nb$0))|0;
   HEAP32[((2280 + 12|0))>>2] = $1071;
   $1072 = HEAP32[((2280 + 24|0))>>2]|0;
   $1073 = (($1072) + ($nb$0)|0);
   HEAP32[((2280 + 24|0))>>2] = $1073;
   $1074 = $1071 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1075 = (($1072) + ($$sum$i32)|0);
   HEAP32[$1075>>2] = $1074;
   $1076 = $nb$0 | 3;
   $1077 = (($1072) + 4|0);
   HEAP32[$1077>>2] = $1076;
   $1078 = (($1072) + 8|0);
   $mem$0 = $1078;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $1079 = (___errno_location()|0);
 HEAP32[$1079>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0;
 var $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
 var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
 var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
 var $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0;
 var $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0;
 var $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0;
 var $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0;
 var $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0;
 var $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$057 = 0;
 var $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$056 = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = (($mem) + -8|0);
 $2 = HEAP32[((2280 + 16|0))>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = (($mem) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[((2280 + 20|0))>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $104 = (($mem) + ($$sum3)|0);
    $105 = HEAP32[$104>>2]|0;
    $106 = $105 & 3;
    $107 = ($106|0)==(3);
    if (!($107)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[((2280 + 8|0))>>2] = $15;
    $108 = HEAP32[$104>>2]|0;
    $109 = $108 & -2;
    HEAP32[$104>>2] = $109;
    $110 = $15 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $111 = (($mem) + ($$sum26)|0);
    HEAP32[$111>>2] = $110;
    HEAP32[$9>>2] = $15;
    STACKTOP = sp;return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum36 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum36)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum37)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = ((2280 + ($25<<2)|0) + 40|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = (($22) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[2280>>2]|0;
     $36 = $35 & $34;
     HEAP32[2280>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre69 = (($24) + 8|0);
     $$pre$phi70Z2D = $$pre69;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = (($24) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = (($22) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi70Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum28 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum28)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum29)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum31 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum31)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum30 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum30)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = (($R$0) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = (($R$0) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum35)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = (($49) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = (($46) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum32 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum32)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = ((2280 + ($72<<2)|0) + 304|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[((2280 + 4|0))>>2]|0;
      $79 = $78 & $77;
      HEAP32[((2280 + 4|0))>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[((2280 + 16|0))>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = (($44) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = (($44) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[((2280 + 16|0))>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = (($R$1) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum33 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum33)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = HEAP32[((2280 + 16|0))>>2]|0;
      $94 = ($91>>>0)<($93>>>0);
      if ($94) {
       _abort();
       // unreachable;
      } else {
       $95 = (($R$1) + 16|0);
       HEAP32[$95>>2] = $91;
       $96 = (($91) + 24|0);
       HEAP32[$96>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum34 = (($$sum2) + 20)|0;
    $97 = (($mem) + ($$sum34)|0);
    $98 = HEAP32[$97>>2]|0;
    $99 = ($98|0)==(0|0);
    if ($99) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $100 = HEAP32[((2280 + 16|0))>>2]|0;
     $101 = ($98>>>0)<($100>>>0);
     if ($101) {
      _abort();
      // unreachable;
     } else {
      $102 = (($R$1) + 20|0);
      HEAP32[$102>>2] = $98;
      $103 = (($98) + 24|0);
      HEAP32[$103>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $112 = ($p$0>>>0)<($9>>>0);
 if (!($112)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($8) + -4)|0;
 $113 = (($mem) + ($$sum25)|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $114 & 1;
 $116 = ($115|0)==(0);
 if ($116) {
  _abort();
  // unreachable;
 }
 $117 = $114 & 2;
 $118 = ($117|0)==(0);
 if ($118) {
  $119 = HEAP32[((2280 + 24|0))>>2]|0;
  $120 = ($9|0)==($119|0);
  if ($120) {
   $121 = HEAP32[((2280 + 12|0))>>2]|0;
   $122 = (($121) + ($psize$0))|0;
   HEAP32[((2280 + 12|0))>>2] = $122;
   HEAP32[((2280 + 24|0))>>2] = $p$0;
   $123 = $122 | 1;
   $124 = (($p$0) + 4|0);
   HEAP32[$124>>2] = $123;
   $125 = HEAP32[((2280 + 20|0))>>2]|0;
   $126 = ($p$0|0)==($125|0);
   if (!($126)) {
    STACKTOP = sp;return;
   }
   HEAP32[((2280 + 20|0))>>2] = 0;
   HEAP32[((2280 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $127 = HEAP32[((2280 + 20|0))>>2]|0;
  $128 = ($9|0)==($127|0);
  if ($128) {
   $129 = HEAP32[((2280 + 8|0))>>2]|0;
   $130 = (($129) + ($psize$0))|0;
   HEAP32[((2280 + 8|0))>>2] = $130;
   HEAP32[((2280 + 20|0))>>2] = $p$0;
   $131 = $130 | 1;
   $132 = (($p$0) + 4|0);
   HEAP32[$132>>2] = $131;
   $133 = (($p$0) + ($130)|0);
   HEAP32[$133>>2] = $130;
   STACKTOP = sp;return;
  }
  $134 = $114 & -8;
  $135 = (($134) + ($psize$0))|0;
  $136 = $114 >>> 3;
  $137 = ($114>>>0)<(256);
  do {
   if ($137) {
    $138 = (($mem) + ($8)|0);
    $139 = HEAP32[$138>>2]|0;
    $$sum2324 = $8 | 4;
    $140 = (($mem) + ($$sum2324)|0);
    $141 = HEAP32[$140>>2]|0;
    $142 = $136 << 1;
    $143 = ((2280 + ($142<<2)|0) + 40|0);
    $144 = ($139|0)==($143|0);
    if (!($144)) {
     $145 = HEAP32[((2280 + 16|0))>>2]|0;
     $146 = ($139>>>0)<($145>>>0);
     if ($146) {
      _abort();
      // unreachable;
     }
     $147 = (($139) + 12|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = ($148|0)==($9|0);
     if (!($149)) {
      _abort();
      // unreachable;
     }
    }
    $150 = ($141|0)==($139|0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[2280>>2]|0;
     $154 = $153 & $152;
     HEAP32[2280>>2] = $154;
     break;
    }
    $155 = ($141|0)==($143|0);
    if ($155) {
     $$pre67 = (($141) + 8|0);
     $$pre$phi68Z2D = $$pre67;
    } else {
     $156 = HEAP32[((2280 + 16|0))>>2]|0;
     $157 = ($141>>>0)<($156>>>0);
     if ($157) {
      _abort();
      // unreachable;
     }
     $158 = (($141) + 8|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = ($159|0)==($9|0);
     if ($160) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
      // unreachable;
     }
    }
    $161 = (($139) + 12|0);
    HEAP32[$161>>2] = $141;
    HEAP32[$$pre$phi68Z2D>>2] = $139;
   } else {
    $$sum5 = (($8) + 16)|0;
    $162 = (($mem) + ($$sum5)|0);
    $163 = HEAP32[$162>>2]|0;
    $$sum67 = $8 | 4;
    $164 = (($mem) + ($$sum67)|0);
    $165 = HEAP32[$164>>2]|0;
    $166 = ($165|0)==($9|0);
    do {
     if ($166) {
      $$sum9 = (($8) + 12)|0;
      $177 = (($mem) + ($$sum9)|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = ($178|0)==(0|0);
      if ($179) {
       $$sum8 = (($8) + 8)|0;
       $180 = (($mem) + ($$sum8)|0);
       $181 = HEAP32[$180>>2]|0;
       $182 = ($181|0)==(0|0);
       if ($182) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;$RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;$RP9$0 = $177;
      }
      while(1) {
       $183 = (($R7$0) + 20|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==(0|0);
       if (!($185)) {
        $R7$0 = $184;$RP9$0 = $183;
        continue;
       }
       $186 = (($R7$0) + 16|0);
       $187 = HEAP32[$186>>2]|0;
       $188 = ($187|0)==(0|0);
       if ($188) {
        break;
       } else {
        $R7$0 = $187;$RP9$0 = $186;
       }
      }
      $189 = HEAP32[((2280 + 16|0))>>2]|0;
      $190 = ($RP9$0>>>0)<($189>>>0);
      if ($190) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $167 = (($mem) + ($8)|0);
      $168 = HEAP32[$167>>2]|0;
      $169 = HEAP32[((2280 + 16|0))>>2]|0;
      $170 = ($168>>>0)<($169>>>0);
      if ($170) {
       _abort();
       // unreachable;
      }
      $171 = (($168) + 12|0);
      $172 = HEAP32[$171>>2]|0;
      $173 = ($172|0)==($9|0);
      if (!($173)) {
       _abort();
       // unreachable;
      }
      $174 = (($165) + 8|0);
      $175 = HEAP32[$174>>2]|0;
      $176 = ($175|0)==($9|0);
      if ($176) {
       HEAP32[$171>>2] = $165;
       HEAP32[$174>>2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $191 = ($163|0)==(0|0);
    if (!($191)) {
     $$sum18 = (($8) + 20)|0;
     $192 = (($mem) + ($$sum18)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ((2280 + ($193<<2)|0) + 304|0);
     $195 = HEAP32[$194>>2]|0;
     $196 = ($9|0)==($195|0);
     if ($196) {
      HEAP32[$194>>2] = $R7$1;
      $cond54 = ($R7$1|0)==(0|0);
      if ($cond54) {
       $197 = 1 << $193;
       $198 = $197 ^ -1;
       $199 = HEAP32[((2280 + 4|0))>>2]|0;
       $200 = $199 & $198;
       HEAP32[((2280 + 4|0))>>2] = $200;
       break;
      }
     } else {
      $201 = HEAP32[((2280 + 16|0))>>2]|0;
      $202 = ($163>>>0)<($201>>>0);
      if ($202) {
       _abort();
       // unreachable;
      }
      $203 = (($163) + 16|0);
      $204 = HEAP32[$203>>2]|0;
      $205 = ($204|0)==($9|0);
      if ($205) {
       HEAP32[$203>>2] = $R7$1;
      } else {
       $206 = (($163) + 20|0);
       HEAP32[$206>>2] = $R7$1;
      }
      $207 = ($R7$1|0)==(0|0);
      if ($207) {
       break;
      }
     }
     $208 = HEAP32[((2280 + 16|0))>>2]|0;
     $209 = ($R7$1>>>0)<($208>>>0);
     if ($209) {
      _abort();
      // unreachable;
     }
     $210 = (($R7$1) + 24|0);
     HEAP32[$210>>2] = $163;
     $$sum19 = (($8) + 8)|0;
     $211 = (($mem) + ($$sum19)|0);
     $212 = HEAP32[$211>>2]|0;
     $213 = ($212|0)==(0|0);
     do {
      if (!($213)) {
       $214 = HEAP32[((2280 + 16|0))>>2]|0;
       $215 = ($212>>>0)<($214>>>0);
       if ($215) {
        _abort();
        // unreachable;
       } else {
        $216 = (($R7$1) + 16|0);
        HEAP32[$216>>2] = $212;
        $217 = (($212) + 24|0);
        HEAP32[$217>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($8) + 12)|0;
     $218 = (($mem) + ($$sum20)|0);
     $219 = HEAP32[$218>>2]|0;
     $220 = ($219|0)==(0|0);
     if (!($220)) {
      $221 = HEAP32[((2280 + 16|0))>>2]|0;
      $222 = ($219>>>0)<($221>>>0);
      if ($222) {
       _abort();
       // unreachable;
      } else {
       $223 = (($R7$1) + 20|0);
       HEAP32[$223>>2] = $219;
       $224 = (($219) + 24|0);
       HEAP32[$224>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $225 = $135 | 1;
  $226 = (($p$0) + 4|0);
  HEAP32[$226>>2] = $225;
  $227 = (($p$0) + ($135)|0);
  HEAP32[$227>>2] = $135;
  $228 = HEAP32[((2280 + 20|0))>>2]|0;
  $229 = ($p$0|0)==($228|0);
  if ($229) {
   HEAP32[((2280 + 8|0))>>2] = $135;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $135;
  }
 } else {
  $230 = $114 & -2;
  HEAP32[$113>>2] = $230;
  $231 = $psize$0 | 1;
  $232 = (($p$0) + 4|0);
  HEAP32[$232>>2] = $231;
  $233 = (($p$0) + ($psize$0)|0);
  HEAP32[$233>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 $235 = ($psize$1>>>0)<(256);
 if ($235) {
  $236 = $234 << 1;
  $237 = ((2280 + ($236<<2)|0) + 40|0);
  $238 = HEAP32[2280>>2]|0;
  $239 = 1 << $234;
  $240 = $238 & $239;
  $241 = ($240|0)==(0);
  if ($241) {
   $242 = $238 | $239;
   HEAP32[2280>>2] = $242;
   $$sum16$pre = (($236) + 2)|0;
   $$pre = ((2280 + ($$sum16$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $237;
  } else {
   $$sum17 = (($236) + 2)|0;
   $243 = ((2280 + ($$sum17<<2)|0) + 40|0);
   $244 = HEAP32[$243>>2]|0;
   $245 = HEAP32[((2280 + 16|0))>>2]|0;
   $246 = ($244>>>0)<($245>>>0);
   if ($246) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $243;$F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $247 = (($F16$0) + 12|0);
  HEAP32[$247>>2] = $p$0;
  $248 = (($p$0) + 8|0);
  HEAP32[$248>>2] = $F16$0;
  $249 = (($p$0) + 12|0);
  HEAP32[$249>>2] = $237;
  STACKTOP = sp;return;
 }
 $250 = $psize$1 >>> 8;
 $251 = ($250|0)==(0);
 if ($251) {
  $I18$0 = 0;
 } else {
  $252 = ($psize$1>>>0)>(16777215);
  if ($252) {
   $I18$0 = 31;
  } else {
   $253 = (($250) + 1048320)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 8;
   $256 = $250 << $255;
   $257 = (($256) + 520192)|0;
   $258 = $257 >>> 16;
   $259 = $258 & 4;
   $260 = $259 | $255;
   $261 = $256 << $259;
   $262 = (($261) + 245760)|0;
   $263 = $262 >>> 16;
   $264 = $263 & 2;
   $265 = $260 | $264;
   $266 = (14 - ($265))|0;
   $267 = $261 << $264;
   $268 = $267 >>> 15;
   $269 = (($266) + ($268))|0;
   $270 = $269 << 1;
   $271 = (($269) + 7)|0;
   $272 = $psize$1 >>> $271;
   $273 = $272 & 1;
   $274 = $273 | $270;
   $I18$0 = $274;
  }
 }
 $275 = ((2280 + ($I18$0<<2)|0) + 304|0);
 $276 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$276>>2] = $I18$0$c;
 $277 = (($p$0) + 20|0);
 HEAP32[$277>>2] = 0;
 $278 = (($p$0) + 16|0);
 HEAP32[$278>>2] = 0;
 $279 = HEAP32[((2280 + 4|0))>>2]|0;
 $280 = 1 << $I18$0;
 $281 = $279 & $280;
 $282 = ($281|0)==(0);
 L199: do {
  if ($282) {
   $283 = $279 | $280;
   HEAP32[((2280 + 4|0))>>2] = $283;
   HEAP32[$275>>2] = $p$0;
   $284 = (($p$0) + 24|0);
   HEAP32[$284>>2] = $275;
   $285 = (($p$0) + 12|0);
   HEAP32[$285>>2] = $p$0;
   $286 = (($p$0) + 8|0);
   HEAP32[$286>>2] = $p$0;
  } else {
   $287 = HEAP32[$275>>2]|0;
   $288 = ($I18$0|0)==(31);
   if ($288) {
    $296 = 0;
   } else {
    $289 = $I18$0 >>> 1;
    $290 = (25 - ($289))|0;
    $296 = $290;
   }
   $291 = (($287) + 4|0);
   $292 = HEAP32[$291>>2]|0;
   $293 = $292 & -8;
   $294 = ($293|0)==($psize$1|0);
   L205: do {
    if ($294) {
     $T$0$lcssa = $287;
    } else {
     $295 = $psize$1 << $296;
     $K19$057 = $295;$T$056 = $287;
     while(1) {
      $303 = $K19$057 >>> 31;
      $304 = ((($T$056) + ($303<<2)|0) + 16|0);
      $299 = HEAP32[$304>>2]|0;
      $305 = ($299|0)==(0|0);
      if ($305) {
       break;
      }
      $297 = $K19$057 << 1;
      $298 = (($299) + 4|0);
      $300 = HEAP32[$298>>2]|0;
      $301 = $300 & -8;
      $302 = ($301|0)==($psize$1|0);
      if ($302) {
       $T$0$lcssa = $299;
       break L205;
      } else {
       $K19$057 = $297;$T$056 = $299;
      }
     }
     $306 = HEAP32[((2280 + 16|0))>>2]|0;
     $307 = ($304>>>0)<($306>>>0);
     if ($307) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$304>>2] = $p$0;
      $308 = (($p$0) + 24|0);
      HEAP32[$308>>2] = $T$056;
      $309 = (($p$0) + 12|0);
      HEAP32[$309>>2] = $p$0;
      $310 = (($p$0) + 8|0);
      HEAP32[$310>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $311 = (($T$0$lcssa) + 8|0);
   $312 = HEAP32[$311>>2]|0;
   $313 = HEAP32[((2280 + 16|0))>>2]|0;
   $314 = ($T$0$lcssa>>>0)<($313>>>0);
   if ($314) {
    _abort();
    // unreachable;
   }
   $315 = ($312>>>0)<($313>>>0);
   if ($315) {
    _abort();
    // unreachable;
   } else {
    $316 = (($312) + 12|0);
    HEAP32[$316>>2] = $p$0;
    HEAP32[$311>>2] = $p$0;
    $317 = (($p$0) + 8|0);
    HEAP32[$317>>2] = $312;
    $318 = (($p$0) + 12|0);
    HEAP32[$318>>2] = $T$0$lcssa;
    $319 = (($p$0) + 24|0);
    HEAP32[$319>>2] = 0;
    break;
   }
  }
 } while(0);
 $320 = HEAP32[((2280 + 32|0))>>2]|0;
 $321 = (($320) + -1)|0;
 HEAP32[((2280 + 32|0))>>2] = $321;
 $322 = ($321|0)==(0);
 if ($322) {
  $sp$0$in$i = ((2280 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $323 = ($sp$0$i|0)==(0|0);
  $324 = (($sp$0$i) + 8|0);
  if ($323) {
   break;
  } else {
   $sp$0$in$i = $324;
  }
 }
 HEAP32[((2280 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function _realloc($oldmem,$bytes) {
 $oldmem = $oldmem|0;
 $bytes = $bytes|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $mem$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($oldmem|0)==(0|0);
 do {
  if ($0) {
   $1 = (_malloc($bytes)|0);
   $mem$0 = $1;
  } else {
   $2 = ($bytes>>>0)>(4294967231);
   if ($2) {
    $3 = (___errno_location()|0);
    HEAP32[$3>>2] = 12;
    $mem$0 = 0;
    break;
   }
   $4 = ($bytes>>>0)<(11);
   if ($4) {
    $8 = 16;
   } else {
    $5 = (($bytes) + 11)|0;
    $6 = $5 & -8;
    $8 = $6;
   }
   $7 = (($oldmem) + -8|0);
   $9 = (_try_realloc_chunk($7,$8)|0);
   $10 = ($9|0)==(0|0);
   if (!($10)) {
    $11 = (($9) + 8|0);
    $mem$0 = $11;
    break;
   }
   $12 = (_malloc($bytes)|0);
   $13 = ($12|0)==(0|0);
   if ($13) {
    $mem$0 = 0;
   } else {
    $14 = (($oldmem) + -4|0);
    $15 = HEAP32[$14>>2]|0;
    $16 = $15 & -8;
    $17 = $15 & 3;
    $18 = ($17|0)==(0);
    $19 = $18 ? 8 : 4;
    $20 = (($16) - ($19))|0;
    $21 = ($20>>>0)<($bytes>>>0);
    $22 = $21 ? $20 : $bytes;
    _memcpy(($12|0),($oldmem|0),($22|0))|0;
    _free($oldmem);
    $mem$0 = $12;
   }
  }
 } while(0);
 STACKTOP = sp;return ($mem$0|0);
}
function _try_realloc_chunk($p,$nb) {
 $p = $p|0;
 $nb = $nb|0;
 var $$pre = 0, $$pre$phiZ2D = 0, $$sum = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum2728 = 0, $$sum3 = 0, $$sum4 = 0, $$sum5 = 0, $$sum78 = 0;
 var $$sum910 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0;
 var $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0;
 var $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0;
 var $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0;
 var $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
 var $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0;
 var $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0;
 var $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0;
 var $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $R$0 = 0, $R$1 = 0, $RP$0 = 0;
 var $cond = 0, $newp$0 = 0, $or$cond = 0, $storemerge = 0, $storemerge21 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($p) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = $1 & -8;
 $3 = (($p) + ($2)|0);
 $4 = HEAP32[((2280 + 16|0))>>2]|0;
 $5 = ($p>>>0)<($4>>>0);
 if ($5) {
  _abort();
  // unreachable;
 }
 $6 = $1 & 3;
 $7 = ($6|0)!=(1);
 $8 = ($p>>>0)<($3>>>0);
 $or$cond = $7 & $8;
 if (!($or$cond)) {
  _abort();
  // unreachable;
 }
 $$sum2728 = $2 | 4;
 $9 = (($p) + ($$sum2728)|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = $10 & 1;
 $12 = ($11|0)==(0);
 if ($12) {
  _abort();
  // unreachable;
 }
 $13 = ($6|0)==(0);
 if ($13) {
  $14 = ($nb>>>0)<(256);
  if ($14) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $15 = (($nb) + 4)|0;
  $16 = ($2>>>0)<($15>>>0);
  if (!($16)) {
   $17 = (($2) - ($nb))|0;
   $18 = HEAP32[((2752 + 8|0))>>2]|0;
   $19 = $18 << 1;
   $20 = ($17>>>0)>($19>>>0);
   if (!($20)) {
    $newp$0 = $p;
    STACKTOP = sp;return ($newp$0|0);
   }
  }
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $21 = ($2>>>0)<($nb>>>0);
 if (!($21)) {
  $22 = (($2) - ($nb))|0;
  $23 = ($22>>>0)>(15);
  if (!($23)) {
   $newp$0 = $p;
   STACKTOP = sp;return ($newp$0|0);
  }
  $24 = (($p) + ($nb)|0);
  $25 = $1 & 1;
  $26 = $25 | $nb;
  $27 = $26 | 2;
  HEAP32[$0>>2] = $27;
  $$sum23 = (($nb) + 4)|0;
  $28 = (($p) + ($$sum23)|0);
  $29 = $22 | 3;
  HEAP32[$28>>2] = $29;
  $30 = HEAP32[$9>>2]|0;
  $31 = $30 | 1;
  HEAP32[$9>>2] = $31;
  _dispose_chunk($24,$22);
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $32 = HEAP32[((2280 + 24|0))>>2]|0;
 $33 = ($3|0)==($32|0);
 if ($33) {
  $34 = HEAP32[((2280 + 12|0))>>2]|0;
  $35 = (($34) + ($2))|0;
  $36 = ($35>>>0)>($nb>>>0);
  if (!($36)) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $37 = (($35) - ($nb))|0;
  $38 = (($p) + ($nb)|0);
  $39 = $1 & 1;
  $40 = $39 | $nb;
  $41 = $40 | 2;
  HEAP32[$0>>2] = $41;
  $$sum22 = (($nb) + 4)|0;
  $42 = (($p) + ($$sum22)|0);
  $43 = $37 | 1;
  HEAP32[$42>>2] = $43;
  HEAP32[((2280 + 24|0))>>2] = $38;
  HEAP32[((2280 + 12|0))>>2] = $37;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $44 = HEAP32[((2280 + 20|0))>>2]|0;
 $45 = ($3|0)==($44|0);
 if ($45) {
  $46 = HEAP32[((2280 + 8|0))>>2]|0;
  $47 = (($46) + ($2))|0;
  $48 = ($47>>>0)<($nb>>>0);
  if ($48) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $49 = (($47) - ($nb))|0;
  $50 = ($49>>>0)>(15);
  if ($50) {
   $51 = (($p) + ($nb)|0);
   $52 = (($p) + ($47)|0);
   $53 = $1 & 1;
   $54 = $53 | $nb;
   $55 = $54 | 2;
   HEAP32[$0>>2] = $55;
   $$sum19 = (($nb) + 4)|0;
   $56 = (($p) + ($$sum19)|0);
   $57 = $49 | 1;
   HEAP32[$56>>2] = $57;
   HEAP32[$52>>2] = $49;
   $$sum20 = (($47) + 4)|0;
   $58 = (($p) + ($$sum20)|0);
   $59 = HEAP32[$58>>2]|0;
   $60 = $59 & -2;
   HEAP32[$58>>2] = $60;
   $storemerge = $51;$storemerge21 = $49;
  } else {
   $61 = $1 & 1;
   $62 = $61 | $47;
   $63 = $62 | 2;
   HEAP32[$0>>2] = $63;
   $$sum17 = (($47) + 4)|0;
   $64 = (($p) + ($$sum17)|0);
   $65 = HEAP32[$64>>2]|0;
   $66 = $65 | 1;
   HEAP32[$64>>2] = $66;
   $storemerge = 0;$storemerge21 = 0;
  }
  HEAP32[((2280 + 8|0))>>2] = $storemerge21;
  HEAP32[((2280 + 20|0))>>2] = $storemerge;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $67 = $10 & 2;
 $68 = ($67|0)==(0);
 if (!($68)) {
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $69 = $10 & -8;
 $70 = (($69) + ($2))|0;
 $71 = ($70>>>0)<($nb>>>0);
 if ($71) {
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $72 = (($70) - ($nb))|0;
 $73 = $10 >>> 3;
 $74 = ($10>>>0)<(256);
 do {
  if ($74) {
   $$sum15 = (($2) + 8)|0;
   $75 = (($p) + ($$sum15)|0);
   $76 = HEAP32[$75>>2]|0;
   $$sum16 = (($2) + 12)|0;
   $77 = (($p) + ($$sum16)|0);
   $78 = HEAP32[$77>>2]|0;
   $79 = $73 << 1;
   $80 = ((2280 + ($79<<2)|0) + 40|0);
   $81 = ($76|0)==($80|0);
   if (!($81)) {
    $82 = ($76>>>0)<($4>>>0);
    if ($82) {
     _abort();
     // unreachable;
    }
    $83 = (($76) + 12|0);
    $84 = HEAP32[$83>>2]|0;
    $85 = ($84|0)==($3|0);
    if (!($85)) {
     _abort();
     // unreachable;
    }
   }
   $86 = ($78|0)==($76|0);
   if ($86) {
    $87 = 1 << $73;
    $88 = $87 ^ -1;
    $89 = HEAP32[2280>>2]|0;
    $90 = $89 & $88;
    HEAP32[2280>>2] = $90;
    break;
   }
   $91 = ($78|0)==($80|0);
   if ($91) {
    $$pre = (($78) + 8|0);
    $$pre$phiZ2D = $$pre;
   } else {
    $92 = ($78>>>0)<($4>>>0);
    if ($92) {
     _abort();
     // unreachable;
    }
    $93 = (($78) + 8|0);
    $94 = HEAP32[$93>>2]|0;
    $95 = ($94|0)==($3|0);
    if ($95) {
     $$pre$phiZ2D = $93;
    } else {
     _abort();
     // unreachable;
    }
   }
   $96 = (($76) + 12|0);
   HEAP32[$96>>2] = $78;
   HEAP32[$$pre$phiZ2D>>2] = $76;
  } else {
   $$sum = (($2) + 24)|0;
   $97 = (($p) + ($$sum)|0);
   $98 = HEAP32[$97>>2]|0;
   $$sum2 = (($2) + 12)|0;
   $99 = (($p) + ($$sum2)|0);
   $100 = HEAP32[$99>>2]|0;
   $101 = ($100|0)==($3|0);
   do {
    if ($101) {
     $$sum4 = (($2) + 20)|0;
     $111 = (($p) + ($$sum4)|0);
     $112 = HEAP32[$111>>2]|0;
     $113 = ($112|0)==(0|0);
     if ($113) {
      $$sum3 = (($2) + 16)|0;
      $114 = (($p) + ($$sum3)|0);
      $115 = HEAP32[$114>>2]|0;
      $116 = ($115|0)==(0|0);
      if ($116) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $115;$RP$0 = $114;
      }
     } else {
      $R$0 = $112;$RP$0 = $111;
     }
     while(1) {
      $117 = (($R$0) + 20|0);
      $118 = HEAP32[$117>>2]|0;
      $119 = ($118|0)==(0|0);
      if (!($119)) {
       $R$0 = $118;$RP$0 = $117;
       continue;
      }
      $120 = (($R$0) + 16|0);
      $121 = HEAP32[$120>>2]|0;
      $122 = ($121|0)==(0|0);
      if ($122) {
       break;
      } else {
       $R$0 = $121;$RP$0 = $120;
      }
     }
     $123 = ($RP$0>>>0)<($4>>>0);
     if ($123) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum14 = (($2) + 8)|0;
     $102 = (($p) + ($$sum14)|0);
     $103 = HEAP32[$102>>2]|0;
     $104 = ($103>>>0)<($4>>>0);
     if ($104) {
      _abort();
      // unreachable;
     }
     $105 = (($103) + 12|0);
     $106 = HEAP32[$105>>2]|0;
     $107 = ($106|0)==($3|0);
     if (!($107)) {
      _abort();
      // unreachable;
     }
     $108 = (($100) + 8|0);
     $109 = HEAP32[$108>>2]|0;
     $110 = ($109|0)==($3|0);
     if ($110) {
      HEAP32[$105>>2] = $100;
      HEAP32[$108>>2] = $103;
      $R$1 = $100;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $124 = ($98|0)==(0|0);
   if (!($124)) {
    $$sum11 = (($2) + 28)|0;
    $125 = (($p) + ($$sum11)|0);
    $126 = HEAP32[$125>>2]|0;
    $127 = ((2280 + ($126<<2)|0) + 304|0);
    $128 = HEAP32[$127>>2]|0;
    $129 = ($3|0)==($128|0);
    if ($129) {
     HEAP32[$127>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $130 = 1 << $126;
      $131 = $130 ^ -1;
      $132 = HEAP32[((2280 + 4|0))>>2]|0;
      $133 = $132 & $131;
      HEAP32[((2280 + 4|0))>>2] = $133;
      break;
     }
    } else {
     $134 = HEAP32[((2280 + 16|0))>>2]|0;
     $135 = ($98>>>0)<($134>>>0);
     if ($135) {
      _abort();
      // unreachable;
     }
     $136 = (($98) + 16|0);
     $137 = HEAP32[$136>>2]|0;
     $138 = ($137|0)==($3|0);
     if ($138) {
      HEAP32[$136>>2] = $R$1;
     } else {
      $139 = (($98) + 20|0);
      HEAP32[$139>>2] = $R$1;
     }
     $140 = ($R$1|0)==(0|0);
     if ($140) {
      break;
     }
    }
    $141 = HEAP32[((2280 + 16|0))>>2]|0;
    $142 = ($R$1>>>0)<($141>>>0);
    if ($142) {
     _abort();
     // unreachable;
    }
    $143 = (($R$1) + 24|0);
    HEAP32[$143>>2] = $98;
    $$sum12 = (($2) + 16)|0;
    $144 = (($p) + ($$sum12)|0);
    $145 = HEAP32[$144>>2]|0;
    $146 = ($145|0)==(0|0);
    do {
     if (!($146)) {
      $147 = HEAP32[((2280 + 16|0))>>2]|0;
      $148 = ($145>>>0)<($147>>>0);
      if ($148) {
       _abort();
       // unreachable;
      } else {
       $149 = (($R$1) + 16|0);
       HEAP32[$149>>2] = $145;
       $150 = (($145) + 24|0);
       HEAP32[$150>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum13 = (($2) + 20)|0;
    $151 = (($p) + ($$sum13)|0);
    $152 = HEAP32[$151>>2]|0;
    $153 = ($152|0)==(0|0);
    if (!($153)) {
     $154 = HEAP32[((2280 + 16|0))>>2]|0;
     $155 = ($152>>>0)<($154>>>0);
     if ($155) {
      _abort();
      // unreachable;
     } else {
      $156 = (($R$1) + 20|0);
      HEAP32[$156>>2] = $152;
      $157 = (($152) + 24|0);
      HEAP32[$157>>2] = $R$1;
      break;
     }
    }
   }
  }
 } while(0);
 $158 = ($72>>>0)<(16);
 if ($158) {
  $159 = HEAP32[$0>>2]|0;
  $160 = $159 & 1;
  $161 = $70 | $160;
  $162 = $161 | 2;
  HEAP32[$0>>2] = $162;
  $$sum910 = $70 | 4;
  $163 = (($p) + ($$sum910)|0);
  $164 = HEAP32[$163>>2]|0;
  $165 = $164 | 1;
  HEAP32[$163>>2] = $165;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 } else {
  $166 = (($p) + ($nb)|0);
  $167 = HEAP32[$0>>2]|0;
  $168 = $167 & 1;
  $169 = $168 | $nb;
  $170 = $169 | 2;
  HEAP32[$0>>2] = $170;
  $$sum5 = (($nb) + 4)|0;
  $171 = (($p) + ($$sum5)|0);
  $172 = $72 | 3;
  HEAP32[$171>>2] = $172;
  $$sum78 = $70 | 4;
  $173 = (($p) + ($$sum78)|0);
  $174 = HEAP32[$173>>2]|0;
  $175 = $174 | 1;
  HEAP32[$173>>2] = $175;
  _dispose_chunk($166,$72);
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 return 0|0;
}
function _dispose_chunk($p,$psize) {
 $p = $p|0;
 $psize = $psize|0;
 var $$0 = 0, $$02 = 0, $$1 = 0, $$pre = 0, $$pre$phi63Z2D = 0, $$pre$phi65Z2D = 0, $$pre$phiZ2D = 0, $$pre62 = 0, $$pre64 = 0, $$sum = 0, $$sum1 = 0, $$sum12$pre = 0, $$sum13 = 0, $$sum14 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0;
 var $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum24 = 0, $$sum25 = 0, $$sum26 = 0, $$sum27 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum4 = 0, $$sum5 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0;
 var $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0;
 var $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0;
 var $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0;
 var $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0;
 var $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0;
 var $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0;
 var $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0;
 var $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0;
 var $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0;
 var $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0;
 var $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0;
 var $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
 var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0;
 var $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I19$0 = 0, $I19$0$c = 0, $K20$049 = 0, $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$048 = 0, $cond = 0, $cond46 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = (($p) + ($psize)|0);
 $1 = (($p) + 4|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = $2 & 1;
 $4 = ($3|0)==(0);
 do {
  if ($4) {
   $5 = HEAP32[$p>>2]|0;
   $6 = $2 & 3;
   $7 = ($6|0)==(0);
   if ($7) {
    STACKTOP = sp;return;
   }
   $8 = (0 - ($5))|0;
   $9 = (($p) + ($8)|0);
   $10 = (($5) + ($psize))|0;
   $11 = HEAP32[((2280 + 16|0))>>2]|0;
   $12 = ($9>>>0)<($11>>>0);
   if ($12) {
    _abort();
    // unreachable;
   }
   $13 = HEAP32[((2280 + 20|0))>>2]|0;
   $14 = ($9|0)==($13|0);
   if ($14) {
    $$sum = (($psize) + 4)|0;
    $100 = (($p) + ($$sum)|0);
    $101 = HEAP32[$100>>2]|0;
    $102 = $101 & 3;
    $103 = ($102|0)==(3);
    if (!($103)) {
     $$0 = $9;$$02 = $10;
     break;
    }
    HEAP32[((2280 + 8|0))>>2] = $10;
    $104 = HEAP32[$100>>2]|0;
    $105 = $104 & -2;
    HEAP32[$100>>2] = $105;
    $106 = $10 | 1;
    $$sum20 = (4 - ($5))|0;
    $107 = (($p) + ($$sum20)|0);
    HEAP32[$107>>2] = $106;
    HEAP32[$0>>2] = $10;
    STACKTOP = sp;return;
   }
   $15 = $5 >>> 3;
   $16 = ($5>>>0)<(256);
   if ($16) {
    $$sum30 = (8 - ($5))|0;
    $17 = (($p) + ($$sum30)|0);
    $18 = HEAP32[$17>>2]|0;
    $$sum31 = (12 - ($5))|0;
    $19 = (($p) + ($$sum31)|0);
    $20 = HEAP32[$19>>2]|0;
    $21 = $15 << 1;
    $22 = ((2280 + ($21<<2)|0) + 40|0);
    $23 = ($18|0)==($22|0);
    if (!($23)) {
     $24 = ($18>>>0)<($11>>>0);
     if ($24) {
      _abort();
      // unreachable;
     }
     $25 = (($18) + 12|0);
     $26 = HEAP32[$25>>2]|0;
     $27 = ($26|0)==($9|0);
     if (!($27)) {
      _abort();
      // unreachable;
     }
    }
    $28 = ($20|0)==($18|0);
    if ($28) {
     $29 = 1 << $15;
     $30 = $29 ^ -1;
     $31 = HEAP32[2280>>2]|0;
     $32 = $31 & $30;
     HEAP32[2280>>2] = $32;
     $$0 = $9;$$02 = $10;
     break;
    }
    $33 = ($20|0)==($22|0);
    if ($33) {
     $$pre64 = (($20) + 8|0);
     $$pre$phi65Z2D = $$pre64;
    } else {
     $34 = ($20>>>0)<($11>>>0);
     if ($34) {
      _abort();
      // unreachable;
     }
     $35 = (($20) + 8|0);
     $36 = HEAP32[$35>>2]|0;
     $37 = ($36|0)==($9|0);
     if ($37) {
      $$pre$phi65Z2D = $35;
     } else {
      _abort();
      // unreachable;
     }
    }
    $38 = (($18) + 12|0);
    HEAP32[$38>>2] = $20;
    HEAP32[$$pre$phi65Z2D>>2] = $18;
    $$0 = $9;$$02 = $10;
    break;
   }
   $$sum22 = (24 - ($5))|0;
   $39 = (($p) + ($$sum22)|0);
   $40 = HEAP32[$39>>2]|0;
   $$sum23 = (12 - ($5))|0;
   $41 = (($p) + ($$sum23)|0);
   $42 = HEAP32[$41>>2]|0;
   $43 = ($42|0)==($9|0);
   do {
    if ($43) {
     $$sum24 = (16 - ($5))|0;
     $$sum25 = (($$sum24) + 4)|0;
     $53 = (($p) + ($$sum25)|0);
     $54 = HEAP32[$53>>2]|0;
     $55 = ($54|0)==(0|0);
     if ($55) {
      $56 = (($p) + ($$sum24)|0);
      $57 = HEAP32[$56>>2]|0;
      $58 = ($57|0)==(0|0);
      if ($58) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $57;$RP$0 = $56;
      }
     } else {
      $R$0 = $54;$RP$0 = $53;
     }
     while(1) {
      $59 = (($R$0) + 20|0);
      $60 = HEAP32[$59>>2]|0;
      $61 = ($60|0)==(0|0);
      if (!($61)) {
       $R$0 = $60;$RP$0 = $59;
       continue;
      }
      $62 = (($R$0) + 16|0);
      $63 = HEAP32[$62>>2]|0;
      $64 = ($63|0)==(0|0);
      if ($64) {
       break;
      } else {
       $R$0 = $63;$RP$0 = $62;
      }
     }
     $65 = ($RP$0>>>0)<($11>>>0);
     if ($65) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum29 = (8 - ($5))|0;
     $44 = (($p) + ($$sum29)|0);
     $45 = HEAP32[$44>>2]|0;
     $46 = ($45>>>0)<($11>>>0);
     if ($46) {
      _abort();
      // unreachable;
     }
     $47 = (($45) + 12|0);
     $48 = HEAP32[$47>>2]|0;
     $49 = ($48|0)==($9|0);
     if (!($49)) {
      _abort();
      // unreachable;
     }
     $50 = (($42) + 8|0);
     $51 = HEAP32[$50>>2]|0;
     $52 = ($51|0)==($9|0);
     if ($52) {
      HEAP32[$47>>2] = $42;
      HEAP32[$50>>2] = $45;
      $R$1 = $42;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $66 = ($40|0)==(0|0);
   if ($66) {
    $$0 = $9;$$02 = $10;
   } else {
    $$sum26 = (28 - ($5))|0;
    $67 = (($p) + ($$sum26)|0);
    $68 = HEAP32[$67>>2]|0;
    $69 = ((2280 + ($68<<2)|0) + 304|0);
    $70 = HEAP32[$69>>2]|0;
    $71 = ($9|0)==($70|0);
    if ($71) {
     HEAP32[$69>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $72 = 1 << $68;
      $73 = $72 ^ -1;
      $74 = HEAP32[((2280 + 4|0))>>2]|0;
      $75 = $74 & $73;
      HEAP32[((2280 + 4|0))>>2] = $75;
      $$0 = $9;$$02 = $10;
      break;
     }
    } else {
     $76 = HEAP32[((2280 + 16|0))>>2]|0;
     $77 = ($40>>>0)<($76>>>0);
     if ($77) {
      _abort();
      // unreachable;
     }
     $78 = (($40) + 16|0);
     $79 = HEAP32[$78>>2]|0;
     $80 = ($79|0)==($9|0);
     if ($80) {
      HEAP32[$78>>2] = $R$1;
     } else {
      $81 = (($40) + 20|0);
      HEAP32[$81>>2] = $R$1;
     }
     $82 = ($R$1|0)==(0|0);
     if ($82) {
      $$0 = $9;$$02 = $10;
      break;
     }
    }
    $83 = HEAP32[((2280 + 16|0))>>2]|0;
    $84 = ($R$1>>>0)<($83>>>0);
    if ($84) {
     _abort();
     // unreachable;
    }
    $85 = (($R$1) + 24|0);
    HEAP32[$85>>2] = $40;
    $$sum27 = (16 - ($5))|0;
    $86 = (($p) + ($$sum27)|0);
    $87 = HEAP32[$86>>2]|0;
    $88 = ($87|0)==(0|0);
    do {
     if (!($88)) {
      $89 = HEAP32[((2280 + 16|0))>>2]|0;
      $90 = ($87>>>0)<($89>>>0);
      if ($90) {
       _abort();
       // unreachable;
      } else {
       $91 = (($R$1) + 16|0);
       HEAP32[$91>>2] = $87;
       $92 = (($87) + 24|0);
       HEAP32[$92>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum28 = (($$sum27) + 4)|0;
    $93 = (($p) + ($$sum28)|0);
    $94 = HEAP32[$93>>2]|0;
    $95 = ($94|0)==(0|0);
    if ($95) {
     $$0 = $9;$$02 = $10;
    } else {
     $96 = HEAP32[((2280 + 16|0))>>2]|0;
     $97 = ($94>>>0)<($96>>>0);
     if ($97) {
      _abort();
      // unreachable;
     } else {
      $98 = (($R$1) + 20|0);
      HEAP32[$98>>2] = $94;
      $99 = (($94) + 24|0);
      HEAP32[$99>>2] = $R$1;
      $$0 = $9;$$02 = $10;
      break;
     }
    }
   }
  } else {
   $$0 = $p;$$02 = $psize;
  }
 } while(0);
 $108 = HEAP32[((2280 + 16|0))>>2]|0;
 $109 = ($0>>>0)<($108>>>0);
 if ($109) {
  _abort();
  // unreachable;
 }
 $$sum1 = (($psize) + 4)|0;
 $110 = (($p) + ($$sum1)|0);
 $111 = HEAP32[$110>>2]|0;
 $112 = $111 & 2;
 $113 = ($112|0)==(0);
 if ($113) {
  $114 = HEAP32[((2280 + 24|0))>>2]|0;
  $115 = ($0|0)==($114|0);
  if ($115) {
   $116 = HEAP32[((2280 + 12|0))>>2]|0;
   $117 = (($116) + ($$02))|0;
   HEAP32[((2280 + 12|0))>>2] = $117;
   HEAP32[((2280 + 24|0))>>2] = $$0;
   $118 = $117 | 1;
   $119 = (($$0) + 4|0);
   HEAP32[$119>>2] = $118;
   $120 = HEAP32[((2280 + 20|0))>>2]|0;
   $121 = ($$0|0)==($120|0);
   if (!($121)) {
    STACKTOP = sp;return;
   }
   HEAP32[((2280 + 20|0))>>2] = 0;
   HEAP32[((2280 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $122 = HEAP32[((2280 + 20|0))>>2]|0;
  $123 = ($0|0)==($122|0);
  if ($123) {
   $124 = HEAP32[((2280 + 8|0))>>2]|0;
   $125 = (($124) + ($$02))|0;
   HEAP32[((2280 + 8|0))>>2] = $125;
   HEAP32[((2280 + 20|0))>>2] = $$0;
   $126 = $125 | 1;
   $127 = (($$0) + 4|0);
   HEAP32[$127>>2] = $126;
   $128 = (($$0) + ($125)|0);
   HEAP32[$128>>2] = $125;
   STACKTOP = sp;return;
  }
  $129 = $111 & -8;
  $130 = (($129) + ($$02))|0;
  $131 = $111 >>> 3;
  $132 = ($111>>>0)<(256);
  do {
   if ($132) {
    $$sum18 = (($psize) + 8)|0;
    $133 = (($p) + ($$sum18)|0);
    $134 = HEAP32[$133>>2]|0;
    $$sum19 = (($psize) + 12)|0;
    $135 = (($p) + ($$sum19)|0);
    $136 = HEAP32[$135>>2]|0;
    $137 = $131 << 1;
    $138 = ((2280 + ($137<<2)|0) + 40|0);
    $139 = ($134|0)==($138|0);
    if (!($139)) {
     $140 = ($134>>>0)<($108>>>0);
     if ($140) {
      _abort();
      // unreachable;
     }
     $141 = (($134) + 12|0);
     $142 = HEAP32[$141>>2]|0;
     $143 = ($142|0)==($0|0);
     if (!($143)) {
      _abort();
      // unreachable;
     }
    }
    $144 = ($136|0)==($134|0);
    if ($144) {
     $145 = 1 << $131;
     $146 = $145 ^ -1;
     $147 = HEAP32[2280>>2]|0;
     $148 = $147 & $146;
     HEAP32[2280>>2] = $148;
     break;
    }
    $149 = ($136|0)==($138|0);
    if ($149) {
     $$pre62 = (($136) + 8|0);
     $$pre$phi63Z2D = $$pre62;
    } else {
     $150 = ($136>>>0)<($108>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($136) + 8|0);
     $152 = HEAP32[$151>>2]|0;
     $153 = ($152|0)==($0|0);
     if ($153) {
      $$pre$phi63Z2D = $151;
     } else {
      _abort();
      // unreachable;
     }
    }
    $154 = (($134) + 12|0);
    HEAP32[$154>>2] = $136;
    HEAP32[$$pre$phi63Z2D>>2] = $134;
   } else {
    $$sum2 = (($psize) + 24)|0;
    $155 = (($p) + ($$sum2)|0);
    $156 = HEAP32[$155>>2]|0;
    $$sum3 = (($psize) + 12)|0;
    $157 = (($p) + ($$sum3)|0);
    $158 = HEAP32[$157>>2]|0;
    $159 = ($158|0)==($0|0);
    do {
     if ($159) {
      $$sum5 = (($psize) + 20)|0;
      $169 = (($p) + ($$sum5)|0);
      $170 = HEAP32[$169>>2]|0;
      $171 = ($170|0)==(0|0);
      if ($171) {
       $$sum4 = (($psize) + 16)|0;
       $172 = (($p) + ($$sum4)|0);
       $173 = HEAP32[$172>>2]|0;
       $174 = ($173|0)==(0|0);
       if ($174) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $173;$RP9$0 = $172;
       }
      } else {
       $R7$0 = $170;$RP9$0 = $169;
      }
      while(1) {
       $175 = (($R7$0) + 20|0);
       $176 = HEAP32[$175>>2]|0;
       $177 = ($176|0)==(0|0);
       if (!($177)) {
        $R7$0 = $176;$RP9$0 = $175;
        continue;
       }
       $178 = (($R7$0) + 16|0);
       $179 = HEAP32[$178>>2]|0;
       $180 = ($179|0)==(0|0);
       if ($180) {
        break;
       } else {
        $R7$0 = $179;$RP9$0 = $178;
       }
      }
      $181 = ($RP9$0>>>0)<($108>>>0);
      if ($181) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $$sum17 = (($psize) + 8)|0;
      $160 = (($p) + ($$sum17)|0);
      $161 = HEAP32[$160>>2]|0;
      $162 = ($161>>>0)<($108>>>0);
      if ($162) {
       _abort();
       // unreachable;
      }
      $163 = (($161) + 12|0);
      $164 = HEAP32[$163>>2]|0;
      $165 = ($164|0)==($0|0);
      if (!($165)) {
       _abort();
       // unreachable;
      }
      $166 = (($158) + 8|0);
      $167 = HEAP32[$166>>2]|0;
      $168 = ($167|0)==($0|0);
      if ($168) {
       HEAP32[$163>>2] = $158;
       HEAP32[$166>>2] = $161;
       $R7$1 = $158;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $182 = ($156|0)==(0|0);
    if (!($182)) {
     $$sum14 = (($psize) + 28)|0;
     $183 = (($p) + ($$sum14)|0);
     $184 = HEAP32[$183>>2]|0;
     $185 = ((2280 + ($184<<2)|0) + 304|0);
     $186 = HEAP32[$185>>2]|0;
     $187 = ($0|0)==($186|0);
     if ($187) {
      HEAP32[$185>>2] = $R7$1;
      $cond46 = ($R7$1|0)==(0|0);
      if ($cond46) {
       $188 = 1 << $184;
       $189 = $188 ^ -1;
       $190 = HEAP32[((2280 + 4|0))>>2]|0;
       $191 = $190 & $189;
       HEAP32[((2280 + 4|0))>>2] = $191;
       break;
      }
     } else {
      $192 = HEAP32[((2280 + 16|0))>>2]|0;
      $193 = ($156>>>0)<($192>>>0);
      if ($193) {
       _abort();
       // unreachable;
      }
      $194 = (($156) + 16|0);
      $195 = HEAP32[$194>>2]|0;
      $196 = ($195|0)==($0|0);
      if ($196) {
       HEAP32[$194>>2] = $R7$1;
      } else {
       $197 = (($156) + 20|0);
       HEAP32[$197>>2] = $R7$1;
      }
      $198 = ($R7$1|0)==(0|0);
      if ($198) {
       break;
      }
     }
     $199 = HEAP32[((2280 + 16|0))>>2]|0;
     $200 = ($R7$1>>>0)<($199>>>0);
     if ($200) {
      _abort();
      // unreachable;
     }
     $201 = (($R7$1) + 24|0);
     HEAP32[$201>>2] = $156;
     $$sum15 = (($psize) + 16)|0;
     $202 = (($p) + ($$sum15)|0);
     $203 = HEAP32[$202>>2]|0;
     $204 = ($203|0)==(0|0);
     do {
      if (!($204)) {
       $205 = HEAP32[((2280 + 16|0))>>2]|0;
       $206 = ($203>>>0)<($205>>>0);
       if ($206) {
        _abort();
        // unreachable;
       } else {
        $207 = (($R7$1) + 16|0);
        HEAP32[$207>>2] = $203;
        $208 = (($203) + 24|0);
        HEAP32[$208>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum16 = (($psize) + 20)|0;
     $209 = (($p) + ($$sum16)|0);
     $210 = HEAP32[$209>>2]|0;
     $211 = ($210|0)==(0|0);
     if (!($211)) {
      $212 = HEAP32[((2280 + 16|0))>>2]|0;
      $213 = ($210>>>0)<($212>>>0);
      if ($213) {
       _abort();
       // unreachable;
      } else {
       $214 = (($R7$1) + 20|0);
       HEAP32[$214>>2] = $210;
       $215 = (($210) + 24|0);
       HEAP32[$215>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $216 = $130 | 1;
  $217 = (($$0) + 4|0);
  HEAP32[$217>>2] = $216;
  $218 = (($$0) + ($130)|0);
  HEAP32[$218>>2] = $130;
  $219 = HEAP32[((2280 + 20|0))>>2]|0;
  $220 = ($$0|0)==($219|0);
  if ($220) {
   HEAP32[((2280 + 8|0))>>2] = $130;
   STACKTOP = sp;return;
  } else {
   $$1 = $130;
  }
 } else {
  $221 = $111 & -2;
  HEAP32[$110>>2] = $221;
  $222 = $$02 | 1;
  $223 = (($$0) + 4|0);
  HEAP32[$223>>2] = $222;
  $224 = (($$0) + ($$02)|0);
  HEAP32[$224>>2] = $$02;
  $$1 = $$02;
 }
 $225 = $$1 >>> 3;
 $226 = ($$1>>>0)<(256);
 if ($226) {
  $227 = $225 << 1;
  $228 = ((2280 + ($227<<2)|0) + 40|0);
  $229 = HEAP32[2280>>2]|0;
  $230 = 1 << $225;
  $231 = $229 & $230;
  $232 = ($231|0)==(0);
  if ($232) {
   $233 = $229 | $230;
   HEAP32[2280>>2] = $233;
   $$sum12$pre = (($227) + 2)|0;
   $$pre = ((2280 + ($$sum12$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $228;
  } else {
   $$sum13 = (($227) + 2)|0;
   $234 = ((2280 + ($$sum13<<2)|0) + 40|0);
   $235 = HEAP32[$234>>2]|0;
   $236 = HEAP32[((2280 + 16|0))>>2]|0;
   $237 = ($235>>>0)<($236>>>0);
   if ($237) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $234;$F16$0 = $235;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $$0;
  $238 = (($F16$0) + 12|0);
  HEAP32[$238>>2] = $$0;
  $239 = (($$0) + 8|0);
  HEAP32[$239>>2] = $F16$0;
  $240 = (($$0) + 12|0);
  HEAP32[$240>>2] = $228;
  STACKTOP = sp;return;
 }
 $241 = $$1 >>> 8;
 $242 = ($241|0)==(0);
 if ($242) {
  $I19$0 = 0;
 } else {
  $243 = ($$1>>>0)>(16777215);
  if ($243) {
   $I19$0 = 31;
  } else {
   $244 = (($241) + 1048320)|0;
   $245 = $244 >>> 16;
   $246 = $245 & 8;
   $247 = $241 << $246;
   $248 = (($247) + 520192)|0;
   $249 = $248 >>> 16;
   $250 = $249 & 4;
   $251 = $250 | $246;
   $252 = $247 << $250;
   $253 = (($252) + 245760)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 2;
   $256 = $251 | $255;
   $257 = (14 - ($256))|0;
   $258 = $252 << $255;
   $259 = $258 >>> 15;
   $260 = (($257) + ($259))|0;
   $261 = $260 << 1;
   $262 = (($260) + 7)|0;
   $263 = $$1 >>> $262;
   $264 = $263 & 1;
   $265 = $264 | $261;
   $I19$0 = $265;
  }
 }
 $266 = ((2280 + ($I19$0<<2)|0) + 304|0);
 $267 = (($$0) + 28|0);
 $I19$0$c = $I19$0;
 HEAP32[$267>>2] = $I19$0$c;
 $268 = (($$0) + 20|0);
 HEAP32[$268>>2] = 0;
 $269 = (($$0) + 16|0);
 HEAP32[$269>>2] = 0;
 $270 = HEAP32[((2280 + 4|0))>>2]|0;
 $271 = 1 << $I19$0;
 $272 = $270 & $271;
 $273 = ($272|0)==(0);
 if ($273) {
  $274 = $270 | $271;
  HEAP32[((2280 + 4|0))>>2] = $274;
  HEAP32[$266>>2] = $$0;
  $275 = (($$0) + 24|0);
  HEAP32[$275>>2] = $266;
  $276 = (($$0) + 12|0);
  HEAP32[$276>>2] = $$0;
  $277 = (($$0) + 8|0);
  HEAP32[$277>>2] = $$0;
  STACKTOP = sp;return;
 }
 $278 = HEAP32[$266>>2]|0;
 $279 = ($I19$0|0)==(31);
 if ($279) {
  $287 = 0;
 } else {
  $280 = $I19$0 >>> 1;
  $281 = (25 - ($280))|0;
  $287 = $281;
 }
 $282 = (($278) + 4|0);
 $283 = HEAP32[$282>>2]|0;
 $284 = $283 & -8;
 $285 = ($284|0)==($$1|0);
 L194: do {
  if ($285) {
   $T$0$lcssa = $278;
  } else {
   $286 = $$1 << $287;
   $K20$049 = $286;$T$048 = $278;
   while(1) {
    $294 = $K20$049 >>> 31;
    $295 = ((($T$048) + ($294<<2)|0) + 16|0);
    $290 = HEAP32[$295>>2]|0;
    $296 = ($290|0)==(0|0);
    if ($296) {
     break;
    }
    $288 = $K20$049 << 1;
    $289 = (($290) + 4|0);
    $291 = HEAP32[$289>>2]|0;
    $292 = $291 & -8;
    $293 = ($292|0)==($$1|0);
    if ($293) {
     $T$0$lcssa = $290;
     break L194;
    } else {
     $K20$049 = $288;$T$048 = $290;
    }
   }
   $297 = HEAP32[((2280 + 16|0))>>2]|0;
   $298 = ($295>>>0)<($297>>>0);
   if ($298) {
    _abort();
    // unreachable;
   }
   HEAP32[$295>>2] = $$0;
   $299 = (($$0) + 24|0);
   HEAP32[$299>>2] = $T$048;
   $300 = (($$0) + 12|0);
   HEAP32[$300>>2] = $$0;
   $301 = (($$0) + 8|0);
   HEAP32[$301>>2] = $$0;
   STACKTOP = sp;return;
  }
 } while(0);
 $302 = (($T$0$lcssa) + 8|0);
 $303 = HEAP32[$302>>2]|0;
 $304 = HEAP32[((2280 + 16|0))>>2]|0;
 $305 = ($T$0$lcssa>>>0)<($304>>>0);
 if ($305) {
  _abort();
  // unreachable;
 }
 $306 = ($303>>>0)<($304>>>0);
 if ($306) {
  _abort();
  // unreachable;
 }
 $307 = (($303) + 12|0);
 HEAP32[$307>>2] = $$0;
 HEAP32[$302>>2] = $$0;
 $308 = (($$0) + 8|0);
 HEAP32[$308>>2] = $303;
 $309 = (($$0) + 12|0);
 HEAP32[$309>>2] = $T$0$lcssa;
 $310 = (($$0) + 24|0);
 HEAP32[$310>>2] = 0;
 STACKTOP = sp;return;
}
function runPostSets() {
 
}
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return ((tempRet0 = h,l|0)|0);
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[((curr)>>0)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memcpy(dest, src, num) {

    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _i64Add(a, b, c, d) {
    /*
      x = a + b*2^32
      y = c + d*2^32
      result = l + h*2^32
    */
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a + c)>>>0;
    h = (b + d + (((l>>>0) < (a>>>0))|0))>>>0; // Add carry from low word to high word on overflow.
    return ((tempRet0 = h,l|0)|0);
}
function _bitshift64Shl(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits));
      return low << bits;
    }
    tempRet0 = low << (bits - 32);
    return 0;
  }
function _bitshift64Lshr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >>> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = 0;
    return (high >>> (bits - 32))|0;
  }
function _bitshift64Ashr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = (high|0) < 0 ? -1 : 0;
    return (high >> (bits - 32))|0;
  }
function _llvm_ctlz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((ctlz_i8)+(x >>> 24))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((ctlz_i8)+(x&0xff))>>0)])|0) + 24)|0;
  }

function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((cttz_i8)+(x & 0xff))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((cttz_i8)+(x >>> 24))>>0)])|0) + 24)|0;
  }

// ======== compiled code from system/lib/compiler-rt , see readme therein
function ___muldsi3($a, $b) {
  $a = $a | 0;
  $b = $b | 0;
  var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
  $1 = $a & 65535;
  $2 = $b & 65535;
  $3 = Math_imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math_imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  $7$0 = $2$0 ^ $1$0;
  $7$1 = $2$1 ^ $1$1;
  $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, 0) | 0;
  $10$0 = _i64Subtract($8$0 ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
  return (tempRet0 = tempRet0, $10$0) | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
  $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
  $10$1 = tempRet0;
  STACKTOP = __stackBase__;
  return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
  $x_sroa_0_0_extract_trunc = $a$0;
  $y_sroa_0_0_extract_trunc = $b$0;
  $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
  $1$1 = tempRet0;
  $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0;
  $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
  return (tempRet0 = tempRet0, $1$0) | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
  STACKTOP = __stackBase__;
  return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  $rem = $rem | 0;
  var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
  $n_sroa_0_0_extract_trunc = $a$0;
  $n_sroa_1_4_extract_shift$0 = $a$1;
  $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
  $d_sroa_0_0_extract_trunc = $b$0;
  $d_sroa_1_4_extract_shift$0 = $b$1;
  $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
  if (($n_sroa_1_4_extract_trunc | 0) == 0) {
    $4 = ($rem | 0) != 0;
    if (($d_sroa_1_4_extract_trunc | 0) == 0) {
      if ($4) {
        HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
        HEAP32[$rem + 4 >> 2] = 0;
      }
      $_0$1 = 0;
      $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$4) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    }
  }
  $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
  do {
    if (($d_sroa_0_0_extract_trunc | 0) == 0) {
      if ($17) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP32[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      if (($n_sroa_0_0_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0;
          HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
      if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0 | $a$0 & -1;
          HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
        }
        $_0$1 = 0;
        $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $49 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
      $51 = $49 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
      if ($51 >>> 0 <= 30) {
        $57 = $51 + 1 | 0;
        $58 = 31 - $51 | 0;
        $sr_1_ph = $57;
        $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
        $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
        $q_sroa_0_1_ph = 0;
        $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
        break;
      }
      if (($rem | 0) == 0) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = 0 | $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$17) {
        $117 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
        $119 = $117 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($119 >>> 0 <= 31) {
          $125 = $119 + 1 | 0;
          $126 = 31 - $119 | 0;
          $130 = $119 - 31 >> 31;
          $sr_1_ph = $125;
          $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet0 = $_0$1, $_0$0) | 0;
        }
        HEAP32[$rem >> 2] = 0 | $a$0 & -1;
        HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
      if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
        $86 = (_llvm_ctlz_i32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
        $88 = $86 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        $89 = 64 - $88 | 0;
        $91 = 32 - $88 | 0;
        $92 = $91 >> 31;
        $95 = $88 - 32 | 0;
        $105 = $95 >> 31;
        $sr_1_ph = $88;
        $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
        $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
        $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
        $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
        break;
      }
      if (($rem | 0) != 0) {
        HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
        HEAP32[$rem + 4 >> 2] = 0;
      }
      if (($d_sroa_0_0_extract_trunc | 0) == 1) {
        $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$0 = 0 | $a$0 & -1;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      } else {
        $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
        $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
        $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
    }
  } while (0);
  if (($sr_1_ph | 0) == 0) {
    $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
    $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
    $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
    $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = 0;
  } else {
    $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
    $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
    $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0, $d_sroa_0_0_insert_insert99$1, -1, -1) | 0;
    $137$1 = tempRet0;
    $q_sroa_1_1198 = $q_sroa_1_1_ph;
    $q_sroa_0_1199 = $q_sroa_0_1_ph;
    $r_sroa_1_1200 = $r_sroa_1_1_ph;
    $r_sroa_0_1201 = $r_sroa_0_1_ph;
    $sr_1202 = $sr_1_ph;
    $carry_0203 = 0;
    while (1) {
      $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
      $149 = $carry_0203 | $q_sroa_0_1199 << 1;
      $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
      $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
      _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
      $150$1 = tempRet0;
      $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
      $152 = $151$0 & 1;
      $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
      $r_sroa_0_0_extract_trunc = $154$0;
      $r_sroa_1_4_extract_trunc = tempRet0;
      $155 = $sr_1202 - 1 | 0;
      if (($155 | 0) == 0) {
        break;
      } else {
        $q_sroa_1_1198 = $147;
        $q_sroa_0_1199 = $149;
        $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
        $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
        $sr_1202 = $155;
        $carry_0203 = $152;
      }
    }
    $q_sroa_1_1_lcssa = $147;
    $q_sroa_0_1_lcssa = $149;
    $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = $152;
  }
  $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
  $q_sroa_0_0_insert_ext75$1 = 0;
  $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
  if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
    HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
  }
  $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
  $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
}
// =======================================================================



// EMSCRIPTEN_END_FUNCS

    
    function dynCall_iiii(index,a1,a2,a3) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0;
      return FUNCTION_TABLE_iiii[index&7](a1|0,a2|0,a3|0)|0;
    }
  

    function dynCall_d(index) {
      index = index|0;
      
      return +FUNCTION_TABLE_d[index&3]();
    }
  

    function dynCall_di(index,a1) {
      index = index|0;
      a1=a1|0;
      return +FUNCTION_TABLE_di[index&63](a1|0);
    }
  

    function dynCall_vi(index,a1) {
      index = index|0;
      a1=a1|0;
      FUNCTION_TABLE_vi[index&63](a1|0);
    }
  

    function dynCall_vii(index,a1,a2) {
      index = index|0;
      a1=a1|0; a2=a2|0;
      FUNCTION_TABLE_vii[index&63](a1|0,a2|0);
    }
  

    function dynCall_ii(index,a1) {
      index = index|0;
      a1=a1|0;
      return FUNCTION_TABLE_ii[index&63](a1|0)|0;
    }
  

    function dynCall_viiid(index,a1,a2,a3,a4) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0; a4=+a4;
      FUNCTION_TABLE_viiid[index&127](a1|0,a2|0,a3|0,+a4);
    }
  

    function dynCall_viii(index,a1,a2,a3) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0;
      FUNCTION_TABLE_viii[index&63](a1|0,a2|0,a3|0);
    }
  

    function dynCall_iii(index,a1,a2) {
      index = index|0;
      a1=a1|0; a2=a2|0;
      return FUNCTION_TABLE_iii[index&63](a1|0,a2|0)|0;
    }
  

    function dynCall_viiii(index,a1,a2,a3,a4) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
      FUNCTION_TABLE_viiii[index&63](a1|0,a2|0,a3|0,a4|0);
    }
  
function b0(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_iiii(0);return 0; }
  function _fprintf__wrapper(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; return _fprintf(p0|0,p1|0,p2|0)|0; }
  function b1() { ; nullFunc_d(1);return +0; }
  function b2(p0) { p0 = p0|0; nullFunc_di(2);return +0; }
  function b3(p0) { p0 = p0|0; nullFunc_vi(3); }
  function b4(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_vii(4); }
  function b5(p0) { p0 = p0|0; nullFunc_ii(5);return 0; }
  function _strlen__wrapper(p0) { p0 = p0|0; return _strlen(p0|0)|0; }
  function _puts__wrapper(p0) { p0 = p0|0; return _puts(p0|0)|0; }
  function _putchar__wrapper(p0) { p0 = p0|0; return _putchar(p0|0)|0; }
  function b6(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = +p3; nullFunc_viiid(6); }
  function b7(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_viii(7); }
  function b8(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_iii(8);return 0; }
  function _printf__wrapper(p0,p1) { p0 = p0|0;p1 = p1|0; return _printf(p0|0,p1|0)|0; }
  function b9(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; nullFunc_viiii(9); }
  function ___assert_fail__wrapper(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; ___assert_fail(p0|0,p1|0,p2|0,p3|0); }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_iiii = [b0,_fprintf__wrapper,b0,b0,__ZN6Solver6newVarEbb,b0,b0,b0];
  var FUNCTION_TABLE_d = [b1,b1,__ZL7cpuTimev,b1];
  var FUNCTION_TABLE_di = [b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,__ZNK6Solver16progressEstimateEv
  ,b2,b2,b2,b2,b2];
  var FUNCTION_TABLE_vi = [b3,b3,b3,b3,b3,b3,b3,__ZN3vecI3LitEC1Ev,b3,b3,b3,__ZN3vecI3LitED1Ev,b3,b3,b3,b3,__Z10printStatsR6Solver,b3,b3,b3,b3,b3,__ZN6SolverD2Ev,b3,b3,b3,__ZN3vecIP6ClauseEC1Ev,__ZN3vecIdEC1Ev,__ZN3vecIS_IP6ClauseEEC1Ev
  ,__ZN3vecIcEC1Ev,__ZN3vecIiEC1Ev,b3,b3,__ZN3vecIcED1Ev,__ZN4HeapIN6Solver10VarOrderLtEED1Ev,__ZN3vecIiED1Ev,__ZN3vecIP6ClauseED1Ev,__ZN3vecIS_IP6ClauseEED1Ev,__ZN3vecIdED1Ev,__ZN3vecI5lboolED1Ev,b3,b3,_free,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,__ZN6Solver16varDecayActivityEv,__ZN6Solver16claDecayActivityEv,b3
  ,b3,__ZN6Solver8reduceDBEv,__ZN6Solver16newDecisionLevelEv,b3,b3];
  var FUNCTION_TABLE_vii = [b4,b4,b4,b4,b4,b4,b4,b4,b4,__ZN3vecI3LitE4pushERKS0_,b4,b4,__ZL10exactlyOneR6SolverR3vecI3LitE,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,__Zco3Lit,b4,b4,b4,b4
  ,b4,b4,__ZN6Solver10VarOrderLtC1ERK3vecIdE,__ZN4HeapIN6Solver10VarOrderLtEEC1ERKS1_,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,__ZN3vecI3LitE5clearEb,b4,__ZN6Solver11cancelUntilEi,b4,b4,b4,b4,b4,__ZN3vecIP6ClauseE4pushERKS1_,__ZN6Solver12attachClauseER6Clause,__ZN6Solver15claBumpActivityER6Clause,b4,b4,b4
  ,b4,b4,b4,b4,b4];
  var FUNCTION_TABLE_ii = [b5,b5,b5,_strlen__wrapper,b5,_puts__wrapper,_putchar__wrapper,b5,b5,b5,b5,b5,b5,__ZN6Solver8simplifyEv,b5,__ZN6Solver5solveEv,b5,__ZNK6Solver5nVarsEv,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,__ZNK3vecIP6ClauseE4sizeEv,b5,b5,__ZN6Solver9propagateEv,__ZNK6Solver13decisionLevelEv,b5,b5,b5,b5,b5,__ZNK3vecI3LitE4sizeEv,b5,b5,b5,b5,b5,b5,b5,b5
  ,__ZNK6Solver8nAssignsEv,b5,b5,b5,b5];
  var FUNCTION_TABLE_viiid = [b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,__ZN6Solver13pickBranchLitEid,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6];
  var FUNCTION_TABLE_viii = [b7,b7,b7,b7,b7,b7,b7,b7,__ZN3LitC1Eib,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,__ZNK6Solver10modelValueE3Lit,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,__ZNK6Solver5valueE3Lit,b7,b7,__ZN6Solver16uncheckedEnqueueE3LitP6Clause,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,__ZN6Solver12analyzeFinalE3LitR3vecIS0_E,b7];
  var FUNCTION_TABLE_iii = [b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,__ZN6Solver9addClauseER3vecI3LitE,b8,b8,b8,_printf__wrapper,b8,b8,b8,__ZN3vecI5lboolEixEi,__ZNK5lboolneES_,__ZNK5lbooleqES_,b8,b8,__ZN3vecI3LitEixEi,b8,__ZN6Solver5solveERK3vecI3LitE,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,__ZN3vecIP6ClauseEixEi,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,__Z10Clause_newI3vecI3LitEEP6ClauseRKT_b,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,__ZNK3LiteqES_];
  var FUNCTION_TABLE_viiii = [b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,__ZN6Solver7analyzeEP6ClauseR3vecI3LitERi,b9,b9,___assert_fail__wrapper,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9];

    return { _i64Subtract: _i64Subtract, _free: _free, _realloc: _realloc, _i64Add: _i64Add, _strlen: _strlen, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _sudoku_c: _sudoku_c, __GLOBAL__I_a: __GLOBAL__I_a, __GLOBAL__I_a79: __GLOBAL__I_a79, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0, dynCall_iiii: dynCall_iiii, dynCall_d: dynCall_d, dynCall_di: dynCall_di, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_ii: dynCall_ii, dynCall_viiid: dynCall_viiid, dynCall_viii: dynCall_viii, dynCall_iii: dynCall_iii, dynCall_viiii: dynCall_viiii };
  })
  // EMSCRIPTEN_END_ASM
  ({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "nullFunc_iiii": nullFunc_iiii, "nullFunc_d": nullFunc_d, "nullFunc_di": nullFunc_di, "nullFunc_vi": nullFunc_vi, "nullFunc_vii": nullFunc_vii, "nullFunc_ii": nullFunc_ii, "nullFunc_viiid": nullFunc_viiid, "nullFunc_viii": nullFunc_viii, "nullFunc_iii": nullFunc_iii, "nullFunc_viiii": nullFunc_viiii, "invoke_iiii": invoke_iiii, "invoke_d": invoke_d, "invoke_di": invoke_di, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viiid": invoke_viiid, "invoke_viii": invoke_viii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_llvm_pow_f64": _llvm_pow_f64, "_send": _send, "___cxa_does_inherit": ___cxa_does_inherit, "__ZSt9terminatev": __ZSt9terminatev, "___setErrNo": ___setErrNo, "___cxa_is_number_type": ___cxa_is_number_type, "___gxx_personality_v0": ___gxx_personality_v0, "___assert_fail": ___assert_fail, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_fflush": _fflush, "_pwrite": _pwrite, "__reallyNegative": __reallyNegative, "_sbrk": _sbrk, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "___resumeException": ___resumeException, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_sysconf": _sysconf, "_putchar": _putchar, "_puts": _puts, "_mkport": _mkport, "_write": _write, "___errno_location": ___errno_location, "_printf": _printf, "_getrusage": _getrusage, "__exit": __exit, "_fputc": _fputc, "_abort": _abort, "_fwrite": _fwrite, "_time": _time, "_fprintf": _fprintf, "__formatString": __formatString, "_fputs": _fputs, "_exit": _exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdout": _stdout }, buffer);
  var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _sudoku_c = Module["_sudoku_c"] = asm["_sudoku_c"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var __GLOBAL__I_a79 = Module["__GLOBAL__I_a79"] = asm["__GLOBAL__I_a79"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_d = Module["dynCall_d"] = asm["dynCall_d"];
var dynCall_di = Module["dynCall_di"] = asm["dynCall_di"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiid = Module["dynCall_viiid"] = asm["dynCall_viiid"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
  
  Runtime.stackAlloc = asm['stackAlloc'];
  Runtime.stackSave = asm['stackSave'];
  Runtime.stackRestore = asm['stackRestore'];
  Runtime.setTempRet0 = asm['setTempRet0'];
  Runtime.getTempRet0 = asm['getTempRet0'];
  

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      for (var i = 0; i < data.length; i++) {
        assert(HEAPU8[STATIC_BASE + i] === 0, "area for memory initializer should not have been touched before it's loaded");
      }
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram'] || '/bin/this.program'), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



//# sourceMappingURL=minisat.js.map