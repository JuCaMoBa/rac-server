exports.htmlTemplate = function welcomeHtmlTemplate(data) {
  return `
    <h1>Hola ${data.firstname},</h1>
    <p><strong>Bienvenido ...</strong></p>
  `;
};

exports.textTemplate = function welcomeTextTemplate(data) {
  return `
    Hola ${data.firstname},
    Bienvenido ...
  `;
};
