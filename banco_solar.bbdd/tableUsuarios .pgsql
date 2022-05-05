CREATE TABLE usuarios (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(50),
    balance FLOAT CHECK (balance >= 0));