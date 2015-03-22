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
        command: 'npm run test -- --colors'
      }
    },
    jsbeautifier: {
      files: allSourceFiles,
      options: {
        config: '.jsbeautifyrc'
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
