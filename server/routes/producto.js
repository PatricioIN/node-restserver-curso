const express = require('express');
const mongoose = require('mongoose');

const { verificaToken } = require('../middleware/autenticacion');

let app = express();
let Producto = require('../models/producto');
let Categoria = require('../models/categoria');

// ===========================================
// Obtener productos
// ===========================================
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .sort('nombre')
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        })
});

// ===========================================
// Obtener producto por id
// ===========================================
app.get('/productos/:id', verificaToken, (req, res) => {
    let idProducto = req.params.id;

    Producto.findById(idProducto)
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        });
});

// ===========================================
// Buscar productos
// ===========================================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

// ===========================================
// Crear un nuevo producto
// ===========================================
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;

    //Comprobar si es un formato ObjectId válido 
    //console.log(mongoose.Types.ObjectId.isValid(body.categoria)); 

    Categoria.findById(body.categoria, (err, categoriaDB) => {
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

        let producto = new Producto({
            usuario: req.usuarioLogueado._id,
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible,
            categoria: body.categoria
        });

        producto.save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoDB
            });
        })
    });
});

// ===========================================
// Actualizar o producto
// ===========================================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' })
        .populate('categoria')
        .populate('usuario')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            !productoDB ? res.status(400).json({ ok: false, err: { message: 'El ID no es correcto' } }) : res.json({ ok: true, producto: productoDB });
        });
});

// ===========================================
// Borrar un producto
// ===========================================
app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        if (!productoBorrado.disponible) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto ya se encuentra deshabilitado'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Se ha deshabilitado el producto',
            producto: productoBorrado
        });
    })
});

module.exports = app;