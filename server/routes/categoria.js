const express = require('express');
const _ = require('underscore');

let { verificaToken, verificaAdmin_Role } = require('../middleware/autenticacion');

let app = express();

let Categoria = require('../models/categoria.js');

// ===========================================
// Mostrar todas las categorias
// ===========================================
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });
        })
});

// ===========================================
// Mostrar una categoria por ID
// ===========================================
app.get('/categoria/:id', verificaToken, (req, res) => {
    //Categoria.findById(...);
    let idCategoria = req.params.id;

    Categoria.findById(idCategoria, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
});

// ===========================================
// Crear una nueva categoria
// ===========================================
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    console.log(req);
    let categoria = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuarioLogueado._id
    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

// ===========================================
// Actualiza el nombre de una categoria
// ===========================================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let idCategoria = req.params.id;
    let body = _.pick(req.body, ['nombre', 'descripcion']);

    Categoria.findByIdAndUpdate(idCategoria, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

// ===========================================
// Elimina una categoria (Sólo rol ADMIN)
// ===========================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe la categoría que desea eliminar'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada',
            categoria: categoriaBorrada
        });
    })
});

module.exports = app;