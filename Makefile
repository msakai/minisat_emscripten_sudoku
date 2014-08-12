minisat.js: Main.cpp Solver.cpp
	em++ -m32 Main.cpp Solver.cpp -s EXPORTED_FUNCTIONS="['_htmlstuff_c']" -o minisat.js
