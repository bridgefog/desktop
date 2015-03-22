module.exports = function (grunt) {
  packageJSON = grunt.file.readJSON('package.json')
  allSourceFiles = ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js', 'bin/*']
  grunt.initConfig({
    pkg: packageJSON,
    jshint: {
      files: allSourceFiles,
      options: {
        jshintrc: true,
      }
    },
    jscs: {
      files: allSourceFiles,
      options: {
        config: '.jscsrc',
      },
    },
    watch: {
      files: allSourceFiles,
      tasks: ['shell:test', 'jshint', 'jscs'],
    },
    shell: {
      test: {
        command: 'npm test'
      }
    },
    jsbeautifier: {
      files: allSourceFiles,
      options: {
        js: {
          indent_size: 2,
          indent_char: ' ',
          indent_level: 0,
          indent_with_tabs: false,
          preserve_newlines: true,
          max_preserve_newlines: 10,
          jslint_happy: true,
          space_after_anon_function: true,
          brace_style: 'collapse',
          keep_array_indentation: false,
          keep_function_indentation: false,
          space_before_conditional: true,
          break_chained_methods: false,
          eval_code: false,
          unescape_strings: false,
          wrap_line_length: 0,
          wrap_attributes: 'auto',
          wrap_attributes_indent_size: 4,
          end_with_newline: true,
        },
      },
    },
  })

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-jsbeautifier')

  grunt.registerTask('default', ['jshint', 'jscs', 'shell:test'])
}
