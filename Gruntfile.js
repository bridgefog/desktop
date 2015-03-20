module.exports = function (grunt) {
  packageJSON = grunt.file.readJSON('package.json')
  grunt.initConfig({
    pkg: packageJSON,
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: packageJSON.jshintConfig,
    },
    jscs: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        config: '.jscsrc',
      },
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['shell:test', 'jshint', 'jscs'],
    },
    shell: {
      test: {
        command: 'npm test'
      }
    }
  })

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-jscs')

  grunt.registerTask('default', ['jshint', 'jscs', 'shell:test'])
}
