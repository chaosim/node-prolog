node-prolog
===========

A Pure JavaScript implementation of Prolog 

Currently there is a basic implementation of L1 from the book:
[Warrens Abstract Machine: A Tutorial Reconstruction](http://wambook.sourceforge.net/)

The purpose of this machine is to be a building block to the full WAM implementation. 

L1 can take a single term as a query (no rules yet) and a program as a list of terms and facts (no rules yet) and compute the MGU between the query and the program.

There currently isn't a parser or anything like that, see main.js and the tests folder for usage.
