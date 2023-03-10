import nodemailer from "nodemailer";

export const sendRegisterEmail = async (data) => {
    const {email, name, token} = data;

    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola: ${name} Comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta está casi lista, solo debes entrar al siguiente enlace:</p>
        <a href="${process.env.FRONT_END_URL}/confirm/${token}">Comprobar Cuenta</a>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>        
        `
    });
}

export const sendRecoverPasswordEmail = async (data) => {
  const {email, name, token} = data;

  const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Reestablece tu contraseña",
    text: "Reestablece la contraseña de tu cuenta en UpTask",
    html: `<p>Hola: ${name}, has solicitado reestablecer tu contraseña</p>
    <p>Para cambiar tu contraseña y recuperar el acceso a tu cuenta haz click en el siguiente enlace:</p>
    <a href="${process.env.FRONT_END_URL}/recover-password/${token}">Reestablecer Contraseña</a>
    <p>Si tu no solicitaste este cambio, puedes ignorar el mensaje</p>        
    `
})


}