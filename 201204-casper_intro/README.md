# README: 2012-April Introduction to CasperJS

You should be able to open the web page `web/complex_form.html` and see
what's going on -- fill out the form, click on elements, etc. 

To run CasperJS against it you'll need to put the `web` directory
in the control of a web server somewhere. (You can also just run
`node server.js`.) Once that's done and you've got Casper
installed, you should be able to do:

    $ casper test/validation_complex.js
    
to execute that script. There's also a super-simple introduction
with `web/simple_form.html` that you can test with:

    $ casper test/validation_simple.js

