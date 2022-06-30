module.exports = {
  client: {
    service: {
      name: 'subService',
      url: 'http://localhost:4000/graphql',
      // optional disable SSL validation check
      skipSSLValidation: true,
      include: '*.ts',
    },
  },
};
