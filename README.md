Sudoku solver in your browser
=============================

This project is a demonstration of solving a famous number-placement puzzle [Sudoku (数独)](https://en.wikipedia.org/wiki/Sudoku) using only client-side Javascript, 

* [Demo site](http://msakai.github.io/minisat_emscripten_sudoku/demo/)

Design and Implementation
-------------------------

It is known that Sudoku can be solved efficiently by using SAT solver.
And we use the [emscripten](http://kripken.github.io/emscripten-site/) compiler to compile [MiniSat](http://minisat.se/) SAT solver into Javascript.

Acknowledgements
----------------

Special thanks to Mate Soos for writing “[MiniSat in your browser](http://www.msoos.org/2013/09/minisat-in-your-browser/)”.

References
----------

* [MiniSat](http://minisat.se/).
* [emscripten](http://kripken.github.io/emscripten-site/).
* Mate Soos. “[MiniSat in your browser](http://www.msoos.org/2013/09/minisat-in-your-browser/)”
* I. Lynce, and J. Ouaknine. “[Sudoku as a SAT Problem](http://sat.inesc-id.pt/~ines/publications/aimath06.pdf)”. Proceedings of the Ninth International Symposium on Artificial Intelligence and Mathematics (AIMATH 2006), Jan. 2006.
* Yusuke Endoh. “[SAT ソルバで数独を解く方法 - まめめも](http://d.hatena.ne.jp/ku-ma-me/20080108/p1)”. 
