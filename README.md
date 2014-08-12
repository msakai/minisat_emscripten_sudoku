Sudoku solver in your browser
=============================

This project is a demonstration of solving a famous number-placement puzzle [Sudoku (数独)](https://en.wikipedia.org/wiki/Sudoku) using only client-side Javascript, 

* [Demo site](https://dl.dropboxusercontent.com/u/123796/app/minisat_emscripten_sudoku/index.html)

Design and Implementation
=========================

It is known that Sudoku can be solved efficiently by using SAT solver.
And we use the [emscripten](http://kripken.github.io/emscripten-site/) compiler to compile [MiniSat](http://minisat.se/) SAT solver into Javascript.

Acknowledgements
================

Special thanks to Mate Soos for writing “[MiniSat in your browser](http://www.msoos.org/2013/09/minisat-in-your-browser/)”.

References
==========

* [MiniSat](http://minisat.se/).
* [emscripten](http://kripken.github.io/emscripten-site/).
* Mate Soos. “[MiniSat in your browser](http://www.msoos.org/2013/09/minisat-in-your-browser/)”
