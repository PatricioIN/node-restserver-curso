const jwt = require('jsonwebtoken');

// =======================
// Verifica Token
// =======================
let verificaToken = (req, res, next) => {
    let token = req.get('token'); //Authorization

    jwt.verify(token, process.env.SEED, (err, decoded) => { //decoded es el payload del token

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        } else {
            req.usuarioLogueado = decoded.usuario;
            next();
        }
    });

    /*res.json({
        token
    });*/
};

// =======================
// Verifica token para imagen
// =======================
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => { //decoded es el payload del token

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        } else {
            req.usuarioLogueado = decoded.usuario;
            next();
        }
    });

    /*res.json({
        token
    });*/
};

// =======================
// Verifica Admin Role
// =======================
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuarioLogueado;
    console.log(usuario)
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

module.exports = {
    verificaToken,
    verificaTokenImg,
    verificaAdmin_Role
}