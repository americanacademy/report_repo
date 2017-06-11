module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower: {
            dev: {
                dest: 'dest/',
                images_dest: 'dest/css',
                js_dest: 'dest/js',
                css_dest: 'dest/css',
            }
        },
        uglify: {
            dev: {
                options: {
                    mangle: false,
                    beautify: true,
                },
                files: {
                    'dest/js/atlas.min.js': 'src/js/atlas.js'
                }
            },
        },
        sass: {
            dev: {
                files: {
                    // destination         // source file
                    "dest/css/atlas.css": "src/scss/atlas.scss"
                }
            }
        },
        watch: {
            css: {
                files: ['src/scss/*.scss'],
                tasks: ['sass:dev']
            },
            js: {
                files: ['src/js/*.js'],
                tasks: ['uglify:dev']
            },
            options: {
                livereload: true,
            },
        },
        express: {
            all: {
                options: {
                    port: 4000,
                    hostname: 'localhost',
                    bases: ['./'],
                    livereload: true
                }
            }
        },
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', [
        'bower',
        'uglify',
        'express',
        'watch',
    ]);
    grunt.registerTask('build', [
        'bower',
        'uglify',
    ]);

};
