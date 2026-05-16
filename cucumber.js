module.exports = {
  default: {
    require: ['tests/bdd/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    paths: ['tests/bdd/features/**/*.feature'],
    format: [
      'progress-bar',
      'html:cucumber-report/index.html',
      'json:cucumber-report/results.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
