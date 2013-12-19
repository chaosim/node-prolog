node-prolog
===========

A Pure JavaScript implementation of Prolog 

Currently there is a basic implementation of L0 from the book:
[Warrens Abstract Machine: A Tutorial Reconstruction](http://wambook.sourceforge.net/)

The purpose of this machine is to be a building block to the full WAM implementation. 

L0 can do only one thing, take a single Fact as a Program and a single Fact as a Query and produce the unification of the two.

There currently isn't a parser or anything like that, see main.js and the tests folder for usage.
