import uglify from "@gesslar/uglier"

const files = ["{bin,src}/**/*.js"]

export default [
  ...uglify({
    with: [
      "lints-js", // default files: []
      "lints-jsdoc", // default files: []
      "node", // default files: []
    ],
    overrides: {
      "lints-js": {files},
      "lints-jsdoc": {files},
      "node": {files}
    }
  })
]
