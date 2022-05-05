const { Pool } = require("pg");
const axios = require('axios');
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    port: 5432,
    database: "bancosolar",
});

// definiendo funcion insertar
const insertar = async (datos) => {

    const consulta = {
        text: "INSERT INTO usuarios (nombre,balance) VALUES ($1,$2) RETURNING *",
        values: datos,
    };
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {

        console.log("Ups!...Ocurrio un problema, ERROR:" + error.code);
        return error;
    }
};

//funcion consultar
const consultar = async () => {
    try {
        const result = await pool.query("SELECT * FROM usuarios");
        return result;
    } catch (error) {
        console.log("Ups!...Ocurrio un problema, ERROR:" + error.code);
        return error;
    }
};

//funcion Editar
const editar = async (datos, id) => {
    const consulta = {
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = '${id}' RETURNING *`,
        values: datos,
    };
    
    try {
        const result = await pool.query(consulta);
        console.log("El usuario fue editado con exito");
        return result;
    } catch (error) {
        console.log("Ups!...Ocurrio un problema, ERROR:" + error.code);
        return error;
    }

};

//funcion Eliminar
const eliminar = async (id) => {
    try {
        const result = await pool.query(
            `DELETE FROM transferencias WHERE emisor = ${id} OR receptor = ${id};
            DELETE FROM usuarios WHERE id = ${id};
             
            `
        );
        console.log("El usuario fue eliminado con exito");
        return result;
    } catch (error) {
        console.log("Ups!...Ocurrio un problema, ERROR:" + error.code);
        return error;
    }

};

//funcion transferencias
const transferir = async (datos) => {
    
    const { data } = await axios.get("http://localhost:3000/usuarios");
    // emisor 
    const emisor = data.rows.filter((element) => {
        return element.nombre == datos[0];
    })
    //receptor 
    const receptor = data.rows.filter((element) => {
        return element.nombre == datos[1];
    })

   
    try {
       
        
        const result = await pool.query(
            `
            BEGIN;
            UPDATE usuarios SET balance = balance - ${datos[2]} WHERE nombre = '${datos[0]}';
            UPDATE usuarios SET balance = balance + ${datos[2]} WHERE nombre = '${datos[1]}';
            INSERT INTO transferencias (emisor,receptor,monto,fecha) VALUES (${emisor[0].id},${receptor[0].id},'${datos[2]}',now());
            COMMIT;
            `
        );
        console.log("Transaccion realizada de manera exitosa")
        return result; 

    } catch (e) {
        await pool.query("ROLLBACK");
        console.log("Error código: " + e.code);
        console.log("Detalle del error: " + e.detail);
        console.log("Tabla originaria del error: " + e.table);
        console.log("Restricción violada en el campo: " + e.constraint);
    }
    release();
    pool.end();
};

//funcion consultatrans
const consultatrans = async () => {
    try {
        const result = await pool.query(
            `
            SELECT fecha, emisor, receptor,nombre as nombre_emisor, monto FROM usuarios
            INNER JOIN transferencias ON usuarios.id = transferencias.emisor;
            `
            );
       
        return result;
    } catch (error) {
        console.log("Ups!...Ocurrio un problema, ERROR:" + error.code);
        return error;
    }
};

module.exports = { insertar, consultar, editar, eliminar, transferir, consultatrans }