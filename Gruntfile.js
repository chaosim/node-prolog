module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: [
                'Gruntfile.js',
                'lib/**/*.js',
                'tests/**/*.js',
                'main.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        mochacli: {
            options: {
                require: ['should'],
                reporter: 'nyan',
                bail: true
            },
            all: ['tests/**/*.js']
        },

        watch: {
            scripts: {
                files: [
                    'Gruntfile.js',
                    'lib/**/*.js',
                    'tests/**/*.js',
                    'main.js'
                ],
                tasks: ['mochacli'],
                options: {
                    spawn: false,
                },
            },
        },

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['jshint', 'mochacli']);
    grunt.registerTask('dev', ['jshint', 'mochacli', 'watch']);
    grunt.registerTask('test', ['mochacli']);
};